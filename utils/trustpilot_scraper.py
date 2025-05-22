import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import json
import os
from datetime import datetime
import logging
from fake_useragent import UserAgent
import streamlit as st

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TrustpilotScraper")

class TrustpilotScraper:
    def __init__(self, company_url, use_selenium=False, batch_size=10):
        """Initialize the TrustpilotScraper with a company URL."""
        self.company_url = company_url
        self.base_url = company_url
        try:
            self.user_agent = UserAgent()
        except:
            self.user_agent = None
        self.session = self._create_session()
        self.reviews = []
        self.use_selenium = use_selenium
        self.batch_size = batch_size
    
    def _create_session(self):
        """Create a session with rotating user agents and headers."""
        session = requests.Session()
        session.headers.update({
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        })
        return session
    
    def _update_headers(self):
        """Update headers with a new random user agent."""
        if self.user_agent:
            self.session.headers.update({
                "User-Agent": self.user_agent.random
            })
        else:
            # Fallback user agents
            user_agents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
            ]
            self.session.headers.update({
                "User-Agent": random.choice(user_agents)
            })
    
    def _random_delay(self, min_seconds=2, max_seconds=7):
        """Add a random delay between requests."""
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)
    
    def _parse_review_soup(self, review_element):
        """Extract data from a single review element using BeautifulSoup."""
        try:
            # Find the star rating
            rating_div = review_element.find('div', {'data-service-review-rating': True})
            rating = int(rating_div['data-service-review-rating']) if rating_div else None
            
            # Find the review title
            title_element = review_element.find('h2', {'data-service-review-title-typography': True})
            title = title_element.text.strip() if title_element else ""
            
            # Find the review content
            content_div = review_element.find('div', {'data-service-review-content-typography': True})
            
            if not content_div:
                content_div = review_element.find('div', {'data-service-review-expanded-content-typography': True})
            
            if not content_div:
                content_div = review_element.find('div', {'data-service-review-text-typography': True})
            
            if not content_div:
                content_p = review_element.find('p')
                content = content_p.text.strip() if content_p else ""
            else:
                content = content_div.text.strip()
            
            # Find the review date
            date_element = review_element.find('time')
            date = date_element['datetime'] if date_element else ""
            
            # Find the reviewer's name
            reviewer_element = review_element.find('span', {'data-consumer-name-typography': True})
            reviewer = reviewer_element.text.strip() if reviewer_element else ""
            
            # Find if the reviewer has verification
            verified = bool(review_element.find('div', {'data-verification-label': True}))
            
            # Find the reviewer's location if available
            location_element = review_element.find('div', {'data-consumer-country-typography': True})
            location = location_element.text.strip() if location_element else ""
            
            # Create review ID
            review_id = f"{reviewer}_{date}".replace(" ", "_") if reviewer and date else f"review_{hash(content[:100])}"
            
            return {
                'review_id': review_id,
                'rating': rating,
                'title': title,
                'content': content,
                'date': date,
                'reviewer': reviewer,
                'verified': verified,
                'location': location,
                'scraped_at': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error parsing review: {str(e)}")
            return None
    
    def scrape_reviews(self, max_reviews=100, company_name="", progress_container=None):
        """
        Scrape Trustpilot reviews with progress tracking
        
        Args:
            max_reviews (int): Maximum number of reviews to scrape
            company_name (str): Company name for identification
            progress_container: Streamlit container for progress updates
            
        Returns:
            pd.DataFrame: DataFrame containing scraped reviews
        """
        logger.info(f"Starting Trustpilot scraping for {self.company_url}")
        
        self.reviews = []
        page = 1
        
        try:
            # Update progress
            if progress_container:
                with progress_container:
                    st.info(f"🌐 Starting Trustpilot scraping for {company_name}...")
                    progress_bar = st.progress(0)
                    status_text = st.empty()
            
            while len(self.reviews) < max_reviews:
                # Update headers for each request
                self._update_headers()
                
                # Construct URL for the current page
                if page == 1:
                    url = self.company_url
                else:
                    # Handle pagination - Trustpilot uses ?page=X parameter
                    if '?' in self.company_url:
                        url = f"{self.company_url}&page={page}"
                    else:
                        url = f"{self.company_url}?page={page}"
                
                logger.info(f"Scraping page {page}: {url}")
                
                try:
                    response = self.session.get(url, timeout=30)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find review elements - Trustpilot uses article tags for reviews
                    review_elements = soup.find_all('article', {'data-service-review-card-paper': True})
                    if not review_elements:
                        # Try alternative selector
                        review_elements = soup.find_all('div', class_='review')
                    
                    if not review_elements:
                        logger.info(f"No reviews found on page {page}")
                        break
                    
                    page_reviews = []
                    for review_element in review_elements:
                        if len(self.reviews) >= max_reviews:
                            break
                            
                        review_data = self._parse_review_soup(review_element)
                        if review_data:
                            # Add company identifier and source
                            review_data['company_name'] = company_name
                            review_data['source'] = 'Trustpilot'
                            # Standardize field names
                            review_data['review_content'] = review_data.get('content', '')
                            review_data['review_title'] = review_data.get('title', '')
                            review_data['username'] = review_data.get('reviewer', '')
                            review_data['datetime'] = review_data.get('date', '')
                            
                            page_reviews.append(review_data)
                    
                    if not page_reviews:
                        logger.info("No more reviews found")
                        break
                    
                    self.reviews.extend(page_reviews)
                    
                    # Update progress
                    if progress_container:
                        with progress_container:
                            progress = len(self.reviews) / max_reviews
                            progress_bar.progress(min(progress, 1.0))
                            status_text.text(f"🌐 Trustpilot: {len(self.reviews)}/{max_reviews} reviews collected")
                    
                    logger.info(f"Collected {len(page_reviews)} reviews from page {page}")
                    
                    # Add delay between pages
                    self._random_delay()
                    page += 1
                    
                except requests.RequestException as e:
                    logger.error(f"Error fetching page {page}: {str(e)}")
                    if progress_container:
                        with progress_container:
                            st.warning(f"⚠️ Error on page {page}: {str(e)}")
                    break
            
            # Final progress update
            if progress_container:
                with progress_container:
                    progress_bar.progress(1.0)
                    st.success(f"✅ Trustpilot scraping completed! Collected {len(self.reviews)} reviews")
            
            logger.info(f"Finished scraping {len(self.reviews)} Trustpilot reviews")
            
            # Convert to DataFrame
            if not self.reviews:
                logger.warning("No reviews collected")
                return pd.DataFrame()
                
            df = pd.DataFrame(self.reviews)
            return df
            
        except Exception as e:
            logger.error(f"Error during Trustpilot scraping: {str(e)}")
            if progress_container:
                with progress_container:
                    st.error(f"❌ Error scraping Trustpilot: {str(e)}")
            
            # Return whatever we've collected so far
            if self.reviews:
                return pd.DataFrame(self.reviews)
            return pd.DataFrame()

def scrape_trustpilot_reviews(company_url, max_reviews=100, company_name="", progress_container=None):
    """
    Main function to scrape Trustpilot reviews
    
    Args:
        company_url (str): Trustpilot company URL
        max_reviews (int): Maximum number of reviews to scrape
        company_name (str): Company name for identification
        progress_container: Streamlit container for progress updates
        
    Returns:
        pd.DataFrame: DataFrame containing scraped reviews
    """
    scraper = TrustpilotScraper(company_url)
    return scraper.scrape_reviews(max_reviews, company_name, progress_container)
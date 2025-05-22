import time
import random
import pandas as pd
import numpy as np
from datetime import datetime
import logging
try:
    from google_play_scraper import Sort, reviews, app
    GOOGLE_PLAY_AVAILABLE = True
except ImportError:
    GOOGLE_PLAY_AVAILABLE = False
    Sort = None
import streamlit as st

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GooglePlayScraper")

class GooglePlayReviewsScraper:
    def __init__(self, app_id, language="en", country="us", 
                 min_delay=2.0, max_delay=5.0, sort_method=Sort.NEWEST):
        """
        Initialize the Google Play Store reviews scraper
        
        Args:
            app_id (str): The app id from Google Play Store
            language (str): Language code (default: 'en')
            country (str): Country code (default: 'us')
            min_delay (float): Minimum delay between requests in seconds
            max_delay (float): Maximum delay between requests in seconds
            sort_method (Sort): Sorting method for reviews (NEWEST, RATING, RELEVANCE)
        """
        self.app_id = app_id
        self.language = language
        self.country = country
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.sort_method = sort_method
        self.reviews = []
        self.app_info = None
        
    def _random_delay(self, first_request=False):
        """Add humanlike random delay between requests"""
        if first_request:
            delay = random.uniform(0.5, 1.5)
        else:
            jitter = random.uniform(-0.5, 0.5)
            delay = random.uniform(self.min_delay, self.max_delay) + jitter
            
        logger.debug(f"Waiting {delay:.2f} seconds")
        time.sleep(delay)
        
    def get_app_info(self):
        """Get app information from Google Play Store"""
        try:
            logger.info(f"Fetching app information for {self.app_id}...")
            self._random_delay(first_request=True)
            
            self.app_info = app(
                self.app_id,
                lang=self.language,
                country=self.country
            )
            return self.app_info
        except Exception as e:
            logger.error(f"Error fetching app information: {e}")
            return None
    
    def _clean_review_data(self, review_data):
        """Clean review data and remove unwanted fields"""
        cleaned = review_data.copy()
        
        # Remove specified fields
        fields_to_remove = ['userImage', 'replyContent', 'repliedAt', 'appVersion']
        for field in fields_to_remove:
            if field in cleaned:
                del cleaned[field]
                
        return cleaned
    
    def scrape_reviews(self, max_reviews=100, company_name="", progress_container=None):
        """
        Scrape Google Play Store reviews with progress tracking
        
        Args:
            max_reviews (int): Maximum number of reviews to collect
            company_name (str): Company name for identification
            progress_container: Streamlit container for progress updates
            
        Returns:
            pd.DataFrame: DataFrame containing all the reviews
        """
        logger.info(f"Starting to scrape up to {max_reviews} reviews for {self.app_id}...")
        
        self.reviews = []
        batches = 0
        batch_size = min(50, max_reviews)
        
        try:
            # Update progress
            if progress_container:
                with progress_container:
                    st.info(f"🔍 Starting Google Play Store scraping for {company_name}...")
                    progress_bar = st.progress(0)
                    status_text = st.empty()
            
            # First batch
            first_batch_size = min(random.randint(20, batch_size), max_reviews)
            
            logger.info(f"Fetching first batch of {first_batch_size} reviews...")
            result, continuation_token = reviews(
                self.app_id,
                lang=self.language,
                country=self.country,
                sort=self.sort_method,
                count=first_batch_size
            )
            batches += 1
            
            # Clean and add the first batch of reviews
            cleaned_results = []
            for review in result:
                cleaned_review = self._clean_review_data(review)
                # Add company identifier and source
                cleaned_review['company_name'] = company_name
                cleaned_review['source'] = 'Google Play Store'
                cleaned_review['scraped_at'] = datetime.now().isoformat()
                # Standardize field names
                cleaned_review['review_content'] = cleaned_review.get('content', '')
                cleaned_review['review_title'] = cleaned_review.get('title', '')  # Google Play doesn't have titles
                cleaned_review['rating'] = cleaned_review.get('score', None)
                cleaned_review['username'] = cleaned_review.get('userName', '')
                cleaned_review['datetime'] = cleaned_review.get('at', '')
                
                cleaned_results.append(cleaned_review)
            
            self.reviews.extend(cleaned_results)
            
            # Update progress
            if progress_container:
                with progress_container:
                    progress = len(self.reviews) / max_reviews
                    progress_bar.progress(min(progress, 1.0))
                    status_text.text(f"📱 Google Play: {len(self.reviews)}/{max_reviews} reviews collected")
            
            # Continue fetching if we need more reviews and have a continuation token
            while continuation_token and len(self.reviews) < max_reviews:
                self._random_delay()
                
                remaining = max_reviews - len(self.reviews)
                current_batch_size = min(remaining, random.randint(batch_size-10, batch_size+10))
                
                try:
                    batch, continuation_token = reviews(
                        self.app_id,
                        continuation_token=continuation_token,
                        count=current_batch_size
                    )
                    batches += 1
                    
                    if not batch:
                        logger.info("No more reviews available")
                        break
                    
                    # Clean and add the batch to our collection
                    cleaned_batch = []
                    for review in batch:
                        cleaned_review = self._clean_review_data(review)
                        # Add company identifier and source
                        cleaned_review['company_name'] = company_name
                        cleaned_review['source'] = 'Google Play Store'
                        cleaned_review['scraped_at'] = datetime.now().isoformat()
                        # Standardize field names
                        cleaned_review['review_content'] = cleaned_review.get('content', '')
                        cleaned_review['review_title'] = cleaned_review.get('title', '')
                        cleaned_review['rating'] = cleaned_review.get('score', None)
                        cleaned_review['username'] = cleaned_review.get('userName', '')
                        cleaned_review['datetime'] = cleaned_review.get('at', '')
                        
                        cleaned_batch.append(cleaned_review)
                    
                    self.reviews.extend(cleaned_batch)
                    
                    # Update progress
                    if progress_container:
                        with progress_container:
                            progress = len(self.reviews) / max_reviews
                            progress_bar.progress(min(progress, 1.0))
                            status_text.text(f"📱 Google Play: {len(self.reviews)}/{max_reviews} reviews collected")
                    
                except Exception as e:
                    logger.error(f"Error fetching batch {batches}: {e}")
                    error_delay = random.uniform(5, 10)
                    time.sleep(error_delay)
                
            # Final progress update
            if progress_container:
                with progress_container:
                    progress_bar.progress(1.0)
                    st.success(f"✅ Google Play Store scraping completed! Collected {len(self.reviews)} reviews")
            
            logger.info(f"Finished scraping {len(self.reviews)} reviews in {batches} batches")
            
            # Convert to DataFrame
            if not self.reviews:
                logger.warning("No reviews collected")
                return pd.DataFrame()
                
            df = pd.DataFrame(self.reviews)
            return df
            
        except Exception as e:
            logger.error(f"Error during review scraping: {e}")
            if progress_container:
                with progress_container:
                    st.error(f"❌ Error scraping Google Play Store: {str(e)}")
            
            # Return whatever we've collected so far
            if self.reviews:
                return pd.DataFrame(self.reviews)
            return pd.DataFrame()

def scrape_google_play_reviews(app_id, max_reviews=100, company_name="", progress_container=None):
    """
    Main function to scrape Google Play Store reviews
    
    Args:
        app_id (str): Google Play Store app ID
        max_reviews (int): Maximum number of reviews to scrape
        company_name (str): Company name for identification
        progress_container: Streamlit container for progress updates
        
    Returns:
        pd.DataFrame: DataFrame containing scraped reviews
    """
    scraper = GooglePlayReviewsScraper(app_id)
    return scraper.scrape_reviews(max_reviews, company_name, progress_container)
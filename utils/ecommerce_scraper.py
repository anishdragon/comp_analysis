import time
import json
import random
import logging
import pandas as pd
from datetime import datetime
from fake_useragent import UserAgent
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('EcommerceScraper')

class EcommerceScraper:
    def __init__(self, base_url, max_products=50, min_delay=2.0, max_delay=5.0):
        """
        Initialize the E-commerce scraper with configuration settings.
        
        Args:
            base_url (str): The base URL of the e-commerce website
            max_products (int): Maximum number of products to scrape
            min_delay (float): Minimum delay between requests in seconds
            max_delay (float): Maximum delay between requests in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.max_products = max_products
        self.min_delay = min_delay
        self.max_delay = max_delay
        
        # State management
        self.session = None
        self.user_agent = UserAgent()
        self.products = []
        self.visited_urls = set()
        
        # Setup
        self._setup_session()
        
    def _setup_session(self):
        """Set up the requests session with rotating user agents"""
        self.session = requests.Session()
        self._update_headers()
        
    def _update_headers(self):
        """Update headers with a new random user agent"""
        headers = {
            'User-Agent': self.user_agent.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
        self.session.headers.update(headers)
        
    def _random_delay(self, min_seconds=None, max_seconds=None):
        """Add a random delay between requests"""
        min_s = min_seconds or self.min_delay
        max_s = max_seconds or self.max_delay
        delay = random.uniform(min_s, max_s)
        time.sleep(delay)
        
    def _make_request(self, url, retries=3):
        """Make a request with error handling and retries"""
        for attempt in range(retries):
            try:
                self._random_delay()
                self._update_headers()  # Rotate user agent
                
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return response
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Request failed (attempt {attempt + 1}/{retries}): {str(e)}")
                if attempt == retries - 1:
                    raise
                time.sleep(random.uniform(5, 10))  # Wait longer before retry
                
        return None
        
    def _detect_site_type(self):
        """Detect the type of e-commerce site and return appropriate selectors"""
        domain = urlparse(self.base_url).netloc.lower()
        
        # Target.com specific selectors
        if 'target.com' in domain:
            return {
                'product_links': 'a[data-test="product-title"]',
                'product_name': '[data-test="product-title"]',
                'product_price': '[data-test="product-price"]',
                'product_rating': '[data-test="ratings-and-reviews"]',
                'review_text': '[data-test="review-content"]',
                'review_rating': '[data-test="review-rating"]',
                'review_author': '[data-test="review-author"]',
                'review_date': '[data-test="review-date"]',
                'search_path': '/s/',
                'search_terms': ['electronics', 'home', 'kitchen', 'furniture', 'clothing']
            }
        # Amazon specific selectors
        elif 'amazon.com' in domain:
            return {
                'product_links': 'a[class*="s-link-style"]',
                'product_name': 'h2 a span',
                'product_price': '.a-price-whole',
                'product_rating': '.a-icon-alt',
                'review_text': '[data-hook="review-body"] span',
                'review_rating': '.a-icon-alt',
                'review_author': '.a-profile-name',
                'review_date': '[data-hook="review-date"]',
                'search_path': '/s?k=',
                'search_terms': ['electronics', 'home', 'kitchen', 'books', 'clothing']
            }
        # Generic selectors for other sites
        else:
            return {
                'product_links': 'a[href*="/product"], a[href*="/item"], a[class*="product"]',
                'product_name': 'h1, h2, h3, .product-name, .item-name, .title',
                'product_price': '.price, .cost, .amount, [class*="price"]',
                'product_rating': '.rating, .stars, [class*="rating"]',
                'review_text': '.review-text, .review-content, .comment',
                'review_rating': '.review-rating, .review-stars',
                'review_author': '.review-author, .reviewer-name, .author',
                'review_date': '.review-date, .date',
                'search_path': '/search?q=',
                'search_terms': ['electronics', 'home', 'kitchen', 'clothing', 'books']
            }
            
    def _find_product_urls(self, max_products):
        """Find product URLs from the website"""
        selectors = self._detect_site_type()
        product_urls = set()
        
        # Try different search terms and category pages
        search_terms = selectors['search_terms'][:3]  # Limit to first 3 terms
        
        for term in search_terms:
            if len(product_urls) >= max_products:
                break
                
            search_url = f"{self.base_url}{selectors['search_path']}{term}"
            logger.info(f"Searching for products with term: {term}")
            
            try:
                response = self._make_request(search_url)
                if response:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find product links
                    links = soup.select(selectors['product_links'])
                    
                    for link in links[:max_products//len(search_terms)]:
                        href = link.get('href')
                        if href:
                            # Convert relative URLs to absolute
                            if href.startswith('/'):
                                product_url = urljoin(self.base_url, href)
                            elif href.startswith('http'):
                                product_url = href
                            else:
                                product_url = urljoin(self.base_url, '/' + href)
                                
                            product_urls.add(product_url)
                            
                            if len(product_urls) >= max_products:
                                break
                                
            except Exception as e:
                logger.error(f"Error searching for term {term}: {str(e)}")
                continue
                
        return list(product_urls)
        
    def _scrape_product_reviews(self, product_url):
        """Scrape reviews for a specific product"""
        selectors = self._detect_site_type()
        reviews = []
        
        try:
            response = self._make_request(product_url)
            if not response:
                return reviews
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract product info
            product_name = "Unknown Product"
            try:
                name_element = soup.select_one(selectors['product_name'])
                if name_element:
                    product_name = name_element.get_text(strip=True)
            except:
                pass
                
            # Look for review sections
            review_elements = soup.select(selectors['review_text'])
            
            for i, review_element in enumerate(review_elements[:10]):  # Limit to 10 reviews per product
                try:
                    review_text = review_element.get_text(strip=True)
                    if len(review_text) < 10:  # Skip very short reviews
                        continue
                        
                    # Try to extract rating
                    rating = None
                    try:
                        rating_element = review_element.find_parent().select_one(selectors['review_rating'])
                        if rating_element:
                            rating_text = rating_element.get_text(strip=True)
                            # Extract number from rating text
                            rating_match = re.search(r'(\d+(?:\.\d+)?)', rating_text)
                            if rating_match:
                                rating = float(rating_match.group(1))
                    except:
                        pass
                        
                    # Try to extract author
                    author = f"User_{i+1}"
                    try:
                        author_element = review_element.find_parent().select_one(selectors['review_author'])
                        if author_element:
                            author = author_element.get_text(strip=True)
                    except:
                        pass
                        
                    review_data = {
                        'username': author,
                        'review_content': review_text,
                        'rating': rating,
                        'product_name': product_name,
                        'product_url': product_url,
                        'datetime': datetime.now(),
                        'source': 'E-commerce Website',
                        'company': urlparse(self.base_url).netloc
                    }
                    
                    reviews.append(review_data)
                    
                except Exception as e:
                    logger.warning(f"Error extracting review {i}: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error scraping product {product_url}: {str(e)}")
            
        return reviews
        
    def scrape_reviews(self, max_products=50, company_name="", progress_container=None):
        """
        Scrape e-commerce reviews with progress tracking
        
        Args:
            max_products (int): Maximum number of products to scrape
            company_name (str): Company name for identification
            progress_container: Streamlit container for progress updates
            
        Returns:
            pd.DataFrame: DataFrame containing scraped reviews
        """
        logger.info(f"Starting e-commerce scraping for {self.base_url}")
        
        # Initialize progress tracking
        if progress_container:
            progress_bar = progress_container.progress(0)
            status_text = progress_container.empty()
            status_text.text("🔍 Finding product URLs...")
        
        all_reviews = []
        
        try:
            # Find product URLs
            product_urls = self._find_product_urls(max_products)
            total_products = len(product_urls)
            
            if total_products == 0:
                logger.warning("No product URLs found")
                if progress_container:
                    status_text.text("⚠️ No products found on this website")
                return pd.DataFrame()
            
            logger.info(f"Found {total_products} product URLs to scrape")
            
            # Scrape reviews from each product
            for i, product_url in enumerate(product_urls):
                try:
                    if progress_container:
                        progress = (i + 1) / total_products
                        progress_bar.progress(progress)
                        status_text.text(f"📦 Scraping product {i + 1}/{total_products}...")
                    
                    reviews = self._scrape_product_reviews(product_url)
                    all_reviews.extend(reviews)
                    
                    logger.info(f"Scraped {len(reviews)} reviews from product {i + 1}/{total_products}")
                    
                except Exception as e:
                    logger.error(f"Error scraping product {i + 1}: {str(e)}")
                    continue
            
            if progress_container:
                progress_bar.progress(1.0)
                status_text.text(f"✅ Completed! Found {len(all_reviews)} reviews")
            
            logger.info(f"Finished scraping {len(all_reviews)} reviews from {total_products} products")
            
        except Exception as e:
            logger.error(f"Error during scraping: {str(e)}")
            if progress_container:
                status_text.text(f"❌ Error: {str(e)}")
        
        # Convert to DataFrame
        if all_reviews:
            df = pd.DataFrame(all_reviews)
            # Ensure consistent column types
            df['datetime'] = pd.to_datetime(df['datetime'])
            return df
        else:
            return pd.DataFrame()


def scrape_ecommerce_reviews(website_url, max_products=50, company_name="", progress_container=None):
    """
    Main function to scrape e-commerce reviews
    
    Args:
        website_url (str): E-commerce website URL
        max_products (int): Maximum number of products to scrape
        company_name (str): Company name for identification
        progress_container: Streamlit container for progress updates
        
    Returns:
        pd.DataFrame: DataFrame containing scraped reviews
    """
    try:
        scraper = EcommerceScraper(website_url, max_products=max_products)
        return scraper.scrape_reviews(max_products, company_name, progress_container)
    except Exception as e:
        logger.error(f"Failed to create scraper: {str(e)}")
        if progress_container:
            progress_container.error(f"❌ Failed to scrape: {str(e)}")
        return pd.DataFrame()
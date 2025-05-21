import os
import json
import pandas as pd
from openai import OpenAI

def get_openai_client():
    """
    Initialize and return the OpenAI client using the API key from environment variables
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")
    
    return OpenAI(api_key=api_key)

def analyze_review(review_content, review_title="", rating=None):
    """
    Analyze a review using OpenAI to determine sentiment, aspect, and issue type
    
    Args:
        review_content (str): The main content of the review
        review_title (str, optional): The title of the review, if available
        rating (float, optional): The numerical rating, if available
    
    Returns:
        dict: A dictionary containing the analysis results
    """
    # Create a complete prompt with all available information
    full_review = ""
    if review_title and not (isinstance(review_title, float) and pd.isna(review_title)):
        full_review += f"Title: {review_title}\n"
    
    if rating is not None and not (isinstance(rating, float) and pd.isna(rating)):
        full_review += f"Rating: {rating}\n"
    
    full_review += f"Content: {review_content}"
    
    # System prompt for the analysis
    system_prompt = """
    You are an expert review analyst. Analyze the given review and categorize it according to these levels:
    
    1. Sentiment: Determine if the overall review is "Positive" or "Negative"
    2. Aspect: Identify what the customer is primarily discussing - "Product", "Service", or "Other"
    3. Issue Type: Categorize the specific issue being discussed, such as:
       - For Product: "Quality Issue", "Functionality Issue", "Design Issue", "Durability Issue", etc.
       - For Service: "Customer Support Issue", "Delivery Issue", "Logistics Issue", "Response Time Issue", etc.
       - For Other: "Pricing Issue", "Policy Issue", "Website Issue", "App Issue", etc.
    
    Provide a confidence score (0.0 to 1.0) for your categorization.
    
    Respond with JSON in this format:
    {
        "sentiment": "Positive or Negative",
        "aspect": "Product, Service, or Other",
        "issue_type": "Specific issue category",
        "confidence": number between 0 and 1
    }
    """
    
    try:
        # Get OpenAI client
        client = get_openai_client()
        
        # Make the API call
        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        # do not change this unless explicitly requested by the user
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_review}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse the response
        content = response.choices[0].message.content
        if content is not None:
            result = json.loads(content)
            
            # Ensure all required fields are present
            required_fields = ["sentiment", "aspect", "issue_type", "confidence"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field in response: {field}")
        else:
            raise ValueError("Empty response received from API")
        
        return result
    
    except Exception as e:
        raise Exception(f"Failed to analyze review: {str(e)}")

def generate_category_summary(issue_type, reviews):
    """
    Generate a summary and best practices for a specific issue type based on multiple reviews
    
    Args:
        issue_type (str): The category/issue type to summarize
        reviews (list): List of review contents related to this issue type
    
    Returns:
        str: A markdown-formatted summary with insights and best practices
    """
    # Limit the number of reviews to avoid token limits
    max_reviews = 15
    if len(reviews) > max_reviews:
        # Take a representative sample
        import random
        reviews = random.sample(reviews, max_reviews)
    
    # Join the reviews with separators
    reviews_text = "\n---\n".join(reviews)
    
    # System prompt for the summary generation
    system_prompt = f"""
    You are a customer experience expert. Based on the reviews related to "{issue_type}", create a comprehensive summary that includes:
    
    1. A clear overview of the common issues/pain points
    2. Key insights into customer expectations
    3. Proposed solutions or best practices
    4. Training recommendations for staff
    5. Potential feedback for vendors or product improvements
    
    Format your response in Markdown with appropriate headers, bullet points, and sections.
    """
    
    try:
        # Get OpenAI client
        client = get_openai_client()
        
        # Make the API call
        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        # do not change this unless explicitly requested by the user
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here are the reviews related to {issue_type}:\n\n{reviews_text}"}
            ],
            max_tokens=1500
        )
        
        # Return the generated summary
        return response.choices[0].message.content
    
    except Exception as e:
        raise Exception(f"Failed to generate summary: {str(e)}")

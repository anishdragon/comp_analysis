import os
import json
import pandas as pd
from anthropic import Anthropic

def get_anthropic_client():
    """
    Initialize and return the Anthropic client using the API key from environment variables
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("Anthropic API key not found. Please set the ANTHROPIC_API_KEY environment variable.")
    
    return Anthropic(api_key=api_key)

def analyze_review(review_content, review_title="", rating=None):
    """
    Analyze a review using Anthropic Claude to determine sentiment, aspect, and issue type
    
    Args:
        review_content (str): The main content of the review
        review_title (str, optional): The title of the review, if available
        rating (float, optional): The numerical rating, if available
    
    Returns:
        dict: A dictionary containing the analysis results
    """
    # Ensure we have valid input data
    if review_title is None:
        review_title = ""
    if not isinstance(review_content, str):
        review_content = str(review_content)
    
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
       - For Product: "Quality Issue", "Functionality Issue", "Design Issue", "Durability Issue", "Product Defect", etc.
       - For Service: "Customer Support Issue", "Delivery Issue", "Logistics Issue", "Response Time Issue", "Installation Issue", etc.
       - For Other: "Pricing Issue", "Policy Issue", "Website Issue", "App Issue", "Documentation Issue", etc.
    
    Also classify the sentiment analysis with more detail - in addition to positive/negative, include:
    - Sentiment Score: A numeric score from -1.0 (extremely negative) to 1.0 (extremely positive)
    - Key Emotions: List the main emotions expressed (anger, satisfaction, frustration, joy, disappointment, etc.)
    - Urgency Level: How urgent the issue appears (high, medium, low)
    
    Provide a confidence score (0.0 to 1.0) for your categorization.
    
    Important: Respond with ONLY JSON data and nothing else. Do not include explanations or additional text.
    Use exactly this format:
    {
        "sentiment": "Positive or Negative",
        "sentiment_score": number between -1.0 and 1.0,
        "key_emotions": ["emotion1", "emotion2"],
        "emotion": "Primary emotion",
        "urgency": "High, Medium, or Low",
        "aspect": "Product, Service, or Other",
        "issue_type": "Specific issue category",
        "confidence": number between 0 and 1
    }
    """
    
    try:
        # Get Anthropic client
        client = get_anthropic_client()
        
        # Make the API call
        #the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            system=system_prompt,
            messages=[
                {"role": "user", "content": full_review}
            ],
            max_tokens=1000,
            temperature=0.1  # Lower temperature for more consistent outputs
        )
        
        # Parse the response - Claude API returns content differently from OpenAI
        try:
            # For Claude API - extract content from response
            if hasattr(response, 'content') and response.content:
                # Get the message content
                content_block = response.content[0]
                
                # Extract the text - Claude API might format responses differently
                if hasattr(content_block, 'text'):
                    content = content_block.text
                elif hasattr(content_block, 'value'):
                    content = content_block.value
                else:
                    # Try to convert the content block to string
                    content = str(content_block).strip()
                
                # Clean up the content to ensure it's valid JSON
                # Remove any non-JSON content
                if content:
                    # Find the first '{' and last '}' for JSON extraction
                    start_idx = content.find('{')
                    end_idx = content.rfind('}') + 1
                    
                    if start_idx >= 0 and end_idx > start_idx:
                        # Extract only the JSON part
                        json_content = content[start_idx:end_idx]
                        result = json.loads(json_content)
                        
                        # Ensure all required fields are present with default values if missing
                        required_fields = {
                            "sentiment": "Neutral",
                            "aspect": "Other",
                            "issue_type": "General Feedback",
                            "confidence": 0.5,
                            "emotion": "Neutral", 
                            "urgency": "Low",
                            "sentiment_score": 0.0,
                            "key_emotions": ["Neutral"]
                        }
                        
                        # Fill in any missing fields with defaults
                        for field, default_value in required_fields.items():
                            if field not in result:
                                result[field] = default_value
                        
                        # Ensure urgency_level is mapped to urgency to handle format inconsistencies
                        if "urgency_level" in result and "urgency" not in result:
                            result["urgency"] = result["urgency_level"]
                        
                        return result
                    else:
                        raise ValueError("No valid JSON found in response content")
                else:
                    raise ValueError("Empty response content received from API")
            else:
                raise ValueError("Empty response received from API")
        except Exception as e:
            # Create a default fallback response
            default_response = {
                "sentiment": "Neutral",
                "sentiment_score": 0.0,
                "key_emotions": ["Neutral"],
                "emotion": "Neutral",
                "urgency": "Low",
                "aspect": "Other",
                "issue_type": "General Feedback",
                "confidence": 0.5
            }
            return default_response
        
        return result
    
    except Exception as e:
        # Create a default fallback response
        default_response = {
            "sentiment": "Neutral",
            "sentiment_score": 0.0,
            "key_emotions": ["Neutral"],
            "emotion": "Neutral",
            "urgency": "Low",
            "aspect": "Other",
            "issue_type": "General Feedback",
            "confidence": 0.5
        }
        return default_response

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
        # Get Anthropic client
        client = get_anthropic_client()
        
        # Make the API call
        #the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"Here are the reviews related to {issue_type}:\n\n{reviews_text}"}
            ],
            max_tokens=1500
        )
        
        # Return the generated summary
        # Extract the text based on different possible response formats
        if hasattr(response, 'content') and response.content:
            content_block = response.content[0]
            
            if hasattr(content_block, 'text'):
                return content_block.text
            elif hasattr(content_block, 'value'):
                return content_block.value
            else:
                return str(content_block)
        else:
            raise ValueError("No content in response")
    
    except Exception as e:
        raise Exception(f"Failed to generate summary: {str(e)}")
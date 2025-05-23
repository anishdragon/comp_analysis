from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from utils.google_play_scraper import scrape_google_play_reviews
from utils.trustpilot_scraper import scrape_trustpilot_reviews
from utils.ecommerce_scraper import scrape_ecommerce_reviews
from utils.anthropic_helper import analyze_review, generate_category_summary
from utils.data_processor import process_excel_file, export_knowledge_base
import json
import io
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"})

@app.route('/api/scrape', methods=['POST'])
def start_scraping():
    try:
        data = request.json
        
        # Extract configuration
        company_name = data.get('companyName', '')
        google_app_id = data.get('googlePlayAppId', '')
        trustpilot_url = data.get('trustpilotUrl', '')
        ecommerce_url = data.get('ecommerceUrl', '')
        google_count = data.get('googlePlayReviews', 500)
        trustpilot_count = data.get('trustpilotReviews', 300)
        ecommerce_count = data.get('ecommerceReviews', 100)
        
        if not company_name:
            return jsonify({"error": "Company name is required"}), 400
        
        all_data = []
        results = {"sources": [], "total_reviews": 0}
        
        # Scrape Google Play Store
        if google_app_id:
            try:
                google_data = scrape_google_play_reviews(
                    app_id=google_app_id,
                    max_reviews=google_count,
                    company_name=company_name
                )
                if not google_data.empty:
                    all_data.append(google_data)
                    results["sources"].append({
                        "name": "Google Play Store",
                        "count": len(google_data),
                        "status": "success"
                    })
            except Exception as e:
                results["sources"].append({
                    "name": "Google Play Store", 
                    "count": 0,
                    "status": "error",
                    "error": str(e)
                })
        
        # Scrape Trustpilot
        if trustpilot_url:
            try:
                trustpilot_data = scrape_trustpilot_reviews(
                    company_url=trustpilot_url,
                    max_reviews=trustpilot_count,
                    company_name=company_name
                )
                if not trustpilot_data.empty:
                    all_data.append(trustpilot_data)
                    results["sources"].append({
                        "name": "Trustpilot",
                        "count": len(trustpilot_data),
                        "status": "success"
                    })
            except Exception as e:
                results["sources"].append({
                    "name": "Trustpilot",
                    "count": 0, 
                    "status": "error",
                    "error": str(e)
                })
        
        # Scrape E-commerce
        if ecommerce_url:
            try:
                ecommerce_data = scrape_ecommerce_reviews(
                    website_url=ecommerce_url,
                    max_products=ecommerce_count,
                    company_name=company_name
                )
                if not ecommerce_data.empty:
                    all_data.append(ecommerce_data)
                    results["sources"].append({
                        "name": "E-commerce",
                        "count": len(ecommerce_data),
                        "status": "success"
                    })
            except Exception as e:
                results["sources"].append({
                    "name": "E-commerce",
                    "count": 0,
                    "status": "error", 
                    "error": str(e)
                })
        
        # Combine all data
        if all_data:
            combined_data = pd.concat(all_data, ignore_index=True)
            results["total_reviews"] = len(combined_data)
            
            # Convert to JSON-serializable format
            reviews_json = combined_data.to_dict('records')
            results["data"] = reviews_json
            
            return jsonify(results)
        else:
            return jsonify({"error": "No data could be scraped from any source"}), 400
            
    except Exception as e:
        return jsonify({"error": f"Scraping failed: {str(e)}"}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_reviews():
    try:
        data = request.json
        reviews_data = data.get('reviews', [])
        api_key = data.get('apiKey', '')
        
        if not api_key:
            return jsonify({"error": "Anthropic API key is required"}), 400
        
        if not reviews_data:
            return jsonify({"error": "No reviews data provided"}), 400
        
        analyzed_reviews = []
        categories = {}
        
        for review in reviews_data:
            try:
                # Analyze each review
                analysis = analyze_review(
                    review_content=review.get('review_content', ''),
                    review_title=review.get('review_title', ''),
                    rating=review.get('rating'),
                    api_key=api_key
                )
                
                # Add analysis to review
                review.update(analysis)
                analyzed_reviews.append(review)
                
                # Group by issue type for knowledge base
                issue_type = analysis.get('issue_type', 'Other')
                if issue_type not in categories:
                    categories[issue_type] = []
                categories[issue_type].append(review.get('review_content', ''))
                
            except Exception as e:
                print(f"Error analyzing review: {e}")
                analyzed_reviews.append(review)
        
        # Generate knowledge base summaries
        knowledge_base = {}
        for issue_type, review_contents in categories.items():
            if len(review_contents) >= 3:  # Only generate summary if we have enough reviews
                try:
                    summary = generate_category_summary(issue_type, review_contents, api_key)
                    knowledge_base[issue_type] = summary
                except Exception as e:
                    print(f"Error generating summary for {issue_type}: {e}")
        
        # Calculate statistics
        total_reviews = len(analyzed_reviews)
        positive_count = sum(1 for r in analyzed_reviews if r.get('sentiment') == 'Positive')
        negative_count = sum(1 for r in analyzed_reviews if r.get('sentiment') == 'Negative')
        
        stats = {
            "total_reviews": total_reviews,
            "positive_sentiment": round((positive_count / total_reviews) * 100, 1) if total_reviews > 0 else 0,
            "negative_sentiment": round((negative_count / total_reviews) * 100, 1) if total_reviews > 0 else 0,
            "categories": len(categories)
        }
        
        return jsonify({
            "reviews": analyzed_reviews,
            "knowledge_base": knowledge_base,
            "stats": stats,
            "categories": list(categories.keys())
        })
        
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Process the Excel file
        df, error = process_excel_file(file)
        
        if error:
            return jsonify({"error": error}), 400
        
        if df is None or df.empty:
            return jsonify({"error": "No valid data found in the file"}), 400
        
        # Convert to JSON-serializable format
        reviews_json = df.to_dict('records')
        
        return jsonify({
            "message": "File uploaded successfully",
            "total_reviews": len(reviews_json),
            "data": reviews_json
        })
        
    except Exception as e:
        return jsonify({"error": f"File upload failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
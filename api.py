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


@app.route('/api/scrape/company', methods=['POST'])
def start_company_scraping():
    try:
        data = request.get_json()
        companies = data.get('companies', [])
        
        if not companies:
            return jsonify({'error': 'No companies provided'}), 400
        
        def generate_company_scraping():
            import json
            
            all_reviews = []
            all_sources = []
            total_companies = len(companies)
            
            for i, company in enumerate(companies):
                company_name = company.get('companyName', '')
                google_play_id = company.get('googlePlayAppId', '')
                trustpilot_url = company.get('trustpilotUrl', '')
                max_reviews = company.get('maxReviews', 100)
                
                progress_data = {
                    'currentCompany': company_name,
                    'currentSource': 'Starting...',
                    'progress': (i * 100) // total_companies,
                    'totalCompanies': total_companies,
                    'completedCompanies': i,
                    'currentStep': f'Processing {company_name}...'
                }
                yield f"data: {json.dumps({'progress': progress_data})}\n\n"
                
                # Scrape Google Play Store reviews
                if google_play_id:
                    try:
                        progress_data['currentSource'] = 'Google Play Store'
                        progress_data['progress'] = (i * 100) // total_companies + 25
                        progress_data['currentStep'] = f'Scraping Google Play for {company_name}...'
                        yield f"data: {json.dumps({'progress': progress_data})}\n\n"
                        
                        from utils.google_play_scraper import scrape_google_play_reviews
                        google_reviews = scrape_google_play_reviews(
                            google_play_id, 
                            max_reviews=max_reviews, 
                            company_name=company_name
                        )
                        all_reviews.extend(google_reviews.to_dict('records'))
                        all_sources.append({'name': f'{company_name} - Google Play Store', 'count': len(google_reviews), 'status': 'success'})
                    except Exception as e:
                        all_sources.append({'name': f'{company_name} - Google Play Store', 'count': 0, 'status': 'error', 'error': str(e)})
                
                # Scrape Trustpilot reviews
                if trustpilot_url:
                    try:
                        progress_data['currentSource'] = 'Trustpilot'
                        progress_data['progress'] = (i * 100) // total_companies + 50
                        progress_data['currentStep'] = f'Scraping Trustpilot for {company_name}...'
                        yield f"data: {json.dumps({'progress': progress_data})}\n\n"
                        
                        from utils.trustpilot_scraper import scrape_trustpilot_reviews
                        trustpilot_reviews = scrape_trustpilot_reviews(
                            trustpilot_url, 
                            max_reviews=max_reviews, 
                            company_name=company_name
                        )
                        all_reviews.extend(trustpilot_reviews.to_dict('records'))
                        all_sources.append({'name': f'{company_name} - Trustpilot', 'count': len(trustpilot_reviews), 'status': 'success'})
                    except Exception as e:
                        all_sources.append({'name': f'{company_name} - Trustpilot', 'count': 0, 'status': 'error', 'error': str(e)})
                
                progress_data['currentSource'] = 'Complete'
                progress_data['progress'] = ((i + 1) * 100) // total_companies
                progress_data['completedCompanies'] = i + 1
                progress_data['currentStep'] = f'Completed {company_name}'
                yield f"data: {json.dumps({'progress': progress_data})}\n\n"
            
            # Final result
            result = {
                'reviews': all_reviews,
                'sources': all_sources,
                'total_reviews': len(all_reviews),
                'success': True
            }
            
            yield f"data: {json.dumps({'result': result})}\n\n"
        
        return Response(generate_company_scraping(), mimetype='text/plain', headers={
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Access-Control-Allow-Origin': '*'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/scrape/product', methods=['POST']) 
def start_product_scraping():
    try:
        data = request.get_json()
        products = data.get('products', [])
        
        if not products:
            return jsonify({'error': 'No products provided'}), 400
        
        def generate_product_scraping():
            import json
            
            all_reviews = []
            all_products = []
            all_sources = []
            total_products = len(products)
            
            for i, product in enumerate(products):
                company_name = product.get('companyName', '')
                ecommerce_url = product.get('ecommerceUrl', '')
                search_term = product.get('searchTerm', '')
                max_products = product.get('maxProducts', 20)
                
                progress_data = {
                    'currentCompany': company_name,
                    'currentSource': 'Searching products...',
                    'progress': (i * 100) // total_products,
                    'totalCompanies': total_products,
                    'completedCompanies': i,
                    'currentStep': f'Searching {search_term} on {company_name}...'
                }
                yield f"data: {json.dumps({'progress': progress_data})}\n\n"
                
                try:
                    progress_data['currentSource'] = f'Scraping {search_term}'
                    progress_data['progress'] = (i * 100) // total_products + 50
                    progress_data['currentStep'] = f'Analyzing products for {search_term}...'
                    yield f"data: {json.dumps({'progress': progress_data})}\n\n"
                    
                    from utils.ecommerce_scraper import scrape_ecommerce_reviews
                    ecommerce_data = scrape_ecommerce_reviews(
                        ecommerce_url, 
                        max_products=max_products,
                        company_name=company_name
                    )
                    
                    # Separate product metadata and reviews
                    product_meta = []
                    reviews = []
                    
                    for item in ecommerce_data.to_dict('records'):
                        if 'review_content' in item and item['review_content']:
                            reviews.append(item)
                        else:
                            # Product metadata
                            product_meta.append({
                                'company': company_name,
                                'search_term': search_term,
                                'product_name': item.get('product_name', ''),
                                'price': item.get('price', ''),
                                'discount': item.get('discount', ''),
                                'rating': item.get('rating', ''),
                                'reviews_count': item.get('reviews_count', ''),
                                'url': item.get('url', '')
                            })
                    
                    all_reviews.extend(reviews)
                    all_products.extend(product_meta)
                    all_sources.append({'name': f'{company_name} - {search_term}', 'count': len(reviews), 'products': len(product_meta), 'status': 'success'})
                    
                except Exception as e:
                    all_sources.append({'name': f'{company_name} - {search_term}', 'count': 0, 'products': 0, 'status': 'error', 'error': str(e)})
                
                progress_data['currentSource'] = 'Complete'
                progress_data['progress'] = ((i + 1) * 100) // total_products
                progress_data['completedCompanies'] = i + 1
                progress_data['currentStep'] = f'Completed {company_name}'
                yield f"data: {json.dumps({'progress': progress_data})}\n\n"
            
            # Final result
            result = {
                'reviews': all_reviews,
                'products': all_products,
                'sources': all_sources,
                'total_reviews': len(all_reviews),
                'total_products': len(all_products),
                'success': True
            }
            
            yield f"data: {json.dumps({'result': result})}\n\n"
        
        return Response(generate_product_scraping(), mimetype='text/plain', headers={
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Access-Control-Allow-Origin': '*'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os
import io
import base64
from datetime import datetime

# Import helper functions
from utils.data_processor import process_excel_file, export_knowledge_base
# Import Anthropic helper functions (Claude-only version)
from utils.anthropic_helper import analyze_review, generate_category_summary
# Import scraper functions
from utils.google_play_scraper import scrape_google_play_reviews
from utils.trustpilot_scraper import scrape_trustpilot_reviews

# Set page configuration
st.set_page_config(
    page_title="Review Analysis & Knowledge Base Creator",
    page_icon="📊",
    layout="wide",
)

# Initialize session state variables if they don't exist
if 'df' not in st.session_state:
    st.session_state.df = None
if 'analyzed_data' not in st.session_state:
    st.session_state.analyzed_data = None
if 'categories' not in st.session_state:
    st.session_state.categories = {}
if 'knowledge_base' not in st.session_state:
    st.session_state.knowledge_base = {}
if 'anthropic_api_key' not in st.session_state:
    st.session_state.anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY", "")
if 'scraped_data' not in st.session_state:
    st.session_state.scraped_data = None
if 'data_source_method' not in st.session_state:
    st.session_state.data_source_method = None  # 'scrape' or 'upload'
if 'scraping_in_progress' not in st.session_state:
    st.session_state.scraping_in_progress = False
if 'scraping_completed' not in st.session_state:
    st.session_state.scraping_completed = False
if 'current_tab' not in st.session_state:
    st.session_state.current_tab = "data_sourcing"  # Track which tab is active
if 'error_placeholder' not in st.session_state:
    st.session_state.error_placeholder = None  # Single placeholder for all errors

# Main app header
st.title("🚀 Sentiment Analysis & Knowledge Base Creator")
st.markdown("**Get data from various sources or upload existing data to analyze sentiment, categorize issues, and build a comprehensive knowledge base**")

# Create a centralized error placeholder (only created once)
if st.session_state.error_placeholder is None:
    st.session_state.error_placeholder = st.empty()

# Function to display errors in the centralized placeholder
def show_error(error_message):
    """Display error message in the centralized error placeholder"""
    if error_message:
        st.session_state.error_placeholder.error(f"❌ {error_message}")
    else:
        st.session_state.error_placeholder.empty()

# Sidebar for configurations
with st.sidebar:
    st.header("🔑 API Configuration")
    
    # Always show API key input
    anthropic_api_key = st.text_input(
        "Anthropic API Key",
        type="password",
        value=st.session_state.anthropic_api_key,
        help="Enter your Anthropic API key for AI analysis",
        placeholder="sk-ant-..."
    )
    
    if anthropic_api_key:
        st.session_state.anthropic_api_key = anthropic_api_key
        st.success("✅ API key configured!")
    else:
        st.warning("⚠️ API key needed for AI analysis")
    
    st.markdown("---")
    st.markdown("### 📋 How to get your API key:")
    st.markdown("1. Visit [Anthropic Console](https://console.anthropic.com/)")
    st.markdown("2. Create an account or sign in") 
    st.markdown("3. Generate a new API key")
    st.markdown("4. Copy and paste it above")
    
    st.header("⚙️ Configuration")
    
    # Show helpful info
    if st.session_state.current_tab == "analysis":
        st.info("💡 Anthropic Claude will analyze your reviews and provide detailed insights including emotions and urgency levels.")
    else:
        st.info("💡 API key not required for data scraping or uploading. You'll need it when you start analysis.")
    
    st.markdown("---")
    
    # Filters (only shown when data is loaded)
    if st.session_state.analyzed_data is not None:
        st.header("Filters")
        
        # Date range filter
        if st.session_state.df is not None and 'datetime' in st.session_state.df.columns:
            # Handle datetime values safely
            try:
                datetime_col = pd.to_datetime(st.session_state.df['datetime'], errors='coerce')
                min_date = datetime_col.min().date() if not pd.isna(datetime_col.min()) else datetime.now().date()
                max_date = datetime_col.max().date() if not pd.isna(datetime_col.max()) else datetime.now().date()
                
                date_range = st.date_input(
                    "Date Range",
                    value=(min_date, max_date),
                    min_value=min_date,
                    max_value=max_date
                )
            except Exception:
                # Default to current date if there are issues with the datetime column
                default_date = datetime.now().date()
                date_range = st.date_input(
                    "Date Range",
                    value=(default_date, default_date)
                )
        
        # Sentiment filter
        sentiment_filter = st.multiselect(
            "Sentiment",
            options=["Positive", "Negative"],
            default=["Positive", "Negative"]
        )
        
        # Aspect filter (if data exists)
        if st.session_state.categories and 'aspect' in st.session_state.categories:
            aspect_options = list(set(st.session_state.categories['aspect']))
            aspect_filter = st.multiselect(
                "Aspect",
                options=aspect_options,
                default=aspect_options
            )
        
        # Issue type filter (if data exists)
        if st.session_state.categories and 'issue_type' in st.session_state.categories:
            issue_options = list(set(st.session_state.categories['issue_type']))
            issue_filter = st.multiselect(
                "Issue Type",
                options=issue_options,
                default=issue_options
            )
        
        # Apply filters button
        apply_filters = st.button("Apply Filters")

# Main navigation - Data Sourcing is now the primary landing page
st.markdown("---")

# Create main navigation tabs
tab_names = ["🔍 Data Sourcing", "📊 Analysis Results", "📈 Visualizations", "📚 Knowledge Base"]
main_tab1, main_tab2, main_tab3, main_tab4 = st.tabs(tab_names)

# Handle tab navigation based on session state
if st.session_state.current_tab == "analysis":
    # Set active tab to Analysis Results
    st.session_state.current_tab = "data_sourcing"  # Reset for next time

# Tab 1: Data Sourcing (Primary landing page)
with main_tab1:
    st.header("🔍 Data Sourcing")
    st.markdown("Choose how you want to get your review data for analysis:")
    
    # Check if user has already chosen a method for this session
    if st.session_state.data_source_method is None:
        # Show initial choice
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("🌐 Scrape Data")
            st.markdown("""
            **Automatically collect reviews from:**
            - Google Play Store
            - Trustpilot
            - Multiple companies and competitors
            """)
            
            if st.button("🚀 Scrape Data", type="primary", use_container_width=True):
                st.session_state.data_source_method = "scrape"
                st.rerun()
        
        with col2:
            st.subheader("📁 Upload Data")
            st.markdown("""
            **Upload your existing data:**
            - Excel files with review data
            - Multiple company datasets
            - Pre-formatted review collections
            """)
            
            if st.button("📤 Upload Data", type="secondary", use_container_width=True):
                st.session_state.data_source_method = "upload"
                st.rerun()
    
    elif st.session_state.data_source_method == "scrape":
        # Scraping interface
        st.subheader("🌐 Data Scraping Configuration")
        
        # Reset button
        if st.button("🔄 Change Data Source Method", type="secondary"):
            st.session_state.data_source_method = None
            st.session_state.scraped_data = None
            st.session_state.scraping_completed = False
            st.rerun()
        
        # Scraping form
        with st.form("scraping_form"):
            st.markdown("### 🏢 Main Company Information")
            
            col1, col2 = st.columns(2)
            with col1:
                main_company = st.text_input("Company Name*", placeholder="e.g., Target")
                google_app_id = st.text_input("Google Play Store App ID*", placeholder="e.g., com.target.ui")
            
            with col2:
                trustpilot_url = st.text_input("Trustpilot Company URL*", placeholder="e.g., https://www.trustpilot.com/review/target.com")
                
            col3, col4 = st.columns(2)
            with col3:
                google_review_count = st.number_input("Google Play Reviews Count", min_value=1, max_value=1000, value=100)
            with col4:
                trustpilot_review_count = st.number_input("Trustpilot Reviews Count", min_value=1, max_value=500, value=50)
            
            st.markdown("### 🏆 Competitor Analysis")
            competitor_count = st.selectbox("Number of Competitors to Benchmark", [0, 1, 2])
            
            # Competitor fields based on selection
            competitors_data = []
            
            if competitor_count >= 1:
                st.markdown("#### Competitor 1")
                col1, col2, col3 = st.columns(3)
                with col1:
                    comp1_name = st.text_input("Competitor 1 Name", placeholder="e.g., Walmart")
                with col2:
                    comp1_google = st.text_input("Competitor 1 Google Play ID", placeholder="e.g., com.walmart.android")
                with col3:
                    comp1_trustpilot = st.text_input("Competitor 1 Trustpilot URL", placeholder="e.g., https://www.trustpilot.com/review/walmart.com")
                
                if comp1_name:
                    competitors_data.append({
                        'name': comp1_name,
                        'google_id': comp1_google,
                        'trustpilot_url': comp1_trustpilot
                    })
            
            if competitor_count >= 2:
                st.markdown("#### Competitor 2")
                col1, col2, col3 = st.columns(3)
                with col1:
                    comp2_name = st.text_input("Competitor 2 Name", placeholder="e.g., Amazon")
                with col2:
                    comp2_google = st.text_input("Competitor 2 Google Play ID", placeholder="e.g., com.amazon.mShop.android.shopping")
                with col3:
                    comp2_trustpilot = st.text_input("Competitor 2 Trustpilot URL", placeholder="e.g., https://www.trustpilot.com/review/amazon.com")
                
                if comp2_name:
                    competitors_data.append({
                        'name': comp2_name,
                        'google_id': comp2_google,
                        'trustpilot_url': comp2_trustpilot
                    })
            
            # Start scraping button
            submitted = st.form_submit_button("🚀 Start Data Collection", type="primary", use_container_width=True)
            
            if submitted:
                # Validate required fields (NO API KEY REQUIRED FOR SCRAPING)
                if not all([main_company, google_app_id, trustpilot_url]):
                    st.error("❌ Please fill in all required main company fields (marked with *)")
                else:
                    st.session_state.scraping_in_progress = True
                    
                    # Store scraping configuration
                    st.session_state.scraping_config = {
                        'main_company': {
                            'name': main_company,
                            'google_id': google_app_id,
                            'trustpilot_url': trustpilot_url,
                            'google_count': google_review_count,
                            'trustpilot_count': trustpilot_review_count
                        },
                        'competitors': competitors_data
                    }
                    st.rerun()
        
        # Show scraping progress if in progress
        if st.session_state.scraping_in_progress:
            st.markdown("---")
            st.subheader("🔄 Data Collection in Progress")
            
            # Progress containers for each source
            google_progress = st.container()
            trustpilot_progress = st.container()
            
            # Overall progress
            overall_progress = st.progress(0)
            overall_status = st.empty()
            
            all_scraped_data = []
            total_sources = 2  # Google Play + Trustpilot for main company
            completed_sources = 0
            
            try:
                config = st.session_state.scraping_config
                main_company = config['main_company']
                
                # Scrape Google Play Store reviews
                with overall_status:
                    st.info("📱 Starting Google Play Store data collection...")
                
                google_data = scrape_google_play_reviews(
                    app_id=main_company['google_id'],
                    max_reviews=main_company['google_count'],
                    company_name=main_company['name'],
                    progress_container=google_progress
                )
                
                if not google_data.empty:
                    all_scraped_data.append(google_data)
                
                completed_sources += 1
                overall_progress.progress(completed_sources / total_sources)
                
                # Scrape Trustpilot reviews
                with overall_status:
                    st.info("🌐 Starting Trustpilot data collection...")
                
                trustpilot_data = scrape_trustpilot_reviews(
                    company_url=main_company['trustpilot_url'],
                    max_reviews=main_company['trustpilot_count'],
                    company_name=main_company['name'],
                    progress_container=trustpilot_progress
                )
                
                if not trustpilot_data.empty:
                    all_scraped_data.append(trustpilot_data)
                
                completed_sources += 1
                overall_progress.progress(completed_sources / total_sources)
                
                # Process competitors if any
                for i, competitor in enumerate(config['competitors']):
                    if competitor['google_id']:
                        comp_google_data = scrape_google_play_reviews(
                            app_id=competitor['google_id'],
                            max_reviews=main_company['google_count'],
                            company_name=competitor['name'],
                            progress_container=st.container()
                        )
                        if not comp_google_data.empty:
                            all_scraped_data.append(comp_google_data)
                    
                    if competitor['trustpilot_url']:
                        comp_trustpilot_data = scrape_trustpilot_reviews(
                            company_url=competitor['trustpilot_url'],
                            max_reviews=main_company['trustpilot_count'],
                            company_name=competitor['name'],
                            progress_container=st.container()
                        )
                        if not comp_trustpilot_data.empty:
                            all_scraped_data.append(comp_trustpilot_data)
                
                # Combine all data
                if all_scraped_data:
                    combined_data = pd.concat(all_scraped_data, ignore_index=True)
                    st.session_state.scraped_data = combined_data
                    st.session_state.df = combined_data  # Set as main dataframe
                    st.session_state.scraping_completed = True
                    st.session_state.scraping_in_progress = False
                    
                    with overall_status:
                        st.success(f"✅ Data collection completed! Collected {len(combined_data)} total reviews")
                    
                    # Show scraped data preview
                    st.markdown("### 👀 Scraped Data Preview")
                    st.dataframe(combined_data, use_container_width=True)
                    
                    # Create tabs for results breakdown
                    source_tab1, source_tab2 = st.tabs(["📊 Source Breakdown", "🏢 Company Breakdown"])
                    
                    with source_tab1:
                        # Show breakdown by source
                        st.subheader("Review Sources")
                        if 'source' in combined_data.columns:
                            source_counts = combined_data['source'].value_counts().reset_index()
                            source_counts.columns = ['Source', 'Count']
                            
                            # Create pie chart for sources
                            fig = px.pie(source_counts, values='Count', names='Source', 
                                         title=f'Total Reviews by Source (Total: {len(combined_data)})',
                                         color_discrete_sequence=px.colors.qualitative.Bold)
                            fig.update_traces(textposition='inside', textinfo='percent+label')
                            st.plotly_chart(fig, use_container_width=True)
                    
                    with source_tab2:
                        # Show breakdown by company
                        st.subheader("Reviews by Company")
                        if 'company' in combined_data.columns:
                            company_counts = combined_data['company'].value_counts().reset_index()
                            company_counts.columns = ['Company', 'Count']
                            
                            # Create bar chart for companies
                            fig = px.bar(company_counts, x='Company', y='Count', 
                                         title=f'Reviews by Company (Total: {len(combined_data)})',
                                         color='Company', color_discrete_sequence=px.colors.qualitative.Bold)
                            st.plotly_chart(fig, use_container_width=True)
                    
                    # Store scraped data for later analysis
                    if st.session_state.scraped_data is None:
                        st.session_state.scraped_data = combined_data.copy()
                    
                    # Display next steps with side-by-side buttons
                    st.markdown("---")
                    st.markdown("### 📊 What's Next?")
                    st.info("Your data has been successfully collected! You can download it or proceed to analysis.")
                    
                    # Create two columns for side-by-side buttons
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        # Download Excel button with embedded download functionality
                        try:
                            # Create Excel for download
                            buffer = io.BytesIO()
                            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                                combined_data.to_excel(writer, index=False, sheet_name='Scraped_Reviews')
                            buffer.seek(0)
                            
                            # Download button that stays on same screen
                            st.download_button(
                                label="📥 Download Excel",
                                data=buffer,
                                file_name=f"scraped_reviews_{main_company['name']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
                                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                key="download_excel_final_btn",
                                use_container_width=True
                            )
                        except Exception as e:
                            st.error(f"Error creating Excel file: {str(e)}")
                    
                    with col2:
                        # Next button (routes to Analysis tab)
                        if st.button("➡️ Next", key="next_to_analysis_btn", type="primary", use_container_width=True):
                            show_error("")  # Clear any previous errors
                            # Store data and navigate to analysis
                            st.session_state.df = combined_data.copy()
                            st.session_state.current_tab = "analysis"
                            st.success("🚀 Moving to Analysis tab...")
                            # Use JavaScript to click the Analysis Results tab (index 1)
                            js_code = """
                            <script>
                                setTimeout(function() {
                                    const tabs = document.querySelectorAll('button[data-baseweb="tab"]');
                                    if (tabs && tabs[1]) {
                                        tabs[1].click();
                                    }
                                }, 200);
                            </script>
                            """
                            st.markdown(js_code, unsafe_allow_html=True)
                            st.rerun()
                
                else:
                    with overall_status:
                        st.error("❌ No data was collected from any source")
                    st.session_state.scraping_in_progress = False
                    
            except Exception as e:
                st.error(f"❌ Error during data collection: {str(e)}")
                st.session_state.scraping_in_progress = False
    
    elif st.session_state.data_source_method == "upload":
        # Upload interface
        st.subheader("📁 Data Upload")
        
        # Reset button
        if st.button("🔄 Change Data Source Method", type="secondary"):
            st.session_state.data_source_method = None
            st.session_state.df = None
            st.rerun()
        
        # Structure the upload interface with tabs
        upload_tab1, upload_tab2 = st.tabs(["📤 Upload Your Data", "📋 Sample File Format"])
        
        # Tab 1: File Upload Section
        with upload_tab1:
            st.markdown("### 📤 Upload Your Review Data")
            st.info("Upload an Excel file containing your review data. The file should have columns for review content, usernames, dates, and ratings.")
            
            # File uploader with unique key
            uploaded_file = st.file_uploader("Choose an Excel file", type=['xlsx', 'xls'], key="data_upload_tab")
            
            if uploaded_file is not None:
                try:
                    # Process the uploaded file
                    df, error_msg = process_excel_file(uploaded_file)
                    
                    if error_msg:
                        st.error(f"❌ Error processing file: {error_msg}")
                    else:
                        st.session_state.df = df
                        st.success(f"✅ File uploaded successfully! Found {len(df)} reviews")
                        
                        # Show data preview
                        st.markdown("### 👀 Data Preview")
                        st.dataframe(df.head(), use_container_width=True)
                        
                        # Show analyze button with unique key to avoid duplicate widget errors
                        if st.button("🔍 Analyze Uploaded Data", key="upload_analyze_btn", type="primary", use_container_width=True):
                            show_error("")  # Clear any previous errors
                            # Switch to analysis tab
                            st.session_state.current_tab = "analysis"
                            st.success("🚀 Switching to analysis tab with your uploaded data...")
                            # Use js to click the Analysis Results tab
                            js = f"""
                            <script>
                                function sleep(ms) {{
                                    return new Promise(resolve => setTimeout(resolve, ms));
                                }}
                                async function clickTab() {{
                                    await sleep(100);
                                    document.querySelectorAll('button[data-baseweb="tab"]')[1].click();
                                }}
                                clickTab();
                            </script>
                            """
                            st.markdown(js, unsafe_allow_html=True)
                            st.rerun()
                    
                except Exception as e:
                    show_error(f"Error processing file: {str(e)}")
        
        # Tab 2: Sample File Format
        with upload_tab2:
            st.markdown("### 📋 Sample File Format")
            st.info("Your Excel file should contain the following columns:")
            
            # Show required columns and their descriptions
            col_info = {
                "username": "The name or ID of the user who left the review",
                "review_content": "The actual text content of the review",
                "datetime": "The date and time when the review was posted (YYYY-MM-DD format)",
                "rating": "Numerical rating (e.g., 1-5 stars)",
                "review_title": "(Optional) Title of the review if available",
                "source": "(Optional) Source of the review (e.g., App Store, Website)",
                "company": "(Optional) Company name if including multiple companies"
            }
            
            for col, desc in col_info.items():
                st.markdown(f"**{col}**: {desc}")
            
            # Create sample data
            sample_data = pd.DataFrame({
                'username': ['user1', 'user2', 'user3', 'user4', 'user5'],
                'review_content': [
                    'Great app, love the features!',
                    'Could be better, has some bugs that need fixing.',
                    'Excellent customer service and easy to use interface.',
                    'App crashes frequently when trying to make a purchase.',
                    'Product arrived damaged, but customer service resolved it quickly.'
                ],
                'datetime': ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
                'rating': [5, 2, 4, 1, 3],
                'review_title': ['Love it!', 'Needs work', 'Great experience', 'Constant crashes', 'Mixed experience'],
                'source': ['App Store', 'Website', 'App Store', 'Google Play', 'Website'],
                'company': ['Company A', 'Company A', 'Company B', 'Company A', 'Company B']
            })
            
            # Show sample data
            st.markdown("### Sample Data Preview")
            st.dataframe(sample_data, use_container_width=True)
            
            # Create Excel file in memory for download
            sample_output = io.BytesIO()
            with pd.ExcelWriter(sample_output, engine='openpyxl') as writer:
                sample_data.to_excel(writer, index=False, sheet_name='Sample_Reviews')
            sample_output.seek(0)
            
            # Download button
            st.download_button(
                label="📥 Download Sample Excel File",
                data=sample_output.getvalue(),
                file_name="sample_review_format.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                type="primary",
                use_container_width=True
            )
    
    # Analysis tab - begins here

# Tab 2: Analysis Results
with main_tab2:
    st.header("📊 Analysis Results")
    
    # Check if we have either uploaded data or scraped data available
    available_data = None
    if st.session_state.df is not None:
        available_data = st.session_state.df
    elif st.session_state.scraped_data is not None:
        available_data = st.session_state.scraped_data
        # Copy scraped data to main df for analysis
        st.session_state.df = st.session_state.scraped_data
    
    if available_data is not None:
        # Show data summary at the top
        st.markdown("### 📋 Available Data for Analysis")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Reviews", len(available_data))
        with col2:
            if 'company' in available_data.columns:
                st.metric("Companies", available_data['company'].nunique())
            else:
                st.metric("Companies", "N/A")
        with col3:
            if 'source' in available_data.columns:
                st.metric("Sources", available_data['source'].nunique())
            else:
                st.metric("Sources", "N/A")
        
        # Show data preview
        with st.expander("👀 Preview Your Data", expanded=False):
            st.dataframe(available_data.head(10), use_container_width=True)
        
        st.markdown("---")
        
        # Check if data has been analyzed already
        if st.session_state.analyzed_data is None:
            # Show analysis start button (API key check happens when clicked)
            if st.button("🔍 Start Analysis", key="start_analysis_btn", type="primary", use_container_width=True):
                # NOW check if Anthropic API key is available
                if not st.session_state.anthropic_api_key:
                    show_error("Anthropic API key is required for analysis. Please enter it in the sidebar.")
                else:
                    # Clear any previous errors
                    show_error("")
                    with st.spinner("Analyzing reviews. This may take a few minutes..."):
                        # Create progress bar
                        progress_bar = st.progress(0)
                        
                        # Process each review
                        analyzed_data = []
                        categories = {
                            'sentiment': [],
                            'aspect': [],
                            'issue_type': [],
                            'emotion': [],
                            'urgency': []
                        }
                        
                        total_rows = len(available_data)
                        
                        for idx, row in available_data.iterrows():
                            # Update progress
                            progress_bar.progress((idx + 1) / total_rows)
                            
                            # Extract review content
                            review_content = row['review_content']
                            review_title = row.get('review_title', '')
                            rating = row.get('rating', None)
                            
                            # Skip empty reviews with proper type checking
                            if pd.isna(review_content) or (isinstance(review_content, str) and review_content.strip() == ""):
                                continue
                            
                            # Store analysis errors to display only once at the end
                            if 'analysis_errors' not in st.session_state:
                                st.session_state.analysis_errors = []
                                
                            # Use Anthropic Claude for analysis  
                            try:
                                # Check if Anthropic API key is provided
                                if not st.session_state.anthropic_api_key:
                                    show_error("Please enter your Anthropic API key in the sidebar before analyzing.")
                                    break
                                
                                # Get API key from session state
                                api_key = st.session_state.anthropic_api_key
                                
                                # Use Anthropic Claude with user-provided API key
                                result = analyze_review(review_content, review_title, rating, api_key)
                                
                                # Add results to the analyzed data
                                result_with_metadata = {
                                    **row.to_dict(),
                                    **result
                                }
                                analyzed_data.append(result_with_metadata)
                                
                                # Update categories
                                categories['sentiment'].append(result['sentiment'])
                                categories['aspect'].append(result['aspect'])
                                categories['issue_type'].append(result['issue_type'])
                                # Ensure keys exist before accessing
                                if 'emotion' in result:
                                    categories['emotion'].append(result['emotion'])
                                else:
                                    categories['emotion'].append('Neutral')
                                    
                                if 'urgency' in result:
                                    categories['urgency'].append(result['urgency'])
                                else:
                                    categories['urgency'].append('Medium')
                                
                            except Exception as e:
                                # Add error to collection
                                error_msg = str(e)
                                if error_msg not in st.session_state.analysis_errors:
                                    st.session_state.analysis_errors.append(error_msg)
                                
                                # Create a default result for this row
                                default_result = {
                                    **row.to_dict(),
                                    'sentiment': 'Neutral',
                                    'sentiment_score': 0.0,
                                    'aspect': 'Other',
                                    'issue_type': 'General Feedback',
                                    'emotion': 'Neutral',
                                    'urgency': 'Medium',
                                    'confidence': 0.5
                                }
                                analyzed_data.append(default_result)
                                
                                # Update categories with default values
                                categories['sentiment'].append('Neutral')
                                categories['aspect'].append('Other')
                                categories['issue_type'].append('General Feedback')
                                categories['emotion'].append('Neutral')
                                categories['urgency'].append('Medium')
                            
                    # Store analyzed data and categories in session state
                    st.session_state.analyzed_data = analyzed_data
                    st.session_state.categories = categories
                    
                    # Show analysis errors if any happened
                    if hasattr(st.session_state, 'analysis_errors') and st.session_state.analysis_errors:
                        if len(st.session_state.analysis_errors) > 3:
                            show_error(f"Some reviews had analysis issues ({len(st.session_state.analysis_errors)} total). Analysis continued with default values for these reviews.")
                        else:
                            show_error(f"Issues during analysis: {', '.join(st.session_state.analysis_errors[:3])}")
                    
                    # Generate knowledge base summaries
                    with st.spinner("Generating knowledge base summaries..."):
                        knowledge_base = {}
                        
                        # Get API key from session state for knowledge base generation
                        api_key = st.session_state.anthropic_api_key
                        
                        # Group by issue type
                        issue_types = list(set(categories['issue_type']))
                        
                        for issue_type in issue_types:
                            # Get all reviews for this issue type
                            issue_reviews = [data['review_content'] for data in analyzed_data 
                                            if data['issue_type'] == issue_type]
                            
                            if issue_reviews:
                                try:
                                    # Use Anthropic Claude for summarization with user-provided API key
                                    summary = generate_category_summary(issue_type, issue_reviews, api_key)
                                    knowledge_base[issue_type] = summary
                                except Exception as e:
                                    st.error(f"Error generating summary for {issue_type}: {str(e)}")
                        
                        # Store knowledge base in session state
                        st.session_state.knowledge_base = knowledge_base
                        
                        st.success("✅ Analysis complete! Check the Analysis Results tab to see the insights.")

# Tab 2: Analysis Results  
with main_tab2:
    if st.session_state.analyzed_data:
        st.header("Review Categorization")
        
        # Show categorized data
        analyzed_df = pd.DataFrame(st.session_state.analyzed_data)
        
        # Basic columns for display
        display_columns = ['username', 'review_content', 'sentiment', 'aspect', 'issue_type', 'confidence']
        
        # Add enhanced sentiment analysis columns if available
        enhanced_columns = []
        for col in ['sentiment_score', 'key_emotions', 'urgency_level']:
            if col in analyzed_df.columns:
                enhanced_columns.append(col)
                
        st.dataframe(analyzed_df[display_columns + enhanced_columns], use_container_width=True)
        
        # Visualizations
        st.header("Visualizations")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Sentiment Distribution
            sentiment_counts = analyzed_df['sentiment'].value_counts().reset_index()
            sentiment_counts.columns = ['Sentiment', 'Count']
            
            fig1 = px.pie(
                sentiment_counts, 
                values='Count', 
                names='Sentiment',
                title='Sentiment Distribution',
                color='Sentiment',
                color_discrete_map={'Positive': '#2ECC71', 'Negative': '#E74C3C'}
            )
            st.plotly_chart(fig1, use_container_width=True)
            
            # Sentiment Score Distribution (if available)
            if 'sentiment_score' in analyzed_df.columns:
                fig_score = px.histogram(
                    analyzed_df, 
                    x='sentiment_score',
                    title='Sentiment Score Distribution (-1 to +1)',
                    nbins=20,
                    color_discrete_sequence=['#3498DB']
                )
                fig_score.update_layout(
                    xaxis_title='Sentiment Score', 
                    yaxis_title='Count',
                    xaxis=dict(tickmode='linear', tick0=-1, dtick=0.2)
                )
                st.plotly_chart(fig_score, use_container_width=True)
            
            # Issue Type Distribution
            issue_counts = analyzed_df['issue_type'].value_counts().reset_index()
            issue_counts.columns = ['Issue Type', 'Count']
            
            fig3 = px.bar(
                issue_counts, 
                x='Issue Type', 
                y='Count',
                title='Issue Type Distribution',
                color='Issue Type'
            )
            st.plotly_chart(fig3, use_container_width=True)
        
        with col2:
            # Aspect Distribution
            aspect_counts = analyzed_df['aspect'].value_counts().reset_index()
            aspect_counts.columns = ['Aspect', 'Count']
            
            fig2 = px.pie(
                aspect_counts, 
                values='Count', 
                names='Aspect',
                title='Aspect Distribution'
            )
            st.plotly_chart(fig2, use_container_width=True)
            
            # Urgency Level Distribution (if available)
            if 'urgency_level' in analyzed_df.columns:
                # Define color map for urgency levels
                urgency_colors = {'High': '#E74C3C', 'Medium': '#F39C12', 'Low': '#2ECC71'}
                
                # Count occurrences of each urgency level
                urgency_counts = analyzed_df['urgency_level'].value_counts().reset_index()
                urgency_counts.columns = ['Urgency', 'Count']
                
                # Create visualization
                fig_urgency = px.bar(
                    urgency_counts, 
                    x='Urgency', 
                    y='Count',
                    title='Urgency Level Distribution',
                    color='Urgency',
                    color_discrete_map=urgency_colors
                )
                st.plotly_chart(fig_urgency, use_container_width=True)
            
            # Confidence Distribution
            fig4 = px.histogram(
                analyzed_df, 
                x='confidence',
                title='Confidence Score Distribution',
                nbins=10,
                color_discrete_sequence=['#3498DB']
            )
            fig4.update_layout(xaxis_title='Confidence Score', yaxis_title='Count')
            st.plotly_chart(fig4, use_container_width=True)
        
        # Emotions Analysis (if available)
        if 'key_emotions' in analyzed_df.columns:
            st.subheader("Key Emotions Analysis")
            
            # Process and extract emotions from the key_emotions column
            all_emotions = []
            for emotions_list in analyzed_df['key_emotions']:
                # Check if it's a string representation of a list
                if isinstance(emotions_list, str):
                    # Clean the string to extract just the emotion words
                    emotions_str = emotions_list.replace('[', '').replace(']', '').replace("'", "").replace('"', '')
                    emotions = [e.strip() for e in emotions_str.split(',') if e.strip()]
                    all_emotions.extend(emotions)
                # If it's already a list
                elif isinstance(emotions_list, list):
                    all_emotions.extend(emotions_list)
            
            # Count frequency of each emotion
            from collections import Counter
            emotion_counts = Counter(all_emotions)
            
            # Convert to DataFrame for plotting
            emotion_df = pd.DataFrame({
                'Emotion': list(emotion_counts.keys()),
                'Count': list(emotion_counts.values())
            })
            
            # Sort by count for better visualization
            emotion_df = emotion_df.sort_values('Count', ascending=False)
            
            # Take top 10 emotions if there are more
            if len(emotion_df) > 10:
                emotion_df = emotion_df.head(10)
                
            # Create bar chart
            fig_emotions = px.bar(
                emotion_df,
                x='Emotion',
                y='Count',
                title='Top Customer Emotions',
                color='Emotion'
            )
            st.plotly_chart(fig_emotions, use_container_width=True)
            
            # Create word cloud if there are enough emotions
            if len(all_emotions) >= 5:
                st.subheader("Emotion Word Cloud")
                try:
                    from wordcloud import WordCloud
                    import matplotlib.pyplot as plt
                    
                    # Create word cloud
                    wordcloud = WordCloud(
                        width=800, 
                        height=400, 
                        background_color='white',
                        colormap='viridis',
                        max_words=100
                    ).generate(' '.join(all_emotions))
                    
                    # Display word cloud using matplotlib
                    fig, ax = plt.subplots(figsize=(10, 5))
                    ax.imshow(wordcloud, interpolation='bilinear')
                    ax.axis('off')
                    st.pyplot(fig)
                except ImportError:
                    st.info("WordCloud package not available. Install it with 'pip install wordcloud' to see the word cloud visualization.")
        
        # Time Series Analysis (if datetime is available)
        if 'datetime' in analyzed_df.columns and not analyzed_df['datetime'].isna().all():
            st.subheader("Sentiment Over Time")
            
            # Convert to datetime if not already (handle mixed formats safely)
            try:
                analyzed_df['datetime'] = pd.to_datetime(analyzed_df['datetime'], errors='coerce')
                # Group by date and sentiment
                analyzed_df['date'] = analyzed_df['datetime'].dt.date
            except:
                # If datetime conversion fails, create a simple date column
                analyzed_df['date'] = pd.to_datetime('today').date()
            sentiment_time = analyzed_df.groupby(['date', 'sentiment']).size().reset_index(name='count')
            
            # Pivot for visualization
            sentiment_pivot = sentiment_time.pivot(index='date', columns='sentiment', values='count').fillna(0)
            sentiment_pivot = sentiment_pivot.reset_index()
            
            # Create time series chart
            fig5 = go.Figure()
            
            if 'Positive' in sentiment_pivot.columns:
                fig5.add_trace(go.Scatter(
                    x=sentiment_pivot['date'],
                    y=sentiment_pivot['Positive'],
                    name='Positive',
                    line=dict(color='#2ECC71', width=2)
                ))
            
            if 'Negative' in sentiment_pivot.columns:
                fig5.add_trace(go.Scatter(
                    x=sentiment_pivot['date'],
                    y=sentiment_pivot['Negative'],
                    name='Negative',
                    line=dict(color='#E74C3C', width=2)
                ))
            
            fig5.update_layout(
                title='Sentiment Trends Over Time',
                xaxis_title='Date',
                yaxis_title='Number of Reviews',
                legend_title='Sentiment'
            )
            
            st.plotly_chart(fig5, use_container_width=True)
    else:
        st.info("Please upload and analyze data first in the 'Data Sourcing' tab.")

# Tab 3: Visualizations
with main_tab3:
    if st.session_state.analyzed_data:
        st.header("📈 Data Visualizations")
        
        analyzed_df = pd.DataFrame(st.session_state.analyzed_data)
        
        # Sentiment Distribution
        st.subheader("Sentiment Distribution")
        sentiment_counts = analyzed_df['sentiment'].value_counts()
        fig1 = px.pie(values=sentiment_counts.values, names=sentiment_counts.index, 
                      title="Overall Sentiment Distribution")
        st.plotly_chart(fig1, use_container_width=True)
        
        # Issue Type Distribution  
        st.subheader("Issue Type Distribution")
        issue_counts = analyzed_df['issue_type'].value_counts()
        fig2 = px.bar(x=issue_counts.index, y=issue_counts.values,
                      title="Issues by Category", labels={'x': 'Issue Type', 'y': 'Count'})
        st.plotly_chart(fig2, use_container_width=True)
        
        # Emotion Analysis (if available)
        if 'emotions' in analyzed_df.columns:
            st.subheader("Emotion Analysis")
            all_emotions = []
            for emotions_list in analyzed_df['emotions'].dropna():
                if isinstance(emotions_list, list):
                    all_emotions.extend(emotions_list)
            
            if all_emotions:
                emotion_counts = pd.Series(all_emotions).value_counts()
                fig3 = px.bar(x=emotion_counts.index, y=emotion_counts.values,
                              title="Most Common Emotions", labels={'x': 'Emotion', 'y': 'Count'})
                st.plotly_chart(fig3, use_container_width=True)
        
        # Urgency Distribution (if available)
        if 'urgency' in analyzed_df.columns:
            st.subheader("Urgency Level Distribution")
            urgency_counts = analyzed_df['urgency'].value_counts()
            fig4 = px.bar(x=urgency_counts.index, y=urgency_counts.values,
                          title="Reviews by Urgency Level", labels={'x': 'Urgency', 'y': 'Count'})
            st.plotly_chart(fig4, use_container_width=True)
        
        # Time Series Analysis (if datetime available)
        if 'datetime' in analyzed_df.columns and not analyzed_df['datetime'].isna().all():
            st.subheader("Sentiment Trends Over Time")
            analyzed_df['datetime'] = pd.to_datetime(analyzed_df['datetime'])
            analyzed_df['date'] = analyzed_df['datetime'].dt.date
            
            sentiment_time = analyzed_df.groupby(['date', 'sentiment']).size().reset_index(name='count')
            fig5 = px.line(sentiment_time, x='date', y='count', color='sentiment',
                           title="Sentiment Trends Over Time")
            st.plotly_chart(fig5, use_container_width=True)
    else:
        st.info("Please upload and analyze data first in the 'Data Sourcing' tab.")

# Tab 4: Knowledge Base
with main_tab4:
    if st.session_state.knowledge_base:
        st.header("Knowledge Base")
        st.markdown("This section contains automatically generated summaries and insights for each issue type to help train staff and provide feedback to vendors.")
        
        # Display knowledge base entries
        for issue_type, summary in st.session_state.knowledge_base.items():
            with st.expander(f"📚 {issue_type}"):
                st.markdown(summary)
                
                # Edit button for each summary
                if st.button(f"Edit Summary for {issue_type}"):
                    st.session_state[f"editing_{issue_type}"] = True
                
                # Show editor if in editing mode
                if st.session_state.get(f"editing_{issue_type}", False):
                    edited_summary = st.text_area(
                        f"Edit Summary for {issue_type}", 
                        value=summary,
                        height=300,
                        key=f"edit_{issue_type}"
                    )
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.button(f"Save Changes for {issue_type}"):
                            st.session_state.knowledge_base[issue_type] = edited_summary
                            st.session_state[f"editing_{issue_type}"] = False
                            st.rerun()
                    
                    with col2:
                        if st.button(f"Cancel Editing for {issue_type}"):
                            st.session_state[f"editing_{issue_type}"] = False
                            st.rerun()
        
        # Export knowledge base
        st.header("Export Knowledge Base")
        export_format = st.selectbox("Export Format", ["Excel", "CSV", "Markdown"])
        
        if st.button("Export Knowledge Base"):
            try:
                export_data = export_knowledge_base(
                    st.session_state.knowledge_base,
                    format=export_format.lower()
                )
                
                # Create download link
                if export_format == "Excel":
                    buffer = io.BytesIO()
                    export_data.to_excel(buffer, index=False)
                    buffer.seek(0)
                    b64 = base64.b64encode(buffer.read()).decode()
                    href = f'<a href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,{b64}" download="knowledge_base.xlsx">Download Excel File</a>'
                    st.markdown(href, unsafe_allow_html=True)
                
                elif export_format == "CSV":
                    csv = export_data.to_csv(index=False)
                    b64 = base64.b64encode(csv.encode()).decode()
                    href = f'<a href="data:text/csv;base64,{b64}" download="knowledge_base.csv">Download CSV File</a>'
                    st.markdown(href, unsafe_allow_html=True)
                
                elif export_format == "Markdown":
                    markdown_text = export_data
                    b64 = base64.b64encode(markdown_text.encode()).decode()
                    href = f'<a href="data:text/markdown;base64,{b64}" download="knowledge_base.md">Download Markdown File</a>'
                    st.markdown(href, unsafe_allow_html=True)
                
                st.success(f"Knowledge base exported as {export_format}!")
            
            except Exception as e:
                st.error(f"Error exporting knowledge base: {str(e)}")
    else:
        st.info("Please upload and analyze data in the 'Data Upload & Analysis' tab first to generate the knowledge base.")

# Footer
st.markdown("---")
st.markdown("Review Analysis & Knowledge Base Creator | Built with Streamlit")

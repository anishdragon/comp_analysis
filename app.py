import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os
import io
import base64
from datetime import datetime

# Import helper functions from both APIs
from utils.data_processor import process_excel_file, export_knowledge_base
# We'll dynamically select which API to use
import utils.openai_helper
import utils.anthropic_helper

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
if 'ai_service' not in st.session_state:
    st.session_state.ai_service = "anthropic"  # Default to Anthropic Claude
if 'api_key' not in st.session_state:
    st.session_state.api_key = ""  # For backward compatibility
if 'openai_api_key' not in st.session_state:
    st.session_state.openai_api_key = os.environ.get("OPENAI_API_KEY", "")
if 'anthropic_api_key' not in st.session_state:
    st.session_state.anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY", "")

# Main app header
st.title("Sentiment Analysis & Knowledge Base Creator")
st.markdown("Upload user reviews to analyze sentiment, categorize issues, and build a knowledge base")

# Sidebar for configurations and filters
with st.sidebar:
    st.header("Configuration")
    
    # AI Service selection
    ai_service = st.radio(
        "Select AI Service",
        options=["Anthropic Claude", "OpenAI GPT"],
        index=0 if st.session_state.ai_service == "anthropic" else 1,
        help="Choose which AI service to use for analyzing reviews"
    )
    
    # Update session state based on selection
    if ai_service == "Anthropic Claude" and st.session_state.ai_service != "anthropic":
        st.session_state.ai_service = "anthropic"
    elif ai_service == "OpenAI GPT" and st.session_state.ai_service != "openai":
        st.session_state.ai_service = "openai"
    
    # Display the appropriate API key input based on selection
    if st.session_state.ai_service == "anthropic":
        # Anthropic API Key input
        anthropic_key = st.text_input("Anthropic API Key", value=st.session_state.anthropic_api_key, type="password")
        if anthropic_key != st.session_state.anthropic_api_key:
            st.session_state.anthropic_api_key = anthropic_key
            os.environ["ANTHROPIC_API_KEY"] = anthropic_key
        
        st.info("Anthropic Claude is a powerful AI that can analyze your reviews and provide detailed insights.")
    else:
        # OpenAI API Key input
        openai_key = st.text_input("OpenAI API Key", value=st.session_state.openai_api_key, type="password")
        if openai_key != st.session_state.openai_api_key:
            st.session_state.openai_api_key = openai_key
            os.environ["OPENAI_API_KEY"] = openai_key
        
        st.info("OpenAI GPT is widely used for text analysis and can provide high-quality categorization of your reviews.")
    
    st.markdown("---")
    
    # Filters (only shown when data is loaded)
    if st.session_state.analyzed_data is not None:
        st.header("Filters")
        
        # Date range filter
        if 'datetime' in st.session_state.df.columns:
            min_date = st.session_state.df['datetime'].min().date() if not pd.isna(st.session_state.df['datetime'].min()) else datetime.now().date()
            max_date = st.session_state.df['datetime'].max().date() if not pd.isna(st.session_state.df['datetime'].max()) else datetime.now().date()
            
            date_range = st.date_input(
                "Date Range",
                value=(min_date, max_date),
                min_value=min_date,
                max_value=max_date
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

# Main content area
tab1, tab2, tab3 = st.tabs(["Data Upload & Analysis", "Categories & Visualization", "Knowledge Base"])

# Tab 1: Data Upload & Analysis
with tab1:
    st.header("Upload Data")
    st.markdown("Upload an Excel file with review data. The file should have columns for datetime, username, review content, and review datetime. Optional columns: review title and rating.")
    
    # Create a sample file for download
    col1, col2 = st.columns([1, 2])
    with col1:
        if st.button("Download Sample File"):
            # Create sample data
            sample_data = {
                "Date": ["2024-05-01", "2024-05-02", "2024-05-03", "2024-05-04", "2024-05-05"],
                "Username": ["John Doe", "Jane Smith", "Alex Johnson", "Taylor Wilson", "Sam Brown"],
                "Review Content": [
                    "The product arrived damaged. The packaging was also torn when I received it.",
                    "Customer service was excellent. The representative was very patient and helped me resolve my issue quickly.",
                    "Delivery was delayed by two days without any communication from the company.",
                    "Great product quality, exactly as described. Would definitely purchase again.",
                    "The app keeps crashing every time I try to make a payment. Very frustrating experience."
                ],
                "Review Date": ["2024-05-01", "2024-05-02", "2024-05-03", "2024-05-04", "2024-05-05"],
                "Review Title": ["Damaged Product", "Excellent Support", "Late Delivery", "High Quality", "Technical Issue"],
                "Rating": [2, 5, 3, 5, 1]
            }
            
            # Create DataFrame
            sample_df = pd.DataFrame(sample_data)
            
            # Convert to Excel
            buffer = io.BytesIO()
            sample_df.to_excel(buffer, index=False, engine='openpyxl')
            buffer.seek(0)
            
            # Create download button
            b64 = base64.b64encode(buffer.read()).decode()
            href = f'<a href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,{b64}" download="sample_reviews.xlsx">Click here to download the sample file</a>'
            st.markdown(href, unsafe_allow_html=True)
    
    with col2:
        st.info("""
        **Expected columns in your Excel file:**
        
        **Required columns:**
        - Date/datetime (e.g., Date, Timestamp, Created At)
        - Username (e.g., User, Customer, Name)
        - Review Content (e.g., Review, Feedback, Comments)
        
        **Optional columns:**
        - Review Date (e.g., Review Timestamp, Feedback Date)
        - Review Title (e.g., Title, Subject, Heading)
        - Rating (e.g., Score, Stars, Satisfaction)
        """)
    
    # Excel file uploader
    uploaded_file = st.file_uploader("Choose an Excel file", type=['xlsx', 'xls'])
    
    if uploaded_file is not None:
        # Process the uploaded Excel file
        try:
            df, error_msg = process_excel_file(uploaded_file)
            
            if error_msg:
                st.error(error_msg)
            else:
                # Store the DataFrame in session state
                st.session_state.df = df
                
                # Display the uploaded data
                st.subheader("Uploaded Data")
                st.dataframe(df, use_container_width=True)
                
                # Button to analyze the data
                if st.button("Analyze Reviews"):
                    # Check API key based on selected service
                    api_key_missing = False
                    if st.session_state.ai_service == "anthropic" and not st.session_state.anthropic_api_key:
                        st.error("Please enter your Anthropic API key in the sidebar before analyzing.")
                        api_key_missing = True
                    elif st.session_state.ai_service == "openai" and not st.session_state.openai_api_key:
                        st.error("Please enter your OpenAI API key in the sidebar before analyzing.")
                        api_key_missing = True
                        
                    if not api_key_missing:
                        with st.spinner("Analyzing reviews. This may take a few minutes..."):
                            # Create progress bar
                            progress_bar = st.progress(0)
                            
                            # Process each review
                            analyzed_data = []
                            categories = {
                                'sentiment': [],
                                'aspect': [],
                                'issue_type': []
                            }
                            
                            total_rows = len(df)
                            
                            for idx, row in df.iterrows():
                                # Update progress
                                progress_bar.progress((idx + 1) / total_rows)
                                
                                # Extract review content
                                review_content = row['review_content']
                                review_title = row.get('review_title', '')
                                rating = row.get('rating', None)
                                
                                # Skip empty reviews
                                if pd.isna(review_content) or review_content.strip() == "":
                                    continue
                                
                                # Select which API to use based on user's choice
                                try:
                                    if st.session_state.ai_service == "anthropic":
                                        # Check if Anthropic API key is provided
                                        if not st.session_state.anthropic_api_key:
                                            st.error("Please enter your Anthropic API key in the sidebar before analyzing.")
                                            break
                                        
                                        # Use Anthropic Claude
                                        result = utils.anthropic_helper.analyze_review(review_content, review_title, rating)
                                    else:
                                        # Check if OpenAI API key is provided
                                        if not st.session_state.openai_api_key:
                                            st.error("Please enter your OpenAI API key in the sidebar before analyzing.")
                                            break
                                        
                                        # Use OpenAI
                                        result = utils.openai_helper.analyze_review(review_content, review_title, rating)
                                    
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
                                    
                                except Exception as e:
                                    st.error(f"Error analyzing review: {str(e)}")
                            
                            # Store analyzed data and categories
                            st.session_state.analyzed_data = analyzed_data
                            st.session_state.categories = categories
                            
                            # Generate knowledge base summaries
                            with st.spinner("Generating knowledge base summaries..."):
                                knowledge_base = {}
                                
                                # Group by issue type
                                issue_types = list(set(categories['issue_type']))
                                
                                for issue_type in issue_types:
                                    # Get all reviews for this issue type
                                    issue_reviews = [data['review_content'] for data in analyzed_data 
                                                    if data['issue_type'] == issue_type]
                                    
                                    if issue_reviews:
                                        # Generate summary for this issue type
                                        try:
                                            # Use the selected AI service for summary generation
                                            if st.session_state.ai_service == "anthropic":
                                                # Use Anthropic Claude
                                                summary = utils.anthropic_helper.generate_category_summary(issue_type, issue_reviews)
                                            else:
                                                # Use OpenAI
                                                summary = utils.openai_helper.generate_category_summary(issue_type, issue_reviews)
                                                
                                            knowledge_base[issue_type] = summary
                                        except Exception as e:
                                            st.error(f"Error generating summary for {issue_type}: {str(e)}")
                                
                                st.session_state.knowledge_base = knowledge_base
                            
                            st.success("Analysis complete!")
        
        except Exception as e:
            st.error(f"Error processing file: {str(e)}")

# Tab 2: Categories & Visualization
with tab2:
    if st.session_state.analyzed_data:
        st.header("Review Categorization")
        
        # Show categorized data
        analyzed_df = pd.DataFrame(st.session_state.analyzed_data)
        st.dataframe(analyzed_df[['username', 'review_content', 'sentiment', 'aspect', 'issue_type', 'confidence']], use_container_width=True)
        
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
        
        # Time Series Analysis (if datetime is available)
        if 'datetime' in analyzed_df.columns and not analyzed_df['datetime'].isna().all():
            st.subheader("Sentiment Over Time")
            
            # Convert to datetime if not already
            analyzed_df['datetime'] = pd.to_datetime(analyzed_df['datetime'])
            
            # Group by date and sentiment
            analyzed_df['date'] = analyzed_df['datetime'].dt.date
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
        st.info("Please upload and analyze data in the 'Data Upload & Analysis' tab first.")

# Tab 3: Knowledge Base
with tab3:
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

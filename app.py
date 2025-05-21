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

# Main app header
st.title("Sentiment Analysis & Knowledge Base Creator")
st.markdown("Upload user reviews to analyze sentiment, categorize issues, and build a knowledge base")

# Sidebar for configurations and filters
with st.sidebar:
    st.header("Configuration")
    
    # Anthropic API Key input
    anthropic_key = st.text_input("Anthropic API Key", value=st.session_state.anthropic_api_key, type="password")
    if anthropic_key != st.session_state.anthropic_api_key:
        st.session_state.anthropic_api_key = anthropic_key
        os.environ["ANTHROPIC_API_KEY"] = anthropic_key
    
    st.info("Anthropic Claude is a powerful AI that can analyze your reviews and provide detailed insights.")
    
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
                "Date": ["2023-01-15", "2023-01-16", "2023-01-17", "2023-01-18", "2023-01-19"],
                "Username": ["Customer1", "Customer2", "Customer3", "Customer4", "Customer5"],
                "Review Content": [
                    "Product received was broken on arrival. The box was also damaged during shipping.",
                    "Support team was helpful and resolved my issue within minutes. Very satisfied!",
                    "Order took 5 days longer than promised with no updates or explanation.",
                    "Excellent quality and meets all specifications. Will order again in the future.",
                    "Mobile application constantly crashes when trying to complete checkout process."
                ],
                "Review Date": ["2023-01-15", "2023-01-16", "2023-01-17", "2023-01-18", "2023-01-19"],
                "Review Title": ["Broken Item", "Great Support", "Shipping Delay", "Perfect Product", "App Issues"],
                "Rating": [1, 5, 2, 5, 2]
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
                                
                                # Use Anthropic Claude for analysis
                                try:
                                    # Check if Anthropic API key is provided
                                    if not st.session_state.anthropic_api_key:
                                        st.error("Please enter your Anthropic API key in the sidebar before analyzing.")
                                        break
                                    
                                    # Use Anthropic Claude
                                    result = analyze_review(review_content, review_title, rating)
                                    
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
                                            # Use Anthropic Claude for summarization
                                            summary = generate_category_summary(issue_type, issue_reviews)
                                                
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

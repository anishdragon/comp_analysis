import pandas as pd
import io
import os

def process_excel_file(file):
    """
    Process an uploaded Excel file containing review data
    
    Args:
        file: The uploaded file object from Streamlit
    
    Returns:
        tuple: (DataFrame, error_message)
    """
    # Column mapping for common synonyms
    column_mapping = {
        # Date/time columns
        'datetime': ['datetime', 'date', 'timestamp', 'created_at', 'date_time', 'submission_date', 'created_date'],
        'review_datetime': ['review_datetime', 'review_date', 'feedback_date', 'review_timestamp', 'review_time', 'response_date', 'feedback_datetime'],
        
        # User identifiers
        'username': ['username', 'user', 'customer', 'customer_name', 'user_id', 'customer_id', 'respondent', 'name', 'reviewer'],
        
        # Review content
        'review_content': ['review_content', 'review', 'feedback', 'comment', 'comments', 'response', 'content', 'review_text', 'feedback_text'],
        
        # Optional columns
        'review_title': ['review_title', 'title', 'subject', 'heading', 'summary'],
        'rating': ['rating', 'score', 'stars', 'review_score', 'satisfaction', 'satisfaction_score', 'review_rating']
    }
    
    try:
        # Read the Excel file
        df = pd.read_excel(file, engine='openpyxl')
        
        # Create a standardized dataframe
        standardized_df = pd.DataFrame()
        
        # Map columns based on synonyms
        original_columns = df.columns
        mapped_columns = {}
        
        for std_col, possible_names in column_mapping.items():
            # Find the first matching column
            matched_col = next((col for col in original_columns if col.lower() in [p.lower() for p in possible_names]), None)
            
            if matched_col:
                mapped_columns[std_col] = matched_col
        
        # Check for required columns
        required_cols = ['datetime', 'username', 'review_content']
        missing_required = [col for col in required_cols if col not in mapped_columns]
        
        if missing_required:
            # Try to identify the most likely columns for missing required fields
            suggestions = []
            for missing in missing_required:
                suggestions.append(f"'{missing}' (possible columns: {', '.join(column_mapping[missing])})")
            return None, f"Missing required columns: {', '.join(suggestions)}. Please rename your columns or upload a file with these fields."
        
        # Create standardized dataframe with mapped columns
        for std_col, orig_col in mapped_columns.items():
            standardized_df[std_col] = df[orig_col]
        
        # If review_datetime is missing, use datetime as fallback
        if 'review_datetime' not in standardized_df.columns and 'datetime' in standardized_df.columns:
            standardized_df['review_datetime'] = standardized_df['datetime']
        
        # Convert datetime columns to proper format
        for date_col in ['datetime', 'review_datetime']:
            if date_col in standardized_df.columns:
                try:
                    standardized_df[date_col] = pd.to_datetime(standardized_df[date_col])
                except Exception:
                    # If conversion fails, just continue with the original format
                    pass
        
        # Clean text columns
        text_columns = ['username', 'review_content']
        if 'review_title' in standardized_df.columns:
            text_columns.append('review_title')
        
        for col in text_columns:
            if col in standardized_df.columns:
                # Replace NaN with empty string and convert to string
                standardized_df[col] = standardized_df[col].fillna('').astype(str)
                # Strip whitespace
                standardized_df[col] = standardized_df[col].str.strip()
        
        # Convert rating to numeric if present
        if 'rating' in standardized_df.columns:
            standardized_df['rating'] = pd.to_numeric(standardized_df['rating'], errors='coerce')
        
        # Copy any additional columns from original dataframe
        for col in original_columns:
            if col not in [mapped_columns.get(key) for key in mapped_columns.keys()]:
                std_col_name = col.lower().replace(' ', '_')
                standardized_df[std_col_name] = df[col]
        
        return standardized_df, None
    
    except Exception as e:
        return None, f"Error processing file: {str(e)}"

def export_knowledge_base(knowledge_base, format='excel'):
    """
    Export the knowledge base in the specified format
    
    Args:
        knowledge_base (dict): Dictionary with issue types as keys and summaries as values
        format (str): Export format ('excel', 'csv', or 'markdown')
    
    Returns:
        object: Depends on format - DataFrame for excel/csv, string for markdown
    """
    if format in ['excel', 'csv']:
        # Create a DataFrame for Excel/CSV export
        data = []
        for issue_type, summary in knowledge_base.items():
            data.append({
                'Issue Type': issue_type,
                'Summary': summary,
                'Date Generated': pd.Timestamp.now().strftime('%Y-%m-%d')
            })
        
        df = pd.DataFrame(data)
        return df
    
    elif format == 'markdown':
        # Create a markdown document
        markdown_text = "# Knowledge Base\n\n"
        markdown_text += f"Generated on: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        for issue_type, summary in knowledge_base.items():
            markdown_text += f"## {issue_type}\n\n"
            markdown_text += f"{summary}\n\n"
            markdown_text += "---\n\n"
        
        return markdown_text
    
    else:
        raise ValueError(f"Unsupported export format: {format}")

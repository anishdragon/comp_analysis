# Review Analysis & Knowledge Base Creator

## Overview
This application analyzes user reviews, categorizes sentiment and issues, and builds a knowledge base for training staff and providing feedback to vendors.

## Features
- Upload Excel files with customer reviews
- Analyze sentiment (positive/negative)
- Categorize by aspect (Product, Service, Other)
- Identify specific issue types
- Generate knowledge base summaries
- Export knowledge base in various formats
- Support for both Anthropic Claude and OpenAI GPT models

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip

### Installation
1. Clone this repository to your local machine
2. Open the project in VSCode
3. Install the required packages:
   ```
   pip install streamlit pandas plotly openai anthropic openpyxl
   ```

### Running the Application
1. Open a terminal in VSCode
2. Run the Streamlit app:
   ```
   streamlit run app.py
   ```
3. The application will open in your default web browser

### API Keys
- For OpenAI functionality: Get an API key from [OpenAI](https://openai.com)
- For Anthropic Claude functionality: Get an API key from [Anthropic](https://www.anthropic.com)

## Usage Guide
1. Select your preferred AI service in the sidebar (Anthropic Claude or OpenAI GPT)
2. Enter your API key for the selected service
3. Click "Download Sample File" to get an example Excel file format
4. Upload your Excel file with reviews
5. Click "Analyze Reviews" to process the data
6. Navigate through the tabs to view:
   - Analysis results and data summary
   - Visualizations and category breakdowns
   - Knowledge base summaries
7. Export the knowledge base in your preferred format (Excel, CSV, Markdown)

## Excel File Format
Your Excel file should have the following columns:
- Date/datetime (e.g., Date, Timestamp, Created At)
- Username (e.g., User, Customer, Name)
- Review Content (e.g., Review, Feedback, Comments)

Optional columns:
- Review Date (e.g., Review Timestamp, Feedback Date)
- Review Title (e.g., Title, Subject, Heading)
- Rating (e.g., Score, Stars, Satisfaction)
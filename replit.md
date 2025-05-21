# Review Analysis & Knowledge Base Creator

## Overview

This application is a Streamlit-based web tool designed to analyze user reviews, categorize sentiment, identify issues, and build a knowledge base. It utilizes OpenAI for natural language processing of review content and creates visualizations and exports of the analyzed data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a simple, modular architecture centered around a Streamlit web interface that processes Excel files containing user reviews. It uses OpenAI's API to analyze the sentiment and content of reviews, categorizes them, and enables users to create a knowledge base from the analysis.

Key architectural decisions:
- **Streamlit** as the web framework: Provides a simple way to build data applications with minimal frontend code
- **OpenAI API** for NLP: Leverages pre-trained models for sentiment analysis and text categorization
- **Pandas** for data processing: Handles Excel file parsing, data cleaning, and transformation
- **Plotly** for data visualization: Creates interactive charts and graphs to display analysis results

## Key Components

1. **Main Application (app.py)**
   - The entry point for the Streamlit application
   - Handles UI rendering, user input, and orchestrates the analysis process
   - Currently incomplete but has the structure for file upload and API key configuration

2. **Data Processing Module (utils/data_processor.py)**
   - Contains functions for processing Excel files
   - Performs data validation and cleaning
   - Prepares data for analysis and exports results

3. **OpenAI Helper Module (utils/openai_helper.py)**
   - Manages interactions with the OpenAI API
   - Initializes the client with API key
   - Contains functions for analyzing reviews and generating summaries

## Data Flow

1. User uploads an Excel file containing reviews through the Streamlit interface
2. The application validates and processes the file using `process_excel_file()`
3. For each review, the application calls OpenAI API through `analyze_review()` to:
   - Determine sentiment (positive/negative)
   - Identify the aspect being discussed (product, service, etc.)
   - Categorize the specific issue type
4. The analyzed data is stored in the Streamlit session state
5. The application generates visualizations and summaries based on the analysis
6. Users can filter and export the results and knowledge base

## External Dependencies

1. **OpenAI API**: Used for natural language processing and analysis of review content
   - Requires API key to be provided by the user
   - Used for sentiment analysis and categorization

2. **Python Libraries**:
   - `streamlit` (1.45.1+): Web application framework
   - `pandas` (2.2.3+): Data processing and manipulation
   - `plotly` (6.1.1+): Data visualization
   - `openai` (1.79.0+): API client for OpenAI services

## Deployment Strategy

The application is configured for deployment on Replit:
- Uses Python 3.11 runtime
- Configured to run on port 5000
- Set up for auto-scaling deployment
- Uses the `streamlit run app.py --server.port 5000` command to start the server

The `.replit` file includes workflows for easy project running with a single click. The Streamlit configuration in `.streamlit/config.toml` ensures the server runs in headless mode and is accessible from any IP address.

## Next Steps for Development

1. **Complete the main application flow**:
   - Implement the review analysis functionality
   - Add visualization components
   - Create the knowledge base generation feature

2. **Enhance error handling and validation**:
   - Improve file validation
   - Add better error messages for API failures

3. **Add filtering and sorting capabilities**:
   - Implement date range filters
   - Add category and sentiment filters

4. **Export functionality**:
   - Complete the knowledge base export feature
   - Add various export formats (Excel, CSV, JSON)
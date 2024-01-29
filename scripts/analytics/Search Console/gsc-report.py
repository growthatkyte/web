import google.oauth2
from googleapiclient.discovery import build
import pandas as pd
from googleapiclient import errors  # Import for error handling
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

encoded_service_account = os.getenv("SERVICE_ACCOUNT_BASE64")
decoded_json = base64.b64decode(encoded_service_account).decode("utf-8")
service_account_info = json.loads(decoded_json)

# Specify the Service Account JSON key file you downloaded earlier
SERVICE_ACCOUNT_FILE = '#'
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

# Authenticate using the Service Account credentials
credentials = google.oauth2.service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

# Build the Search Console service
service = build('webmasters', 'v3', credentials=credentials)

# List of sites to gather data for
sites = ['sc-domain:kyte.com.br', 'sc-domain:kyteapp.com', 'sc-domain:appkyte.com']

# Prompt the user for the start and end dates
start_date = input('Enter the start date (YYYY-MM-DD): ')
end_date = input('Enter the end date (YYYY-MM-DD): ')

# Loop through each site
for site_url in sites:
    print(f'Fetching data for {site_url}...')
    try:
        # Make a request to retrieve search analytics data for the current site
        response = service.searchanalytics().query(
            siteUrl=site_url,
            body={
                'startDate': start_date,
                'endDate': end_date,
                'dimensions': ['date'],
                'searchType': 'web',
                'rowLimit': 1000  # Adjust the row limit as needed
            }
        ).execute()

        # Check if the response contains data
        if 'rows' in response:
            # Extract the data
            data = response['rows']

            # Transform the data into a format suitable for DataFrame
            transformed_data = []
            for row in data:
                date = row['keys'][0]
                clicks = row.get('clicks', 0)
                impressions = row.get('impressions', 0)
                transformed_data.append({'Site': site_url, 'Date': date, 'Clicks': clicks, 'Impressions': impressions})

            # Create a DataFrame
            df = pd.DataFrame(transformed_data)

            # Convert the 'Date' column to a datetime object
            df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d')

            # Calculate total clicks and impressions for the current site
            total_clicks = df['Clicks'].sum()
            total_impressions = df['Impressions'].sum()

            # Save the DataFrame to a CSV file
            csv_file_path = f'gsc-report_{site_url.split(":")[1]}.csv'
            df.to_csv(csv_file_path, index=False)

            # Print the total data for the current site
            print(f'Data for {site_url} has been saved to {csv_file_path}')
            print(f'Total Clicks for {site_url}: {total_clicks}')
            print(f'Total Impressions for {site_url}: {total_impressions}')
        else:
            print(f'No data returned from the API for {site_url}.')

    except errors.HttpError as error:  # Corrected exception handling
        print(f'Error fetching data for {site_url}: {error}')

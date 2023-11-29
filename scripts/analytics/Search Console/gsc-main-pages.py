import google.oauth2
from googleapiclient.discovery import build
import pandas as pd
from googleapiclient import errors  # Import for error handling

# Specify the Service Account JSON key file you downloaded earlier
SERVICE_ACCOUNT_FILE = ''
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

# Authenticate using the Service Account credentials
credentials = google.oauth2.service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

# Build the Search Console service
service = build('webmasters', 'v3', credentials=credentials)

# List of sites to gather data for
sites = ['sc-domain:kyte.com.br', 'sc-domain:kyteapp.com', 'sc-domain:appkyte.com']

# Define the specific pages
specific_pages = [
    'https://www.kyte.com.br/',
    'https://www.kyte.com.br/fidelizar/catalogo-de-produtos',
    'https://www.kyte.com.br/fidelizar/cardapio-digital',
    'https://www.kyte.com.br/vender/recibos',
    'https://www.kyteapp.com/',
    'https://www.kyteapp.com/engaging/digital-catalog',
    'https://www.kyteapp.com/selling/receipts',
    'https://www.kyteapp.com/selling/pos-system',
    'https://www.appkyte.com/',
    'https://www.appkyte.com/fidelizar/catalogo-online',
    'https://www.appkyte.com/vender/recibos-digitales-e-impresos',
    'https://www.appkyte.com/segmento/punto-de-venta-abarrotes'
]

# Prompt the user for the start and end dates
start_date = input('Enter the start date (YYYY-MM-DD): ')
end_date = input('Enter the end date (YYYY-MM-DD): ')

# Initialize a list to store data for all sites and pages
all_sites_data = []

# Loop through each site
for site_url in sites:
    print(f'Fetching data for {site_url}...')

    for page_url in specific_pages:
        try:
            # Make a request to retrieve search analytics data for the current site and specific page
            response = service.searchanalytics().query(
                siteUrl=site_url,
                body={
                    'startDate': start_date,
                    'endDate': end_date,
                    'dimensions': ['page'],
                    'dimensionFilterGroups': [{
                        'filters': [{
                            'dimension': 'page',
                            'expression': page_url
                        }]
                    }],
                    'searchType': 'web',
                    'rowLimit': 1000
                }
            ).execute()

            # Check if the response contains data
            if 'rows' in response:
                # Aggregate clicks and impressions
                total_clicks = sum(row.get('clicks', 0) for row in response['rows'])
                total_impressions = sum(row.get('impressions', 0) for row in response['rows'])

                # Append aggregated data to the list
                all_sites_data.append({
                    'Site': site_url,
                    'Page': page_url,
                    'Total Clicks': total_clicks,
                    'Total Impressions': total_impressions
                })

        except errors.HttpError as error:
            print(f'Error fetching data for {site_url} and page {page_url}: {error}')

# Convert the list to a DataFrame
all_sites_df = pd.DataFrame(all_sites_data)

# Save the DataFrame to a CSV file
if not all_sites_df.empty:
    csv_file_path = 'gsc-main-pages.csv'
    all_sites_df.to_csv(csv_file_path, index=False)
    print(f'Aggregated data for all sites has been saved to {csv_file_path}')
else:
    print('No data returned from the API.')

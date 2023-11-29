import google.oauth2
from googleapiclient.discovery import build
import pandas as pd
from googleapiclient import errors

# Specify the Service Account JSON key file
SERVICE_ACCOUNT_FILE = ''
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

# Authenticate using the Service Account credentials
credentials = google.oauth2.service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

# Build the Search Console service
service = build('webmasters', 'v3', credentials=credentials)

def fetch_data(site, start_date, end_date, dimension):
    try:
        response = service.searchanalytics().query(
            siteUrl=site,
            body={
                'startDate': start_date,
                'endDate': end_date,
                'dimensions': [dimension],
                'searchType': 'web',
                'rowLimit': 5000
            }
        ).execute()

        return response.get('rows', [])
    except errors.HttpError as error:
        print(f'Error fetching data: {error}')
        return []

def process_data(rows, dimension, exclude_post=False):
    # Convert rows to DataFrame
    data = []
    for row in rows:
        key = row['keys'][0]
        if exclude_post and '/post' in key:
            continue
        data.append({'key': key, 'clicks': row.get('clicks', 0), 'impressions': row.get('impressions', 0)})
    
    df = pd.DataFrame(data)
    df.set_index('key', inplace=True)
    return df

def compare_data(df1, df2, metric):
    # Merge the two dataframes using an outer join
    merged_df = df1.merge(df2, on='key', how='outer', suffixes=('_1', '_2'))
    # Fill NaN values with 0
    merged_df.fillna(0, inplace=True)
    # Calculate the difference
    merged_df['difference'] = merged_df[f'{metric}_2'] - merged_df[f'{metric}_1']
    # Return top 5 gains and losses
    return merged_df['difference'].nlargest(5), merged_df['difference'].nsmallest(5)

# Replace with your site URL
site = 'sc-domain:kyteapp.com'

# Input Date Ranges
first_start_date = input('Enter the first start date (YYYY-MM-DD): ')
first_end_date = input('Enter the first end date (YYYY-MM-DD): ')
second_start_date = input('Enter the second start date (YYYY-MM-DD): ')
second_end_date = input('Enter the second end date (YYYY-MM-DD): ')

# Fetch and Process Data for Queries
first_period_queries = fetch_data(site, first_start_date, first_end_date, 'query')
second_period_queries = fetch_data(site, second_start_date, second_end_date, 'query')
df_queries_1 = process_data(first_period_queries, 'query')
df_queries_2 = process_data(second_period_queries, 'query')

# Fetch and Process Data for Pages, excluding '/post'
first_period_pages = fetch_data(site, first_start_date, first_end_date, 'page')
second_period_pages = fetch_data(site, second_start_date, second_end_date, 'page')
df_pages_1 = process_data(first_period_pages, 'page', exclude_post=True)
df_pages_2 = process_data(second_period_pages, 'page', exclude_post=True)

# Compare Data for Queries
gained_impressions_queries, lost_impressions_queries = compare_data(df_queries_1, df_queries_2, 'impressions')
gained_clicks_queries, lost_clicks_queries = compare_data(df_queries_1, df_queries_2, 'clicks')

# Compare Data for Pages
gained_impressions_pages, lost_impressions_pages = compare_data(df_pages_1, df_pages_2, 'impressions')
gained_clicks_pages, lost_clicks_pages = compare_data(df_pages_1, df_pages_2, 'clicks')

# Save to CSV
results = pd.concat([
    gained_impressions_queries, lost_impressions_queries, 
    gained_clicks_queries, lost_clicks_queries,
    gained_impressions_pages, lost_impressions_pages,
    gained_clicks_pages, lost_clicks_pages
], keys=[
    'Gained Impressions Queries', 'Lost Impressions Queries', 
    'Gained Clicks Queries', 'Lost Clicks Queries',
    'Gained Impressions Pages', 'Lost Impressions Pages',
    'Gained Clicks Pages', 'Lost Clicks Pages'
])
results.to_csv('gsc-pagesEN.csv')

print("Comparison results saved to 'gsc-pagesEN.csv'")

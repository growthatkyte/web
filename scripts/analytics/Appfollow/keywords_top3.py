import requests
from base64 import b64encode
import csv

def get_appfollow_keywords(ext_id, date=None, page=1, country=None, device=None):
    # Your API key
    api_key = ''

    # Encoding the API key for basic authentication
    encoded_key = b64encode(f"{api_key}:".encode()).decode()

    # Base URL for the AppFollow API
    url = 'https://api.appfollow.io/keywords'

    # Headers for the request
    headers = {"Authorization": f"Basic {encoded_key}"}

    # Parameters for the request
    params = {'ext_id': ext_id, 'page': page}
    if date:
        params['date'] = date
    if country:
        params['country'] = country
    if device:
        params['device'] = device

    # Making the GET request
    response = requests.get(url, headers=headers, params=params)

    # Checking if the request was successful
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code}, {response.text}"

def fetch_all_data(ext_id, country, date, device):
    all_data = []
    current_page = 1
    total_pages = 1

    while current_page <= total_pages:
        data = get_appfollow_keywords(ext_id, date, current_page, country, device)
        if isinstance(data, dict) and 'keywords' in data and 'list' in data['keywords']:
            all_data.extend(data['keywords']['list'])
            total_pages = data['keywords']['page']['total']
            current_page += 1
        else:
            print("Error or unexpected data format on page", current_page)
            break

    return all_data

def aggregate_data(data):
    positions = {1: 0, 2: 0, 3: 0}
    for item in data:
        pos = item['pos']
        if pos in positions:
            positions[pos] += 1
    return positions

# Configurations
countries = ['br', 'us', 'mx']
devices = {'Android': {'ext_id': 'com.kyte.catalog', 'device': 'android'}, 
           'iOS': {'ext_id': '6462521196', 'device': 'iphone'}}
date = input("Enter the date (YYYY-MM-DD) or leave blank for current day: ")

# Fetching, aggregating, and saving data
aggregated_results = {}
all_keywords = []

for device_name, device_info in devices.items():
    for country in countries:
        print(f"Fetching data for {device_name} in {country}...")
        keywords = fetch_all_data(device_info['ext_id'], country, date, device_info['device'])
        all_keywords.extend(keywords)
        positions = aggregate_data(keywords)
        aggregated_results[(device_name, country)] = positions

# Displaying aggregated results
for key, value in aggregated_results.items():
    device_name, country = key
    print(f"{device_name} in {country}: Position 1 - {value[1]}, Position 2 - {value[2]}, Position 3 - {value[3]}")

# Saving the data to a CSV file
if all_keywords:
    with open('keywords_top3.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        # Writing headers
        writer.writerow(all_keywords[0].keys())
        # Writing data rows
        for item in all_keywords:
            writer.writerow(item.values())
    print("Data saved to keywords_top3.csv")
else:
    print("No data to save.")


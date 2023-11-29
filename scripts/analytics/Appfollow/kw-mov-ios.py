import requests
from base64 import b64encode
import csv

def get_appfollow_keywords(ext_id, date, country, page=1, limit=10):
    # Your API key
    api_key = ''

    # Encoding the API key for basic authentication
    encoded_key = b64encode(f"{api_key}:".encode()).decode()

    # Base URL for the AppFollow API
    url = 'https://api.appfollow.io/keywords'

    # Headers and parameters for the request
    headers = {"Authorization": f"Basic {encoded_key}"}
    params = {'ext_id': ext_id, 'date': date, 'country': country, 'device': 'iphone', 'page': page, 'limit': limit}

    # Making the GET request
    response = requests.get(url, headers=headers, params=params)

    # Checking if the request was successful
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code}, {response.text}"

def compare_keywords(data_day1, data_day2):
    # Convert the data into dictionaries for easy lookup
    day1_keywords = {item['kw']: item['pos'] for item in data_day1}
    day2_keywords = {item['kw']: item['pos'] for item in data_day2}

    analysis_results = []

    # Keywords present on both days and in top 10 on either day
    for kw, pos1 in day1_keywords.items():
        if kw in day2_keywords:
            pos2 = day2_keywords[kw]
            if pos1 <= 10 or pos2 <= 10:  # Check if in top 10 on either day
                change = pos1 - pos2
                analysis_results.append({'keyword': kw, 'day1_pos': pos1, 'day2_pos': pos2, 'change': change})

    # Keywords gained on day 2 and in top 10
    gained_keywords = set(day2_keywords.keys()) - set(day1_keywords.keys())
    for kw in gained_keywords:
        if day2_keywords[kw] <= 10:  # Check if in top 10 on day 2
            analysis_results.append({'keyword': kw, 'day1_pos': '-', 'day2_pos': day2_keywords[kw], 'change': 'gained'})

    # Keywords lost after day 1 but were in top 10 on day 1
    lost_keywords = set(day1_keywords.keys()) - set(day2_keywords.keys())
    for kw in lost_keywords:
        if day1_keywords[kw] <= 10:  # Check if was in top 10 on day 1
            analysis_results.append({'keyword': kw, 'day1_pos': day1_keywords[kw], 'day2_pos': '-', 'change': 'lost'})

    return analysis_results

# Configuration
ext_id_ios = '6462521196'  # Replace with the iOS app's ID
countries = ['br', 'us', 'mx']
date1 = input("Enter Day 1 date (YYYY-MM-DD): ")
date2 = input("Enter Day 2 date (YYYY-MM-DD): ")

for country in countries:
    # Fetch data for both dates for each country
    data_day1 = get_appfollow_keywords(ext_id_ios, date1, country)
    data_day2 = get_appfollow_keywords(ext_id_ios, date2, country)

    # Compare and analyze keywords
    analysis_results = compare_keywords(data_day1['keywords']['list'], data_day2['keywords']['list'])

    # Saving the analysis results to a CSV file for each country
    with open(f'kw-mov-ios_{country}.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['keyword', 'day1_pos', 'day2_pos', 'change'])
        writer.writeheader()
        writer.writerows(analysis_results)

    print(f"Analysis data for iOS in {country.upper()} saved to kw-mov-ios_{country}.csv")

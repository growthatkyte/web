import requests
import csv
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Apps information
apps = {
    "1": {"name": "Kyte POS - iOS", "id": "280661583683"},
    "2": {"name": "Kyte POS - Android", "id": "280422679381"},
    "3": {"name": "Kyte Catalog - iOS", "id": "337081538634"},
    "4": {"name": "Kyte Catalog - Android", "id": "337076556482"},
    "5": {"name": "Kyte Control - iOS", "id": "337140720102"},
    "6": {"name": "Kyte Control - Android", "id": "337127614098"},
}

# Display apps for selection
print("Select an app to check:")
for key, app in apps.items():
    print(f"{key}. {app['name']}")

# User selects the app
selection = input("Enter the number of the app: ")
product_id = apps[selection]["id"]  # Use the selected app's ID


def get_appfigures_keywords(product_id, country, start_date, end_date):
    access_token = os.getenv("APPFIGURES_ACCESS_TOKEN")
    url = "https://api.appfigures.com/v2/aso/stats"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "products": product_id,
        "countries": country,
        "start": start_date,
        "end": end_date,
        "granularity": "daily",
    }
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        try:
            return response.json()
        except ValueError:
            return "Error: Failed to parse JSON response"
    else:
        return {"error": f"Error: {response.status_code}, {response.text}"}


def analyze_keyword_performance(data_day1, data_day2):
    analysis_results = {}
    expected_keys = [
        "avg_position",
        "highest",
        "lowest",
        "top_5",
        "top_25",
        "top_100",
        "ranked_keywords",
        "total_keywords",
        "positive",
        "negative",
        "unranked_keywords",
        "unchanged",
    ]
    for key in expected_keys:
        if key in data_day1 and key in data_day2:
            try:
                change = data_day2[key] - data_day1[key]
                analysis_results[f"{key}_change"] = change
            except TypeError:
                analysis_results[f"{key}_change"] = "Error: Invalid data type"
        else:
            analysis_results[f"{key}_change"] = "Error: Key missing"
    return analysis_results


# Prompt for country, start date, and end date inputs
country = input("Enter the country code (e.g., US, BR, MX): ")
date1 = input("Enter the start date (YYYY-MM-DD): ")
date2 = input("Enter the end date (YYYY-MM-DD): ")

data_day1_stats = get_appfigures_keywords(product_id, country, date1, date1)
data_day2_stats = get_appfigures_keywords(product_id, country, date2, date2)

analysis_results = analyze_keyword_performance(data_day1_stats, data_day2_stats)

# Define the CSV file name
csv_file_name = f"{country}_keyword_analysis_{date1}_to_{date2}.csv"

# Writing the analysis results to a CSV file
with open(csv_file_name, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Metric", "Change"])
    for key, value in analysis_results.items():
        writer.writerow([key, value])

print(f"Analysis results for {country} saved to {csv_file_name}")

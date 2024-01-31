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


def get_appfigures_keywords(product_id, country, start_date, end_date, page=1):
    access_token = os.getenv("APPFIGURES_ACCESS_TOKEN")
    url = "https://api.appfigures.com/v2/aso"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "group_by": "keyword",
        "products": product_id,
        "countries": country,
        "start_date": start_date,
        "end_date": end_date,
        "normalize": True,
        "granularity": "daily",
        "page": page,
    }
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        try:
            return response.json()
        except ValueError:
            return "Error: Failed to parse JSON response"
    else:
        return {"error": f"Error: {response.status_code}, {response.text}"}


def analyze_keyword_performance(response_data):
    analysis_results = []
    if "results" in response_data:
        for keyword_data in response_data["results"]:
            analysis_results.append(
                {
                    "keyword": keyword_data["keyword_term"],
                    "position": keyword_data["position"],
                    "delta": keyword_data["delta"],
                    "last_change": keyword_data.get(
                        "last_change", "N/A"
                    ),  # Use .get for optional fields
                    "num_apps": keyword_data["num_apps"],
                    "popularity": keyword_data.get(
                        "popularity", "N/A"
                    ),  # Use .get for optional fields
                    "competitiveness": keyword_data.get(
                        "competitiveness", "N/A"
                    ),  # Use .get for optional fields
                }
            )
    return analysis_results


# Prompt for country, start date, and end date inputs
country = input("Enter the country code (e.g., US, BR, MX): ")
start_date = input("Enter the start date (YYYY-MM-DD): ")
end_date = input("Enter the end date (YYYY-MM-DD): ")

response_data = get_appfigures_keywords(product_id, country, start_date, end_date)
analysis_results = analyze_keyword_performance(response_data)

# Define the CSV file name
csv_file_name = f"{country}_keyword_rank_trends_{start_date}_to_{end_date}.csv"

# Writing the analysis results to a CSV file
with open(csv_file_name, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=[
            "keyword",
            "position",
            "delta",
            "last_change",
            "num_apps",
            "popularity",
            "competitiveness",
        ],
    )
    writer.writeheader()
    writer.writerows(analysis_results)

print(f"Analysis results for {country} saved to {csv_file_name}")

import requests
import pandas as pd
import base64
from collections import defaultdict


def format_app_store_data(data):
    aggregated_data = defaultdict(
        lambda: {
            "units": 0,
            "views_unique": 0,
            "impressions_unique": 0,
            "days_counted": 0,
        }
    )
    for record in data:
        key = (record.get("country", "N/A"), record.get("channel", "N/A"))
        aggregated_data[key]["units"] += record.get("units", 0)
        aggregated_data[key]["views_unique"] += record.get("views_uniq", 0)
        aggregated_data[key]["impressions_unique"] += record.get("impressions_uniq", 0)
        aggregated_data[key]["days_counted"] += 1

    # Convert aggregated data to list of dictionaries
    formatted_data = []
    for (country, channel), values in aggregated_data.items():
        formatted_record = {
            "country": country if country != "all" else "N/A",
            "channel": channel,
            "units": values["units"],
            "views_unique": values["views_unique"],
            "impressions_unique": values["impressions_unique"],
        }
        formatted_data.append(formatted_record)
    return formatted_data


def get_app_store_data(ext_id, country, from_date, to_date, channel="channel"):
    api_key = ""
    encoded_key = base64.b64encode(f"{api_key}:".encode()).decode()
    headers = {"Authorization": f"Basic {encoded_key}"}
    url = f"https://api.appfollow.io/reports/aso_report?ext_id={ext_id}&country={country}&from={from_date}&to={to_date}&channel={channel}&period=daily"
    response = requests.get(url, headers=headers)
    data = response.json()
    return data.get("data", [])


def main():
    ext_id = "6462521196"
    countries = ["br", "us", "mx", "all"]

    # Prompt for from and to dates
    from_date = input("Enter the from date (YYYY-MM-DD): ")
    to_date = input("Enter the to date (YYYY-MM-DD): ")

    all_data = []

    for country in countries:
        data = get_app_store_data(ext_id, country, from_date, to_date)
        if data:
            formatted_data = format_app_store_data(data)
            all_data.extend(formatted_data)
        else:
            print(f"No data returned for country {country}")

    if all_data:
        df = pd.DataFrame(all_data)
        df.to_csv("ios_report.csv", index=False)
        print("Data has been saved to ios_report.csv.")
    else:
        print("No data available to save.")


if __name__ == "__main__":
    main()

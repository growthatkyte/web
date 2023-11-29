import requests
import pandas as pd
import base64
from collections import defaultdict


def format_google_play_data(data, country, channel):
    aggregated_data = defaultdict(
        lambda: {"units": 0, "views": 0, "total_conversion": 0, "days_counted": 0}
    )
    for record in data:
        key = (country, channel)
        aggregated_data[key]["units"] += record.get("units", 0)
        aggregated_data[key]["views"] += record.get("views", 0)
        aggregated_data[key]["total_conversion"] += record.get("conversion", 0)
        aggregated_data[key]["days_counted"] += 1

# Convert aggregated data to list of dictionaries
    formatted_data = []
    for (country, channel), values in aggregated_data.items():
        average_conversion = (
            values["total_conversion"] / values["days_counted"]
            if values["days_counted"] > 0
            else 0
        )
        formatted_record = {
            "country": country if country != "all" else "all",
            "channel": channel,
            "units": values["units"],
            "views": values["views"],
            "average_conversion": round(average_conversion, 2),
        }
        formatted_data.append(formatted_record)
    return formatted_data
    

def get_google_play_data(ext_id, country, from_date, to_date, channel):
    api_key = ""
    encoded_key = base64.b64encode(f"{api_key}:".encode()).decode()
    headers = {"Authorization": f"Basic {encoded_key}"}
    url = f"https://api.appfollow.io/reports/aso_report/gdc?ext_id={ext_id}&country={country}&from={from_date}&to={to_date}&channel={channel}&period=daily"
    response = requests.get(url, headers=headers)
    data = response.json()
    return data.get("data", [])


def main():
    ext_id = "com.kyte.catalog"
    countries = ["br", "us", "mx", "all"]

    # Prompt for from and to dates
    from_date = input("Enter the from date (YYYY-MM-DD): ")
    to_date = input("Enter the to date (YYYY-MM-DD): ")

    # Display channel options and prompt for choice
    print("Choose the channels:")
    print("1 - search")
    print("2 - explore")
    print("3 - 3rdparty")
    channel_input = input("Enter the numbers for the channels separated by commas (e.g., 1,2,3): ")

    # Map input to channels
    channel_map = {"1": "search", "2": "explore", "3": "3rdparty"}
    channels = [channel_map[num.strip()] for num in channel_input.split(',') if num.strip() in channel_map]

    all_data = []

    for country in countries:
        for channel in channels:
            data = get_google_play_data(ext_id, country, from_date, to_date, channel)
            if data:
                formatted_data = format_google_play_data(data, country, channel)
                all_data.extend(formatted_data)
            else:
                print(f"No data returned for country {country} and channel {channel}")

    if all_data:
        df = pd.DataFrame(all_data)
        df.to_csv("android_report.csv", index=False)
        print("Data has been saved to android_report.csv.")
    else:
        print("No data available to save.")

if __name__ == "__main__":
    main()

import requests
import csv
import datetime

ACCESS_TOKEN = "EAAOHnAwaw38BO2ZCMxzviMSSEhilExAjoZAZAQRbhjlWs42jQP8e5PFRUf7Sug1z6DgjYhClOijlgtuCoTJdPT1Uyqr8D52UBv8R7uLgZAWFYOAAzgMaNBXStvZA67PHKeIZA6f7A5whO7poMwUeQidMmjcGvPDj9BEjXurOQpS1nzsdbeoHto2RUn31AZAyIP6R5yUlUq7FdKWeJTb2uEYZC8EGG3QZD"
ACCOUNTS = {
    "1": ("Kyte BR", "17841406706495336"),
    "2": ("Kyte EN", "17841406789051026"),
    "3": ("Kyte ES", "17841444631956079"),
}
BASE_METRICS = "impressions,profile_views,reach,website_clicks"
FOLLOWER_METRIC = "follower_count"


def get_insights(ig_user_id, start_date, end_date, metrics=BASE_METRICS):
    base_url = f"https://graph.facebook.com/v18.0/{ig_user_id}/insights"

    params = {
        "metric": metrics,
        "period": "day",
        "since": start_date,
        "until": end_date,
        "access_token": ACCESS_TOKEN,
    }
    response = requests.get(base_url, params=params)
    response_json = response.json()

    # Enhanced Error Handling
    if "error" in response_json:
        print(f"Error fetching insights: {response_json['error']['message']}")

    return response_json


def save_insights_to_csv(insights, filename="insights.csv"):
    data = insights.get("data", [])
    if not data:
        print(f"No data to save to {filename}")
        return

    with open(filename, "w", newline="") as csvfile:
        fieldnames = ["date", "metric", "value"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for entry in data:
            metric_name = entry["name"]
            for value in entry["values"]:
                writer.writerow(
                    {
                        "date": value["end_time"],
                        "metric": metric_name,
                        "value": value["value"],
                    }
                )


def main_retrieve_insights():
    # User Input
    start_date = input("Enter the start date (YYYY-MM-DD): ")
    end_date = input("Enter the end date (YYYY-MM-DD): ")
    print("Select the account:")
    for key, (name, _) in ACCOUNTS.items():
        print(f"{key}. {name}")
    account_choice = input("Your choice (1/2/3): ")

    account_name, ig_user_id = ACCOUNTS[account_choice]

    # Fetch base metrics for the specified date range
    insights = get_insights(ig_user_id, start_date, end_date)
    if "data" in insights:
        save_insights_to_csv(
            insights, filename=f"{account_name}_{start_date}_to_{end_date}_insights.csv"
        )
        print(
            f"Base insights saved to {account_name}_{start_date}_to_{end_date}_insights.csv"
        )
    else:
        print("Failed to retrieve base insights.")

    # Fetch follower_count for last 30 days
    follower_insights = get_insights(
        ig_user_id,
        (datetime.datetime.now() - datetime.timedelta(days=30)).strftime("%Y-%m-%d"),
        (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
        metrics=FOLLOWER_METRIC,
    )
    if "data" in follower_insights:
        save_insights_to_csv(
            follower_insights,
            filename=f"{account_name}_last_30_days_follower_count.csv",
        )
        print(
            f"Follower count insights for the last 30 days saved to {account_name}_last_30_days_follower_count.csv"
        )
    else:
        print("Failed to retrieve follower count insights.")


if __name__ == "__main__":
    main_retrieve_insights()

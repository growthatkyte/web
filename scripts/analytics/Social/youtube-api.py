import csv
import google_auth_oauthlib.flow
import googleapiclient.discovery

CLIENT_SECRET_FILE = ""
SCOPES = ["https://www.googleapis.com/auth/yt-analytics.readonly"]


def authenticate():
    flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
        CLIENT_SECRET_FILE, SCOPES
    )
    credentials = flow.run_local_server(port=8080)
    return credentials


def retrieve_analytics_data(
    credentials, start_date, end_date, dimensions, video_id=None, country_code=None
):
    youtube_analytics = googleapiclient.discovery.build(
        "youtubeAnalytics", "v2", credentials=credentials
    )

    # Metrics for the query
    metrics = "views,likes,dislikes,subscribersGained,subscribersLost,comments,shares"

    query_params = {
        "ids": "channel==UCa1bm2wm3XlgOMetic_TC3Q",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": metrics,
        "dimensions": dimensions,
    }

    if dimensions == "video":
        # Update metrics based on the sample you provided
        metrics = "estimatedMinutesWatched,views,likes,subscribersGained"
        query_params["metrics"] = metrics
        query_params["maxResults"] = 10
        query_params["sort"] = "-estimatedMinutesWatched"

    # Apply filters if necessary
    if video_id and dimensions == "video":
        query_params["filters"] = f"video=={video_id}"
    elif country_code and dimensions == "country":
        query_params["filters"] = f"country=={country_code}"

    # Retrieve a report for the authenticated user's channel.
    response = youtube_analytics.reports().query(**query_params).execute()

    return response


def save_to_csv(data, dimensions):
    headers_map = {
        "day": ["Date", "Views", "Subscribers", "Interactions"],
        "country": ["Country Code", "Views", "Subscribers", "Interactions"],
        "video": [
            "Video URL",
            "Estimated Minutes Watched",
            "Views",
            "Likes",
            "Subscribers Gained",
        ],
    }
    header = headers_map[dimensions]
    rows = []

    for entry in data["rows"]:
        if dimensions == "video":
            video_url = f"https://www.youtube.com/watch?v={entry[0]}"
            row = [
                video_url,
                entry[1],  # Estimated Minutes Watched
                entry[2],  # Views
                entry[3],  # Likes
                entry[4],  # Subscribers Gained
            ]
        else:
            interactions = sum(
                entry[2:6]
            )  # This line assumes you have 4 metrics starting at index 2
            net_subscribers = entry[3] - entry[4]  # Adjust indices based on actual data
            row = [
                entry[0],  # Date or Country Code
                entry[1],  # Views
                net_subscribers,  # Net Subscribers
                interactions,  # Total interactions
            ]
        rows.append(row)

    with open("report.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)


def main():
    creds = authenticate()
    start_date = input("Enter start date (YYYY-MM-DD): ")
    end_date = input("Enter end date (YYYY-MM-DD): ")

    print("Choose a grouping option:")
    print("1. Day")
    print("2. Country")
    print("3. Video")

    choice = input("Enter your choice: ")

    dimensions_map = {
        "1": "day",
        "2": "country",
        "3": "video",
    }

    dimensions = dimensions_map.get(choice, "day")
    analytics_data = retrieve_analytics_data(creds, start_date, end_date, dimensions)
    save_to_csv(analytics_data, dimensions)


if __name__ == "__main__":
    main()

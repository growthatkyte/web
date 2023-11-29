import requests
import pandas as pd


def aso_keyword_search(limit=None):
    # Define the base URL
    base_url = "https://api.appfollow.io/aso/search?"

    # Your API key
    api_key = ""

    # Ask for parameters
    term = input("Enter a search term: ")
    device = input("Enter a device (iphone, ipad, android): ")
    country = input("Enter a country code (e.g. us): ")
    limit = input("Enter the number of results to display (e.g. 10): ")

    params = {"term": term, "device": device, "country": country, "limit": limit}

    if limit is not None:
        params["limit"] = limit

    # Send the request
    response = requests.get(base_url, params=params, auth=(api_key, ""))

    # Check the status of the request
    if response.status_code == 200:
        # Parse the response as JSON
        data = response.json()

        # Print each app's details
        for i, app in enumerate(data["result"], start=1):
            print(f"App #{i}:")
            print(f"Title: {app.get('title')}")
            print(f"Artist URL: {app.get('artist_url')}")
            print(f"Artist ID: {app.get('id')}")
            print(f"Icon: {app.get('icon')}")
            print(f"Ratings Average: {app.get('rating_avg')}")
            print(f"URL: {app.get('url')}")
            if device == "android":
                print(f"Artist Name: {app.get('artist_name')}")
                print(f"Type: {app.get('type')}")
                print(f"Price: {app.get('price')}")
                print(f"Position: {app.get('pos')}")
            print()

        # Ask user if they want to save data to a CSV file
        save_csv = input("Do you want to save the data to a CSV file? (Yes/No): ")
        if save_csv.lower() in ["yes", "y"]:
            df = pd.DataFrame(data["result"])
            df.to_csv("aso_search_results.csv", index=False)
            print("Data saved to aso_search_results.csv.")

        return data
    else:
        print(f"Request failed with status code {response.status_code}")
        return None


# Run the function
aso_keyword_search()

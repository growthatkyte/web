import requests
import pandas as pd


def get_trending_data():
    # Set up the base URL and the API key
    base_url = "https://api.appfollow.io/aso/trending"
    api_key = "MLgajeVmXqWngrSs6ky6"  # Substitute with your actual API key

    # Request parameters from the user
    keyword = input("Enter a keyword: ")
    country = input("Enter a country code (e.g., us): ")
    device = input("Enter a device (e.g., iphone, ipad, android): ")

    # Create a dictionary of parameters to send in the request
    params = {
        "keyword": keyword,
        "country": country,
        "device": device,
    }

    # Send the request
    response = requests.get(base_url, params=params, auth=(api_key, ""))

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the response as JSON
        data = response.json()

        # Print each trending item
        for item in data["trendings"]:
            print(f"Term: {item['term']}")
            print(f"Count: {item['count']}")
            print(f"Average Position: {item['avg_pos']}")
            print(f"Per Date Position: {item['per_date_pos']}")
            print()

        # Ask user if they want to save data to a CSV file
        save_csv = input("Do you want to save the data to a CSV file? (Yes/No): ")
        if save_csv.lower() in ["yes", "y"]:
            df = pd.DataFrame(data["trendings"])
            df.to_csv("aso_trending_results.csv", index=False)
            print("Data saved to aso_trending_results.csv.")

        return data
    else:
        print(f"Request failed with status code {response.status_code}")
        return None


# Run the function
get_trending_data()

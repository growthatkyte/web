import requests
import pandas as pd

def appfollow_suggest(term, country=None, device=None):
    # Define the base URL
    base_url = 'https://api.appfollow.io/aso/suggest?'

    # Your API key
    api_key = 'XXXXXXX'

    # Define parameters
    params = {
        'term': term,
    }

    if country is not None:
        params['country'] = country

    if device is not None:
        params['device'] = device

    # Send the request
    response = requests.get(base_url, params=params, auth=(api_key, ''))

    # Check the status of the request
    if response.status_code == 200:
        # Parse the response as JSON
        data = response.json()

        # Nicely print the result in the terminal
        for i, suggestion in enumerate(data, start=1):
            print(f"Suggestion #{i}:")
            print(f"Term: {suggestion.get('term')}")
            print(f"Position: {suggestion.get('pos')}")
            print()

        # Ask user if they want to save data to a CSV file
        save_csv = input("Do you want to save the data to a CSV file? (Yes/No): ")
        if save_csv.lower() in ["yes", "y"]:
            df = pd.DataFrame(data)
            df.to_csv("appfollow_suggest_results.csv", index=False)
            print("Data saved to appfollow_suggest_results.csv.")
        
        return data
    else:
        print(f"Request failed with status code {response.status_code}")
        return None

# Ask for parameters
term = input("Enter the search term: ")
country = input("Enter country code (or leave blank for default): ")
device = input("Enter device (iphone, ipad, android, or leave blank for default): ")

# Run the function
result = appfollow_suggest(term, country, device)

import requests
import pandas as pd

def appfollow_keywords(ext_id, page=None, date=None, country=None, device=None):
    # Define the base URL
    base_url = 'https://api.appfollow.io/keywords?'

    # Your API key
    api_key = 'XXXXXXX'

    # Define parameters
    params = {
        'ext_id': ext_id,
    }

    if page is not None:
        params['page'] = page

    if date is not None:
        params['date'] = date

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
        for i, keyword in enumerate(data['keywords']['list'], start=1):
            print(f"Keyword #{i}:")
            print(f"Country: {keyword['country']}")
            print(f"Date: {keyword['date']}")
            print(f"Device: {keyword['device']}")
            print(f"Keyword: {keyword['kw']}")
            print(f"Position: {keyword['pos']}")
            print(f"Score: {keyword['score']}")
            print()

        # Ask user if they want to save data to a CSV file
        save_csv = input("Do you want to save the data to a CSV file? (Yes/No): ")
        if save_csv.lower() in ["yes", "y"]:
            df = pd.DataFrame(data['keywords']['list'])
            df.to_csv("appfollow_keywords_results.csv", index=False)
            print("Data saved to appfollow_keywords_results.csv.")
        
        return data
    else:
        print(f"Request failed with status code {response.status_code}")
        return None

# Ask for parameters
ext_id_option = input("Choose the app platform (Type '1' for Android 'com.kyte', '2' for iOS '165557'): ")
ext_id = input("Enter the App Extension ID (i.e. com.kyte): ")
page = input("Enter page number (or leave blank for default): ")
date = input("Enter date (YYYY-MM-DD format, or leave blank for default): ")
country = input("Enter country code (or leave blank for default): ")
device = input("Enter device (iphone, ipad, android, or leave blank for default): ")

# Run the function
result = appfollow_keywords(ext_id, page, date, country, device)

import requests
import pandas as pd
import csv
import os
from dotenv import load_dotenv
from io import StringIO

load_dotenv()


def fetch_matomo_data(base_url, site_id, token_auth, report_id, date_range, columns):
    # Constructing the API URL
    api_url = (
        f"{base_url}/index.php?module=API&method=CustomReports.getCustomReport&"
        f"idSite={site_id}&period=range&date={date_range}&format=CSV&token_auth={token_auth}&"
        f"idCustomReport={report_id}&columns={columns}"
    )

    # Making the API request
    response = requests.get(api_url)

    # Check if the request was successful
    if response.status_code == 200:
        return response.text
    else:
        return f"Error: {response.status_code}, {response.text}"


def filter_data_for_specific_pages(csv_data, specific_pages):
    reader = csv.reader(StringIO(csv_data))
    rows = list(reader)

    # Assuming the first row is the header and the rest are data
    header = rows[0]
    data = rows[1:]

    # Filter data for specific pages
    page_index = header.index("label")  # Use 'label' as the column name
    filtered_data = [row for row in data if row[page_index] in specific_pages]

    # Converting filtered data back to CSV format
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(header)
    writer.writerows(filtered_data)

    return output.getvalue()


def save_to_csv(data, filename):
    with open(filename, "w", newline="", encoding="utf-8") as file:
        file.write(data)
    print(f"Data saved to {filename}")


def main():
    # Matomo details
    base_url = "https://kyte.matomo.cloud"
    token_auth = os.getenv("TOKEN_AUTH")
    columns = "nb_visits,goal_3_conversion"  # Visits and Conversions for Goal ID 3

    # Site and report configurations
    sites_reports = {
        "PT": {"site_id": "2", "report_id": "2"},
        "EN": {"site_id": "1", "report_id": "5"},
        "ES": {"site_id": "3", "report_id": "6"},
    }

    # User input for date range
    start_date = input("Enter the start date (YYYY-MM-DD): ")
    end_date = input("Enter the end date (YYYY-MM-DD): ")
    date_range = f"{start_date},{end_date}"

    # Specific pages to filter
    specific_pages = [
        "kyte.com.br/",
        "kyte.com.br/fidelizar/catalogo-de-produtos",
        "kyte.com.br/fidelizar/cardapio-digital",
        "kyte.com.br/vender/recibos",
        "kyteapp.com/",
        "kyteapp.com/engaging/digital-catalog",
        "kyteapp.com/selling/receipts",
        "kyteapp.com/selling/pos-system",
        "appkyte.com/",
        "appkyte.com/fidelizar/catalogo-online",
        "appkyte.com/vender/recibos-digitales-e-impresos",
        "appkyte.com/segmento/punto-de-venta-abarrotes",
    ]  # Define your specific pages here

    # Create an empty DataFrame for aggregated data
    aggregated_data = pd.DataFrame()

    for language, config in sites_reports.items():
        print(f"Fetching data for {language} site...")
        csv_data = fetch_matomo_data(
            base_url,
            config["site_id"],
            token_auth,
            config["report_id"],
            date_range,
            columns,
        )

        if not csv_data.startswith("Error"):
            filtered_csv_data = filter_data_for_specific_pages(csv_data, specific_pages)

            # Convert filtered data to DataFrame
            df = pd.read_csv(StringIO(filtered_csv_data))

            # Add a column to identify the site/language
            df["Site"] = language

            # Append this data to the aggregated DataFrame
            aggregated_data = pd.concat([aggregated_data, df], ignore_index=True)
        else:
            print(csv_data)

    # Save the aggregated data to a single CSV file
    if not aggregated_data.empty:
        aggregated_data.to_csv("matomo-main-pages.csv", index=False)
        print("Aggregated data saved to 'matomo-main-pages.csv'")
    else:
        print("No data to save.")


if __name__ == "__main__":
    main()

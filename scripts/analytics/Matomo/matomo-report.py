import requests
import csv
from io import StringIO


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


def calculate_and_append_totals(csv_data):
    reader = csv.reader(StringIO(csv_data))
    rows = list(reader)

    # Assuming the first row is the header and the rest are data
    header = rows[0]
    data = rows[1:]

    # Calculating totals
    total_visits_index = header.index("nb_visits") if "nb_visits" in header else None
    total_conversions_index = (
        header.index("goal_3_conversion") if "goal_3_conversion" in header else None
    )

    total_visits = sum(
        int(row[total_visits_index])
        for row in data
        if total_visits_index is not None and row[total_visits_index].isdigit()
    )
    total_conversions = sum(
        int(row[total_conversions_index])
        for row in data
        if total_conversions_index is not None
        and row[total_conversions_index].isdigit()
    )

    # Appending totals to the data
    totals_row = ["Total", total_visits, total_conversions]
    data.append(totals_row)

    # Converting back to CSV format
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(header)
    writer.writerows(data)

    return output.getvalue(), total_visits, total_conversions


def save_to_csv(data, filename):
    with open(filename, "w", newline="", encoding="utf-8") as file:
        file.write(data)
    print(f"Data saved to {filename}")


def main():
    # Matomo details
    base_url = "https://kyte.matomo.cloud"
    token_auth = ""
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
            (
                csv_data_with_totals,
                total_visits,
                total_conversions,
            ) = calculate_and_append_totals(csv_data)
            save_to_csv(csv_data_with_totals, f"matomo-report{language}.csv")
            print(
                f"{language} Site - Total Visits: {total_visits}, Total Conversions: {total_conversions}"
            )
        else:
            print(csv_data)


if __name__ == "__main__":
    main()

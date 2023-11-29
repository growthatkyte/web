import requests
import time
import os
from dotenv import load_dotenv  # <-- Import the load_dotenv function

load_dotenv()  # <-- Load the environment variables from .env file

INTERCOM_API_KEY = os.getenv("INTERCOM_API_KEY")


def convert_to_unix_timestamp(date_str):
    return int(time.mktime(time.strptime(date_str, "%Y-%m-%d %H:%M:%S")))


def create_export_job(created_at_after, created_at_before):
    url = "https://api.intercom.io/export/content/data"
    payload = {
        "created_at_after": convert_to_unix_timestamp(created_at_after + " 00:00:00"),
        "created_at_before": convert_to_unix_timestamp(created_at_before + " 23:59:59"),
    }
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"Bearer {INTERCOM_API_KEY}",
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        try:
            response_json = response.json()
            job_identifier = response_json.get("job_identifier")
            if job_identifier is None:
                raise KeyError("Job identifier not found in the API response.")
            return job_identifier
        except ValueError:
            raise ValueError("Invalid JSON response from the API.")
    else:
        raise Exception(f"API request failed with status code: {response.status_code}")


def check_job_status(job_identifier):
    url = f"https://api.intercom.io/export/content/data/{job_identifier}"
    headers = {
        "accept": "application/json",
        "authorization": "Bearer dG9rOjdmYmJlMWMzXzhhMjhfNDJiNV84NzA5XzJiM2ZhYjIzYTkzODoxOjA=",
    }

    response = requests.get(url, headers=headers)
    return response.json()["status"]


def download_report(job_identifier, output_folder):
    url = f"https://api.intercom.io/download/content/data/{job_identifier}"
    headers = {
        "accept": "application/octet-stream",
        "authorization": "Bearer dG9rOjdmYmJlMWMzXzhhMjhfNDJiNV84NzA5XzJiM2ZhYjIzYTkzODoxOjA=",  # Get the ID from Intercom
    }

    response = requests.get(url, headers=headers)
    report_path = os.path.join(
        output_folder, f"intercom_report_{job_identifier}.csv.gz"
    )

    with open(report_path, "wb") as f:
        f.write(response.content)

    return report_path


def main():
    created_at_after = input("Enter the start date (YYYY-MM-DD): ")
    created_at_before = input("Enter the end date (YYYY-MM-DD): ")

    job_identifier = create_export_job(created_at_after, created_at_before)
    print("✅ Job sent to Intercom.")

    while True:
        status = check_job_status(job_identifier)
        if status == "completed":
            break
        else:
            print("🟡 Generating report...")
            time.sleep(15)

    output_folder = "intercom_reports"
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    report_path = download_report(job_identifier, output_folder)
    print(f"✅ Report downloaded and saved at: {report_path}")


if __name__ == "__main__":
    main()

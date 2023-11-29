# Mautic Contacts Import Script

This script imports contacts from a CSV file into Mautic, a marketing automation platform. It utilizes the Mautic API to authenticate, exchange authorization code for an access token, and import contacts with additional UTM tags.

## Requirements

- Python 3.x
- Requests library
- python-dotenv library

## Usage

1. Clone or download the script to your local machine.
2. Install the required dependencies mentioned in the "Requirements" section using pip or any package manager of your choice.
3. Create a `.env` file in the same directory as the script with the following configuration:

```
MAUTIC_URL=<Mautic base URL>
CLIENT_ID=<Your client ID>
CLIENT_SECRET=<Your client secret>
REDIRECT_URI=<Your redirect URI>
```

Replace the placeholders with your Mautic base URL, client ID, client secret, and redirect URI.

4. Prepare a CSV file containing the contacts you want to import. Ensure that the CSV file has the required columns, including `first_name`, `last_name`, `email`, and any additional fields you want to import.

5. Update the `csv_file` variable in the script with the path to your CSV file.

6. Run the script using the Python interpreter `python3 main.py`

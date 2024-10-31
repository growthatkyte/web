import os
import csv

# Input and output directories
input_directory = "inputs"
output_directory = "outputs"

# Maximum rows per output file
max_rows_per_file = 50000

# Load country dictionary from file: ISO codes as keys, full country names as values
country_dict = {}
with open("country_dict.csv", "r") as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Assuming the CSV has columns 'iso_code' and 'country_name'
        country_dict[row["iso_code"].strip().upper()] = row["country_name"].strip()


def normalize_text(text):
    """Removes non-UTF-8 characters and normalizes text."""
    return "".join(char for char in text if char.isascii())


# Clean up and standardize contacts
def clean_contacts(input_file):
    cleaned_contacts = []
    with open(input_file, "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Remove non-UTF-8 characters from firstname
            firstname = normalize_text(row.get("firstname", "").strip())

            # Get the country ISO code from the row and find the full name using the dictionary
            country_code = row.get("country", "").strip().upper()
            country_name = country_dict.get(
                country_code, country_code
            )  # Fallback to ISO code if not found

            # Set preferred_locale based on country code if undefined
            preferred_locale = row.get("preferred_locale", "").strip().lower()
            if preferred_locale == "undefined":
                if country_code == ["BR", "MZ", "AO"]:
                    preferred_locale = "pt_BR"
                elif country_code in [
                    "US",
                    "ID",
                    "CA",
                    "MY",
                    "PH",
                    "GB",
                    "UAE",
                    "IN",
                    "AG",
                    "MV",
                    "AE",
                    "BS",
                    "CM",
                    "SG",
                ]:
                    preferred_locale = "en_US"
                elif country_code in [
                    "MX",
                    "AR",
                    "CO",
                    "EC",
                    "PE",
                    "CL",
                    "UY",
                    "DO",
                    "CR",
                    "ES",
                    "PA",
                    "GT",
                    "GE",
                    "HN",
                    "PY",
                    "VE",
                    "NI",
                    "SV",
                ]:
                    preferred_locale = "es_MX"

            # Update the row with cleaned and standardized values
            updated_row = {
                "aid": row.get("aid", ""),
                "email": row.get("email", ""),
                "creation_date": row.get("creation_date", ""),
                "buy_date": row.get("buy_date", ""),
                "billing_status": row.get("billing_status", ""),
                "country": country_name,  # Replace with full country name
                "preferred_locale": preferred_locale,
                "firstname": firstname,
                "plan": row.get("plan", ""),
            }

            cleaned_contacts.append(updated_row)

    return cleaned_contacts


# Create output directory if it doesn't exist
if not os.path.exists(output_directory):
    os.makedirs(output_directory)

# Process each input file in the input directory
input_files = os.listdir(input_directory)
for input_file in input_files:
    input_path = os.path.join(input_directory, input_file)
    output_file_base = os.path.splitext(input_file)[0] + "_cleaned"
    output_file_counter = 1

    # Read and clean contacts from the input file
    contacts = clean_contacts(input_path)

    # Split contacts into batches with a maximum number of rows
    contact_batches = [
        contacts[i : i + max_rows_per_file]
        for i in range(0, len(contacts), max_rows_per_file)
    ]

    # Write each batch to a separate output file
    for batch in contact_batches:
        output_file = os.path.join(
            output_directory, f"{output_file_base}_{output_file_counter}.csv"
        )
        with open(output_file, "w", newline="") as file:
            # Adjust fieldnames to match the provided fields
            fieldnames = [
                "aid",
                "email",
                "creation_date",
                "buy_date",
                "billing_status",
                "country",
                "preferred_locale",
                "firstname",
                "plan",
            ]
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(batch)

        print(f"Batch {output_file_counter} written to {output_file}")
        output_file_counter += 1

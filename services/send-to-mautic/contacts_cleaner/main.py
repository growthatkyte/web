import os
import csv

# Input and output directories
input_directory = "inputs"
output_directory = "outputs"

# Maximum rows per output file
max_rows_per_file = 10000

# Load country dictionary from file
country_dict = {}
with open("country_dict.csv", "r") as file:
    reader = csv.DictReader(file)
    for row in reader:
        country_dict[row["country_name"].strip().lower()] = row["iso_code"]


def normalize_text(text):
    return " ".join(text.title().split())


# Clean up and standardize contacts
def clean_contacts(input_file):
    cleaned_contacts = []
    with open(input_file, "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Check if the 'name' column exists and is not 'Undefined' or 'undefined'
            if "name" in row and row["name"].strip().lower() not in ["undefined", ""]:
                name_parts = row["name"].split(" ", 1)
                first_name = normalize_text(name_parts[0])
                last_name = normalize_text(name_parts[1]) if len(name_parts) > 1 else ""

                # Standardize the city and state
                city = normalize_text(row.get("city", ""))
                state = normalize_text(row.get("state", ""))

                # Standardize the country column using ISO codes
                country_name = row.get("country", "").strip().lower()
                country_code = country_dict.get(country_name, row.get("country", ""))

                # Update the row with cleaned and standardized values, prepare row for writing
                updated_row = {
                    "first_name": first_name,
                    "last_name": last_name,
                    "city": city,
                    "state": state,
                    "country": country_code,
                }

                # Merge with existing data, excluding 'phone_number'
                for key in row:
                    if key not in ["phone_number", "name"]:
                        updated_row[key] = row[key]

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
            # Adjust fieldnames to match the processed and cleaned data
            fieldnames = [
                "aid",
                "email",
                "first_name",
                "last_name",
                "last_seen",
                "preferred_locale",
                "country",
                "state",
                "city",
                "os",
                "app_sessions",
                "billing_status",
                "billing_buy_date",
                "billing_end_date",
                "billing_tolerance_date",
            ]
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(batch)

        print(f"Batch {output_file_counter} written to {output_file}")
        output_file_counter += 1

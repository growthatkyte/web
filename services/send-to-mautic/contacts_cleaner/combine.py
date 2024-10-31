import os
import csv

# Specify the directory containing the CSV files
directory = "outputs"

# Specify the path for the combined output CSV file
combined_csv_path = "/Users/ivanfarias/Downloads/free_base_upload.csv"

# Initialize a variable to track whether the header has been written
header_written = False

# Open the combined output CSV file in write mode
with open(combined_csv_path, "w", newline="") as combined_file:
    writer = None

    # Iterate through each file in the directory
    for filename in os.listdir(directory):
        if filename.endswith(".csv"):
            file_path = os.path.join(directory, filename)

            # Open the current CSV file in read mode
            with open(file_path, "r", newline="") as csv_file:
                reader = csv.reader(csv_file)

                # Read the header from the first file and write it to the combined file
                if not header_written:
                    header = next(reader)
                    writer = csv.writer(combined_file)
                    writer.writerow(header)
                    header_written = True
                else:
                    # Skip the header for subsequent files
                    next(reader)

                # Write the rows from the current file to the combined file
                for row in reader:
                    writer.writerow(row)

print(f"All CSV files in {directory} have been combined into {combined_csv_path}.")

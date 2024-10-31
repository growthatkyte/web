import pandas as pd

# Replace 'your_file.csv' with your actual CSV file path
file_path = "/Users/ivanfarias/Downloads/user_export.csv"

# Load the data from the CSV file
data = pd.read_csv(file_path)

# Determine the number of rows per split file
chunk_size = 50000

# Loop over the data and write chunks to new CSV files
for i in range(0, len(data), chunk_size):
    # Extract the current chunk of data
    chunk = data.iloc[i : i + chunk_size]

    # Create a filename for the current chunk
    chunk_filename = f"split_file_{i//chunk_size + 1}.csv"

    # Write the chunk to a new CSV file
    chunk.to_csv(chunk_filename, index=False)

print("CSV file has been successfully split.")

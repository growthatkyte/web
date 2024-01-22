import os
import pandas as pd
import re


# Function to find the latest file matching a given pattern
def find_latest_file(folder, pattern):
    matching_files = []
    for f in os.listdir(folder):
        if re.match(pattern, f):
            full_path = os.path.join(folder, f)
            matching_files.append((f, os.path.getctime(full_path)))

    if not matching_files:
        print(f"No files matching pattern '{pattern}' found in folder '{folder}'.")
        return None

    latest_file = max(matching_files, key=lambda x: x[1])[0]
    return os.path.join(folder, latest_file)


# Function to join data with receipt information based on receipt_id
def join_data(df_receipt, pattern, column_name, date_column):
    file_path = find_latest_file(folder_path, pattern)
    if file_path:
        df_file = pd.read_csv(file_path)
        df_joined = pd.merge(
            df_receipt,
            df_file[["receipt_id", date_column]],
            on="receipt_id",
            how="left",
        )
        df_receipt[column_name] = df_joined[date_column]
    else:
        print(f"File matching '{pattern}' not found. Skipping.")


# Step 1: Set the folder path
folder_path = "intercom_reports"

# Step 2: Find the receipt .csv file within the folder
receipt_csv_file = find_latest_file(folder_path, r"receipt_\d{8}-\d{6}\.csv")

# Step 3: Check if a receipt .csv file was found
if receipt_csv_file is None:
    print("No receipt .csv file found in the 'intercom_reports' folder.")
    exit()

# Step 4: Read the receipt .csv file
df_receipt = pd.read_csv(receipt_csv_file, low_memory=False)

# Step 5: Join other relevant information based on receipt_id
join_data(df_receipt, r"open_\d{8}-\d{6}\.csv", "opened_at", "opened_at")
join_data(
    df_receipt, r"series_completion_\d{8}-\d{6}\.csv", "completed_at", "completed_at"
)
join_data(
    df_receipt,
    r"series_disengagement_\d{8}-\d{6}\.csv",
    "disengaged_at",
    "disengaged_at",
)
join_data(df_receipt, r"series_exit_\d{8}-\d{6}\.csv", "exited_at", "exited_at")
join_data(df_receipt, r"goal_success_\d{8}-\d{6}\.csv", "goal_hit_at", "goal_hit_at")

# Step 6: Save the enriched receipt data as a new .csv file
df_receipt.to_csv("enriched_receipt_data.csv", index=False)

print("Enriched receipt data generated successfully.")

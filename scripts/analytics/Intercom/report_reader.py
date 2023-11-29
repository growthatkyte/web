import os
import pandas as pd
from datetime import datetime


# Function to process a specific file type and count receipt_ids
def process_file(df_receipt, file_type):
    for file_name in os.listdir(folder_path):
        if file_name.startswith(file_type) and file_name.endswith(".csv"):
            file_path = os.path.join(folder_path, file_name)
            df_file = pd.read_csv(file_path)
            if "receipt_id" in df_file.columns:
                receipt_id_column = "receipt_id"
            elif "receipt_id_x" in df_file.columns:
                receipt_id_column = "receipt_id_x"
            else:
                print(
                    f"Warning: File '{file_name}' does not contain the 'receipt_id' column. Skipping."
                )
                continue
            df_receipt[file_type] = (
                df_receipt["receipt_id"].isin(df_file[receipt_id_column]).astype(int)
            )
            break


# Function to determine the category of the series_title
def get_series_category(series_title):
    categories = ["Activation", "Conversion", "WinBack", "Retention"]
    if not isinstance(series_title, str):
        return "Unknown"
    for cat in categories:
        if cat in series_title:
            return cat
    return "Unknown"


# Step 1: Find the receipt .csv file within the folder
folder_path = "intercom_reports"
receipt_csv_file = None
for file_name in os.listdir(folder_path):
    if file_name.startswith("receipt_") and file_name.endswith(".csv"):
        receipt_csv_file = os.path.join(folder_path, file_name)
        break

# Step 2: Check if a receipt .csv file was found
if receipt_csv_file is None:
    print("No receipt .csv file found in the 'intercom_reports' folder.")
    exit()

# Step 3: Read the receipt .csv file and perform initial transformations
df_receipt = pd.read_csv(receipt_csv_file)
df_receipt["received_at"] = pd.to_datetime(df_receipt["received_at"])
df_receipt["day"] = df_receipt["received_at"].dt.date

# Step 4: Process other files and count receipt_ids
files_to_process = [
    "click",
    "button_tap",
    "completion",
    "goal_success",
    "hard_bounce",
    "open",
    "reply",
    "screen_view",
    "series_completion",
    "series_disengagement",
    "series_exit",
    "soft_bounce",
    "unsubscribe",
]

for file_type in files_to_process:
    process_file(df_receipt, file_type)

# Step 5: Check if the columns exist before grouping the data
missing_columns = [col for col in files_to_process if col not in df_receipt.columns]
if missing_columns:
    print(f"Columns {missing_columns} do not exist in the data.")
    exit()

# Step 6: Check if series_title exists, then determine the category and group by it
if "series_title" in df_receipt.columns and not df_receipt["series_title"].isna().all():
    df_receipt["category"] = df_receipt["series_title"].apply(get_series_category)
    group_keys = ["day", "category", "content_type"]
else:
    group_keys = ["day", "content_type"]

grouped_data = (
    df_receipt.groupby(group_keys)
    .agg(
        {
            "receipt_id": "count",  # Count of receipt_ids from the receipt_ csv file
            "button_tap": "sum",
            "click": "sum",
            "completion": "sum",
            "goal_success": "sum",
            "hard_bounce": "sum",
            "open": "sum",
            "reply": "sum",
            "screen_view": "sum",
            "series_completion": "sum",
            "series_disengagement": "sum",
            "series_exit": "sum",
            "soft_bounce": "sum",
            "unsubscribe": "sum",
        }
    )
    .reset_index()
)

# Step 7: Save the aggregated report as a .csv file
grouped_data.to_csv("aggregated_report.csv", index=False)

print("Aggregated report generated successfully.")

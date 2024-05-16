import pandas as pd
from datetime import datetime, timedelta

# Load the CSV file
df = pd.read_csv("/Users/ivanfarias/Downloads/subs_catalog_ios.csv", dayfirst=True)
# Explicitly convert 'Signup Date' to datetime
df["Signup Date"] = pd.to_datetime(df["Signup Date"], format="%d/%m/%Y")

# Set the date as the index
df.set_index("Signup Date", inplace=True)

# Define the range of dates from a minimum to a maximum
start_date = df.index.min()
end_date = df.index.max()
all_dates = pd.date_range(start=start_date, end=end_date, freq="D")

# Reindex the dataframe to fill missing dates
df_reindexed = df.reindex(all_dates, fill_value=0)
df_reindexed.index.name = "Signup Date"
df_reindexed.reset_index(inplace=True)

# Rename columns to match original format if needed and ensure the correct datatype for output
df_reindexed.columns = ["Signup Date", "Account Create [Unique Users]"]

# Save the result to a new CSV file
df_reindexed.to_csv("filled_data.csv", index=False)

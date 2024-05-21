import pandas as pd

# Load the CSV file with the correct date format
df = pd.read_csv(
    "/Users/ivanfarias/Downloads/ads_table.csv",
    parse_dates=["Event Date"],
    date_format="%b %d, %Y",
)

# Set the 'Event Date' column as the index
df.set_index("Event Date", inplace=True)

# Resample by week (Sunday to Saturday) and sum the 'Unique Users'
weekly_sum = df.resample("W-SAT").sum()

# Reset index to get 'Event Date' back as a column
weekly_sum.reset_index(inplace=True)

# Save the result to a CSV file
weekly_sum.to_csv("/Users/ivanfarias/Downloads/weekly_sum.csv", index=False)

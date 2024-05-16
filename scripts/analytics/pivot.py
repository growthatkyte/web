import pandas as pd

# Load the CSV data
df = pd.read_csv("/Users/ivanfarias/Downloads/ads_analytics.csv")

# Convert Event Date to datetime type for better sorting
df["Event Date"] = pd.to_datetime(df["Event Date"])

# Create a unique column name combining app, channel, language, and event
df["column_name"] = (
    df["Selected Apps"]
    + "."
    + df["Channel Grouping"]
    + "."
    + df["Selected Language"]
    + "."
    + df["Event Name"]
)

# Pivot the table to get dates as rows and unique events as columns, filling missing values with 0
pivot_df = df.pivot_table(
    index="Event Date",
    columns="column_name",
    values="Unique Users",
    aggfunc="sum",
    fill_value=0,
)

# Drop columns where all values are 0
pivot_df = pivot_df.loc[:, (pivot_df != 0).any(axis=0)]

# Sort the dataframe by date
pivot_df.sort_index(inplace=True)

# Save the result to a new CSV file
pivot_df.to_csv("organized_events_with_language.csv")

print(pivot_df)

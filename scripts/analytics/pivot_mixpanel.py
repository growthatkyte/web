import pandas as pd

# Load the CSV data
df = pd.read_csv("/Users/ivanfarias/Downloads/signups_mixpanel.csv")

# Convert Store Creation Date to datetime type for sorting
df["Store Creation Date"] = pd.to_datetime(df["Store Creation Date"])

# Create a unique column name combining UTMs (Origin), Account's Last Language, OS (Simple Group), and Multi-app (at time of event)
df["column_name"] = (
    df["UTMs (Origin)"].str.lower()
    + "."
    + df["Account's Last Language"].str.lower()
    + "."
    + df["OS (Simple Group)"].str.lower()
    + "."
    + df["Multi-app (at time of event)"].str.lower()
)

# Convert the Store Creation Date to YYYY-MM-DD format
df["Date"] = df["Store Creation Date"].dt.strftime("%Y-%m-%d")

# Group by the new date and the unique column name, and sum the unique users for each group
grouped_df = (
    df.groupby(["Date", "column_name"])["Account Create [Unique Users]"]
    .sum()
    .reset_index()
)

# Generate all combinations of dates and column names
all_dates = pd.date_range(start=df["Date"].min(), end=df["Date"].max()).strftime(
    "%Y-%m-%d"
)
all_column_names = df["column_name"].unique()
all_combinations = pd.MultiIndex.from_product(
    [all_dates, all_column_names], names=["Date", "column_name"]
).to_frame(index=False)

# Merge the complete combinations with the grouped data
full_df = all_combinations.merge(grouped_df, on=["Date", "column_name"], how="left")

# Fill missing values for events with 0
full_df["Account Create [Unique Users]"].fillna(0, inplace=True)

# Save the result to a new CSV file
full_df.to_csv("organized_data_full.csv", index=False)

print(full_df)

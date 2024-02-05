import pandas as pd

# Load the CSV data
df = pd.read_csv("/Users/ivanfarias/Downloads/seo_subs.csv")

# Convert 'Date' to datetime
df["Date"] = pd.to_datetime(df["Date"])

# Map 'OS' to 'Mobile' and 'Web'
df["OS_Category"] = df["OS"].map(
    {"Android": "Mobile", "iOS": "Mobile", "Web": "Web", "undefined": "Web"}
)

# Ask the user if they want to group by week or month
grouping_period = input("Do you want to group by 'week' or 'month'? ")

if grouping_period.lower() == "week":
    freq = "W"
elif grouping_period.lower() == "month":
    freq = "M"
else:
    raise ValueError("Invalid input. Please enter 'week' or 'month'.")

# Group by the selected period, 'OS_Category', and 'Language', then sum the totals
grouped = (
    df.groupby([pd.Grouper(key="Date", freq=freq), "OS", "Language"])
    .sum()
    .reset_index()
)

# If grouping by month, convert dates to month periods
if freq == "M":
    grouped["Date"] = grouped["Date"].dt.to_period("M")

# Filter for the languages 'pt', 'en', 'es'
final_df = grouped[grouped["Language"].isin(["pt", "en", "es"])]

# Save the aggregated data to a CSV file
csv_filename = f"aggregated_data_by_{grouping_period}.csv"
final_df.to_csv(csv_filename, index=False)

print(f"Data aggregated and saved to {csv_filename}")

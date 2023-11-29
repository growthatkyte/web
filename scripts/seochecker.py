import pandas as pd

# Load the CSV data
df = pd.read_csv("/Users/ivanfarias/Documents/Development/web/scripts/subs_seo.csv")

# Convert 'Date' to datetime
df["Date"] = pd.to_datetime(df["Date"])

# Map 'OS' to 'Mobile' and 'Web'
df["OS_Category"] = df["OS"].map(
    {"Android": "Mobile", "iOS": "Mobile", "Web": "Web", "undefined": "Web"}
)

# Filter for 'SEO' and 'undefined' UTMs
filtered_df = df[
    (df["UTMs"] == "SEO") | ((df["UTMs"] == "undefined") & (df["OS_Category"] == "Web"))
]

# Group by week, 'OS_Category', and 'Language', then sum the totals
grouped = (
    filtered_df.groupby([pd.Grouper(key="Date", freq="W"), "OS_Category", "Language"])
    .sum()
    .reset_index()
)

# Filter for the languages 'pt', 'en', 'es'
final_df = grouped[grouped["Language"].isin(["pt", "en", "es"])]

# Save the aggregated data to a CSV file
final_df.to_csv("aggregated_data_by_week.csv", index=False)

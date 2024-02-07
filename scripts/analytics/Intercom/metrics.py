import pandas as pd

# Load the CSV file
df = pd.read_csv("./aggregated_report.csv")

# Convert 'day' column to datetime
df["day"] = pd.to_datetime(df["day"])

# For categories 'chat', 'push', 'post', use receipt_id for interactions
df.loc[df["category"].isin(["chat", "push", "post"]), "interactions"] = df["receipt_id"]

# In other cases, use the sum of screen_view and open for interactions
df.loc[~df["category"].isin(["chat", "push", "post"]), "interactions"] = df[
    "receipt_id"
]

# Define content_types to remove
content_types_to_remove = [
    "series",
    "answer",
    "triggerable_custom_bot",
    "inbound_custom_bot",
    "news_item",
    "resolution_bot_behavior",
    "article",
    "survey",
    "custom_bot",
    "resolution_bot_behavior_version",
]

# Remove rows with specific content_types
df = df[~df["content_type"].isin(content_types_to_remove)]

# Remove rows with category 'unknown' and 'Activation'
df = df[df["category"] != "Unknown"]
df = df[df["category"] != "Activation"]

# Calculate daily conversion rate before grouping
df["daily_conversion_rate"] = df["goal_success"] / df["interactions"]
df["daily_conversion_rate"].replace([float("inf"), float("nan")], 0, inplace=True)

# Group by week starts here
df["week"] = df["day"].dt.to_period("W-SAT").apply(lambda r: r.start_time)
grouped_df = (
    df.groupby(["week", "category", "content_type"])
    .agg(
        {
            "interactions": "sum",  # Sum interactions weekly
            "goal_success": "sum",  # Sum goal_success weekly
            "daily_conversion_rate": "mean",  # Average of daily conversion rates
        }
    )
    .reset_index()
)
# Group by week ends here

# Group by month starts here
# df["month"] = df["day"].dt.to_period("M").apply(lambda r: r.start_time)
# grouped_df = (
#    df.groupby(["month", "category", "content_type"])
#   .agg(
#        {
#            "interactions": "sum",  # Sum interactions monthly
#            "goal_success": "sum",  # Sum goal_success monthly
#            "daily_conversion_rate": "mean",  # Average of daily conversion rates
#        }
#    )
#    .reset_index()
# )

# grouped_df.rename(
#    columns={"daily_conversion_rate": "monthly_conversion_rate"}, inplace=True
# )
# Group by month ends here


# Rename 'daily_conversion_rate' to 'weekly_conversion_rate' for clarity
grouped_df.rename(
    columns={"daily_conversion_rate": "weekly_conversion_rate"}, inplace=True
)

# Save the grouped data to a new CSV file
grouped_df.to_csv("weekly_conversion_rates.csv", index=False)

print("CSV file with weekly conversion rates saved as 'weekly_conversion_rates.csv'")

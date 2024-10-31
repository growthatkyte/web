import pandas as pd

# Load the CSV file into a DataFrame
df = pd.read_csv("/Users/ivanfarias/Downloads/whatsapp.csv")

# Pivot the data to create a column for each event
pivot_df = df.pivot_table(index="DATE", columns="METRIC", values="COUNT", aggfunc="sum")

# Reset the index to turn the dates back into a column
pivot_df = pivot_df.reset_index()

# Fill NaN values with 0 in case there are missing counts for some events on some dates
pivot_df.fillna(0, inplace=True)

# Save the transformed data to a new CSV file (optional)
pivot_df.to_csv("transformed_file.csv", index=False)

# Show the result
print(pivot_df)

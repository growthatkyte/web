import pandas as pd
import numpy as np
from scipy import stats

# Load the CSV file
df = pd.read_csv("/Users/ivanfarias/Downloads/insights.csv")

# Convert 'Date' to datetime and extract day of week and hour
df["Date"] = pd.to_datetime(df["Date"])
df["DayOfWeek"] = df["Date"].dt.day_name()
df["Hour"] = df["Date"].dt.hour

# Remove outliers
# Assuming outliers are in the 'Totals' column and based on z-scores
df = df[(np.abs(stats.zscore(df["Totals"])) < 300)]

# Save the modified dataframe to a new CSV
df.to_csv("modified_file.csv", index=False)

import pandas as pd

# Load the csv file
df = pd.read_csv('keywords_android.csv')

# Select the specific columns
df = df[['Keyword', 'Position', 'Popularity', 'Difficulty', 'Effectiveness']]

# Save it back to the csv
df.to_csv('cleaned_catalog_keywords_android.csv', index=False)

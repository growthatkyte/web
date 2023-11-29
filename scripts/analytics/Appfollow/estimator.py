import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Load the CSV files into pandas dataframes
df_A = pd.read_csv('company_report_ios.csv')
df_B = pd.read_csv('company_index_ios.csv')
df_C = pd.read_csv('cleaned_catalog_keywords_iphone.csv')

# Convert string percentages to floats in df_B
df_B['share'] = df_B['share'].str.rstrip('%').astype('float') / 100.0

# Filter dataframe A to only include the "App Store Browse" and "App Store Search" channels
df_A = df_A[df_A['Channel'].isin(['explore', 'browse'])]

# Convert string to integers in df_A
df_A['Visitors'] = df_A['Visitors'].astype(int)
df_A['Installers'] = df_A['Installers'].astype(int)

# Aggregate data by month in df_A
df_A['Date'] = pd.to_datetime(df_A['Date'])
df_A.set_index('Date', inplace=True) # Set 'Date' as the index
df_A = df_A.resample('M').sum()

# Convert total visitors and installers to average monthly visitors and installers
monthly_visitors = df_A['Visitors'].mean()
monthly_installers = df_A['Installers'].mean()

# Handle NaN values in 'popularity' and 'share'
df_B['popularity'].fillna(df_B['popularity'].mean(), inplace=True)
df_B['share'].fillna(df_B['share'].mean(), inplace=True)

# Prepare the data for the linear regression
X = df_B[['popularity']]
y = df_B['share'] * monthly_visitors

# Handle NaN values in y
y.fillna(y.mean(), inplace=True)

# Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit the linear regression model
model = LinearRegression()
model.fit(X_train, y_train)

# Check the model performance
y_pred = model.predict(X_test)
print(f"RMSE: {mean_squared_error(y_test, y_pred, squared=False)}")

# Predict monthly visitors for each keyword in dataframe C
df_C['Estimated Impressions'] = model.predict(df_C[['popularity']])

# Handle NaN values in 'Estimated Impressions'
df_C['Estimated Impressions'].fillna(df_C['Estimated Impressions'].mean(), inplace=True)

# Estimate installs using the average "impressions to installs" ratio
ratio = monthly_installers / monthly_visitors
df_C['Estimated Installs'] = (df_C['Estimated Impressions'] * ratio).astype(int)

# Output the updated dataframe C to a new CSV file
df_C.to_csv('ios_catalog_estimated_impressions_and_installs.csv', index=False)

# Web Scraping Script

This script fetches metadata from URLs specified in a sitemap XML file and saves the metadata to a JSON file. It utilizes the BeautifulSoup library to parse HTML content and retrieve specific elements such as page title, meta description, and main content.

## Requirements

1. Python 3.x
2. BeautifulSoup library
3. Requests library
4. xml.etree.ElementTree module
5. JSON library

### Usage

1. Clone or download the script to your local machine.
2. Install the required dependencies mentioned in the "Requirements" section using pip `pip install -r requirements.txt`
3. Open the script file in a Python-compatible editor or IDE.
4. Modify the script as needed, e.g., update the sitemap_url variable with the desired sitemap URL.
5. Run the script using the Python interpreter.
`python3 app.py`

### Functionality

The script performs the following actions:

Fetches URLs from a sitemap XML file specified by the sitemap_url variable.
Fetches metadata (title, description, main content) from each URL.
Excludes specific HTML elements (IDs or classes) defined in the exclude_ids and exclude_classes variables.
Splits the main content into chunks of a specified size (default: 200 words) using a sliding window approach.
Saves the metadata (including chunks) to a JSON file named "metadata.json" in the same directory as the script.
Customization
You can modify the exclude_ids and exclude_classes variables to exclude specific HTML elements that should not be included in the fetched metadata.
The chunk_content function can be adjusted to change the chunk size or modify the content included in each chunk.
Additional customization can be made based on specific requirements by modifying the script as needed.
Notes
Ensure that you have appropriate permissions to access the URLs specified in the sitemap file.
Error handling is implemented for connection timeouts or request exceptions when fetching metadata from URLs.
The script may take some time to run, depending on the number of URLs in the sitemap and the response times of the websites.

import requests
from base64 import b64encode
import csv

def get_appfollow_keywords(ext_id, date=None, page=1, country=None, device=None):
    api_key = ''
    encoded_key = b64encode(f"{api_key}:".encode()).decode()
    url = 'https://api.appfollow.io/keywords'
    headers = {"Authorization": f"Basic {encoded_key}"}
    params = {'ext_id': ext_id, 'page': page}
    if date: params['date'] = date
    if country: params['country'] = country
    if device: params['device'] = device
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code}, {response.text}"

def fetch_all_data(ext_id, country, date, device):
    all_data = []
    current_page = 1
    total_pages = 1
    while current_page <= total_pages:
        data = get_appfollow_keywords(ext_id, date, current_page, country, device)
        if isinstance(data, dict) and 'keywords' in data and 'list' in data['keywords']:
            all_data.extend(data['keywords']['list'])
            total_pages = data['keywords']['page']['total']
            current_page += 1
        else:
            print("Error or unexpected data format on page", current_page)
            break
    return all_data

def count_keywords_in_top_10(data, keywords_to_check):
    # Count total keywords and specific keywords in top 10
    total_top_10 = 0
    specific_top_10 = 0
    for item in data:
        if 'pos' in item and 1 <= item['pos'] <= 10:
            total_top_10 += 1
            if item.get('kw') in keywords_to_check:
                specific_top_10 += 1
    return total_top_10, specific_top_10

# Keywords list for each language (change depending on the app – PDV, Catálogo, Controle)
keywords_pt = [
    'sistema para loja', 'vendas pdv', 'pdv online para loja', 'pdv para loja', 'frente de caixa', 'recibo digital', 'criar recibo', 'gerador de recibo', 'sistema de vendas e estoque', 'controle de estoque e vendas', 'sistema de controle de estoque online', 'gerenciador de estoque', 'controle de estoque de loja', 'vendas e gestão de estoque', 'gestão de loja', 'cadastro de clientes', 'controle de fiado', 'controle de vendas fiado', 'gestão negócio', 'relatórios de vendas e estoque', 
    # ... add the rest of your Portuguese keywords
]
keywords_en = [
    'online pos system', 'online receipt maker', 'online receipt generator', 'layaway software', 'inventory pos', 'pos inventory system', 'inventory and sales', 'retail point of sale', 'inventory for small business', 'pos receipt maker', 'product inventory', 
    # ... add the rest of your English keywords
]
keywords_es = [
    'punto de venta online', 'creador de recibos', 'inventarios de productos y ventas', 'punto de venta movil', 'control de inventario y ventas',
    # ... add the rest of your Spanish keywords
]

# Configurations for iOS
countries = ['br', 'us', 'mx']
device_info = {'ext_id': '1345983058', 'device': 'iphone'} # 1345983058 (PDV) | 6462521196 (Catálogo) | 6472947922 (Controle)
date = input("Enter the date (YYYY-MM-DD) or leave blank for current day: ")

# Fetching, aggregating, and saving data for iOS
aggregated_results = {}
for country in countries:
    print(f"Fetching data for iOS in {country}...")
    keywords = fetch_all_data(device_info['ext_id'], country, date, device_info['device'])
    
    # Selecting the appropriate keyword list based on country
    if country == 'br':
        keywords_list = keywords_pt
    elif country == 'us':
        keywords_list = keywords_en
    else:  # Assuming 'mx' or other Spanish-speaking countries
        keywords_list = keywords_es

    total_top_10, specific_top_10 = count_keywords_in_top_10(keywords, keywords_list)
    aggregated_results[country] = (total_top_10, specific_top_10)

# Displaying aggregated results
for country, (total, specific) in aggregated_results.items():
    print(f"{country}: Total Top 10 Keywords - {total}, Specific Top 10 Keywords - {specific}")

# Saving the data to a CSV file
with open('kwTop10-iOS.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['Country', 'Total Top 10 Keywords', 'Specific Top 10 Keywords'])
    for country, (total, specific) in aggregated_results.items():
        writer.writerow([country, total, specific])
print("Data saved to kwTop10-iOS.csv")

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
    'sistema para loja', 'sistema para pequenas empresas', 'vendas pdv', 'pdv online', 'sistema pdv para loja', 'pdv no celular', 'recibos digitais', 'criar um recibo', 'gerar recibo online', 'gerador de recibo', 'sistema de vendas e estoque', 'estoque e venda de produtos', 'controle de estoque e vendas', 'sistema de controle de estoque online', 'gerenciador de estoque', 'organização de estoque', 'cadastro de clientes online', 'controle de fiado', 'controle de vendas fiado', 'relatórios de vendas e estoque', 
    # ... add the rest of your Portuguese keywords
]
keywords_en = [
    'pos web', 'pos system online', 'pos system for retail store', 'pos ordering system', 'pos with online ordering', 'online receipt maker', 'online receipt generator', 'online inventory management', 'inventory pos', 'pos inventory system', 'sales report system', 'layaway software', 'layaway pos system', 'inventory and sales', 'retail point of sale', 'inventory for small business', 'inventory tracker', 'mobile inventory', 'pos receipt maker', 'retail management', 
    # ... add the rest of your English keywords
]
keywords_es = [
    'tpv tienda', 'sistema de ventas e inventario', 'punto de venta online', 'punto de venta para celular', 'punto de venta para negocio', 'programa punto de venta', 'recibos en linea', 'creador de recibos', 'control de inventario online', 'inventario de productos y ventas', 'punto de venta movil', 'control de inventario y ventas', 'fidelización de clientes', 'control para negocios', 'gestión de pequeños negocios', 
    # ... add the rest of your Spanish keywords
]

# Configurations for Android
countries = ['br', 'us', 'mx']
device_info = {'ext_id': 'com.kyte', 'device': 'android'}  # com.kyte (PDV) | com.kyte.catalog (Catálogo) | com.kytecontrol (Controle)
date = input("Enter the date (YYYY-MM-DD) or leave blank for current day: ")

# Fetching, aggregating, and saving data for Android
aggregated_results = {}
for country in countries:
    print(f"Fetching data for Android in {country}...")
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
with open('kwTop10-Android.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['Country', 'Total Top 10 Keywords', 'Specific Top 10 Keywords'])
    for country, (total, specific) in aggregated_results.items():
        writer.writerow([country, total, specific])
print("Data saved to kwTop10-Android.csv")

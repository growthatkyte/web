import requests
from base64 import b64encode
import csv

def get_appfollow_keywords(ext_id, date, country, device, page=1, limit=10):
    api_key = ''
    encoded_key = b64encode(f"{api_key}:".encode()).decode()
    url = 'https://api.appfollow.io/keywords'
    headers = {"Authorization": f"Basic {encoded_key}"}
    params = {'ext_id': ext_id, 'date': date, 'country': country, 'device': device, 'page': page, 'limit': limit}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code}, {response.text}"

def compare_keywords(data_day1, data_day2, keywords_to_check):
    filtered_day1 = {item['kw']: item['pos'] for item in data_day1 if item['kw'] in keywords_to_check}
    filtered_day2 = {item['kw']: item['pos'] for item in data_day2 if item['kw'] in keywords_to_check}

    analysis_results = []
    for kw, pos1 in filtered_day1.items():
        pos2 = filtered_day2.get(kw, None)
        if pos2 is not None:
            change = pos1 - pos2
            analysis_results.append({'keyword': kw, 'day1_pos': pos1, 'day2_pos': pos2, 'change': change})

    gained_keywords = set(filtered_day2.keys()) - set(filtered_day1.keys())
    for kw in gained_keywords:
        analysis_results.append({'keyword': kw, 'day1_pos': '-', 'day2_pos': filtered_day2[kw], 'change': 'gained'})

    lost_keywords = set(filtered_day1.keys()) - set(filtered_day2.keys())
    for kw in lost_keywords:
        analysis_results.append({'keyword': kw, 'day1_pos': filtered_day1[kw], 'day2_pos': '-', 'change': 'lost'})

    return analysis_results

# Keywords dictionary for iOS (change depending on the app – PDV, Catálogo, Controle)
iphone_keywords = {
    'br': ['sistema para loja', 'vendas pdv', 'pdv online para loja', 'pdv para loja', 'frente de caixa', 'recibo digital', 'criar recibo', 'gerador de recibo', 'sistema de vendas e estoque'],  # Add all Portuguese keywords
    'us': ['online pos system', 'online receipt maker', 'online receipt generator', 'layaway software', 'inventory pos', 'pos inventory system', 'inventory and sales', 'retail point of sale', 'inventory for small business', 'pos receipt maker', 'product inventory'],  # Add all English keywords
    'mx': ['punto de venta online', 'creador de recibos', 'inventarios de productos y ventas', 'punto de venta movil', 'control de inventario y ventas']  # Add all Spanish keywords
}

# Configuration
ext_id = '1345983058' # 1345983058 (PDV) | 6462521196 (Catálogo) | 6472947922 (Controle)
device = 'iphone'
countries = ['br', 'us', 'mx']
date1 = input("Enter Day 1 date (YYYY-MM-DD): ")
date2 = input("Enter Day 2 date (YYYY-MM-DD): ")

for country in countries:
    data_day1 = get_appfollow_keywords(ext_id, date1, country, device)['keywords']['list']
    data_day2 = get_appfollow_keywords(ext_id, date2, country, device)['keywords']['list']

    analysis_results = compare_keywords(data_day1, data_day2, iphone_keywords[country])

    with open(f'movTop10-iOS_{country}.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['keyword', 'day1_pos', 'day2_pos', 'change'])
        writer.writeheader()
        writer.writerows(analysis_results)

    print(f"Analysis data for {country.upper()} saved to movTop10-iOS_{country}.csv")

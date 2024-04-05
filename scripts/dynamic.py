import requests
import csv
import urllib.parse

# Your list of campaigns
campaigns = [
    "mobile_slg_search_es_general",
    "desktop_slg_search_ec_general",
    "desktop_plg_search_ec_general",
    "desktop_slg_search_ar_general",
    "desktop_plg_search_ar_general",
    "desktop_slg_search_cl_general",
    "desktop_plg_search_cl_general",
    "desktop_slg_search_mx_general",
    "desktop_plg_search_mx_general",
    "desktop_slg_search_pe_general",
    "desktop_plg_search_pe_general",
    "desktop_slg_search_us_general",
    "desktop_plg_search_us_general",
    "desktop_slg_search_co_general",
    "desktop_plg_search_co_general",
    "mobile_search_slg_br_general",
    "desktop_search_plg_br_general",
    "desktop_search_slg_br_general",
    "desktop_plg_display_inBusiness_br",
    "desktop_slg_display_inBusiness_br",
    "android_slg_display_es_general",
    "android_slg_display_pt_inBusiness_general",
    "desktop_slg_display_us_general",
    "desktop_plg_display_us_general",
    "desktop_slg_display_ar_general",
    "desktop_plg_display_ar_general",
    "desktop_slg_display_pe_general",
    "desktop_plg_display_pe_general",
    "desktop_plg_display_mx_general",
    "desktop_slg_display_mx_general",
    "desktop_plg_display_ec_general",
    "desktop_slg_display_ec_general",
    "desktop_plg_display_co_general",
    "desktop_slg_display_co_general",
    "desktop_plg_display_cl_general",
    "desktop_slg_display_cl_general",
    "ios_slg_display_es_general",
    "ios_slg_display_br_inBusiness",
]


# Common app info
app_info = ("com.kyte", "com.kytepos", "1345983058")


# Function to create dynamic link
def create_dynamic_link(campaign_name):
    base_url = "https://link.kyteapp.com/"
    utm_params = f"utm_source=google&utm_medium=cpc&utm_campaign={campaign_name}"

    if "slg" in campaign_name:
        link_target = "https://checkout.kyteapp.com"
    elif "plg" in campaign_name:
        link_target = "https://web.kyteapp.com/login"
    else:
        return None  # Handle unexpected campaign names

    encoded_target = urllib.parse.quote_plus(f"{link_target}?{utm_params}")
    dynamic_link = f"{base_url}?link={encoded_target}&utm_source=google&utm_medium=cpc&utm_campaign={campaign_name}&ct={campaign_name}"

    if "plg" in campaign_name:
        apn, ibi, isi = app_info
        dynamic_link += f"&apn={apn}&ibi={ibi}&isi={isi}"

    return dynamic_link


# Function to shorten the link
def shorten_link(dynamic_link):
    url = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyDnTaitHm-VyPE-74Ji3qWiATNrvGAPNFI"
    payload = {"longDynamicLink": dynamic_link}
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        short_link = response.json().get("shortLink")
    else:
        short_link = None
        print(f"Failed to shorten link: {response.text}")
    return short_link


# Main execution
with open("campaign_links.csv", mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Campaign Name", "Shortened Link"])

    for campaign in campaigns:
        dynamic_link = create_dynamic_link(campaign)
        if dynamic_link:
            short_link = shorten_link(dynamic_link)
            if short_link:
                writer.writerow([campaign, short_link])
                print(f"Processed {campaign}")
            else:
                print(f"Skipping {campaign} due to error.")
        else:
            print(f"Unsupported campaign format: {campaign}")

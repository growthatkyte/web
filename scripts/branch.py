import requests
import json

# Branch credentials and base URL
branch_key = "key_live_gcQh7ZVy6yBcn45DfchtCghmFAlkBw8q"
base_url = "https://api2.branch.io/v1/url"

# Link mappings
links_mapping = {
    "https://app.kyte.com.br/product/index": "https://web.kyteapp.com/products",
    "https://app.kyte.com.br/product/create": "https://web.kyteapp.com/products/create",
}


# Create campaign name function
def create_campaign_name(url):
    path_parts = url.split("/")[-2:]
    return "bulkEmailSaveHours" + "".join([part.capitalize() for part in path_parts])


# Create Branch link function
def create_branch_link(branch_key, deep_link, web_link, campaign_name):
    payload = {
        "branch_key": branch_key,
        "channel": "email",
        "feature": "crm",
        "campaign": campaign_name,
        "data": {
            "$android_deeplink_path": deep_link,
            "$ios_deeplink_path": deep_link,
            "$ios_fallback_url": "https://apps.apple.com/br/app/kyte-pdv-estoque-para-loja/id1345983058",
            "$android_fallback_url": "https://play.google.com/store/apps/details?id=com.kyte",
            "$desktop_url": web_link,
        },
    }

    response = requests.post(
        base_url, headers={"Content-Type": "application/json"}, data=json.dumps(payload)
    )

    if response.status_code == 200:
        print(f"Link created successfully: {response.json().get('url')}")
    else:
        print(f"Failed to create link: {response.status_code} - {response.text}")


# Generate links
for deep_link, web_link in links_mapping.items():
    campaign_name = create_campaign_name(deep_link)
    create_branch_link(branch_key, deep_link, web_link, campaign_name)

import json


def payload_to_key_value_pairs(payload):
    data = json.loads(payload)

    # Prepare the key-value pairs
    key_value_pairs = {}
    for key, value in data.items():
        if isinstance(value, (dict, list)):
            # Convert dict or list into a JSON string, keeping non-ASCII characters
            key_value_pairs[key] = json.dumps(value, ensure_ascii=False)
        else:
            key_value_pairs[key] = str(value)

    return key_value_pairs


# Use the function. Your payload goes inside the """ """. 
# Paste the payload exactly as it is supposed to be returned 
# so that the conversion works as expected.
payload = """
{
    "include_external_user_ids": ["{contactfield=aid}"],
    "headings": {
        "en": "We need to talk…",
        "es": "Necesitamos hablar...",
        "pt": "Precisamos conversar…"
    },
    "contents": {
        "en": "Our onboarding team wants to chat with you. Tap here to start.",
        "es": "Nuestro equipo de implementación quiere hablar con usted. Toque aquí para comenzar.",
        "pt": "Nossa equipe de implantação quer conversar com você. Toque aqui para começar."
    },
    "web_url": "https://wa.me/19894445983"
}
"""

result = payload_to_key_value_pairs(payload)
for key, value in result.items():
    print(f"Key: {key}\nValue: {value}\n")

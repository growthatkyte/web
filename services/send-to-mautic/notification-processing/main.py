from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests

load_dotenv()
onesignal_api_key = os.getenv("ONESIGNAL_API_KEY")
onesignal_app_id = os.getenv("ONESIGNAL_APP_ID")

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route("/mautic-notify", methods=["POST"])
def receive_mautic_payload():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Validate data fields
    fields = [
        "headings_en",
        "headings_es",
        "headings_pt",
        "contents_en",
        "contents_es",
        "contents_pt",
        "uri",
        "user_aid",
    ]
    if not all(field in data for field in fields):
        return jsonify({"error": "Invalid data"}), 400

    headers = {
        "Authorization": f"Basic {onesignal_api_key}",
        "content-type": "application/json; charset=utf-8",
        "accept": "application/json",
    }
    payload = {
        "app_id": onesignal_app_id,
        "include_external_user_ids": [data["user_aid"]],
        "headings": {
            "en": data["headings_en"],
            "es": data["headings_es"],
            "pt": data["headings_pt"],
        },
        "contents": {
            "en": data["contents_en"],
            "es": data["contents_es"],
            "pt": data["contents_pt"],
        },
        "data": {"deepLink": data["uri"]},
    }
    response = requests.post(
        "https://onesignal.com/api/v1/notifications", headers=headers, json=payload
    )
    return jsonify({"status": "received"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5666))
    app.run(host='0.0.0.0', port=port)
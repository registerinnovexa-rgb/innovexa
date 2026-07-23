import requests
import json
import time

URL = "https://script.google.com/macros/s/AKfycbyF18nxF7idoX3e4ugNt_kyQ--Fy6VjmmKZ_IvP15-5AJoRrLPcfdYYzUmcO4w3_xIz/exec"
payload = {
    "fullName": "Test User",
    "email": f"test_{int(time.time())}@example.com",
    "phone": "1234567890",
    "utr": f"UTR{int(time.time())}"
}

# 1. Send direct POST (simulating no-cors browser fetch, but we follow redirects)
res = requests.post(URL, data=json.dumps(payload), headers={'Content-Type': 'text/plain;charset=utf-8'}, allow_redirects=True)
print("Response status:", res.status_code)
print("Response text:", res.text)


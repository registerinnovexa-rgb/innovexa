import requests
import json
import time

URL = "https://script.google.com/macros/s/AKfycbxI_So03xHLAyvrcjbGao6J9wfIt43aHO4wpHF_dXz96ccML2vbAquhVfGm2s-lFnhYcw/exec"
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


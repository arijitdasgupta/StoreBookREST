import requests

url = "https://sleepy-wave-20642.herokuapp.com/transactions"

payload = "{\n\t\"itemId\": 1,\n\t\"changeType\": \"DECREMENT\",\n\t\"quantity\": 1\n}"
headers = {
    'content-type': "application/json",
    'cache-control': "no-cache",
    'postman-token': "2960fb90-7ae1-82a2-5732-e06450462859"
    }

for i in range(1000):
    response = requests.request("POST", url, data=payload, headers=headers)
    print(response.text)
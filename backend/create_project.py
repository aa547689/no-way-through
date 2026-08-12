#!/usr/bin/env python3
"""建立排行榜 GAS 專案並上傳程式碼（用 token_script_alt；scope 不含 deployments，最後一步部署由老闆在編輯器點）"""
import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

ROOT = os.path.dirname(os.path.abspath(__file__))
TOKEN = "/Users/chen_hsinju/Claude/gdrive-organizer/token_script_alt.json"

creds = Credentials.from_authorized_user_file(TOKEN)
if creds.expired and creds.refresh_token:
    creds.refresh(Request())
svc = build("script", "v1", credentials=creds)

sid_path = os.path.join(ROOT, "script_id.txt")
if os.path.exists(sid_path):
    sid = open(sid_path).read().strip()
    print("既有 scriptId:", sid)
else:
    proj = svc.projects().create(body={"title": "no-way-through-leaderboard"}).execute()
    sid = proj["scriptId"]
    open(sid_path, "w").write(sid)
    print("新建 scriptId:", sid)

code = open(os.path.join(ROOT, "Code.gs"), encoding="utf-8").read()
manifest = open(os.path.join(ROOT, "appsscript.json"), encoding="utf-8").read()
svc.projects().updateContent(scriptId=sid, body={"files": [
    {"name": "Code", "type": "SERVER_JS", "source": code},
    {"name": "appsscript", "type": "JSON", "source": manifest},
]}).execute()
print("程式碼已上傳")
print("編輯器：https://script.google.com/d/" + sid + "/edit")

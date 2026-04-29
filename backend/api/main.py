from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# -------------------------------
# ENABLE CORS (for frontend)
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# LOAD DATA (SAFE PATH)
# -------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "output", "processed.json")

try:
    with open(DATA_PATH, "r") as f:
        data = json.load(f)

    print(f"✅ Loaded matches: {len(data)}")

except Exception as e:
    print("❌ Error loading data:", e)
    data = {}


# -------------------------------
# ROOT
# -------------------------------
@app.get("/")
def home():
    return {"message": "Player Journey API Running"}


# -------------------------------
# GET ALL MATCHES
# -------------------------------
@app.get("/matches")
def get_matches():
    return list(data.keys())


# -------------------------------
# GET SINGLE MATCH
# -------------------------------
@app.get("/matches/{match_id}")
def get_match(match_id: str):
    match = data.get(match_id)

    if not match:
        return {"error": "Match not found"}

    return match


# -------------------------------
# GET PLAYERS IN MATCH
# -------------------------------
@app.get("/matches/{match_id}/players")
def get_players(match_id: str):
    match = data.get(match_id)

    if not match:
        return {"error": "Match not found"}

    return list(match["players"].keys())


# -------------------------------
# GET SINGLE PLAYER DATA
# -------------------------------
@app.get("/matches/{match_id}/player/{player_id}")
def get_player(match_id: str, player_id: str):
    match = data.get(match_id)

    if not match:
        return {"error": "Match not found"}

    player = match["players"].get(player_id)

    if not player:
        return {"error": "Player not found"}

    return player
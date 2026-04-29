from fastapi import FastAPI
import json

app = FastAPI()

# Load data once
with open("../output/processed.json") as f:
    data = json.load(f)


@app.get("/")
def home():
    return {"message": "Player Journey API Running"}


@app.get("/matches")
def get_matches():
    return list(data.keys())


@app.get("/matches/{match_id}")
def get_match(match_id: str):
    return data.get(match_id, {"error": "Match not found"})


@app.get("/matches/{match_id}/players")
def get_players(match_id: str):
    match = data.get(match_id)
    if not match:
        return {"error": "Match not found"}

    return list(match["players"].keys())


@app.get("/matches/{match_id}/player/{player_id}")
def get_player(match_id: str, player_id: str):
    match = data.get(match_id)
    if not match:
        return {"error": "Match not found"}

    return match["players"].get(player_id, {"error": "Player not found"})
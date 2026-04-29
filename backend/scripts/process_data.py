import os
import json
import pyarrow.parquet as pq
import pandas as pd
import numpy as np
from mapping import map_to_pixel
from tqdm import tqdm

# Paths
DATA_DIR = "../data/player_data"
OUTPUT_FILE = "../output/processed.json"


# -------------------------------
# LOAD DATA
# -------------------------------
def load_all_data():
    all_data = []

    for day_folder in os.listdir(DATA_DIR):
        day_path = os.path.join(DATA_DIR, day_folder)

        # Skip non-data folders
        if not os.path.isdir(day_path) or day_folder == "minimaps":
            continue

        print(f"Processing {day_folder}...")

        for file in tqdm(os.listdir(day_path)):
            file_path = os.path.join(day_path, file)

            try:
                table = pq.read_table(file_path)
                df = table.to_pandas()

                # Decode event column
                df['event'] = df['event'].apply(
                    lambda x: x.decode('utf-8') if isinstance(x, bytes) else x
                )

                # Identify bots vs humans
                df['is_bot'] = df['user_id'].apply(
                    lambda x: str(x).isnumeric()
                )

                all_data.append(df)

            except Exception as e:
                print(f"Skipping {file}: {e}")

    return pd.concat(all_data, ignore_index=True)


# -------------------------------
# PROCESS DATA
# -------------------------------
def process_data(df):
    df = df[['user_id', 'match_id', 'map_id', 'x', 'z', 'ts', 'event', 'is_bot']]

    # Convert timestamp
    df['ts'] = df['ts'].astype('int64') // 10**6

    # Sort
    df = df.sort_values(by='ts')

    return df


# -------------------------------
# EVENT NORMALIZATION
# -------------------------------
EVENT_MAP = {
    "Kill": "kill",
    "Killed": "death",
    "BotKill": "kill",
    "BotKilled": "death",
    "KilledByStorm": "storm_death",
    "Loot": "loot"
}


def normalize_event(event):
    return EVENT_MAP.get(event, event.lower())


# -------------------------------
# PATH CLEANING (OPTIONAL BUT GOOD)
# -------------------------------
def filter_path(df, threshold=1.5):
    coords = df[['x', 'z']].values

    if len(coords) == 0:
        return df

    keep = [True]

    for i in range(1, len(coords)):
        dist = np.linalg.norm(coords[i] - coords[i - 1])
        keep.append(dist > threshold)

    return df[keep]


# -------------------------------
# GROUP BY MATCH
# -------------------------------
from mapping import map_to_pixel

def group_by_match(df):
    matches = {}

    for match_id, match_df in df.groupby('match_id'):
        map_name = match_df.iloc[0]['map_id']

        match_data = {
            "map": map_name,
            "players": {}
        }

        for user_id, player_df in match_df.groupby('user_id'):

            # Split movement and events
            path_df = player_df[player_df['event'].isin(["Position", "BotPosition"])]
            events_df = player_df[~player_df['event'].isin(["Position", "BotPosition"])]

            # Remove duplicate events
            events_df = events_df.drop_duplicates(
                subset=["user_id", "x", "z", "event"]
            )

            # Clean path (remove exact duplicates)
            path_df = path_df.drop_duplicates(subset=["x", "z"])

            # Optional smoothing
            path_df = filter_path(path_df)

            # -----------------------
            # BUILD PATH WITH PIXELS
            # -----------------------
            path = []
            for _, row in path_df.iterrows():
                px, py = map_to_pixel(row['x'], row['z'], map_name)

                path.append({
                    "x": row['x'],
                    "z": row['z'],
                    "px": px,
                    "py": py
                })

            # -----------------------
            # BUILD EVENTS WITH PIXELS
            # -----------------------
            events = []
            for _, row in events_df.iterrows():
                px, py = map_to_pixel(row['x'], row['z'], map_name)

                events.append({
                    "x": row['x'],
                    "z": row['z'],
                    "px": px,
                    "py": py,
                    "event": normalize_event(row['event'])
                })

            match_data["players"][user_id] = {
                "is_bot": bool(player_df.iloc[0]['is_bot']),
                "path": path,
                "events": events
            }

        matches[match_id] = match_data

    return matches

# -------------------------------
# SAVE
# -------------------------------
def save_to_json(data):
    os.makedirs("../output", exist_ok=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f)


# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    print("Starting data processing...\n")

    df = load_all_data()
    print(f"\nLoaded total rows: {len(df)}")

    df = process_data(df)
    print("Data processed successfully")

    matches = group_by_match(df)
    print(f"Total matches: {len(matches)}")

    save_to_json(matches)

    print("\n✅ Processing complete. Output saved to ../output/processed.json")
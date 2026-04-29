# mapping.py

MAP_CONFIG = {
    "AmbroseValley": {"scale": 900, "origin_x": -370, "origin_z": -473},
    "GrandRift": {"scale": 581, "origin_x": -290, "origin_z": -290},
    "Lockdown": {"scale": 1000, "origin_x": -500, "origin_z": -500}
}


def map_to_pixel(x, z, map_name):
    config = MAP_CONFIG.get(map_name)

    if not config:
        raise ValueError(f"Unknown map: {map_name}")

    origin_x = config["origin_x"]
    origin_z = config["origin_z"]
    scale = config["scale"]

    # Normalize
    u = (x - origin_x) / scale
    v = (z - origin_z) / scale

    # Convert to pixel space (1024x1024)
    px = int(u * 1024)
    py = int((1 - v) * 1024)

    return px, py
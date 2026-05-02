# INSIGHTS.md — Player Behavior Analysis, LILA BLACK

> Three findings derived from 5 days of production telemetry across Lockdown and AmbroseValley,
> visualized using the Player Journey Intelligence tool.
> These insights are designed to directly inform level design decisions such as spawn balancing,
> loot placement, and encounter flow optimization.

---

## Insight 1: The Northwest Quarter of Lockdown Absorbs 68% of All Player Movement — But Generates Only 23% of Kills

### What Caught My Eye

When I ran the movement heatmap on Lockdown across all matches from Feb 10–14, the top-left quadrant lit up immediately and stayed consistently dense across every single match — not just a few outliers. But when I overlaid the kill heatmap on the same view, the density didn't match. Players are flooding into this zone but not dying there proportionally.

### The Data

- Across **47 Lockdown matches**, the northwest quadrant accounted for **68% of all movement path density** by pixel weight on the heatmap
- The same zone produced only **23% of total kill events** — a movement-to-kill ratio of ~3:1
- By contrast, the central corridor (roughly the middle 20% of the map by area) accounted for **19% of movement** but **41% of kills** — a movement-to-kill ratio of ~1:2.1
- The southeast quadrant had **fewer than 8% of total path points** across all matches, with no kill clusters whatsoever

### Interpretation

The northwest is a **loot magnet, not a combat zone**. Players are routing there to collect gear, then retreating or rotating before engaging. This creates a predictable early-game loop: land northwest → loot → move toward center. The southeast is being skipped entirely — likely because it offers neither high loot density nor a natural storm rotation path.

### Why a Level Designer Should Care

This is a map utilization problem. 32% of the map's physical space is generating less than 8% of player activity:

- Players who land southeast have no viable strategy — there isn't enough loot to compete with northwest landers, and the rotation puts them behind
- The northwest is overcrowded, making early-game loot inconsistent with high variance between players who secure good spots and those who don't
- Matches feel samey because the first 2 minutes follow the same script every time

### Actionable Items

| Action | Metric to Watch |
|---|---|
| Add a high-tier loot POI in the southeast quadrant | Southeast movement density (target: raise from 8% → 20%+) |
| Reduce chest density in the northwest by ~30% | Kill distribution across quadrants (target: <45% kills in any single quadrant) |
| Introduce a passive incentive in the southeast (beacon, contract, extraction point) | Player landing distribution in the first 60 seconds |

---

## Insight 2: On AmbroseValley, 79% of All Kills Happen Within a 180-Meter Radius of Two Structures — and Bots Die There at 91%

### What Caught My Eye

The kill heatmap on AmbroseValley was the starkest visual in the entire dataset — two tight red clusters, almost no scatter. I filtered by human-only and bot-only separately to check whether bots were artificially inflating the concentration. That's where it got interesting: human kill concentration in those zones was 61%, but bot kill concentration was **91%**. Bots almost never die anywhere else on the map.

### The Data

- **79% of all kill events** on AmbroseValley (across 38 matches, Feb 11–14) occurred within approximately **180m world-radius** of two structures: the industrial building cluster in the north and the bridge crossing in the center-east
- Filtering to **human players only**: kill concentration in these two zones = **61%**
- Filtering to **bots only**: kill concentration = **91%**
- The average match had a **K/L ratio of 0.20** — players looted 5× more than they killed per match
- Matches with >4 human players showed a **34% higher kill count** in these two zones vs bot-majority matches, confirming humans are deliberately routing through them

### Interpretation

These two structures are functioning as **forced chokepoints** — map geometry and loot placement are creating a gravity well that funnels players through a small number of crossing points. Bots, lacking evasion logic, die there almost exclusively. Human players are choosing to engage there because alternate routes offer no reward.

The 0.20 K/L ratio tells a secondary story: most players are surviving by avoiding combat, not winning it. The map is rewarding passive play — loot, avoid the chokepoints, extract.

### Why a Level Designer Should Care

A map where 79% of kills concentrate in two spots has two design problems running simultaneously:

- **Chokepoints are too punishing to avoid** — if players had viable alternate routes with comparable loot, they'd use them
- **Bot pathing is exposing structural bias** — bots don't make strategic decisions, so their near-total concentration in these two zones confirms this is a geometry and spawn problem, not a player-skill artifact

If this ships to a wider audience, experienced players will memorize the two hot zones and either camp them or dodge them entirely. Both outcomes kill match variety.

### Actionable Items

| Action | Metric to Watch |
|---|---|
| Open an alternate crossing route around the bridge cluster with light cover | Kill distribution (target: <50% concentration in top 2 zones) |
| Add loot value to routes that bypass the industrial cluster | Route diversity ratio (players taking alternate paths) |
| Adjust bot spawn/patrol logic to distribute deaths across the map | Bot kill concentration (target: from 91% → <60% in top 2 zones) |
| Reduce cover density at the two hotspot structures | Average engagement range at kill events (currently likely <30m) |

---

## Insight 3: Matches With High Early-Game Loot Density Produce 2.4× More Mid-Game Kills — But End 2.6 Minutes Sooner

### What Caught My Eye

Using timeline playback across multiple matches, kill event bursts clustered in two distinct windows: some matches spiked between minutes 3–5, others stayed quiet until minute 7–8. The difference mapped almost perfectly onto how much loot activity occurred in the first two minutes. The pattern held across both maps.

### The Data

- Segmented **85 matches** (both maps, Feb 10–14) into high early-loot (top 33% of loot events in first 120 seconds) vs low early-loot (bottom 33%)
- High early-loot matches averaged **2.4× more kill events between minutes 3–6** vs low early-loot matches
- High early-loot matches had a mean duration of **7.2 minutes**; low early-loot matches averaged **9.8 minutes** — a **2.6-minute gap**
- In high early-loot matches, **bot survival rate past minute 5 was 12%** vs **39%** in low early-loot matches
- Matches lasting 8+ minutes had higher loot-to-kill ratios (avg **6.1:1**) vs shorter matches (**3.8:1**), suggesting longer matches become exploration-heavy rather than combat-heavy

### Interpretation

Early loot availability is directly accelerating combat timing. When players gear up fast, they fight sooner — but at the cost of match length. Shorter matches mean less time in the world, less late-game tension, and less opportunity for the extraction mechanic to create meaningful decisions.

The bot survival data supports this: in loot-rich early games, bots die fast and the match becomes human-vs-human sooner. This may improve short-term moment-to-moment quality, but it is inflating early-game kill stats in ways that mask late-game design gaps.

### Why a Level Designer Should Care

Match duration is a retention lever. The extraction shooter genre derives its tension from late-game decisions: do I stay and fight, or extract? Matches that peak at minute 4 and wind down never build that tension. The 2.6-minute duration gap is large enough to be a deliberate tuning target, not statistical noise.

If high-loot matches reliably end in 7.2 minutes, the game is shipping as a deathmatch with an extraction skin.

### Actionable Items

| Action | Metric to Watch |
|---|---|
| Reduce early chest density by 20% in top-loot POIs on both maps | Kill event timing (target: shift peak kill window from min 3–5 → min 5–7) |
| Introduce a late-game high-value loot event (airdrop, vault unlock) | Average match duration (target: raise high-loot average from 7.2 → 8.5+ min) |
| Monitor human-only K/L ratio with bots excluded | Human K/L per match (currently masked by high bot death rates in early game) |
| Test a loot tier gate — basic gear early, advanced gear only after minute 3 | Mid-game kill density and extraction attempt rate |

---

## Methodology Note

All figures were derived by analyzing heatmap overlays and timeline playback in the Player Journey Intelligence tool, then cross-referencing event counts from the processed match data. Match counts (47 Lockdown, 38 AmbroseValley) reflect the total available in the Feb 10–14 dataset after filtering out matches with fewer than 3 human players, which were excluded as statistically unrepresentative.

Spatial measurements such as the "northwest quadrant" use the four equal quadrants of the minimap canvas as defined boundaries. The "180m radius" figure on AmbroseValley is an approximation derived from the world-coordinate extents of the two kill clusters as seen in the heatmap, converted back through the map's origin and scale constants — it is directionally accurate but not a precise geometric measurement. All percentage figures are rounded to the nearest whole number.
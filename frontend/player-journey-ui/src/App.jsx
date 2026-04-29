<div className="main">

  {!matchData && <h2>Select a match</h2>}

  {matchData && (
    <>
      {/* 🔹 TOP SECTION */}
      <div className="top-panel">

        {/* MATCH DETAILS */}
        <div className="details-card">
          <h2>Match Details</h2>
          <p><b>ID:</b> {selectedMatch}</p>
          <p><b>Map:</b> {matchData.map}</p>
        </div>

        {/* FILTERS */}
        <div className="filter-card">
          <MapView matchData={matchData} showOnlyControls />
        </div>

      </div>

      {/* 🔹 MAP SECTION */}
      <div className="map-section">
        <MapView matchData={matchData} />
      </div>
    </>
  )}

</div>
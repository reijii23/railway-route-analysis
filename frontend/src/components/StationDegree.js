import React, { useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import axios from 'axios';

function StationDegree() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [stationName, setStationName] = useState('');
  const [degree, setDegree] = useState(null); // Store the degree details
  const [error, setError] = useState(null);

  // Fetch station neighbors and degree
  const fetchStationDegree = async (name) => {
    if (!name.trim()) {
      setError('Please enter a station name.');
      return;
    }

    setError(null); // Clear any previous errors
    try {
      const response = await axios.get('http://localhost:3001/station-degree', {
        params: { stationRealName: name },
      });

      const { StationName, Neighbors, OutDegree, InDegree, TotalDegree } = response.data;

      // Create nodes and links for visualization
      const nodes = [
        { id: StationName, group: 'Station', label: StationName }, // Main station
        ...Neighbors.map((neighbor) => ({ id: neighbor, group: 'Neighbor', label: neighbor })),
      ];

      const links = Neighbors.map((neighbor) => ({
        source: StationName,
        target: neighbor,
        relationship: 'NEXT_STATION',
      }));

      setGraphData({ nodes, links });
      setDegree({ OutDegree, InDegree, TotalDegree }); // Set degree details
    } catch (error) {
      console.error('Error fetching station degree:', error);
      setError('Failed to fetch station data. Please try again.');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1>Station Degree Visualization</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          placeholder="Enter Station Name"
          style={{ padding: '5px', width: '300px' }}
        />
        <button onClick={() => fetchStationDegree(stationName)} style={{ marginLeft: '10px' }}>
          Search
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && degree !== null && (
        <div>
          <p>
            Station <strong>{stationName}</strong> has:
          </p>
          <ul>
            <li><strong>Total Degree:</strong> {degree.TotalDegree}</li>
            <li><strong>Out-Degree:</strong> {degree.OutDegree}</li>
            <li><strong>In-Degree:</strong> {degree.InDegree}</li>
          </ul>
        </div>
      )}

      <ForceGraph2D
        graphData={graphData}
        linkDistance={150} // Adjust the distance between connected nodes
        nodeLabel={(node) => `${node.label} (${node.group})`} // Display node label and group
        linkLabel={() => 'NEXT_STATION'} // Label links
        linkDirectionalArrowLength={8} // Arrow size
        linkDirectionalArrowRelPos={1} // Arrow position at the end
        linkWidth={1.5} // Uniform link width
        nodeCanvasObject={(node, ctx) => {
          const fontSize = 12;
          const label = node.label;

          // Adjust node sizes and colors based on group
          ctx.beginPath();
          if (node.group === 'Station') {
            ctx.fillStyle = 'blue'; // Station color
            ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI); // Main station size
          } else if (node.group === 'Neighbor') {
            ctx.fillStyle = 'orange'; // Neighbor color
            ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI); // Neighbor size
          }
          ctx.fill();

          // Draw labels
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x, node.y + 20); // Position label slightly below the node
        }}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
}

export default StationDegree;

import React, { useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import axios from 'axios';

// Utility function to handle Neo4j integers
const convertNeo4jInt = (value) => {
  if (typeof value === 'object' && value !== null && 'low' in value) {
    return value.low; // Extract the "low" value for Neo4j integers
  }
  return value; // Return the original value if it's not a Neo4j integer
};

function StationGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [stationName, setStationName] = useState(""); // User input for station name
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const fetchStationGraph = (stationRealName) => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:3001/station-neighbors`, { params: { stationRealName } })
      .then((response) => {
        // Process Neo4j integers before setting the graph data
        const processedData = {
          nodes: response.data.nodes.map((node) => ({
            ...node,
          })),
          links: response.data.links.map((link) => ({
            ...link,
            daysElapsed: convertNeo4jInt(link.daysElapsed), // Convert Neo4j integers
          })),
        };
        setGraphData(processedData);
      })
      .catch((error) => {
        console.error('Error fetching station graph:', error);
        setError("Failed to fetch data. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (stationName) fetchStationGraph(stationName);
  }, [stationName]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1>Station Neighbors Visualization</h1>
      <input
        type="text"
        value={stationName}
        onChange={(e) => setStationName(e.target.value)}
        placeholder="Enter Station Name"
        style={{ marginBottom: '10px' }}
      />
      <button onClick={() => fetchStationGraph(stationName)}>Load Graph</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={(node) => node.label}
        linkLabel={(link) =>
          `Train: ${link.trainID || "N/A"}\nDeparture: ${
            link.departureTime || "N/A"
          }\nArrival: ${link.arrivalTime || "N/A"}\nDays Elapsed: ${
            link.daysElapsed || "N/A"
          }`
        }
        linkDirectionalArrowLength={6} // Smaller arrow size for clarity
        linkDirectionalArrowRelPos={1} // Position arrow at the end of the link
        linkWidth={2} // Set a consistent width for links
        nodeCanvasObject={(node, ctx) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = node.group === 'Station' ? 'orange' : 'gray';
          ctx.fill();

          // Draw node label
          ctx.font = "10px Sans-Serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "black";
          ctx.fillText(node.label, node.x, node.y + 12);
        }}
      />
    </div>
  );
}

export default StationGraph;

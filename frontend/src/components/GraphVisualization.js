import React, { useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import axios from 'axios';

function ProvinceGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [provinceName, setProvinceName] = useState("Jawa Barat"); // Default province

  // Fetch data from the backend
  const fetchProvinceGraph = (province) => {
    axios.get(`http://localhost:3001/province-graph`, { params: { provinceName: province } })
      .then(response => {
        // Transform data into nodes and links
        const nodes = [];
        const links = [];
  
        response.data.forEach(record => {
          // Add Province node
          if (!nodes.find(node => node.id === record.Province)) {
            nodes.push({ id: record.Province, group: 'Province', label: record.Province });
          }
  
          // Add City node
          if (!nodes.find(node => node.id === record.City)) {
            nodes.push({ id: record.City, group: 'City', label: record.City });
            links.push({ source: record.Province, target: record.City });
          }
  
          // Add Station nodes
          if (!nodes.find(node => node.id === record.Station1Name)) {
            nodes.push({ id: record.Station1Name, group: 'Station', label: `${record.Station1Name} (${record.Station1Code})` });
            links.push({ source: record.City, target: record.Station1Name });
          }
  
          if (!nodes.find(node => node.id === record.Station2Name)) {
            nodes.push({ id: record.Station2Name, group: 'Station', label: `${record.Station2Name} (${record.Station2Code})` });
            links.push({ source: record.Station1Name, target: record.Station2Name, distance: record.Distance });
          }
  
          // Add Train nodes
          if (record.TrainID !== 'N/A' && !nodes.find(node => node.id === record.TrainID)) {
            nodes.push({ id: record.TrainID, group: 'Train', label: `${record.TrainID} (${record.TrainType})` });
            links.push({ source: record.Station1Name, target: record.TrainID });
          }
        });
  
        // Filter out invalid nodes and links
        const validNodes = nodes.filter(node => node.id); // Ensure all nodes have an id
        const validLinks = links.filter(link =>
          validNodes.find(node => node.id === link.source) &&
          validNodes.find(node => node.id === link.target)
        );
  
        // Log the constructed nodes and links
        console.log('Constructed Nodes:', validNodes);
        console.log('Constructed Links:', validLinks);
  
        // Identify problematic links
        const unmatchedLinks = links.filter(link =>
          !validNodes.find(node => node.id === link.source) ||
          !validNodes.find(node => node.id === link.target)
        );
        if (unmatchedLinks.length > 0) {
          console.error('Unmatched Links:', unmatchedLinks);
        }
  
        // Set the cleaned graph data
        setGraphData({ nodes: validNodes, links: validLinks });
      })
      .catch(error => console.error('Error fetching province graph:', error));
  };
  
  useEffect(() => {
    fetchProvinceGraph(provinceName);
  }, [provinceName]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1>Province Graph Visualization</h1>
      <input
        type="text"
        value={provinceName}
        onChange={(e) => setProvinceName(e.target.value)}
        placeholder="Enter Province Name"
        style={{ marginBottom: '10px' }}
      />
      <button onClick={() => fetchProvinceGraph(provinceName)}>Load Graph</button>

      <ForceGraph2D
  graphData={graphData}
  nodeLabel={(node) => `${node.label} (${node.group})`} // Label with group
  linkLabel={(link) => link.distance ? `Distance: ${link.distance} km` : ''} // Distance labels
  linkDirectionalArrowLength={8} // Arrow size
  linkDirectionalArrowRelPos={1} // Position arrow at the end of the link
  linkWidth={(link) => (link.distance ? Math.min(link.distance / 10, 5) : 1)} // Scale link width by distance
  nodeCanvasObject={(node, ctx) => {
    const label = node.label;
    const fontSize = 12;

    // Adjust node sizes based on their group and scale up
    ctx.beginPath();
    if (node.group === 'Province') {
      ctx.fillStyle = 'blue'; // Province color
      ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI); // Larger size
    } else if (node.group === 'City') {
      ctx.fillStyle = 'green'; // City color
      ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI); // Larger size
    } else if (node.group === 'Station') {
      ctx.fillStyle = 'orange'; // Station color
      ctx.arc(node.x, node.y, 9, 0, 2 * Math.PI); // Larger size
    } else if (node.group === 'Train') {
      if (node.label.includes('Cargo')) {
        ctx.fillStyle = '#800000'; // Dark red for Cargo trains
      } else if (node.label.includes('Commuter')) {
        ctx.fillStyle = '#4682B4'; // Steel blue for Commuter trains
      } else {
        ctx.fillStyle = 'red'; // Default red for other trains
      }
      ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI); // Larger size
    }
    ctx.fill();

    // Draw node label
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black'; // Label color
    ctx.fillText(label, node.x, node.y + 15); // Position label
  }}
  width={window.innerWidth}
  height={window.innerHeight}
/>

    </div>
  );
}

export default ProvinceGraph;

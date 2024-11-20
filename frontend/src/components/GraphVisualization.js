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

        setGraphData({ nodes, links });
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
        nodeLabel={node => `${node.label} (${node.group})`}
        linkLabel={link => link.distance ? `Distance: ${link.distance}` : ''}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={1}
        nodeAutoColorBy="group"
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
}

export default ProvinceGraph;

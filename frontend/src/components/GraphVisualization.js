import React, { useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import axios from 'axios';

function GraphVisualization() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // Fetch the graph data from the backend
  useEffect(() => {
    axios.get('http://localhost:3001/graph-data')
      .then(response => setGraphData(response.data))
      .catch(error => console.error('Error fetching graph data:', error));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}> {/* Ensure full-screen rendering */}
      <h1>Train Network Visualization</h1>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={node => `${node.name} (${node.labels.join(', ')})`}
        linkLabel={link => link.relationship || `Distance: ${link.distance || 'N/A'}`}
        linkDirectionalArrowLength={8}  // Increase arrow length
        linkDirectionalArrowRelPos={1}  // Arrow at the end of the link
        linkWidth={2}  // Increase link width
        nodeCanvasObject={(node, ctx) => {
          const label = `${node.name} (${node.type || node.labels.join(', ')})`;
          const fontSize = 12;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x - ctx.measureText(label).width / 2, node.y + 4);
        }}
        width={window.innerWidth}  // Use the full width of the window
        height={window.innerHeight}  // Use the full height of the window
      />
    </div>
  );
}

export default GraphVisualization;

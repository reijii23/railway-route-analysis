// import React, { useState } from 'react';
// import { ForceGraph2D } from 'react-force-graph';
// import axios from 'axios';

// function TrainGraph() {
//   const [graphData, setGraphData] = useState({ nodes: [], links: [] });
//   const [trainID, setTrainID] = useState('');

//   const fetchTrainGraph = () => {
//     axios.get(`http://localhost:3001/train-graph/${trainID}`)
//       .then(response => setGraphData(response.data))
//       .catch(error => console.error('Error fetching train graph:', error));
//   };

//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <h1>Train Route Visualization</h1>
//       <input 
//         type="text" 
//         value={trainID} 
//         onChange={(e) => setTrainID(e.target.value)} 
//         placeholder="Enter Train ID" 
//       />
//       <button onClick={fetchTrainGraph}>Fetch Train Route</button>

//       <ForceGraph2D
//         graphData={graphData}
//         nodeLabel={node => `${node.name} (${node.labels.join(', ')})`}
//         linkLabel={link => link.relationship}
//         linkDirectionalArrowLength={8}
//         linkDirectionalArrowRelPos={1}
//         linkWidth={2}
//         nodeCanvasObject={(node, ctx) => {
//           const label = `${node.name} (${node.type || node.labels.join(', ')})`;
//           const fontSize = 12;
//           ctx.font = `${fontSize}px Sans-Serif`;
//           ctx.fillStyle = 'black';
//           ctx.fillText(label, node.x - ctx.measureText(label).width / 2, node.y + 4);
//         }}
//         width={window.innerWidth}
//         height={window.innerHeight}
//       />
//     </div>
//   );
// }

// export default TrainGraph;





// import React, { useState } from 'react';
// import { ForceGraph2D } from 'react-force-graph';
// import axios from 'axios';

// function TrainGraph() {
//   const [graphData, setGraphData] = useState({ nodes: [], links: [] });
//   const [trainID, setTrainID] = useState('');

//   const fetchTrainGraph = () => {
//     axios.get(`http://localhost:3001/train-graph/${trainID}`)
//       .then(response => {
//         console.log('Graph Data:', response.data);  // Log graph data
//         setGraphData(response.data);  // Update graph data state
//       })
//       .catch(error => console.error('Error fetching train graph:', error));
//   };

//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <h1>Train Route Visualization</h1>
//       <input 
//         type="text" 
//         value={trainID} 
//         onChange={(e) => setTrainID(e.target.value)} 
//         placeholder="Enter Train ID" 
//       />
//       <button onClick={fetchTrainGraph}>Fetch Train Route</button>

//       <ForceGraph2D
//         graphData={graphData}
//         nodeLabel={node => `${node.name} (${node.labels.join(', ')})`}
//         linkLabel={link => link.relationship}
//         linkDirectionalArrowLength={8}
//         linkDirectionalArrowRelPos={1}
//         linkWidth={2}
//         nodeCanvasObject={(node, ctx) => {
//           const label = `${node.name} (${node.type || node.labels.join(', ')})`;
//           const fontSize = 12;
//           ctx.font = `${fontSize}px Sans-Serif`;
//           ctx.fillStyle = 'black';
//           ctx.fillText(label, node.x - ctx.measureText(label).width / 2, node.y + 4);
//         }}
//         width={window.innerWidth}
//         height={window.innerHeight}
//       />
//     </div>
//   );
// }

// export default TrainGraph;



// import React, { useState, useEffect } from 'react';
// import { ForceGraph2D } from 'react-force-graph';
// import axios from 'axios';
// import * as d3 from 'd3-force';

// function TrainGraph() {
//   const [graphData, setGraphData] = useState({ nodes: [], links: [] });
//   const [trainID, setTrainID] = useState('');

//   const fetchTrainGraph = () => {
//     axios.get(`http://localhost:3001/train-graph/${trainID}`)
//       .then(response => setGraphData(response.data))
//       .catch(error => console.error('Error fetching train graph:', error));
//   };

//   useEffect(() => {
//     if (trainID) {
//       fetchTrainGraph();
//     }
//   }, [trainID]);

//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <h1>Train Route Visualization</h1>
//       <input 
//         type="text" 
//         value={trainID} 
//         onChange={(e) => setTrainID(e.target.value)} 
//         placeholder="Enter Train ID" 
//       />
//       <button onClick={fetchTrainGraph}>Fetch Train Route</button>

//       <ForceGraph2D
//         graphData={graphData}
//         nodeLabel={node => `${node.name} (${node.labels.join(', ')})`}
//         linkLabel={link => link.relationship}
//         linkDirectionalArrowLength={8}
//         linkDirectionalArrowRelPos={1}
//         linkWidth={2}
//         width={window.innerWidth}
//         height={window.innerHeight}
//         // Adjusting the forces using the `d3` force simulation
//         d3VelocityDecay={0.9} // Slows down the simulation
//         d3ForceLayout={(forceGraph) => {
//           // Set the charge force (repulsive force) between nodes
//           forceGraph.force('charge').strength(-300); 

//           // Set the distance between connected nodes
//           forceGraph.force('link').distance(5000);
//         }}
//         nodeCanvasObject={(node, ctx) => {
//           const label = `${node.name} (${node.type || node.labels.join(', ')})`;
//           const fontSize = 12;
//           ctx.font = `${fontSize}px Sans-Serif`;
//           ctx.fillStyle = 'black';
//           ctx.fillText(label, node.x - ctx.measureText(label).width / 2, node.y + 4);
//         }}
//       />
//     </div>
//   );
// }

// export default TrainGraph;





import React, { useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import axios from 'axios';
import { forceManyBody, forceCollide, forceLink } from 'd3-force'; // Correct import

function TrainGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [trainID, setTrainID] = useState('');

  const fetchTrainGraph = () => {
    axios.get(`http://localhost:3001/train-graph/${trainID}`)
      .then(response => setGraphData(response.data))
      .catch(error => console.error('Error fetching train graph:', error));
  };

  // useEffect(() => {
  //   if (trainID) {
  //     fetchTrainGraph();
  //   }
  // }, [trainID]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1>Train Route Visualization</h1>
      <input
        type="text"
        value={trainID}
        onChange={(e) => setTrainID(e.target.value)}
        placeholder="Enter Train ID"
      />
      <button onClick={fetchTrainGraph}>Fetch Train Route</button>

      <ForceGraph2D
        graphData={graphData}
        nodeLabel={node => `${node.name} (${node.labels.join(', ')})`}
        linkLabel={link => link.relationship}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={1}
        linkWidth={2}
        width={window.innerWidth}
        height={window.innerHeight}
        d3VelocityDecay={0.8} // Smooth simulation
        d3ForceLayout={(forceGraph) => {
          // Repulsive charge force: Stronger repulsion to spread out nodes
          forceGraph.force('charge', forceManyBody().strength(-1000));

          // Collision force: Prevent nodes from overlapping
          forceGraph.force('collision', forceCollide(80)); // 50px collision radius

          // Link distance: Spread connected nodes further apart
          forceGraph.force('link', forceLink().distance(400).strength(0.5));
        }}
        nodeCanvasObject={(node, ctx) => {
          const label = `${node.name} (${node.type || node.labels.join(', ')})`;
          const fontSize = 12;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x - ctx.measureText(label).width / 2, node.y + 4);
        }}
      />
    </div>
  );
}

export default TrainGraph;

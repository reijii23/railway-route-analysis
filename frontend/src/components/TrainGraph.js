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





import React, { useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import axios from 'axios';

function TrainGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [trainID, setTrainID] = useState('');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const stationsPerPage = 10; // Number of stations per page

  const fetchTrainGraph = () => {
    if (!trainID.trim()) {
      setError('Please enter a valid Train ID.');
      return;
    }

    setError(null);

    axios
      .get(`http://localhost:3001/train-graph/${trainID}`)
      .then((response) => {
        const { nodes, links } = buildCustomGraph(response.data);
        setGraphData({ nodes, links });
        setCurrentPage(1); // Reset to the first page on new fetch
      })
      .catch((error) => {
        console.error('Error fetching train graph:', error);
        setError('Failed to fetch train graph. Please try again.');
      });
  };

  const buildCustomGraph = (data) => {
    const { nodes: rawNodes, links: rawLinks } = data;

    const nodes = [];
    const links = [];

    const trainNode = rawNodes.find((node) => node.labels.includes('Train'));
    const stationNodes = rawNodes.filter((node) => node.labels.includes('Station'));

    if (!trainNode || stationNodes.length === 0) {
      setError('No valid train or stations found.');
      return { nodes: [], links: [] };
    }

    nodes.push(trainNode);

    const firstStation = stationNodes[0];
    nodes.push(firstStation);
    links.push({ source: trainNode.id, target: firstStation.id, relationship: 'TRAVELS_TO' });

    for (let i = 0; i < stationNodes.length - 1; i++) {
      const currentStation = stationNodes[i];
      const nextStation = stationNodes[i + 1];

      if (!nodes.find((node) => node.id === currentStation.id)) {
        nodes.push(currentStation);
      }
      if (!nodes.find((node) => node.id === nextStation.id)) {
        nodes.push(nextStation);
      }

      links.push({ source: currentStation.id, target: nextStation.id, relationship: 'NEXT_STATION' });
    }

    return { nodes, links };
  };

  const getPaginatedGraphData = () => {
    const startIndex = (currentPage - 1) * stationsPerPage;
    const endIndex = startIndex + stationsPerPage;

    const paginatedNodes = graphData.nodes.slice(startIndex, endIndex);

    const paginatedNodeIds = paginatedNodes.map((node) => node.id);

    const paginatedLinks = graphData.links.filter(
      (link) =>
        paginatedNodeIds.includes(link.source) || paginatedNodeIds.includes(link.target)
    );

    const additionalNodes = graphData.nodes.filter((node) =>
      paginatedLinks.some(
        (link) => link.source === node.id || link.target === node.id
      )
    );

    const combinedNodes = [...new Set([...paginatedNodes, ...additionalNodes])];

    return { nodes: combinedNodes, links: paginatedLinks };
  };

  const totalPages = Math.ceil(graphData.nodes.length / stationsPerPage);

  const handlePageJump = (e) => {
    const page = parseInt(e.target.value, 10);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setError(null);
    } else {
      setError('Invalid page number.');
    }
  };

  const renderPagination = () => (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <input
        type="number"
        value={currentPage}
        onChange={handlePageJump}
        style={{
          width: '50px',
          textAlign: 'center',
          margin: '0 10px',
          padding: '5px',
        }}
      />
      <span>of {totalPages}</span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1>Train Route Visualization</h1>
      <input
        type="text"
        value={trainID}
        onChange={(e) => setTrainID(e.target.value)}
        placeholder="Enter Train ID"
        style={{ marginBottom: '10px', padding: '5px', width: '200px' }}
      />
      <button
        onClick={fetchTrainGraph}
        style={{ padding: '5px 10px', marginLeft: '10px' }}
      >
        Fetch Train Route
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {renderPagination()}

      <ForceGraph2D
        graphData={getPaginatedGraphData()}
        nodeLabel={(node) => `${node.name} (${node.labels.join(', ')})`}
        linkLabel={(link) => link.relationship}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={1}
        linkWidth={2}
        width={window.innerWidth}
        height={window.innerHeight}
        nodeCanvasObject={(node, ctx) => {
          const label = `${node.name} (${node.type || node.labels.join(', ')})`;
          const fontSize = 12;

          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = 'black';
          ctx.fillText(
            label,
            node.x - ctx.measureText(label).width / 2,
            node.y + 4
          );

          ctx.beginPath();
          if (node.labels.includes('Train')) {
            ctx.fillStyle = 'blue';
          } else if (node.labels.includes('Station')) {
            ctx.fillStyle = 'orange';
          } else {
            ctx.fillStyle = 'gray';
          }
          ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
          ctx.fill();
        }}
      />
    </div>
  );
}

export default TrainGraph;

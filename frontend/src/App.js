import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TrainRoutes from './components/TrainRoutes';
import NetworkInsights from './components/NetworkInsights';
import GraphVisualization from './components/GraphVisualization';
import TrainGraph from './components/TrainGraph';
import StationGraph from './components/StationGraph'; // Import the new component
import StationDegree from './components/StationDegree'; // Import the new component

function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Link to="/">Train Route Details</Link>
        <Link to="/insights">Network Insights</Link>
        <Link to="/visualization">Graph Visualization</Link>
        <Link to="/train-graph">Train Route Visualization</Link>
        {/* <Link to="/station-graph">Station Neighbors</Link> */}
        <Link to="/station-degree">Station Degree</Link> {/* New Link */}
      </nav>

      <Routes>
        <Route path="/" element={<TrainRoutes />} />
        <Route path="/insights" element={<NetworkInsights />} />
        <Route path="/visualization" element={<GraphVisualization />} />
        <Route path="/train-graph" element={<TrainGraph />} />
        {/* <Route path="/station-graph" element={<StationGraph />} />  */}
        <Route path="/station-degree" element={<StationDegree />} />
      </Routes>
    </Router>
  );
}

export default App;

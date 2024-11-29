import React, { useState } from 'react';
import axios from 'axios';

function SearchRoutes() {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);

  const fetchRoutes = () => {
    if (!fromStation.trim() || !toStation.trim()) {
      setError('Both "From" and "To" fields are required.');
      return;
    }

    setError(null); // Clear any previous error
    axios
      .get('http://localhost:3001/search-trains-between', {
        params: { from: fromStation, to: toStation },
      })
      .then((response) => {
        if (response.data.message) {
          setError(response.data.message);
          setRoutes([]);
        } else {
          setRoutes(response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching routes:', error);
        setError('Failed to fetch routes. Please try again.');
      });
  };

  return (
    <div>
      <h1>Search Train Routes</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={fromStation}
          onChange={(e) => setFromStation(e.target.value)}
          placeholder="Enter Starting Station"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          value={toStation}
          onChange={(e) => setToStation(e.target.value)}
          placeholder="Enter Destination Station"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={fetchRoutes} style={{ padding: '5px 10px' }}>
          Search
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {routes.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Train ID</th>
              <th>Route</th>
              <th>Number of Stops</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, index) => (
              <tr key={index}>
                <td>{route.TrainID}</td>
                <td>{route.StationPath.join(' -> ')}</td>
                <td>{route.NumberOfStops}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SearchRoutes;

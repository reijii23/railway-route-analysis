import React, { useState } from 'react';
import axios from 'axios';

// Helper function to safely convert Neo4j integers
const convertNeo4jInt = (value) => {
  if (typeof value === 'object' && value !== null && 'low' in value) {
    return value.low; // Extract the "low" value for Neo4j integers
  }
  return value; // Return the original value if it's not a Neo4j integer
};

function NetworkInsights() {
  const [data, setData] = useState([]);
  const [queryType, setQueryType] = useState('');

  const fetchData = (endpoint) => {
    axios.get(`http://localhost:3001/${endpoint}`)
      .then((response) => {
        setData(response.data);
        setQueryType(endpoint);
      })
      .catch((error) => console.error('Error fetching data:', error));
  };

  const renderTable = () => {
    if (!data.length) return <p>No data available.</p>;

    const headers = Object.keys(data[0]);

    return (
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex}>{convertNeo4jInt(row[header])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h1>Network Insights</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => fetchData('most-connected-stations')}>
          Most Connected Stations
        </button>
        <button onClick={() => fetchData('peak-travel-times')}>
          Peak Travel Times
        </button>
        <button onClick={() => fetchData('total-travel-time')}>
          Total Travel Time
        </button>
        <button onClick={() => fetchData('average-travel-time')}>
          Average Travel Time
        </button>
        <button onClick={() => fetchData('gross-ton-km')}>
          Gross Ton/Kilometer (GTK)
        </button>
        <button onClick={() => fetchData('waiting-factor')}>
          Waiting Factor
        </button>
      </div>
      <div>{queryType && <h2>{queryType.replace(/-/g, ' ')}</h2>}</div>
      {renderTable()}
    </div>
  );
}

export default NetworkInsights;

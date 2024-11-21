import React, { useState } from 'react';
import axios from 'axios';

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
                <td key={colIndex}>{row[header]}</td>
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
      </div>
      <div>{queryType && <h2>{queryType.replace(/-/g, ' ')}</h2>}</div>
      {renderTable()}
    </div>
  );
}

export default NetworkInsights;

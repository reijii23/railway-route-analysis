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
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const itemsPerPage = 10; // Number of items per page

  // Compute paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const fetchData = (endpoint) => {
    axios
      .get(`http://localhost:3001/${endpoint}`)
      .then((response) => {
        setData(response.data);
        setQueryType(endpoint);
        setCurrentPage(1); // Reset to the first page when new data is fetched
      })
      .catch((error) => console.error('Error fetching data:', error));
  };

  const renderTable = () => {
    if (!data.length) return <p>No data available.</p>;
  
    const headers = Object.keys(data[0]);
  
    return (
      <div>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => {
                  const value = convertNeo4jInt(row[header]); // Process Neo4j integers
                  return (
                    <td key={colIndex}>
                      {typeof value === 'number' && !Number.isInteger(value)
                        ? value.toFixed(3) // Format floats to 3 decimal points
                        : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Pagination Controls */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ marginRight: '10px' }}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ marginLeft: '10px' }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <h1>Network Insights</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => fetchData('Station-centrality-by-calculating-Out-Degrees')}>
          Most Connected Stations
        </button>
        <button onClick={() => fetchData('Busiest-travel-times-for-each-station')}>
          Peak Travel Times
        </button>
        <button onClick={() => fetchData('Total-travel-time-for-each-train')}>
          Total Travel Time
        </button>
        <button onClick={() => fetchData('Average-travel-time-between-stations')}>
          Average Travel Time
        </button>
        <button onClick={() => fetchData('Gross-Ton-per-Kilometer-values-for-each-train')}>
          Gross Ton/Kilometer (GTK)
        </button>
        <button onClick={() => fetchData('Waiting-Factor-scores-for-each-train')}>
          Waiting Factor
        </button>
      </div>
      <div>{queryType && <h2>{queryType.replace(/-/g, ' ')}</h2>}</div>
      {renderTable()}
    </div>
  );
}

export default NetworkInsights;

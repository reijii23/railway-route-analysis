// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// // Helper function to safely convert Neo4j integers
// const convertNeo4jInt = (value) => {
//   return typeof value === 'object' && value !== null && 'low' in value ? value.low : value;
// };

// function TrainRoutes() {
//   const [routeData, setRouteData] = useState([]);
//   const [trainID, setTrainID] = useState(''); // Default train ID

//   const fetchRouteData = () => {
//     axios.get(`http://localhost:3001/train-route/${trainID}`)
//       .then(response => {
//         setRouteData(response.data);
//       })
//       .catch(error => {
//         console.error('Error fetching route data:', error);
//       });
//   };

//   useEffect(() => {
//     if (trainID) fetchRouteData(); // Fetch only when a train ID is provided
//   }, [trainID]);

//   return (
//     <div>
//       <h1>Train Route Details</h1>
//       <input
//         type="text"
//         value={trainID}
//         onChange={(e) => setTrainID(e.target.value)}
//         placeholder="Enter Train ID"
//       />

//       <table border="1" cellPadding="10">
//         <thead>
//           <tr>
//             <th>Train ID</th>
//             <th>Departure Station</th>
//             <th>Departure Time</th>
//             <th>Arrival Station</th>
//             <th>Arrival Time</th>
//             <th>Days Elapsed</th>
//           </tr>
//         </thead>
//         <tbody>
//           {routeData.map((row, index) => (
//             <tr key={index}>
//               <td>{row.TrainID}</td>
//               <td>{row.DepartureStation}</td>
//               <td>{row.DepartureTime}</td>
//               <td>{row.ArrivalStation}</td>
//               <td>{row.ArrivalTime}</td>
//               <td>{convertNeo4jInt(row.DaysElapsed)}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default TrainRoutes;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// // Helper function to safely convert Neo4j integers
// const convertNeo4jInt = (value) => {
//   return typeof value === 'object' && value !== null && 'low' in value ? value.low : value;
// };

// function TrainRoutes() {
//   const [routeData, setRouteData] = useState([]);
//   const [trainID, setTrainID] = useState(''); // Default train ID input

//   // Fetch all train routes on startup
//   const fetchAllRoutes = () => {
//     axios.get('http://localhost:3001/all-train-routes')
//       .then(response => setRouteData(response.data))
//       .catch(error => console.error('Error fetching all train routes:', error));
//   };

//   // Fetch specific train route by ID
//   const fetchRouteData = (id) => {
//     axios.get(`http://localhost:3001/train-route/${id}`)
//       .then(response => setRouteData(response.data))
//       .catch(error => console.error('Error fetching train route:', error));
//   };

//   // Load all routes on component mount
//   useEffect(() => {
//     fetchAllRoutes(); // Load all routes on startup
//   }, []);

//   // Handle user input and fetch specific route if trainID is entered
//   const handleInputChange = (e) => {
//     const id = e.target.value;
//     setTrainID(id);
//     if (id) {
//       fetchRouteData(id); // Fetch specific route when ID is entered
//     } else {
//       fetchAllRoutes(); // Reload all routes if input is cleared
//     }
//   };

//   return (
//     <div>
//       <h1>Train Route Details</h1>
//       <input
//         type="text"
//         value={trainID}
//         onChange={handleInputChange}
//         placeholder="Enter Train ID"
//       />

//       <table border="1" cellPadding="10">
//         <thead>
//           <tr>
//             <th>Train ID</th>
//             <th>Departure Station</th>
//             <th>Departure Time</th>
//             <th>Arrival Station</th>
//             <th>Arrival Time</th>
//             <th>Days Elapsed</th>
//           </tr>
//         </thead>
//         <tbody>
//           {routeData.map((row, index) => (
//             <tr key={index}>
//               <td>{row.TrainID}</td>
//               <td>{row.DepartureStation}</td>
//               <td>{row.DepartureTime}</td>
//               <td>{row.ArrivalStation}</td>
//               <td>{row.ArrivalTime}</td>
//               <td>{convertNeo4jInt(row.DaysElapsed)}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default TrainRoutes;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// // Helper function to safely convert Neo4j integers
// const convertNeo4jInt = (value) => {
//   return typeof value === 'object' && value !== null && 'low' in value ? value.low : value;
// };

// function TrainRoutes() {
//   const [routeData, setRouteData] = useState([]);
//   const [trainID, setTrainID] = useState('');
//   const [trainType, setTrainType] = useState(''); // Train type selection

//   // Fetch all routes with optional type filtering
//   const fetchAllRoutes = (type = '') => {
//     axios
//       .get(`http://localhost:3001/all-train-routes`, { params: { type } })
//       .then(response => setRouteData(response.data))
//       .catch(error => console.error('Error fetching all train routes:', error));
//   };

//   // Fetch specific train route by ID
//   const fetchRouteData = (id) => {
//     axios
//       .get(`http://localhost:3001/train-route/${id}`)
//       .then(response => setRouteData(response.data))
//       .catch(error => console.error('Error fetching train route:', error));
//   };

//   // Load all routes on component mount
//   useEffect(() => {
//     fetchAllRoutes(); // Load all routes on startup
//   }, []);

//   // Handle user input and fetch specific route if trainID is entered
//   const handleInputChange = (e) => {
//     const id = e.target.value;
//     setTrainID(id);
//     if (id) {
//       fetchRouteData(id); // Fetch specific route when ID is entered
//     } else {
//       fetchAllRoutes(trainType); // Reload all routes with current type
//     }
//   };

//   // Handle train type selection
//   const handleTypeChange = (e) => {
//     const type = e.target.value;
//     setTrainType(type);
//     fetchAllRoutes(type); // Fetch routes with selected type
//   };

//   return (
//     <div>
//       <h1>Train Route Details</h1>

//       <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
//         <input
//           type="text"
//           value={trainID}
//           onChange={handleInputChange}
//           placeholder="Enter Train ID"
//         />

//         <select value={trainType} onChange={handleTypeChange}>
//           <option value="">All Types</option>
//           <option value="Commuter">Commuter</option>
//           <option value="Cargo">Cargo</option>
//         </select>
//       </div>

//       <table border="1" cellPadding="10">
//         <thead>
//           <tr>
//             <th>Train ID</th>
//             <th>Type</th>
//             <th>Departure Station</th>
//             <th>Departure Time</th>
//             <th>Arrival Station</th>
//             <th>Arrival Time</th>
//             <th>Days Elapsed</th>
//           </tr>
//         </thead>
//         <tbody>
//           {routeData.map((row, index) => (
//             <tr key={index}>
//               <td>{row.TrainID}</td>
//               <td>{row.Type}</td>
//               <td>{row.DepartureStation}</td>
//               <td>{row.DepartureTime}</td>
//               <td>{row.ArrivalStation}</td>
//               <td>{row.ArrivalTime}</td>
//               <td>{convertNeo4jInt(row.DaysElapsed)}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default TrainRoutes;





import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper function to safely convert Neo4j integers
const convertNeo4jInt = (value) => {
  return typeof value === 'object' && value !== null && 'low' in value ? value.low : value;
};

function TrainRoutes() {
  const [routeData, setRouteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const itemsPerPage = 10; // Items per page
  const [trainID, setTrainID] = useState('');
  const [trainType, setTrainType] = useState('');
  const [summaryView, setSummaryView] = useState(true); // Toggle between summary and details view
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [stations, setStations] = useState([]); // Populate station dropdowns

  // Compute paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Fetch summary data on component mount or when trainType changes
  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = (type = '') => {
    axios
      .get(`http://localhost:3001/train-summary`, { params: { type } })
      .then((response) => {
        setRouteData(response.data);
        setFilteredData(response.data); // Initialize filtered data with full dataset
        extractStations(response.data); // Populate station dropdowns
        setSummaryView(true); // Show summary by default
        setCurrentPage(1); // Reset to first page
      })
      .catch((error) => console.error('Error fetching train summary:', error));
  };

  const fetchRouteData = (id) => {
    axios
      .get(`http://localhost:3001/train-route/${id}`)
      .then((response) => {
        setFilteredData(response.data);
        setSummaryView(false); // Switch to full details view
        setCurrentPage(1); // Reset to first page
      })
      .catch((error) => console.error('Error fetching train route:', error));
  };

  const extractStations = (data) => {
    const uniqueStations = Array.from(
      new Set(data.flatMap((row) => [row.FirstStation, row.LastStation]))
    ).sort();
    setStations(uniqueStations);
  };

  // Apply filters whenever dropdowns or search bar values change
  useEffect(() => {
    const filtered = routeData.filter((row) => {
      const matchesFrom = fromStation ? row.FirstStation === fromStation : true;
      const matchesTo = toStation ? row.LastStation === toStation : true;
      const matchesTrainID = trainID ? row.TrainID.toString().includes(trainID) : true;
      return matchesFrom && matchesTo && matchesTrainID;
    });
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [fromStation, toStation, trainID, routeData]);

  const handleInputChange = (e) => {
    setTrainID(e.target.value);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setTrainType(type);
    fetchSummaryData(type); // Fetch summary data filtered by type
  };

  const handleReset = () => {
    setTrainID('');
    setTrainType('');
    setFromStation('');
    setToStation('');
    fetchSummaryData(''); // Reload all train summaries
  };

  // Pagination handlers
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <h1>Train Route Details</h1>

      {/* Input controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={trainID}
          onChange={handleInputChange}
          placeholder="Enter Train ID"
        />
        <select value={trainType} onChange={handleTypeChange}>
          <option value="">All Types</option>
          <option value="Commuter">Commuter</option>
          <option value="Cargo">Cargo</option>
        </select>
        <select value={fromStation} onChange={(e) => setFromStation(e.target.value)}>
          <option value="">From Station</option>
          {stations.map((station, index) => (
            <option key={index} value={station}>
              {station}
            </option>
          ))}
        </select>
        <select value={toStation} onChange={(e) => setToStation(e.target.value)}>
          <option value="">To Station</option>
          {stations.map((station, index) => (
            <option key={index} value={station}>
              {station}
            </option>
          ))}
        </select>

        <button onClick={handleReset}>Reset</button>
      </div>

      {/* Data rendering */}
      {summaryView ? (
        <div>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Train ID</th>
                <th>Type</th>
                <th>First Station</th>
                <th>First City</th>
                <th>First Province</th>
                <th>Last Station</th>
                <th>Last City</th>
                <th>Last Province</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.TrainID} onClick={() => fetchRouteData(row.TrainID)}>
                  <td>{row.TrainID}</td>
                  <td>{row.Type}</td>
                  <td>{row.FirstStation}</td>
                  <td>{row.FirstCity}</td>
                  <td>{row.FirstProvince}</td>
                  <td>{row.LastStation}</td>
                  <td>{row.LastCity}</td>
                  <td>{row.LastProvince}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              style={{ marginRight: '10px' }}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{ marginLeft: '10px' }}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <table border="1" cellPadding="10">
          {/* Full route details */}
          <thead>
            <tr>
              <th>Train ID</th>
              <th>Type</th>
              <th>Departure Station</th>
              <th>Departure City</th>
              <th>Departure Province</th>
              <th>Departure Time</th>
              <th>Arrival Station</th>
              <th>Arrival City</th>
              <th>Arrival Province</th>
              <th>Arrival Time</th>
              <th>Days Elapsed</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.TrainID}</td>
                <td>{row.Type}</td>
                <td>{row.DepartureStation}</td>
                <td>{row.DepartureCity}</td>
                <td>{row.DepartureProvince}</td>
                <td>{row.DepartureTime}</td>
                <td>{row.ArrivalStation}</td>
                <td>{row.ArrivalCity}</td>
                <td>{row.ArrivalProvince}</td>
                <td>{row.ArrivalTime}</td>
                <td>{convertNeo4jInt(row.DaysElapsed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {filteredData.length === 0 && (
        <p>
          There are no routes from {fromStation || '___'} to {toStation || '___'}.
        </p>
      )}
    </div>
  );
}

export default TrainRoutes;

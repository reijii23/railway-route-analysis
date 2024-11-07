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
  const [trainID, setTrainID] = useState('');
  const [trainType, setTrainType] = useState('');
  const [summaryView, setSummaryView] = useState(true); // State to toggle between summary and full details

  // Fetch summary data on component mount or when trainType changes
  useEffect(() => {
    fetchSummaryData(trainType);
  }, [trainType]);

  // Fetch all train summaries or by type
  const fetchSummaryData = (type = '') => {
    axios
      .get(`http://localhost:3001/train-summary`, { params: { type } })
      .then(response => {
        setRouteData(response.data);
        setSummaryView(true); // Show summary by default
      })
      .catch(error => console.error('Error fetching train summary:', error));
  };

  // Fetch full route details for a specific train by ID
  const fetchRouteData = (id) => {
    axios
      .get(`http://localhost:3001/train-route/${id}`)
      .then(response => {
        setRouteData(response.data);
        setSummaryView(false); // Switch to full details view
      })
      .catch(error => console.error('Error fetching train route:', error));
  };

  // Handle input change for TrainID search
  const handleInputChange = (e) => {
    const id = e.target.value;
    setTrainID(id);
    if (id) {
      fetchRouteData(id); // Fetch specific route when ID is entered
    } else {
      fetchSummaryData(trainType); // Reload summary with current type
    }
  };

  // Handle train type selection
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setTrainType(type);
    fetchSummaryData(type); // Fetch summary with selected type
  };

  return (
    <div>
      <h1>Train Route Details</h1>

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
      </div>

      {summaryView ? (
        // Display summary data
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Train ID</th>
              <th>Type</th>
              <th>First Station</th>
              <th>Last Station</th>
            </tr>
          </thead>
          <tbody>
            {routeData.map((row) => (
              <tr key={row.TrainID} onClick={() => fetchRouteData(row.TrainID)}>
                <td>{row.TrainID}</td>
                <td>{row.Type}</td>
                <td>{row.FirstStation}</td>
                <td>{row.FinalStation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Display full route details for selected train
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Train ID</th>
              <th>Type</th>
              <th>Departure Station</th>
              <th>Departure Time</th>
              <th>Arrival Station</th>
              <th>Arrival Time</th>
              <th>Days Elapsed</th>
            </tr>
          </thead>
          <tbody>
            {routeData.map((row, index) => (
              <tr key={index}>
                <td>{row.TrainID}</td>
                <td>{row.Type}</td>
                <td>{row.DepartureStation}</td>
                <td>{row.DepartureTime}</td>
                <td>{row.ArrivalStation}</td>
                <td>{row.ArrivalTime}</td>
                <td>{convertNeo4jInt(row.DaysElapsed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TrainRoutes;

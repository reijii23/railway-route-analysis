const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Neo4j Driver Configuration
const driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345678'), {
  encrypted: 'ENCRYPTION_OFF'
});


// Helper function to convert Neo4j time object to string
function formatTime(timeObj) {
  if (!timeObj) return ''; // Handle cases where time is undefined
  const { hour, minute } = timeObj;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Helper function to convert Neo4j integers to native numbers
function convertNeo4jInt(value) {
  return typeof value === 'object' && value !== null && 'low' in value ? value.low : value;
}

// // Fetch all train routes
// app.get('/all-train-routes', async (req, res) => {
//   const session = driver.session({ database: "neo4j" });

//   try {
//     const result = await session.run(`
//       MATCH (train:Train)-[r:TRAVELS_TO]->(departureStation:Station)
//       OPTIONAL MATCH (departureStation)-[n:NEXT_STATION {TrainID: train.TrainID}]->(arrivalStation:Station)
//       RETURN train.TrainID AS TrainID, 
//              departureStation.name AS DepartureStation, 
//              r.departureTime AS DepartureTime, 
//              arrivalStation.name AS ArrivalStation, 
//              n.arrivalTime AS ArrivalTime, 
//              r.daysElapsed AS DaysElapsed
//       ORDER BY TrainID, DaysElapsed, DepartureTime
//     `);

//     const formattedData = result.records.map(record => ({
//       TrainID: record.get('TrainID'),
//       DepartureStation: record.get('DepartureStation'),
//       DepartureTime: formatTime(record.get('DepartureTime')), // Format time
//       ArrivalStation: record.get('ArrivalStation'),
//       ArrivalTime: formatTime(record.get('ArrivalTime')), // Format time
//       DaysElapsed: convertNeo4jInt(record.get('DaysElapsed')) // Handle Neo4j integer
//     }));

//     res.json(formattedData);
//   } catch (error) {
//     console.error('Error querying Neo4j:', error);
//     res.status(500).send('Internal server error');
//   } finally {
//     await session.close();
//   }
// });

// app.get('/all-train-routes', async (req, res) => {
//   const session = driver.session({ database: "neo4j" });

//   // Get the train type from the query parameters (if provided)
//   const trainType = req.query.type;

//   try {
//     const query = `
//       MATCH (train:Train)-[r:TRAVELS_TO]->(departureStation:Station)
//       ${trainType ? 'WHERE train.type = $trainType' : ''}  // Filter by type if provided
//       OPTIONAL MATCH (departureStation)-[n:NEXT_STATION {TrainID: train.TrainID}]->(arrivalStation:Station)
//       RETURN train.TrainID AS TrainID, 
//              train.type AS Type, 
//              departureStation.name AS DepartureStation, 
//              r.departureTime AS DepartureTime, 
//              arrivalStation.name AS ArrivalStation, 
//              n.arrivalTime AS ArrivalTime, 
//              r.daysElapsed AS DaysElapsed
//       ORDER BY TrainID, DaysElapsed, DepartureTime
//     `;

//     const result = await session.run(query, { trainType });

//     const formattedData = result.records.map(record => ({
//       TrainID: record.get('TrainID'),
//       Type: record.get('Type'),
//       DepartureStation: record.get('DepartureStation'),
//       DepartureTime: formatTime(record.get('DepartureTime')),
//       ArrivalStation: record.get('ArrivalStation'),
//       ArrivalTime: formatTime(record.get('ArrivalTime')),
//       DaysElapsed: convertNeo4jInt(record.get('DaysElapsed')),
//     }));

//     res.json(formattedData);
//   } catch (error) {
//     console.error('Error querying Neo4j:', error);
//     res.status(500).send('Internal server error');
//   } finally {
//     await session.close();
//   }
// });

// Fetch all train routes
app.get('/all-train-routes', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  const trainType = req.query.type;

  try {
    const query = `
MATCH (train:Train)-[r:TRAVELS_TO]->(departureStation:Station)
${trainType ? 'WHERE train.type = $trainType' : ''}
OPTIONAL MATCH (departureStation)-[n:NEXT_STATION {TrainID: train.TrainID}]->(arrivalStation:Station)
RETURN train.TrainID AS TrainID, 
       train.type AS Type, 
       departureStation.realName AS DepartureStation, 
       r.departureTime AS DepartureTime, 
       arrivalStation.realName AS ArrivalStation, 
       n.arrivalTime AS ArrivalTime, 
       r.daysElapsed AS DaysElapsed
ORDER BY TrainID, DaysElapsed, DepartureTime
LIMIT 50
    `;

    const result = await session.run(query, { trainType });

    const formattedData = result.records.map(record => ({
      TrainID: record.get('TrainID'),
      Type: record.get('Type') || 'Unknown', // Ensure type is returned
      DepartureStation: record.get('DepartureStation'),
      DepartureTime: formatTime(record.get('DepartureTime')),
      ArrivalStation: record.get('ArrivalStation'),
      ArrivalTime: formatTime(record.get('ArrivalTime')),
      DaysElapsed: convertNeo4jInt(record.get('DaysElapsed')),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Fetch specific train route by ID (TEXT)
app.get('/train-route/:trainID', async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const { trainID } = req.params;

  try {
    const result = await session.run(
      `MATCH (train:Train {TrainID: $trainID})-[r:TRAVELS_TO]->(departureStation:Station)
       OPTIONAL MATCH (departureStation)-[n:NEXT_STATION {TrainID: $trainID}]->(arrivalStation:Station)
       RETURN train.TrainID AS TrainID, 
              train.type AS Type, 
              departureStation.realName AS DepartureStation, 
              r.departureTime AS DepartureTime, 
              arrivalStation.realName AS ArrivalStation, 
              n.arrivalTime AS ArrivalTime, 
              r.daysElapsed AS DaysElapsed
       ORDER BY DaysElapsed, DepartureTime`,
      { trainID }
    );

    const formattedData = result.records.map(record => ({
      TrainID: record.get('TrainID'),
      Type: record.get('Type') || 'Unknown',
      DepartureStation: record.get('DepartureStation'),
      DepartureTime: formatTime(record.get('DepartureTime')), // Format the time
      ArrivalStation: record.get('ArrivalStation'),
      ArrivalTime: formatTime(record.get('ArrivalTime')), // Format the time
      DaysElapsed: record.get('DaysElapsed')
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



app.get('/train-summary', async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const { type } = req.query;  // Get the type from query parameters

  try {
    const query = `
MATCH (train:Train)-[r:TRAVELS_TO]->(station:Station)
${type ? 'WHERE train.type = $type' : ''}  // Apply type filter if provided
WITH train, r, station
ORDER BY r.daysElapsed ASC, r.departureTime ASC

// Collect stations, times, and days elapsed
WITH train, 
     COLLECT(station.name) AS stations, 
     COLLECT(station.realName) AS stationRealNames,  // Collect real names
     COLLECT(r.departureTime) AS departureTimes, 
     COLLECT(r.arrivalTime) AS arrivalTimes, 
     COLLECT(r.daysElapsed) AS daysElapsedList

// Calculate the total travel time considering DaysElapsed and base datetime
WITH train, stations, stationRealNames, departureTimes, arrivalTimes, daysElapsedList,
     REDUCE(totalTime = 0, i IN RANGE(0, SIZE(departureTimes)-1) | 
         totalTime + 
         duration.between(
             datetime({year: 2024, month: 1, day: 1, time: departureTimes[i]}) + duration({days: daysElapsedList[i]}), 
             datetime({year: 2024, month: 1, day: 1, time: arrivalTimes[i]}) + duration({days: daysElapsedList[i]})
         ).minutes
     ) AS TotalTravelTimeInMinutes

// Find the next station connected to the last station via the NEXT_STATION relationship
OPTIONAL MATCH (lastStation:Station {name: stations[-1]})-[:NEXT_STATION {TrainID: train.TrainID}]->(nextStation:Station)

// Return the train's details
RETURN 
    train.TrainID AS Train, 
    train.type AS Type,
    stationRealNames[0] AS FirstStation,
    departureTimes[0] AS FirstDepartureTime, 
    nextStation.realName AS FinalStation,
    arrivalTimes[-1] AS LastArrivalTime, 
    TotalTravelTimeInMinutes
ORDER BY Train ASC
LIMIT 50
    `;

    const result = await session.run(query, { type });

    const summaryData = result.records.map(record => ({
      TrainID: record.get('Train'),
      Type: record.get('Type') || 'Unknown',
      FirstStation: record.get('FirstStation'),
      FinalStation: record.get('FinalStation'),
      TotalTravelTimeInMinutes: record.get('TotalTravelTimeInMinutes')
    }));

    res.json(summaryData);
  } catch (error) {
    console.error('Error fetching train summary:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Route 1: Most Connected Stations
app.get('/most-connected-stations', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(`
MATCH (s:Station)-[:NEXT_STATION]->(s2:Station)
RETURN 
    s.realName AS Station,
    COUNT(*) AS Connections
ORDER BY Connections DESC
LIMIT 10
    `);

    const formattedData = result.records.map(record => ({
      Station: record.get('Station'),
      Connections: record.get('Connections').low, // Handle Neo4j integer
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Route 2: Peak Travel Times
app.get('/peak-travel-times', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(`
MATCH (s:Station)<-[r:TRAVELS_TO]-(train:Train)
RETURN 
    s.realName AS Station, 
    r.departureTime.hour AS Starting_From, 
    r.departureTime.hour + 1 AS Until, 
    COUNT(*) AS NumberOfDepartures
ORDER BY NumberOfDepartures DESC
LIMIT 10
    `);

    const formattedData = result.records.map(record => ({
      Station: record.get('Station'),
      Starting_From: convertNeo4jInt(record.get('Starting_From')), // Convert to native number
      Until: convertNeo4jInt(record.get('Until')), // Convert to native number
      NumberOfDepartures: convertNeo4jInt(record.get('NumberOfDepartures')), // Convert to native number
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Route 3: Total Travel Time for Each Train
app.get('/total-travel-time', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(`
      MATCH (train:Train)-[r:TRAVELS_TO]->(station:Station)
      WITH train, r, station
      ORDER BY r.daysElapsed ASC, r.departureTime ASC

      WITH train.TrainID AS TrainID, 
           COLLECT(station.realName) AS stations, 
           COLLECT(r.departureTime) AS departureTimes, 
           COLLECT(r.arrivalTime) AS arrivalTimes, 
           COLLECT(r.daysElapsed) AS daysElapsedList

      WITH TrainID, stations, departureTimes, arrivalTimes, daysElapsedList,
           REDUCE(totalTime = 0, i IN RANGE(0, SIZE(departureTimes)-1) | 
             totalTime + 
             duration.between(
               datetime({year: 2024, month: 1, day: 1, time: departureTimes[i]}) + duration({days: daysElapsedList[i]}), 
               datetime({year: 2024, month: 1, day: 1, time: arrivalTimes[i]}) + duration({days: daysElapsedList[i]})
             ).minutes
           ) AS TotalTravelTimeInMinutes

      OPTIONAL MATCH (lastStation:Station {realName: stations[-1]})-[:NEXT_STATION {TrainID: TrainID}]->(nextStation:Station)

      RETURN 
        TrainID AS Train, 
        stations[0] AS FirstStation, 
        departureTimes[0] AS FirstDepartureTime, 
        nextStation.realName AS FinalStation, 
        arrivalTimes[-1] AS LastArrivalTime, 
        TotalTravelTimeInMinutes
      ORDER BY TotalTravelTimeInMinutes DESC
      LIMIT 10
    `);

    const formattedData = result.records.map(record => ({
      Train: record.get('Train'),
      FirstStation: record.get('FirstStation'),
      FirstDepartureTime: formatTime(record.get('FirstDepartureTime')), // Format time here
      FinalStation: record.get('FinalStation') || 'N/A',
      LastArrivalTime: formatTime(record.get('LastArrivalTime')), // Format time here
      TotalTravelTimeInMinutes: record.get('TotalTravelTimeInMinutes').low, // Handle Neo4j integer
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Route to fetch graph data (stations, trains, and their relationships)
app.get('/graph-data', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(`
MATCH (s1:Station)-[r:CONNECTED]->(s2:Station)
OPTIONAL MATCH (train:Train)-[t:TRAVELS_TO]->(s1)
RETURN 
    ID(s1) AS sourceId, 
    s1.realName AS sourceName,  
    labels(s1) AS sourceLabels,
    
    ID(s2) AS targetId, 
    s2.realName AS targetName,  
    labels(s2) AS targetLabels,
    
    r.distance AS distance, 
    ID(train) AS trainId, 
    train.TrainID AS trainName, 
    train.type AS trainType
    `);

    const nodes = {};
    const links = [];

    result.records.forEach(record => {
      const sourceId = record.get('sourceId');
      const targetId = record.get('targetId');
      const trainId = record.get('trainId');

      // nodes[sourceId] = { id: sourceId, name: record.get('sourceName'), labels: record.get('sourceLabels') };
      // nodes[targetId] = { id: targetId, name: record.get('targetName'), labels: record.get('targetLabels') };

      // if (trainId) {
      //   nodes[trainId] = { id: trainId, name: record.get('trainName'), labels: ['Train'], type: record.get('trainType') };
      //   links.push({ source: trainId, target: sourceId, relationship: 'TRAVELS_TO' });
      // }

      // links.push({ source: sourceId, target: targetId, distance: record.get('distance') });

      nodes[String(sourceId)] = { 
        id: String(sourceId), 
        name: record.get('sourceName'), 
        labels: record.get('sourceLabels') 
      };
      
      nodes[String(targetId)] = { 
        id: String(targetId), 
        name: record.get('targetName'), 
        labels: record.get('targetLabels') 
      };
      
      if (trainId) {
        nodes[String(trainId)] = { 
          id: String(trainId), 
          name: record.get('trainName'), 
          labels: ['Train'], 
          type: record.get('trainType') 
        };
        
        // Add a TRAVELS_TO relationship from Train -> Source Node
        links.push({ 
          source: String(trainId), 
          target: String(sourceId), 
          relationship: 'TRAVELS_TO' 
        });
      }
      
      // Add the main link (Source -> Target)
      links.push({ 
        source: String(sourceId), 
        target: String(targetId), 
        distance: record.get('distance') 
      });
      
    });

    res.json({ nodes: Object.values(nodes), links });
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Route to fetch graph data for a specific train's route (GRAPH)
app.get('/train-graph/:trainID', async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const trainID = req.params.trainID;

  try {
    const result = await session.run(`
MATCH (train:Train {TrainID: $trainID})-[r:TRAVELS_TO]->(station:Station)
OPTIONAL MATCH (station)-[n:NEXT_STATION {TrainID: $trainID}]->(nextStation:Station)
RETURN 
    ID(train) AS trainId, 
    train.TrainID AS trainName, 
    train.type AS trainType,
    
    ID(station) AS stationId, 
    station.realName AS stationName, 
    
    ID(nextStation) AS nextStationId, 
    nextStation.realName AS nextStationName 
    `, { trainID });

    const nodes = {};
    const links = [];

    result.records.forEach(record => {
      const trainId = record.get('trainId');
      const stationId = record.get('stationId');
      const nextStationId = record.get('nextStationId');

      // Add train and station nodes
      nodes[trainId] = { id: String(trainId), name: record.get('trainName'), labels: ['Train'], type: record.get('trainType') };
      nodes[stationId] = { id: String(stationId), name: record.get('stationName'), labels: ['Station'] };

      if (nextStationId) {
        nodes[nextStationId] = { id: String(nextStationId), name: record.get('nextStationName'), labels: ['Station'] };

        // Add links (edges)
        links.push({ source: String(stationId), target: String(nextStationId), relationship: 'NEXT_STATION' });
      }

      links.push({ source: String(trainId), target: String(stationId), relationship: 'TRAVELS_TO' });
    });

    console.log('Nodes:', nodes);
    console.log('Links:', links);


    res.json({ nodes: Object.values(nodes), links });
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});


app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

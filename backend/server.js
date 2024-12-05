const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');
const app = express();
const port = 3001;

app.use(cors());

// Pengaturan untuk menghubungkan aplikasi dengan Neo4j
const driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345678'), {
  encrypted: 'ENCRYPTION_OFF'
});


// Fungsi tambahan untuk mengubah objek waktu dari format Neo4j menjadi String
function formatTime(timeObj) {
  if (!timeObj) return ''; //Menangani kasus-kasus dimana waktu adalah "undefined"
  const { hour, minute } = timeObj;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Fungsi tambahan untuk mengubah Integer Neo4j ke Integer pada umumnya
function convertNeo4jInt(value) {
  return typeof value === 'object' && value !== null && 'low' in value ? value.low : value;
}

// Rute untuk mengambil data semua kereta 
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
      Type: record.get('Type') || 'Unknown',
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



// Rute untuk mengambil data perjalanan sebuah kereta berdasarkan ID
app.get('/train-route/:trainID', async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const { trainID } = req.params;

  try {
    const query = `
MATCH (train:Train {TrainID: $trainID})-[r:TRAVELS_TO]->(departureStation:Station)
OPTIONAL MATCH (departureStation)-[:LOCATED_IN]->(departureCity:City)-[:PART_OF]->(departureProvince:Province)
OPTIONAL MATCH (departureStation)-[n:NEXT_STATION {TrainID: $trainID}]->(arrivalStation:Station)
OPTIONAL MATCH (arrivalStation)-[:LOCATED_IN]->(arrivalCity:City)-[:PART_OF]->(arrivalProvince:Province)

RETURN 
  train.TrainID AS TrainID,
  train.type AS Type,
  departureStation.realName AS DepartureStation,
  departureCity.name AS DepartureCity,
  departureProvince.name AS DepartureProvince,
  r.departureTime AS DepartureTime,
  arrivalStation.realName AS ArrivalStation,
  arrivalCity.name AS ArrivalCity,
  arrivalProvince.name AS ArrivalProvince,
  r.arrivalTime AS ArrivalTime,
  r.daysElapsed AS DaysElapsed
ORDER BY r.daysElapsed ASC, r.departureTime ASC
    `;

    const result = await session.run(query, { trainID });

    const formattedData = result.records.map(record => ({
      TrainID: record.get('TrainID'),
      Type: record.get('Type') || 'Unknown',
      DepartureStation: record.get('DepartureStation'),
      DepartureCity: record.get('DepartureCity') || 'N/A',
      DepartureProvince: record.get('DepartureProvince') || 'N/A',
      DepartureTime: formatTime(record.get('DepartureTime')),
      ArrivalStation: record.get('ArrivalStation'),
      ArrivalCity: record.get('ArrivalCity') || 'N/A',
      ArrivalProvince: record.get('ArrivalProvince') || 'N/A',
      ArrivalTime: formatTime(record.get('ArrivalTime')),
      DaysElapsed: record.get('DaysElapsed'),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Rute untuk mengambil data rute perjalanan semua kereta (ringkasan)
app.get('/train-summary', async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const { type } = req.query; 

  try {
    const query = `
MATCH (train:Train)-[r:TRAVELS_TO]->(station:Station)
${type ? 'WHERE train.type = $type' : ''} // Apply type filter if provided
WITH train, r, station
ORDER BY r.daysElapsed ASC, r.departureTime ASC

// Collect stations, times, and days elapsed
WITH train, 
     COLLECT(station.name) AS stations, 
     COLLECT(station.realName) AS stationRealNames,  // Collect real names
     COLLECT(station) AS stationNodes,               // Collect station nodes
     COLLECT(r.departureTime) AS departureTimes, 
     COLLECT(r.arrivalTime) AS arrivalTimes, 
     COLLECT(r.daysElapsed) AS daysElapsedList

// Calculate the total travel time considering DaysElapsed and base datetime
WITH train, stations, stationRealNames, stationNodes, departureTimes, arrivalTimes, daysElapsedList,
     REDUCE(totalTime = 0, i IN RANGE(0, SIZE(departureTimes)-1) | 
         totalTime + 
         duration.between(
             datetime({year: 2024, month: 1, day: 1, time: departureTimes[i]}) + duration({days: daysElapsedList[i]}), 
             datetime({year: 2024, month: 1, day: 1, time: arrivalTimes[i]}) + duration({days: daysElapsedList[i]})
         ).minutes
     ) AS TotalTravelTimeInMinutes

// Get the first and last station nodes
WITH train, stationRealNames, stationNodes, departureTimes, arrivalTimes, TotalTravelTimeInMinutes,
     stationNodes[0] AS firstStationNode,
     stationNodes[-1] AS lastStationNode,
     departureTimes[0] AS FirstDepartureTime,
     arrivalTimes[-1] AS LastArrivalTime

// Find the next station connected to the last station via the NEXT_STATION relationship
OPTIONAL MATCH (lastStationNode)-[:NEXT_STATION {TrainID: train.TrainID}]->(nextStation:Station)

// Optional matches for cities and provinces
OPTIONAL MATCH (firstStationNode)-[:LOCATED_IN]->(firstCity:City)-[:PART_OF]->(firstProvince:Province)
OPTIONAL MATCH (nextStation)-[:LOCATED_IN]->(lastCity:City)-[:PART_OF]->(lastProvince:Province)

// Return the train's details
RETURN 
    train.TrainID AS TrainID, 
    train.type AS Type,
    stationRealNames[0] AS FirstStation,
    firstCity.name AS FirstCity,
    firstProvince.name AS FirstProvince,
    FirstDepartureTime, 
    nextStation.realName AS LastStation,
    lastCity.name AS LastCity,
    lastProvince.name AS LastProvince,
    LastArrivalTime, 
    TotalTravelTimeInMinutes
ORDER BY TrainID ASC
    `;

    const result = await session.run(query, { type });

    const summaryData = result.records.map(record => ({
      TrainID: record.get('TrainID'),
      Type: record.get('Type') || 'Unknown',
      FirstStation: record.get('FirstStation'),
      FirstCity: record.get('FirstCity') || 'N/A',
      FirstProvince: record.get('FirstProvince') || 'N/A',
      LastStation: record.get('LastStation'),
      LastCity: record.get('LastCity') || 'N/A',
      LastProvince: record.get('LastProvince') || 'N/A',
      TotalTravelTimeInMinutes: record.get('TotalTravelTimeInMinutes'),
    }));

    res.json(summaryData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Route 1: Most Connected Stations
app.get('/Station-centrality-by-calculating-Out-Degrees', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(`
MATCH (s:Station)-[:NEXT_STATION]->(s2:Station)
RETURN 
    s.realName AS Station,
    COUNT(*) AS Connections
ORDER BY Connections DESC
    `);

    const formattedData = result.records.map(record => ({
      Station: record.get('Station'),
      Connections: record.get('Connections').low, 
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
app.get('/Busiest-travel-times-for-each-station', async (req, res) => {
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
    `);

    const formattedData = result.records.map(record => ({
      Station: record.get('Station'),
      Starting_From: convertNeo4jInt(record.get('Starting_From')),
      Until: convertNeo4jInt(record.get('Until')),
      NumberOfDepartures: convertNeo4jInt(record.get('NumberOfDepartures')),
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
app.get('/Total-travel-time-for-each-train', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(`
MATCH (train:Train)-[r:TRAVELS_TO]->(station:Station)
WITH train, r, station
ORDER BY r.daysElapsed ASC, r.departureTime ASC

// Collect relevant data
WITH train.TrainID AS TrainID, 
     COLLECT(station.realName) AS stations, 
     COLLECT(r.departureTime) AS departureTimes, 
     COLLECT(r.arrivalTime) AS arrivalTimes, 
     COLLECT(r.daysElapsed) AS daysElapsedList

// Calculate total travel time dynamically
WITH TrainID, stations, departureTimes, arrivalTimes, daysElapsedList,
     REDUCE(totalTime = 0, i IN RANGE(0, SIZE(departureTimes)-1) | 
       totalTime + 
       duration.between(
         datetime({year: 2024, month: 1, day: 1, time: departureTimes[i]}) + duration({days: daysElapsedList[i]}),
         CASE 
           // Handle intra-row transitions where arrivalTime < departureTime
           WHEN arrivalTimes[i] < departureTimes[i] THEN
             datetime({year: 2024, month: 1, day: 2, time: arrivalTimes[i]}) + duration({days: daysElapsedList[i]})
           ELSE
             datetime({year: 2024, month: 1, day: 1, time: arrivalTimes[i]}) + duration({days: daysElapsedList[i]})
         END
       ).minutes
     ) AS TotalTravelTimeInMinutes

// Match the final station and find the next station
OPTIONAL MATCH (lastStation:Station {realName: stations[-1]})-[:NEXT_STATION {TrainID: TrainID}]->(nextStation:Station)

RETURN 
  TrainID AS Train, 
  stations[0] AS FirstStation, 
  departureTimes[0] AS FirstDepartureTime, 
  nextStation.realName AS FinalStation, 
  arrivalTimes[-1] AS LastArrivalTime, 
  TotalTravelTimeInMinutes
ORDER BY TotalTravelTimeInMinutes DESC
    `);

    const formattedData = result.records.map(record => ({
      Train: record.get('Train'),
      FirstStation: record.get('FirstStation'),
      FirstDepartureTime: formatTime(record.get('FirstDepartureTime')),
      FinalStation: record.get('FinalStation') || 'N/A',
      LastArrivalTime: formatTime(record.get('LastArrivalTime')),
      TotalTravelTimeInMinutes: record.get('TotalTravelTimeInMinutes').low, 
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Route 4: Average travel time between stations
app.get('/Average-travel-time-between-stations', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
MATCH (s1:Station)-[next:NEXT_STATION]->(s2:Station)
MATCH (s1)-[conn:CONNECTED]-(s2) // Use CONNECTED to get the distance
WITH 
  s1, 
  s2, 
  conn.distance AS DistanceInKm, 
  next.departureTime AS DepartureTime, 
  next.arrivalTime AS ArrivalTime,
  next.daysElapsed AS DaysElapsed
// Calculate adjusted departure and arrival times considering daysElapsed
WITH 
  s1, 
  s2, 
  DistanceInKm,
  datetime({year: 2024, month: 1, day: 1, time: DepartureTime}) + duration({days: DaysElapsed}) AS AdjustedDepartureTime,
  CASE 
    WHEN ArrivalTime < DepartureTime THEN
      datetime({year: 2024, month: 1, day: 2, time: ArrivalTime}) + duration({days: DaysElapsed})
    ELSE
      datetime({year: 2024, month: 1, day: 1, time: ArrivalTime}) + duration({days: DaysElapsed})
  END AS AdjustedArrivalTime
WITH 
  s1.realName AS StartStation,
  s2.realName AS EndStation,
  DistanceInKm,
  duration.between(AdjustedDepartureTime, AdjustedArrivalTime).minutes AS TravelTimeInMinutes
// Aggregate to calculate the average travel time
RETURN 
  StartStation,
  EndStation,
  DistanceInKm,
  AVG(TravelTimeInMinutes) AS AvgTravelTimeInMinutes
ORDER BY AvgTravelTimeInMinutes DESC
    `;

    const result = await session.run(query);

    const formattedData = result.records.map(record => ({
      StartStation: record.get('StartStation'),
      EndStation: record.get('EndStation'),
      DistanceInKm: record.get('DistanceInKm') || 'N/A',
      AvgTravelTimeInMinutes: record.get('AvgTravelTimeInMinutes').toFixed(2),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Route 5: Gross Ton/Kilometer Route
app.get('/Gross-Ton-per-Kilometer-values-for-each-train', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
      MATCH (train:Train)-[r:TRAVELS_TO]->(station:Station)
      WITH train, r
      MATCH (station)-[conn:CONNECTED]-(nextStation:Station)
      WHERE conn.distance IS NOT NULL
      WITH 
          train.TrainID AS TrainID, 
          train.weight AS WeightPerTrip, 
          train.trip_count AS TripCount, 
          SUM(conn.distance) AS TotalDistanceInKm
      RETURN 
          TrainID,
          WeightPerTrip,
          TripCount,
          TotalDistanceInKm,
          (WeightPerTrip * TripCount) AS TotalTonnage,
          (WeightPerTrip * TripCount) / TotalDistanceInKm AS GrossTonPerKm
      ORDER BY GrossTonPerKm DESC
    `;

    const result = await session.run(query);

    const formattedData = result.records.map(record => ({
      TrainID: record.get('TrainID'),
      WeightPerTrip: record.get('WeightPerTrip'),
      TripCount: record.get('TripCount'),
      TotalDistanceInKm: record.get('TotalDistanceInKm'),
      TotalTonnage: record.get('TotalTonnage'),
      GrossTonPerKm: record.get('GrossTonPerKm')
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



//Route 6: Waiting Factor insights
app.get('/Waiting-Factor-scores-for-each-train', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(`
      MATCH (startStation:Station)-[r1:NEXT_STATION]->(endStation:Station)
      MATCH (train:Train)-[r2:TRAVELS_TO]->(startStation)
      WITH train, startStation, endStation,
           r1.departureTime AS departure, r1.arrivalTime AS arrival
      WHERE duration.inSeconds(arrival, departure).seconds >= 0
      WITH train, SUM(duration.inSeconds(arrival, departure).seconds) AS totalWaitTime
      MATCH (train)-[r3:TRAVELS_TO]->(station:Station)
      WITH train, totalWaitTime,
           MIN(r3.departureTime) AS firstDepTime, MAX(r3.arrivalTime) AS lastArrTime
      WITH train, totalWaitTime / 60 AS totalWaitTimeInMinutes,
           duration.inSeconds(firstDepTime, lastArrTime).seconds / 60 AS totalJourneyTimeInMinutes
      RETURN train.TrainID AS TrainID,
             totalWaitTimeInMinutes AS TotalWaitTime,
             totalJourneyTimeInMinutes AS TotalJourneyTime,
             CASE
               WHEN totalJourneyTimeInMinutes > 0 THEN
                 totalWaitTimeInMinutes * 1.0 / totalJourneyTimeInMinutes
               ELSE 0
             END AS WaitingFactor
      ORDER BY WaitingFactor ASC
    `);

    const insights = result.records.map((record) => ({
      TrainID: record.get('TrainID'),
      TotalWaitTime: record.get('TotalWaitTime'),
      TotalJourneyTime: record.get('TotalJourneyTime'),
      WaitingFactor: record.get('WaitingFactor'),
    }));

    res.json(insights);
  } catch (error) {
    console.error('Error fetching Waiting Factor:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Rute untuk mengambil data graf mengenai perjalanan sebuah kereta
app.get('/train-graph/:trainID', async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const trainID = req.params.trainID;

  try {
    const result = await session.run(
      `
      MATCH (train:Train {TrainID: $trainID})-[r:TRAVELS_TO]->(station:Station)
      OPTIONAL MATCH (station)-[n:NEXT_STATION {TrainID: $trainID}]->(nextStation:Station)
      RETURN 
        ID(train) AS trainId, 
        train.TrainID AS trainName, 
        train.type AS trainType,
        ID(station) AS stationId, 
        station.realName AS stationName, 
        ID(nextStation) AS nextStationId, 
        nextStation.realName AS nextStationName,
        n.daysElapsed AS daysElapsed,
        n.departureTime AS departureTime
      ORDER BY n.daysElapsed, n.departureTime
      `,
      { trainID }
    );

    const nodesMap = new Map();
    const links = [];

    let trainNode;
    result.records.forEach((record) => {
      if (!trainNode) {
        trainNode = {
          id: String(record.get("trainId")),
          name: record.get("trainName"),
          labels: ["Train"],
          type: record.get("trainType"),
        };
        nodesMap.set(trainNode.id, trainNode);
      }

      const stationId = String(record.get("stationId"));
      const stationName = record.get("stationName");
      const nextStationId = record.get("nextStationId")
        ? String(record.get("nextStationId"))
        : null;
      const nextStationName = record.get("nextStationName");

      if (!nodesMap.has(stationId)) {
        nodesMap.set(stationId, {
          id: stationId,
          name: stationName,
          labels: ["Station"],
        });
      }

      if (nextStationId && !nodesMap.has(nextStationId)) {
        nodesMap.set(nextStationId, {
          id: nextStationId,
          name: nextStationName,
          labels: ["Station"],
        });
      }

      if (!links.some((link) => link.source === trainNode.id && link.target === stationId)) {
        links.push({
          source: trainNode.id,
          target: stationId,
          relationship: "TRAVELS_TO",
        });
      }

      if (nextStationId) {
        links.push({
          source: stationId,
          target: nextStationId,
          relationship: "NEXT_STATION",
        });
      }
    });

    const nodes = Array.from(nodesMap.values());
    res.json({ nodes, links });
  } catch (error) {
    console.error("Error querying Neo4j:", error);
    res.status(500).send("Internal server error");
  } finally {
    await session.close();
  }
});



// Rute untuk menampilkan visualisasi graf pada tingkat Provinsi
app.get('/province-graph', async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  const { provinceName } = req.query; 

  try {
    const query = `
      MATCH (province:Province {name: $provinceName})<-[:PART_OF]-(city:City)<-[:LOCATED_IN]-(station1:Station)
      MATCH (station1)-[r:CONNECTED]-(station2:Station)
      OPTIONAL MATCH (station1)<-[:TRAVELS_TO]-(train:Train)
      RETURN
        province.name AS Province,
        city.name AS City,
        station1.realName AS Station1Name,
        station1.name AS Station1Code,
        station2.realName AS Station2Name,
        station2.name AS Station2Code,
        r.distance AS Distance,
        train.TrainID AS TrainID,
        train.type AS TrainType
      ORDER BY City, Station1Name, TrainID
    `;

    const result = await session.run(query, { provinceName });

    const formattedData = result.records.map(record => ({
      Province: record.get('Province'),
      City: record.get('City'),
      Station1Name: record.get('Station1Name'),
      Station1Code: record.get('Station1Code'),
      Station2Name: record.get('Station2Name'),
      Station2Code: record.get('Station2Code'),
      Distance: record.get('Distance') || 'N/A',
      TrainID: record.get('TrainID') || 'N/A',
      TrainType: record.get('TrainType') || 'N/A',
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error querying Neo4j:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Rute untuk mengambil nama semua stasiun dalam Neo4j
app.get('/stations', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (station:Station)
      RETURN station.realName AS stationName
      ORDER BY station.realName
    `);
    const stations = result.records.map(record => record.get('stationName'));
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await session.close();
  }
});



// Rute untuk mengambil kederajatan sebuah stasiun dan tetangganya
app.get('/station-degree', async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const { stationRealName } = req.query;

  try {
    const query = `
      MATCH (station:Station {realName: $stationRealName})
      OPTIONAL MATCH (station)-[outRel:NEXT_STATION]->(neighbor:Station)
      OPTIONAL MATCH (neighbor)-[inRel:NEXT_STATION]->(station)
      RETURN 
        station.realName AS StationName,
        COLLECT(DISTINCT neighbor.realName) AS Neighbors,
        size([(station)-[:NEXT_STATION]->(:Station) | 1]) AS OutDegree,
        size([(:Station)-[:NEXT_STATION]->(station) | 1]) AS InDegree,
        size([(station)-[:NEXT_STATION]->(:Station) | 1]) +
        size([(:Station)-[:NEXT_STATION]->(station) | 1]) AS TotalDegree
    `;

    const result = await session.run(query, { stationRealName });

    if (result.records.length === 0) {
      res.status(404).json({ error: `Station "${stationRealName}" not found.` });
      return;
    }

    const record = result.records[0];
    const response = {
      StationName: record.get('StationName'),
      Neighbors: record.get('Neighbors') || [],
      OutDegree: convertNeo4jInt(record.get('OutDegree')),
      InDegree: convertNeo4jInt(record.get('InDegree')),
      TotalDegree: convertNeo4jInt(record.get('TotalDegree')),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching station degree:', error);
    res.status(500).send('Internal server error');
  } finally {
    await session.close();
  }
});



// Rute untuk mencari rute-rute perjalanan antar stasiun
app.get('/search-trains-between', async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const { from, to } = req.query;

  const convertNeo4jInt = (value) =>
    typeof value === 'object' && value !== null && 'low' in value ? value.low : value;

  try {
    console.log(`Searching for trains between ${from} and ${to}`);

    // Step 1: Find candidate trains
    const candidateQuery = `
      MATCH (station:Station {realName: $from})<-[:NEXT_STATION|:TRAVELS_TO]-(train:Train)
      RETURN train.TrainID AS TrainID
      UNION
      MATCH (station:Station {realName: $to})<-[:NEXT_STATION|:TRAVELS_TO]-(train:Train)
      RETURN train.TrainID AS TrainID
    `;
    const candidateResult = await session.run(candidateQuery, { from, to });
    const candidateTrains = candidateResult.records.map((record) => record.get('TrainID'));

    if (candidateTrains.length === 0) {
      res.json({ message: `No trains found between ${from} and ${to}.` });
      return;
    }

    // Step 2: Validate paths for candidate trains
    const routes = [];
    for (const trainID of candidateTrains) {
      const routeQuery = `
        MATCH path=(fromStation:Station {realName: $from})-[:NEXT_STATION*..20]->(toStation:Station {realName: $to})
        WHERE ALL(rel IN relationships(path) WHERE rel.TrainID = $trainID)
        RETURN 
          [station IN nodes(path) | station.realName] AS StationPath,
          size(relationships(path)) AS NumberOfStops
      `;
      const routeResult = await session.run(routeQuery, { from, to, trainID });

      routeResult.records.forEach((record) => {
        routes.push({
          TrainID: trainID,
          StationPath: record.get('StationPath'),
          NumberOfStops: convertNeo4jInt(record.get('NumberOfStops')),
        });
      });
    }

    if (routes.length === 0) {
      res.json({ message: `No trains found between ${from} and ${to}.` });
    } else {
      res.json(routes);
    }
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

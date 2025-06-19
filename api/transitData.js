import qs from "qs";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from 'node-fetch';

const SFMTA_API_KEY = process.env.SFMTA_API_KEY;
const maxDis = 0.007;
const SFMTA_OPERATOR_ID = "SF";
const BASE_URL = "http://api.511.org/transit/vehiclepositions";

export async function nearbyArrivals(lat, long) {
  const LAT = parseFloat(lat ?? process.env.LAT);
  const LONG = parseFloat(long ?? process.env.LONG);

  // return {
  //   nearbyArrivals: [
  //     {
  //       line: "5",
  //       dest: "Ocean Beach",
  //       min: "3",
  //       stop: "Fulton + 25th Ave.",
  //     },
  //     {
  //       line: "29",
  //       dest: "Baker Beach",
  //       min: "5",
  //       stop: "Crossover Drive + Fulton",
  //     },
  //   ],
  // };

  const query = {
    api_key: SFMTA_API_KEY,
    operator_id: SFMTA_OPERATOR_ID,
    agency: SFMTA_OPERATOR_ID,
  };

  const closeStops = [];

  // // Get operators
  // try {
  //   const opsUrl = "http://api.511.org/transit/operators";
  //   const url = `${opsUrl}?${qs.stringify(query)}`;
  //   const response = await fetch(url);
  //   console.log({ response: response.body });
  //   const data = await response.json();
  //   console.log({ data });
  // } catch (error) {
  //   console.log({ error });
  // }

  const announcements = {};

  try {
    const stopsUrl = "http://api.511.org/transit/stops";
    const url = `${stopsUrl}?${qs.stringify(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = new Error(
        `${response.url}: ${response.status} ${response.statusText}`
      );
      error.response = response;
      throw error;
    }
    
    const _data = await response.text();
    const data = JSON.parse(_data.slice(1, _data.length))
    
    // const data = await response.json();
    // console.log({ data })
    data.Contents.dataObjects.ScheduledStopPoint.forEach((stop) => {
      const location = stop.Location;
      const latDist = Math.abs(LAT - location.Latitude);
      const longDist = Math.abs(LONG - location.Longitude);
      const distance = Math.sqrt(latDist * latDist + longDist * longDist);
      if (distance > maxDis) return;
      closeStops.push({ ...stop, distance });
    });
  } catch (error) {
    console.log("THIS ONE")
    console.log({ error });
  }

  closeStops.sort((a, b) => a.distance - b.distance);

  closeStops.forEach((stop) => {
    // console.log(`${stop.id} - ${stop.Name} - ${stop.distance}`);
  });

  try {
    const stopsUrl = "http://api.511.org/transit/StopMonitoring";
    const url = `${stopsUrl}?${qs.stringify({ ...query })}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = new Error(
        `${response.url}: ${response.status} ${response.statusText}`
      );
      error.response = response;
      throw error;
    }
    const _data = await response.text();
    const data = JSON.parse(_data.slice(1, _data.length))
    // const data = await response.json();
    data.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit.forEach(
      (visit) => {
        const jour = visit.MonitoredVehicleJourney;
        const stopId = jour.MonitoredCall.StopPointRef;
        const stopData = closeStops.find((i) => i.id === stopId);
        if (closeStops.map((i) => i.id).includes(stopId)) {
          const routeHash = `${jour.LineRef}_${jour.DestinationName}`;
          if (
            !announcements[routeHash] ||
            announcements[routeHash].distance > stopData.distance
          ) {
            // console.log({
            //   new: stopData.distance,
            //   before:
            //     announcements[routeHash] && announcements[routeHash].distance,
            // });
            announcements[routeHash] = { ...stopData, ...jour };
          } else {
            // console.log("\t", {
            //   not: stopData.distance,
            //   still:
            //     announcements[routeHash] && announcements[routeHash].distance,
            // });
          }
        }
      }
    );
  } catch (error) {
    console.log("NOW THIS ONE")
    console.log({ error });
  }

  // console.log(announcements["29_Baker Beach"]);

  const announcementsArray = [];

  Object.keys(announcements).forEach((a) => {
    const ann = announcements[a];
    const expArr = new Date(ann.MonitoredCall.ExpectedArrivalTime).getTime();
    const now = new Date().getTime();
    const arrivesInMin = Math.ceil((expArr - now) / 1000 / 60);
    if (arrivesInMin < 0) return
    announcementsArray.push({
      line: ann.LineRef,
      dest: ann.DestinationName,
      min: arrivesInMin,
      stop: ann.MonitoredCall.StopPointName,
    });
  });

  announcementsArray.sort((a, b) => a.min - b.min);

  return {
    nearbyArrivals: announcementsArray,
  };

  announcementsArray.forEach((a) => {
    console.log(`${a.line} to ${a.dest} in ${a.min} minutes at ${a.stop}`);
  });

  return;
  try {
    const url = `${BASE_URL}?${qs.stringify(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = new Error(
        `${response.url}: ${response.status} ${response.statusText}`
      );
      error.response = response;
      throw error;
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    feed.entity.forEach((entity) => {
      if (entity.tripUpdate) {
        console.log(entity.tripUpdate);
      }
      if (
        entity.vehicle &&
        entity.vehicle.trip &&
        entity.vehicle.trip.routeId === "5"
      ) {
        console.log(entity);
      }
    });
  } catch (error) {
    console.log("NUMBER 3")
    console.log(error);
    process.exit(1);
  }
}

import express from "express";
import { view } from "./view.js";
import { nearbyArrivals } from "./transitData.js";

const app = express();

app.get("/", async (req, res) => {
  // res.send(view(""));
  // return;
  const _nearbyArrivals = await nearbyArrivals();
  const nearbyArrivalsData = _nearbyArrivals.nearbyArrivals;
  const nearbyArrivalsList = nearbyArrivalsData.map((arrival) => {
    return `
      <li>
        <strong>${arrival.line}</strong> to ${arrival.dest} in <strong>${arrival.min} minutes</strong> at <strong>${arrival.stop}</strong>
      </li>
    `;
  });
  res.send(
    view(
      `<h2>Nearby Arrivals</h2><ol class="arrival-list">${nearbyArrivalsList.join(
        ""
      )}</ol>`
    )
  );
});

app.get("/api/nearby-arrivals", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const long = parseFloat(req.query.long);
  // console.log({ lat, long, qLat: req.query.lat, qLong: req.query.long });
  // res.json({ data: { nearbyArrivals: [] } });
  // return;
  const _nearbyArrivals = await nearbyArrivals(lat, long);
  const nearbyArrivalsData = _nearbyArrivals.nearbyArrivals;
  res.json({ data: { nearbyArrivals: nearbyArrivalsData } });
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});

export default app;

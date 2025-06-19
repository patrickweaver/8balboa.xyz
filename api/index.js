import express from "express";
const app = express();
import { view } from "../api/view.js";
import { nearbyArrivals } from "../api/transitData.js";

app.get("/test", (req, res) => res.send("Express on Vercel"));

app.get("/", async (req, res) => {
  // res.send(view(""));
  // return;
  const _nearbyArrivals = await nearbyArrivals();
  const nearbyArrivalsData = _nearbyArrivals.nearbyArrivals;
  if (nearbyArrivalsData.length === 0) {
    res.send(
      view(`
      <h3>Error</h3>
      <p>Can’t load MUNI arrival times</p>
    `)
    );
    return;
  }

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

app.listen(process.env.PORT, () =>
  console.log(`Server ready on port ${process.env.PORT}.`)
);

export default app;

import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";
import * as L from 'leaflet';
import { eq_state } from "./state";

export function loadCeriBoundary() {
  const ceriBound_url = 'data/ceri_boundaries_req3.geojson';

  const fetchInit = sp.util.defaultFetchInitObj(sp.util.JSON_MIME);
  return sp.util.doFetchWithTimeout(ceriBound_url, fetchInit, 10).then(response => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(`Status not successful: ${response.status}`);
    }
  }).then(geojson => {
    eq_state.boundary = geojson;
    return geojson;
  });
}

export function addBoundaryToMap(geoJsonBoundary,
                                eqMap: sp.leafletutil.QuakeStationMap) {
  if (eqMap.map != null) {
    const colors = [ "green", "blue"]
    let idx = 0;
    const bigBox = geoJsonBoundary.features[0];
    const westArea = geoJsonBoundary.features[1];
    const eastArea = geoJsonBoundary.features[2];
    const fList = [westArea, eastArea];
    for (const f of fList) {
      const latlon = [];

      for (const ll of f.geometry.coordinates[0]) {
        console.log(ll)
        latlon.push([ll[1], ll[0]]);
      }
      let polygon = L.polygon(latlon, {color: colors[idx], fill: false}).addTo(eqMap.map);
      idx +=1;
    }
    // some issue with leaflet and the geojson causes errors, so add manually
    //L.geoJSON(geoJsonBoundary).addTo(eqMap.map);
  }
}

export function loadQuakes() {
  const ceri_recenteq_url =
    'http://folkworm.ceri.memphis.edu/REQ/json/recent_events.json?map_type=recent';
  const test_recenteq_url = 'data/recent_events.json';

  const fetchInit = sp.util.defaultFetchInitObj(sp.util.JSON_MIME);
  return sp.util.doFetchWithTimeout(test_recenteq_url, fetchInit, 10).then(response => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(`Status not successful: ${response.status}`);
    }
  }).then(json => {
    return parseCeriJson(json);
  }).then(quakeList => {
    eq_state.quakeList = quakeList;
    return quakeList;
  });
}

export function parseCeriJson(jsonArr) {
  const out: Array<sp.quakeml.Quake> = [];
  for (let jObj of jsonArr) {
    const e = jObj.event;
    const otime = DateTime.fromSeconds(e.event_time_epoch, {zone: "utc"});
    const or = new sp.quakeml.Origin(otime, e.lat, e.lon);
    const evid = e.evid != null ? e.evid : `recent_${e.epoch}`;
    const q = sp.quakeml.createQuakeFromValues(evid,
      otime,
      e.lat, e.lng,
      e.depth_km*1000
    );
    if (q == null) {
      throw new Error(`q is null`);
    }
    q.preferredMagnitude = new sp.quakeml.Magnitude(e.magnitude, "Ml");

    out.push(q);
  }
  console.log(`par`)
  return out;
}

export function createQuakeLoadRadios(displayFun) {
  document.querySelector<HTMLDivElement>('#timerange')!.innerHTML = `
  <label>Time: </label>
  <input type="radio" id="isday" name="timerange" value="day" />
  <label for="day">
      <span>24 Hours: </span>
  </label>
  <input type="radio" id="isweek" name="timerange" value="week"  checked/>
  <label for="week">
      <span>Last Week: </span>
  </label>
  <input type="radio" id="ismonth" name="timerange" value="month" />
  <label for="month">
      <span>Last Month: </span>
  </label>
  <input type="radio" id="issixmonth" name="timerange" value="sixmonth" />
  <label for="sixmonth">
      <span>Six Months: </span>
  </label>
  `;

  const timeRangeList = document.querySelectorAll('input[name="timerange"]');
  timeRangeList.forEach(el => {
    el.addEventListener("change", (event) => loadForRange().then(displayFun));
  });
  loadForRange().then(displayFun);
}

const quakeDisplaySelector = ".quakedisplay";

export function loadForRange() {
  const timeRangeEl = document.querySelector('input[name="timerange"]:checked');
  let timeRangeStr = timeRangeEl ? timeRangeEl.value : "day";
  let timeRangeDur;
  if (timeRangeStr === "day") {
    timeRangeDur = Duration.fromObject({hours: 24});
  } else if (timeRangeStr === "week") {
    timeRangeDur = Duration.fromObject({days: 7});
  } else if (timeRangeStr === "month") {
    timeRangeDur = Duration.fromObject({days: 31});
  } else if (timeRangeStr === "sixmonth") {
    timeRangeDur = Duration.fromObject({days: 185});
  } else {
    timeRangeDur = Duration.fromObject({years: 1});
  }

  return loadQuakes().then(quakeList => {
    console.log(`added ${quakeList.length} quakes`);
    const now = DateTime.utc();
    const tableTimeRange = now.minus(timeRangeDur);
    const tableQuakes = [];
    for (let q of quakeList.reverse()) {
      let css = "older";
      if (q.preferredOrigin.time > tableTimeRange) {
        tableQuakes.push(q);
      }
    }
    return tableQuakes
  });
}

export function filterQuakesOnMap(quakeList: Array<sp.quakeml.Quake>,
  latlonBounds: leaflet.LatLngBounds): Array<sp.quakeml.Quake> {
  const out = new Array();
  if (latlonBounds == null) {return quakeList;}
  const west = latlonBounds.getWest();
  const east = latlonBounds.getEast();
  const south = latlonBounds.getSouth();
  const north = latlonBounds.getNorth();
  for (const q of quakeList) {
    if (q != null
      && q.latitude >= south && q.latitude <= north
      && q.longitude >= west && q.longitude <= east
    ) {
      out.push(q);
    }
  }
  return out;
}

export function loadQuakeById(qid: String): sp.quakeml.Quake {
  return loadQuakes().then(quakeList => {
    return quakeList.find(q => q.publicId === qid);
  })
}


export function addQuakesToMap(quakeList: Array<sp.quakeml.Quake>,
                                eqMap: sp.leafletutil.QuakeStationMap) {

  console.log(`added ${quakeList.length} quakes`);
  //quakeList = quakeList.slice(10,15);
  const now = DateTime.utc();
  const yesterday = now.minus(Duration.fromObject({hours: 24}));
  const weekago = now.minus(Duration.fromObject({days: 7}));
  eqMap.quakeList.length=0;
  for (let q of quakeList.reverse()) {
    let css = "older";
    if (q.preferredOrigin.time > yesterday) {
      css = "day";
    } else if (q.preferredOrigin.time > weekago) {
      css = "week";
    }
    eqMap.addQuake(q, css);
  }
  eqMap.redraw();
}

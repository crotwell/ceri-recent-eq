import './style.css'
import {quakeTimeColorCSS, createNetworkCSS} from './css_util';
import {setUpEQMapAndTable, defaultHandleQuakeClick} from './eqmap';
import { createStandardLegend, legendCSS} from './legend';
import { loadStations, loadStationBySID } from './load_stations.ts'
import { loadQuakes, createQuakeLoadRadios, addQuakesToMap,
  loadCeriBoundary, addBoundaryToMap,
} from './load_quakes.ts'
import {createHeader, setSPVersion} from './navigation';
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";

const headEl = createHeader();

const tileURL = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
const tileAttrib = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>';

const uscTileCache = 'https://www.seis.sc.edu/tilecache/USGS_USImageryTopo/{z}/{y}/{x}/'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <span class="toptext">On station page: </span>
    <a id="realtime">Realtime</a>
    <span> Latency: </span><span class="latency">-</span><span> at IRIS</span>
  <div>
  <div id="timerange">
  </div>
  <div>
    <sp-station-quake-map
      centerLat="36" centerLon="-90" zoomLevel="6"
      magScale="3"
      tileUrl='${uscTileCache}'
      tileAttrib='${tileAttrib}'
      fitBounds="false"
      >
    </sp-station-quake-map>
    <sp-channel-table>
    </sp-channel-table>
    <div id="realtime"></div>
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
      <span class="sp_version"></span>
    </h5>
  </div>
`

const chanTable = document.querySelector("sp-channel-table");

const url = new URL(document.URL);
const queryParams = url.searchParams;
const sid = queryParams.get("sid");
let station = null;

const eqMap = document.querySelector("sp-station-quake-map");
setUpEQMapAndTable(eqMap, null);
eqMap.removeEventListener("quakeclick", defaultHandleQuakeClick);
eqMap.addEventListener("quakeclick", e => {
  console.log(e.detail.quake.publicId);
  window.location.href = `seismogram?sid=${station.sourceId}&quakeid=${e.detail.quake.publicId}`;
});

document.querySelector("span.toptext").textContent = sid;
loadStationBySID(sid).then(netList => {
  document.querySelector("#realtime").setAttribute("href",  `station_realtime.html?sid=${sid}`);

  station = netList[0].stations[0];
  document.querySelector("span.toptext").textContent = `${sid} ${station.name}`;
  eqMap.addStation(station, station.networkCode);
  eqMap.centerLat = station.latitude;
  eqMap.centerLon = station.longitude;
  chanTable.channelList = station.channels;

  eqMap.redraw();
  return station;
}).then(station => {
  return station;
});

createQuakeLoadRadios(quakeList => {
  addQuakesToMap(quakeList, eqMap);
});


// set up periodic query for station latency at IRIS
let ringConn = new sp.ringserverweb.RingserverConnection();
function enableLatencyCheck() {
  if (station != null) {
    const pattern = `${station.network.networkCode}_${station.stationCode}`;
    ringConn.pullStreams(pattern).then(streamStats => {
      const stationStats =
        sp.ringserverweb.stationsFromStreams(streamStats.streams);
      if (stationStats.length !== 0) {
        const diffText = latencyAsText(stationStats[0].end);
        document.querySelectorAll(".latency").forEach( el => {
          el.textContent = diffText;
        });
      }
    });
  }

  setTimeout(()=> {
    enableLatencyCheck();
  }, 10*1000);
}

setTimeout(()=> {
  enableLatencyCheck();
}, 2*1000);


export function latencyAsText( end: sp.luxon.DateTime ) {
  let out = "missing";
  if (end){
    const latency = end.diffNow("seconds").negate();
    if (latency.as('milliseconds') < 1000) {
      out = "ok";
    } else if (latency.as('seconds') < 10) {
      out = "ok";
    } else if (latency.as('seconds') < 150) {
      out = `${Math.round(latency.as('seconds'))} sec`;
    } else if (latency.as('minutes') < 150) {
      out = `${Math.round(latency.as('minutes'))} min`;
    } else if (latency.as('hours') < 48) {
      out = `${Math.round(latency.as('hours'))} hr`;
    } else {
      out = `${Math.round(latency.as('days'))} days`;
    }
  }
  return out;
}


setSPVersion();

import './style.css';
import {quakeTimeColorCSS, createNetworkCSS} from './css_util';
import { loadStations, } from './load_stations.ts'
import { loadQuakeById } from './load_quakes.ts'
import { createStandardLegend, legendCSS } from './legend';
import * as sp from 'seisplotjs';
import AutoGraticule from "leaflet-auto-graticule";


const headEl = document.querySelector<HTMLElement>('header');
headEl!.innerHTML = `
  <a href="http://www.memphis.edu/ceri">
    <img src="UofM_logo_preferred.png" alt"CERI" height="180">
  </a>
  <nav>
    <ul>
      <li><a href="index.html">Recent Earthquakes</a></li>
      <li><a href="station_list.html">Station Map</a></li>
      <li><a href="req_sta.html">Recent Earthquakes and Stations</a></li>
      <li><a href="event_list.html">List of all events</a></li>
    </ul>
  </nav>
`;

//const tileURL = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
const tileAttrib = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>';
const uscTileCache = 'https://www.seis.sc.edu/tilecache/USGS_USImageryTopo/{z}/{y}/{x}/'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<p>On event page: </p>
  <div id="timerange">
  </div>
  <div>
    <sp-station-quake-map
      centerLat="36" centerLon="-90" zoomLevel="6"
      magScale="20"
      tileUrl='${uscTileCache}'
      tileAttrib='${tileAttrib}'
      fitBounds="false"
      >
    </sp-station-quake-map>
    <sp-quake-table>
    </sp-quake-table>
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
    </h5>
  </div>
`

const eqMap = document.querySelector("sp-station-quake-map") as sp.leafletutil.QuakeStationMap;
eqMap.addStyle(legendCSS);
eqMap.addStyle(quakeTimeColorCSS);
eqMap.addStyle(createNetworkCSS([]));// empty network list just gets default colors


const quakeTable = document.querySelector("sp-quake-table");

const url = new URL(document.URL);
const queryParams = url.searchParams;
const qid = queryParams.get("quakeid");
if (qid == null) {
  // go back to main?
  window.open(`index.html`);
}
const pEl = document.querySelector("p");
if (pEl != null) {pEl.textContent = qid;}
loadQuakeById(qid).then(quake => {
  if (quake == null) {
    pEl.textContent = `Unable to load earthquake for id ${qid}`;
  }
  eqMap.centerLat = quake.origin.latitude;
  eqMap.centerLon = quake.origin.longitude;
  quakeTable.quakeList = [quake];
  eqMap.addQuake(quake, "day");
  eqMap.redraw();
  return quake;
}).then(quake => {
  return loadStations().then(netList => {
    eqMap.addStyle(createNetworkCSS(netList));
    for (let net of netList ) {
      eqMap.addStation(net.stations, net.networkCode);
    }
    eqMap.redraw();
    return netList;
  });
}).then(netList => {
  console.log(`loaded ${netList.length} networks`);
});

eqMap.onRedraw = function(eqMap) {
  createStandardLegend(eqMap);
  new AutoGraticule().addTo(eqMap.map);
};

eqMap.addEventListener("stationclick", e => {
  console.log(e.detail.station.sourceId);
  window.open(`seismogram?sid=${e.detail.station.sourceId}&quakeid=${qid}`, "seismogram");
});

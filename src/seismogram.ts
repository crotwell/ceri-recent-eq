import './style.css'
import { loadStations, loadStationBySID } from './load_stations.ts'
import { loadQuakeById, loadQuakes, createQuakeLoadRadios, addQuakesToMap } from './load_quakes.ts'
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";


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

const tileURL = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
const tileAttrib = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>';

const uscTileCache = 'https://www.seis.sc.edu/tilecache/USGS_USImageryTopo/{z}/{y}/{x}/'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<p>On seismogram page: </p>
  <div id="timerange">
  </div>
  <div>
    <h3 id="quakeinfo"></h3>
    <h3 id="stationinfo"></h3>

    <sp-organized-display
      tools="true"
      map="true"
      info="false"
      overlay="individual"
      sort="distance"
      tileUrl='${uscTileCache}'
      tileAttrib='${tileAttrib}'
    ></sp-organized-display>
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
    </h5>
  </div>
`;


const url = new URL(document.URL);
const queryParams = url.searchParams;
const sid = queryParams.get("sid");
let station = null;
const qid = queryParams.get("quakeid");
let dataset = null;
loadStationBySID(sid).then(netList => {
  station = netList[0].stations[0];
  document.querySelector("#stationinfo").textContent = `${station.codes()} (${station.latitude}/${station.longitude}) ${station.description}`;
  const qPromise = loadQuakeById(qid);
  return Promise.all([netList, qPromise]);
}).then(([netList, quake]) => {
  document.querySelector("#quakeinfo").textContent = quake.toString();
  const loader = new sp.seismogramloader.SeismogramLoader(netList, [quake]);
  return loader.load();
}).then(loadedDataset => {
  dataset = loadedDataset;
  console.log(`got dataset: ${dataset.waveforms.length}`);
  const orgDisp = document.querySelector("sp-organized-display");
  orgDisp.seisData = dataset.waveforms;
  return dataset;
});

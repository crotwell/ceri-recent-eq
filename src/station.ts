import './style.css'
import { createStandardLegend} from './legend';
import { loadStations, loadStationBySID } from './load_stations.ts'
import { loadQuakes, createQuakeLoadRadios, addQuakesToMap } from './load_quakes.ts'
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";
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

const tileURL = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
const tileAttrib = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>';

const uscTileCache = 'https://www.seis.sc.edu/tilecache/USGS_USImageryTopo/{z}/{y}/{x}/'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<p>On station page: </p>
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
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
    </h5>
  </div>
`

const eqMap = document.querySelector("sp-station-quake-map");
eqMap.addStyle(`
  div.legend {
    background-color: lightgrey;
    border-color: red;
    border-width: thick;
    font-size: large;
    font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
  }
  div.legend div div {
    display: flex;
    align-items: start;
    justify-content: space-around;
  }
  div.NM.stationMapMarker {
    color: red;
  }
  div.CO.stationMapMarker {
    color: rebeccapurple;
  }
  div.ET.stationMapMarker {
    color: orange;
  }
  div.US.stationMapMarker {
    color: blue;
  }
  div.N4.stationMapMarker {
    color: brown;
  }
  div.OK.stationMapMarker {
    color: white;
  }
  div.KY.stationMapMarker {
    color: cyan;
  }
  div.O2.stationMapMarker {
    color: pink;
  }
  div.AG.stationMapMarker {
    color: yellow;
  }
  path.quakeMapMarker {
    fill: yellow;
    stroke: yellow;
    fill-opacity: 0.25;
    stroke-opacity: 0.75
  }
  .quakeMapMarker.day {
    fill: red;
    stroke: red;
  }
  .quakeMapMarker.week {
    fill: orange;
    stroke: orange;
  }
  .quakeMapMarker.older {
    fill: yellow;
    stroke: yellow;
  }
`);



const chanTable = document.querySelector("sp-channel-table");

const url = new URL(document.URL);
const queryParams = url.searchParams;
const sid = queryParams.get("sid");
let station = null;
document.querySelector("p").textContent = sid;
loadStationBySID(sid).then(netList => {
  station = netList[0].stations[0];
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

eqMap.onRedraw = function(eqMap) {
  createStandardLegend(eqMap);
  new AutoGraticule().addTo(eqMap.map);
};

eqMap.addEventListener("quakeclick", e => {
  console.log(e.detail.quake.publicId);
  window.open(`seismogram?sid=${station.sourceId}&quakeid=${e.detail.quake.publicId}`, "seismogram");
});
eqMap.redraw();

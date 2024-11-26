import './style.css'
import { loadQuakes, createQuakeLoadRadios, addQuakesToMap } from './load_quakes.ts'
import {createLegendCircle, createStandardLegend } from './legend';
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";
import AutoGraticule from "leaflet-auto-graticule";

const headEl = document.querySelector<HTMLHeaderElement>('header');
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

const uscTileCache = 'https://www.seis.sc.edu/tilecache/USGS_USImageryTopo/{z}/{y}/{x}/';


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

  <div id="timerange">
  </div>
  <div>
    <sp-station-quake-map
      class="quakedisplay"
      centerLat="36" centerLon="-90" zoomLevel="6"
      magScale="3"
      tileUrl="${uscTileCache}",
      tileAttribution="${tileAttrib}",
      fitBounds="false"
      >
    </sp-station-quake-map>
    <sp-quake-table></sp-quake-table>
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
    </h5>
  </div>
`


//const uscTileCache = 'https://www.seis.sc.edu/tilecache/NatGeo/{z}/{y}/{x}/'

const eqMap = document.querySelector("sp-station-quake-map");
const eqTable = document.querySelector("sp-quake-table");
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
  div.stationMapMarker {
    color: rebeccapurple;
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

eqMap.onRedraw = function(eqMap) {
  createStandardLegend(eqMap);
  new AutoGraticule().addTo(eqMap.map);
}

createQuakeLoadRadios(quakeList => {
  addQuakesToMap(quakeList, eqMap);
  eqTable.quakeList = quakeList;
  eqMap.redraw();
});

eqMap.addEventListener("quakeclick", e => {
  console.log(e.detail.quake.publicId);
  window.open(`earthquake?quakeid=${e.detail.quake.publicId}`, "earthquake");
});

eqTable.addEventListener("quakeclick", e => {
  console.log(e.detail.quake.publicId);
  window.open(`earthquake?quakeid=${e.detail.quake.publicId}`, "earthquake");
});
eqMap.redraw();

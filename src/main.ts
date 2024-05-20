import './style.css'
import { loadQuakes, createQuakeLoadRadios } from './load_quakes.ts'
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";


const headEl = document.querySelector<HTMLHeaderElement>('header');
headEl!.innerHTML = `
  <a href="http://www.memphis.edu/ceri">
    <img src="UofM_logo_preferred.png" alt"CERI" height="180">
  </a>
  <nav>
    <ul>
      <li><a href="recent.html">Recent Earthquakes</a></li>
      <li><a href="station.html">Station Map</a></li>
      <li><a href="req_sta.html">Recent Earthquakes and Stations</a></li>
      <li><a href="event_list.html">List of all events</a></li>
    </ul>
  </nav>
`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

  <div id="timerange">
  </div>
  <div>
    <sp-station-quake-map
      class="quakedisplay"
      centerLat="36" centerLon="-90" zoomLevel="6"
      magScale="3"
      tileUrl='https://www.seis.sc.edu/tilecache/USGS_USImageryTopo/{z}/{y}/{x}/'
      fitBounds="false"
      >
    </sp-station-quake-map>
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
    </h5>
  </div>
`

const tileURL = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
const tileAttrib = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>';

const uscTileCache = 'https://www.seis.sc.edu/tilecache/NatGeo/{z}/{y}/{x}/'

const eqMap = document.querySelector("sp-station-quake-map");
eqMap.addStyle(`
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


createQuakeLoadRadios(quakeList => {
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
  eqMap.draw();
});

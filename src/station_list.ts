import './style.css';
import {quakeTimeColorCSS, createNetworkCSS} from './css_util';
import {createStandardLegend, legendCSS} from './legend';
import {
  loadCeriBoundary, addBoundaryToMap,
} from './load_quakes.ts';

import {
  setUpEQMapAndTable,
  defaultHandleQuakeClick, defaultHandleStationClick
} from './eqmap';
import { loadStations } from './load_stations.ts'
import {createHeader, setSPVersion} from './navigation';
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";


const headEl = createHeader();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

  <div>
    <sp-station-quake-map
      centerLat="36" centerLon="-90" zoomLevel="6"
      magScale="3"
      tileUrl='https://www.seis.sc.edu/tilecache/USGS_USImageryTopo/{z}/{y}/{x}/'
      fitBounds="false"
      >
    </sp-station-quake-map>
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
      <span class="sp_version"></span>
    </h5>
  </div>
`

const eqMap = document.querySelector("sp-station-quake-map");
setUpEQMapAndTable(eqMap, null);

loadStations().then(netList => {
  eqMap.addStyle(createNetworkCSS(netList));
  for (let net of netList ) {
    eqMap.addStation(net.stations, net.networkCode);
  }
  eqMap.redraw();
});

eqMap.removeEventListener("stationclick", defaultHandleStationClick);
eqMap.addEventListener("stationclick", e => {
  console.log(e.detail.station.sourceId);
  window.location.href = `station?sid=${e.detail.station.sourceId}`;
});
setSPVersion();

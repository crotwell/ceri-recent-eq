import './style.css';
import {quakeTimeColorCSS, createNetworkCSS} from './css_util';
import {createStandardLegend, legendCSS} from './legend';
import { loadStations } from './load_stations.ts'
import {createHeader, setSPVersion} from './navigation';
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";
import AutoGraticule from "leaflet-auto-graticule";


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

const tileURL = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
const tileAttrib = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>';

const uscTileCache = 'https://www.seis.sc.edu/tilecache/NatGeo/{z}/{y}/{x}/'

const eqMap = document.querySelector("sp-station-quake-map");
eqMap.addStyle(legendCSS);
eqMap.addStyle(quakeTimeColorCSS);

loadStations().then(netList => {
  eqMap.addStyle(createNetworkCSS(netList));
  for (let net of netList ) {
    eqMap.addStation(net.stations, net.networkCode);
  }
  eqMap.redraw();
});

eqMap.onRedraw = function(eqMap) {
  createStandardLegend(eqMap);
  new AutoGraticule().addTo(eqMap.map);
};

eqMap.addEventListener("stationclick", e => {
  console.log(e.detail.station.sourceId);
  window.open(`station?sid=${e.detail.station.sourceId}`);
});
eqMap.redraw();
setSPVersion();

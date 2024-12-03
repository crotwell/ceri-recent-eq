import './style.css'
import {quakeTimeColorCSS, createNetworkCSS} from './css_util';
import {
  loadQuakes, createQuakeLoadRadios,
  addQuakesToMap, filterQuakesOnMap,
  loadCeriBoundary, addBoundaryToMap,
} from './load_quakes.ts';
import {setUpEQMapAndTable} from './eqmap';
import { createStandardLegend, legendCSS, } from './legend';
import {createHeader, setSPVersion} from './navigation';
import { eq_state } from "./state";

import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";

const headEl = createHeader();
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
      <span class="sp_version"></span>
    </h5>
  </div>
`


//const uscTileCache = 'https://www.seis.sc.edu/tilecache/NatGeo/{z}/{y}/{x}/'

const eqMap = document.querySelector("sp-station-quake-map");
const eqTable = document.querySelector("sp-quake-table");
setUpEQMapAndTable(eqMap, eqTable);

createQuakeLoadRadios(quakeList => {
  addQuakesToMap(quakeList, eqMap);
  if (eqMap.map != null) {
    eqTable.quakeList = filterQuakesOnMap(quakeList, eqMap.map.getBounds());
  }
  eqMap.redraw();
});


setSPVersion();

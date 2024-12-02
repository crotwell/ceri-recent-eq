import {quakeTimeColorCSS, createNetworkCSS} from './css_util';
import { createStandardLegend, legendCSS, } from './legend';
import { eq_state } from "./state";
import {
  loadQuakes, createQuakeLoadRadios,
  addQuakesToMap, filterQuakesOnMap,
  loadCeriBoundary, addBoundaryToMap,
} from './load_quakes.ts';
import AutoGraticule from "leaflet-auto-graticule";

const tileURL = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
const tileAttrib = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>';

const uscTileCache = 'https://www.seis.sc.edu/tilecache/USGS_USImageryTopo/{z}/{y}/{x}/';

export function defaultHandleQuakeClick(e) {
  console.log(`eqmap quakeclick: ${e.detail.quake.publicId}`);
  window.location.href = `earthquake?quakeid=${e.detail.quake.publicId}`;
}
export function defaultHandleStationClick(e) {
  console.log(`eqmap stationclick: ${e.detail.station.sourceId}`);
  window.location.href = `station?sid=${e.detail.station.sourceId}`;
}


export function setUpEQMapAndTable(eqMap, eqTable, ) {
  if (eqMap) {
    eqMap.addStyle(legendCSS);
    eqMap.addStyle(quakeTimeColorCSS);
    eqMap.addStyle(createNetworkCSS([]));// empty network list just gets default colors

    eqMap.onRedraw = function(eqMap) {
      createStandardLegend(eqMap);
      if (eqTable) {
        eqMap.map.addEventListener("zoomend", e => {
          eqTable.quakeList = filterQuakesOnMap(eqMap.quakeList, eqMap.map.getBounds());
        });
        eqMap.map.addEventListener("moveend", e => {
          eqTable.quakeList = filterQuakesOnMap(eqMap.quakeList, eqMap.map.getBounds());
        });
      }
      if (eqMap.map != null && eqMap.map.getBounds().isValid() && eqMap.map.getBounds().getSouthWest()!= null) {
        console.log(eqMap.map.getBounds().getSouthWest());
        console.log(eqMap.map.getBounds().getSouth())
        //new AutoGraticule().addTo(eqMap.map);
        if ( eq_state.boundary != null ) {
          addBoundaryToMap(eq_state.boundary, eqMap);
        }
      }
    }

    eqMap.addEventListener("stationclick", defaultHandleStationClick);
    eqMap.addEventListener("quakeclick", defaultHandleQuakeClick);

    if (eq_state.boundary == null) {
      loadCeriBoundary().then( boundary => {
        eqMap.redraw();
      });
    }
    eqMap.redraw();
  }
  if (eqTable != null) {
    eqTable.addEventListener("quakeclick", defaultHandleQuakeClick);

  }

}

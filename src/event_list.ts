
import './style.css'
import { loadQuakes, createQuakeLoadRadios } from './load_quakes.ts'
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


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="timerange">
    </div>
    <div>
      <sp-quake-table
        class="quakedisplay">
      </sp-quake-table>
    </div>
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
    </h5>
  </div>
`;

createQuakeLoadRadios(quakeList => {
  const eqTable = document.querySelector("sp-quake-table");
  eqTable.quakeList = quakeList;
  eqTable.draw();
});

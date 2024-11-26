
import './style.css'
import { loadQuakes, createQuakeLoadRadios } from './load_quakes.ts'
import {createHeader, setSPVersion} from './navigation';
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";


const headEl = createHeader();


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
      <span class="sp_version"></span>
    </h5>
  </div>
`;

createQuakeLoadRadios(quakeList => {
  const eqTable = document.querySelector("sp-quake-table");
  eqTable.quakeList = quakeList;
  eqTable.draw();
});
setSPVersion();

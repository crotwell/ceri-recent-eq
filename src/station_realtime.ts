import './style.css'
import {quakeTimeColorCSS, createNetworkCSS} from './css_util';
import { createStandardLegend, legendCSS} from './legend';
import { loadStations, loadStationBySID } from './load_stations.ts'
import { loadQuakes, createQuakeLoadRadios, addQuakesToMap } from './load_quakes.ts'
import {createHeader, setSPVersion} from './navigation';
import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";
import AutoGraticule from "leaflet-auto-graticule";

const headEl = createHeader();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<p>On station page: </p>
  <div id="timerange">
  </div>
  <div>

    <h5 >Now: <span id="nt"></span></h5>
    <button id="disconnect">Disconnect</button>
    <button id="pause">Pause</button>
    Packets: <span id="numPackets">0</span>
    <div id="realtime"></div>

    <div id="debug"></div>
    <h5 class="read-the-docs">
      Created with <a href="http://crotwell.github.io/seisplotjs/">Seisplotjs</a>
      <span class="sp_version"></span>
    </h5>
  </div>
`;


function updateNumPackets() {
  numPackets++;
  document.querySelector("#numPackets").textContent = numPackets;
}
function addToDebug(message) {
  const debugDiv = document.querySelector("div#debug");
  if (!debugDiv) {
    return;
  }
  const pre = debugDiv.appendChild(document.createElement("pre"));
  const code = pre.appendChild(document.createElement("code"));
  code.textContent = message;
}
function errorFn(error) {
  console.assert(false, error);
  if (seedlink) {
    seedlink.close();
  }
  addToDebug("Error: " + error);
}

let rtDisp;
const duration = sp.luxon.Duration.fromISO("PT5M");
let numPackets = 0;
let paused = false;
let stopped = true;
let realtimeDiv = document.querySelector("div#realtime");

function toggleConnect() {
  stopped = !stopped;
  if (stopped) {
    document.querySelector("button#disconnect").textContent = "Reconnect";
    if (seedlink) {
      seedlink.close();
    }
  } else {
    document.querySelector("button#disconnect").textContent = "Disconnect";
    if (!seedlink) {
      const requestConfig = [
        `STATION ${station.stationCode} ${station.network.networkCode}`,
      ];
      let hasHH=false;
      let hasBH=false;
      let hasSH=false;
      for (let c of station.channels) {
        if (c.channelCode[0]=='H') {hasHH=true;}
        if (c.channelCode[0]=='B') {hasBH=true;}
        if (c.channelCode[0]=='S') {hasSH=true;}
      }
      if (hasHH) {
        requestConfig.push("SELECT HH?.D");
        requestConfig.push("SELECT 00HH?.D");
      } else if (hasHH) {
        requestConfig.push("SELECT BH?.D");
        requestConfig.push("SELECT 00BH?.D");
      } else if (hasHH) {
        requestConfig.push("SELECT SH?.D");
        requestConfig.push("SELECT 00SH?.D");
      } else {
        requestConfig.push("SELECT ?H?.D");
        requestConfig.push("SELECT 00?H?.D");
      }
      console.log(`start SEEDLINK for ${station.stationCode} ${station.network.networkCode}`)
      seedlink = new sp.seedlink.SeedlinkConnection(
        IRIS_SEEDLINK,
        requestConfig,
        (packet) => {
          rtDisp.packetHandler(packet);
          updateNumPackets();
        },
        errorFn,
      );
    }
    if (seedlink) {
      const start = sp.luxon.DateTime.utc().minus(duration);
      seedlink.setTimeCommand(start)
      seedlink.connect();
    }
  }
};

let seedlink = null;
const IRIS_SEEDLINK = "wss://rtserve.iris.washington.edu/seedlink";


// snip start disconnet
document
  .querySelector("button#disconnect")
  .addEventListener("click", function (evt) {
    toggleConnect();
  });

let togglePause = function () {
  paused = !paused;
  if (paused) {
    document.querySelector("button#pause").textContent = "Play";
    rtDisp.animationScaler.pause();
  } else {
    document.querySelector("button#pause").textContent = "Pause";
    rtDisp.animationScaler.animate();
  }
};

document
  .querySelector("button#pause")
  .addEventListener("click", function (evt) {
    togglePause();
  });



const url = new URL(document.URL);
const queryParams = url.searchParams;
const sid = queryParams.get("sid");
let station = null;
document.querySelector("p").textContent = sid;
loadStationBySID(sid).then(netList => {
  station = netList[0].stations[0];


  const rtConfig = {
    duration: duration,
    networkList: netList,
  };
  rtDisp = sp.animatedseismograph.createRealtimeDisplay(rtConfig);
  rtDisp.organizedDisplay.map = "false";

  realtimeDiv.appendChild(rtDisp.organizedDisplay);

  rtDisp.organizedDisplay.draw();
  rtDisp.animationScaler.minRedrawMillis =
    sp.animatedseismograph.calcOnePixelDuration(rtDisp.organizedDisplay);

  rtDisp.animationScaler.animate();

  toggleConnect();

  return station;
}).then(station => {
  return station;
});

setSPVersion();

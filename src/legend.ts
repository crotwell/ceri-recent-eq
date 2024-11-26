import * as sp from 'seisplotjs';


export function createLegendCircle(cssClass, text) {
  const div = document.createElement("div");
  div.innerHTML =`
    <span>
      <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="5" r="5" class="quakeMapMarker ${cssClass}"/>
      </svg>
    </span>
    <span>${text}</span>
  `;
  //div.appendChild(div);
  return div;
}

export function createLegendTriangle(cssClass, text) {
    const div = document.createElement("div");
    div.innerHTML =`
      <span>
        <div class="${cssClass} ${sp.leafletutil.StationMarkerClassName}"></div>
      </span>
      <span>${text}</span>
    `;
    //div.appendChild(div);
    return div;
}

export function createNetworkLegend(networkList: Array<sp.stationxml.Network>) {
  const div = document.createElement("div");
  for (const n of networkList) {
    div.appendChild(createLegendTriangle(n.networkCode, n.networkCode));
  }
  return div;
}

export function createStandardLegend(mapEl) {
  console.log("Map on redraw")
  if (! mapEl.map) {
    console.log("map null inside mapEl")
  }
  const oldLegend = mapEl.querySelector("div.legend");
  if (oldLegend) {
    oldLegend.remove();
  }

  let networkList = new Array();
  if (mapEl.stationList) {
    for (const s of mapEl.stationList) {
      console.log(s.constructor.name)
      console.log(s);
      console.log(s.sourceId);
//      console.log(s.network.networkCode)
    }
    const out = new Set();
    for (const c of mapEl.stationList) {
      if (c) {mapEl.stationList
        out.add(c.network)
      }
    }
    networkList = Array.from(out.values());
  }
  const legend = L.control({position: 'topright'});
  if ( ! networkList) {
    networkList = new Array();
  }
  legend.onAdd = function (map) {
    console.log("onAdd called")
    const div = L.DomUtil.create('div', 'info legend');
    const title = document.createElement("div");
    title.textContent = "Legend";
    div.appendChild(title);
    const subdiv = document.createElement("div");
    subdiv.appendChild(createLegendCircle("day", "Day"));
    subdiv.appendChild(createLegendCircle("week", "Week"));
    subdiv.appendChild(createLegendCircle("older", "Older"));
    div.appendChild(subdiv);
    div.appendChild(createNetworkLegend(networkList));
    console.log("onAdd finish return div")
    return div;
  }
  console.log("add legend to map")
  legend.addTo(mapEl.map);
}

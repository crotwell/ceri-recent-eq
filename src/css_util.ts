import * as sp from 'seisplotjs';

export const quakeTimeColorCSS = `
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
`;

export let colorList = [
  "red",
  "rebeccapurple",
  "orange",
  "blue",
  "brown",
  "white",
  "cyan",
  "pink",
  "yellow",
  "darkgrey",
  "brickred",
  "lime",
  "burlywood",
  "cornflowerblue",
  "dodgerblue",
  "goldenrod"
];
export let knownNetworkCodes = [
  "NM","CO","ET","US","N4","OK","KY","O2","AG"
];

export function createNetworkCSS(networkList: Array<sp.stationxml.Network>): String {
  let css = "";
  let idx = 0;
  for (const n of knownNetworkCodes) {
    css += `
    div.${n}.stationMapMarker {
      color: ${colorList[idx]};
    }
    `;
    idx = (idx+1) % colorList.length;
  }
  if (networkList != null) {
    for (const n of networkList) {
      if (knownNetworkCodes.includes(n.networkCode)) {continue;}
      css += `
      div.${n.networkCode}.stationMapMarker {
        color: ${colorList[idx]};
      }
      `;
      idx = (idx+1) % colorList.length;
    }
  }
  // add a default color in case we miss any or stations added late
  css += `
  div.stationMapMarker {
    color: seagreen;
  }
  `;
  return css;
}

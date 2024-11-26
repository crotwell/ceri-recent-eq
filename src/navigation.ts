
import * as sp from 'seisplotjs';

export function createHeader()  {
  const headEl = document.querySelector<HTMLElement>('header');
  headEl!.innerHTML = `
    <a href="http://www.memphis.edu/ceri">
      <img src="UofM_logo_preferred.png" alt"CERI" height="180">
    </a>
    <nav>
      <ul>
        <li><a href="index.html">Recent Earthquakes</a></li>
        <li><a href="station_list.html">Station Map</a></li>
        <li><a href="event_list.html">List of all events</a></li>
      </ul>
    </nav>
  `;
  return headEl;
}

export function setSPVersion() {
  const spverList = document.querySelectorAll(".sp_version");
  for (const spverEl of spverList) {
    if (spverEl != null) {spverEl.textContent = sp.version;}
  }
  console.log(`sp version ${sp.version}`)
}

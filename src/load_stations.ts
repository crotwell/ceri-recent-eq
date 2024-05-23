import * as sp from 'seisplotjs';
import { DateTime, Duration, Interval } from "luxon";

export function loadStations() {
  const ceri_recenteq_url =
    'http://folkworm.ceri.memphis.edu/REQ/json/recent_events.json?map_type=recent';
  const test_stations_url = 'data/stations.staxml';

  const fetchInit = sp.util.defaultFetchInitObj(sp.util.XML_MIME);
  return sp.util.doFetchWithTimeout(test_stations_url, fetchInit, 10).then(response => {
    if (response.status === 200) {
      return response.text();
    } else {
      throw new Error(`Status not successful: ${response.status}`);
    }
  }).then(rawXmlText => {
      return new DOMParser().parseFromString(rawXmlText, "text/xml");
  }).then(xml => {
    return sp.stationxml.parseStationXml(xml);
  });
}

export function loadStationBySID(sid: string) {
  if (!sid.startsWith(sp.fdsnsourceid.FDSN_PREFIX)) {
    sid = sp.fdsnsourceid.FDSN_PREFIX+sid;
  }
  let fdsnsid = sp.fdsnsourceid.StationSourceId.parse(sid);
  console.log(`${fdsnsid.networkCode}  ${fdsnsid.stationCode}`)
  let stationQuery = new sp.fdsnstation.StationQuery()
  .networkCode(fdsnsid.networkCode)
  .stationCode(fdsnsid.stationCode);
  return stationQuery.queryChannels();
}

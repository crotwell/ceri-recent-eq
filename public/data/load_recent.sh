#!/bin/bash

curl -o recent_events.json 'http://folkworm.ceri.memphis.edu/REQ/json/recent_events.json?map_type=recent'

curl -o stations.staxml 'https://service.iris.edu/fdsnws/station/1/query?net=US,OK,O2,SE,NM,N4,KY,LD,IU,IM,ET,CO,AG&starttime=2024-05-20T20:03:48&level=station&format=xml&maxlat=42.800&minlon=-101.646&maxlon=-64.644&minlat=23.711&includecomments=false&nodata=404'

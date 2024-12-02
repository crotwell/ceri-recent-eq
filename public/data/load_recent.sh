#!/bin/bash

curl -o recent_events.json 'http://folkworm.ceri.memphis.edu/REQ/json/recent_events.json?map_type=recent'

curl -o stations.staxml 'https://service.iris.edu/fdsnws/station/1/query?net=US,OK,O2,SE,NM,N4,KY,LD,IU,IM,ET,CO,AG&endafter=2024-12-01T00:00:00&cha=BH?,HH?,SH?&level=channel&format=xml&maxlat=42.800&minlon=-101.646&maxlon=-64.644&minlat=23.711&includecomments=false&nodata=404'

#!/bin/bash

curl https://eu.ftp.opendatasoft.com/sncf/plandata/export_gtfs_voyages.zip --output data/tgv.zip
curl https://eu.ftp.opendatasoft.com/sncf/plandata/export-ter-gtfs-last.zip --output data/ter.zip
curl https://eu.ftp.opendatasoft.com/sncf/plandata/export-intercites-gtfs-last.zip --output data/intercites.zip


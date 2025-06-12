# roki-demo

## Setup

Install pip for python dependencies
```bash
pip install pipenv --user
```

## Launch 

Launch the docker containers
```bash
docker-compose up
```

Send some requests request
```bash
pipenv run python demo.py
```

The docker-compose will launch:
 - a container with roki that can be reached on localhost:3000
 - a container with simple http server that provides realtime gtfs-rt feeds to roki
 - a prometheus server that scrapes metrics from roki. Its user interface is served on localhost:9090
 - a grafana server with some dashboards that display the prometheus metrics. Go to localhost:3010. The initial login/password is admin/admin. It takes a minute or so to setup on first launch.

Roki expect protobuf requests sent via http, and respond with a protobuf payload.
The protobuf schema for requests and responses are given in the roki.proto file in
roki-proto/roki.proto

Look at the demo.py an the protobuf file to understand how requests are made, and how responses should be read.

The web interface https://pbench.github.io/roki-demo/ allows to make requests to your roki container.

## Get more recent gtfs data

The gtfs datasets and gtfs-rt feeds present here were retrieved on 2024-11-21 (a day with a lot of snow and a strike)
from https://transport.data.gouv.fr/

You can download more recent dataset by running
```bash
./download_gtfs.sh
```
This will replace the files data/tgv.zip data/ter.zip and data/intercites.zip 

You can setup roki to retreive the most recent gtfs-rt feed by replacing the path
http://gtfs_rt_feed_server:8001
in data/roki_config.toml 
by https://proxy.transport.data.gouv.fr/resource/

## Configure roki

Roki reads its configuration from the data/roki_config.toml file.
This file contains documentation for the configuration options.

## Update the protobuf files

Install the protobuf compiler 
```bash
sudo apt install -y protobuf-compiler
```

Generate the python protobuf files
```bash
protoc --proto_path=roki-proto --python_out=. roki-proto/roki.proto
```





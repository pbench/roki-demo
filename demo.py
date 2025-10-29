import requests
import roki_pb2
import roki_response
import datetime
import json

def lannion_paris():
    roki_request = roki_pb2.RangeRequest()
    departure_station = roki_request.departures.stations.add()
    departure_station.station_id = "StopArea:OCE87473223" #lannion

    arrival_station = roki_request.arrivals.stations.add()
    arrival_station.station_id = "StopArea:OCE87391003" #paris montparnasse

    dt = datetime.datetime.fromisoformat('2024-11-21 06:00:00+00:00')
    timestamp = dt.timestamp()
    roki_request.datetime.seconds = int(timestamp)

    resp = send_request(roki_request)
    print("Lannion - Paris")
    print(json.dumps(resp, indent=4, ensure_ascii=False))

    assert len(resp) > 0
    for journey in resp:
        legs = journey["legs"]
        assert len(legs) > 0
        assert legs[0]["start_station_name"] == "Lannion"
        assert legs[-1]["end_station_name"] == "Paris Montparnasse Hall 1 - 2"

def nantes_marseille():
    roki_request = roki_pb2.RangeRequest()
    departure_box = roki_request.departures.stations_within.add()
    # all stations within 10km around Nantes center
    departure_box.center.lat =  47.2186371
    departure_box.center.lon =  -1.5541362
    departure_box.distance.meters = 10000

    arrival_box = roki_request.arrivals.stations_within.add()
     # all stations within 10km around Marseille center
    arrival_box.center.lat =   43.2961743
    arrival_box.center.lon =   5.3699525
    arrival_box.distance.meters = 10000

    dt = datetime.datetime.fromisoformat('2024-11-21 06:00:00+00:00')
    timestamp = dt.timestamp()
    roki_request.datetime.seconds = int(timestamp)

    resp = send_request(roki_request)
    print("Nantes - Marseille")
    print(json.dumps(resp, indent=4, ensure_ascii=False))

    assert len(resp) > 0
    for journey in resp:
        legs = journey["legs"]
        assert len(legs) > 0
        assert legs[0]["start_station_name"] == "Nantes"
        assert legs[-1]["end_station_name"] == "Marseille Saint-Charles"

def service_alert_on_trip():
    roki_request = roki_pb2.RangeRequest()
    departure_stop = roki_request.departures.stops.add()
    departure_stop.stop_id = "StopPoint:OCETrain TER-87481002" #Nantes

    arrival_stop = roki_request.arrivals.stops.add()
    arrival_stop.stop_id = "StopPoint:OCETrain TER-87486571" #Saint-Gilles-Croix-de-Vie

    dt = datetime.datetime.fromisoformat('2024-11-22 15:30:00+00:00')
    timestamp = dt.timestamp()
    roki_request.datetime.seconds = int(timestamp)

    # limit the range to obtain only one journey
    roki_request.range_duration.seconds = 10*60

    resp = send_request(roki_request)
    print("Nantes - Saint-Gilles-Croix-de-Vie on 2024-11-22")
    # the trip OCESN859123F3158539:2024-11-21T00:29:13Z on the day 2024-11-22
    # is concerned by the service alert QOM:Broadcast::212878355310363232:LOC
    # about "Positionnement rame 859273 / 859123"
    print(json.dumps(resp, indent=4, ensure_ascii=False))

    assert len(resp) == 1
    legs = resp[0]["legs"]
    assert len(legs) == 1
    leg = legs[0]
    assert leg["start_station_name"] == "Nantes"
    assert leg["end_station_name"] == "Saint-Gilles-Croix-de-Vie"
    assert leg["trip_id"] == "OCESN859123F3158539:2024-11-21T00:29:13Z"
    assert leg["trip_date"] == "20241122"
    assert "QOM:Broadcast::212878355310363232:LOC" in leg["service_alerts"].keys()

    ############################

    dt = datetime.datetime.fromisoformat('2024-11-25 15:30:00+00:00')
    timestamp = dt.timestamp()
    roki_request.datetime.seconds = int(timestamp)

    resp = send_request(roki_request)
    print("Nantes - Saint-Gilles-Croix-de-Vie on 2024-11-25")
    # the trip OCESN859123F3158539:2024-11-21T00:29:13Z on the day 2024-11-25
    # is NOT concerned by the service alert QOM:Broadcast::212878355310363232:LOC
    print(json.dumps(resp, indent=4, ensure_ascii=False))

    assert len(resp) == 1
    legs = resp[0]["legs"]
    assert len(legs) == 1
    leg = legs[0]
    assert leg["start_station_name"] == "Nantes"
    assert leg["end_station_name"] == "Saint-Gilles-Croix-de-Vie"
    assert leg["trip_id"] == "OCESN859123F3158539:2024-11-21T00:29:13Z"
    assert leg["trip_date"] == "20241125"
    assert "QOM:Broadcast::212878355310363232:LOC" not in leg["service_alerts"].keys()



def service_alert_on_stop_area():
    roki_request = roki_pb2.RangeRequest()
    departure_station = roki_request.departures.stations.add()
    departure_station.station_id = "StopArea:OCE87175000" #St Dizier 

    arrival_station = roki_request.arrivals.stations.add()
    arrival_station.station_id = "StopArea:OCE87113001" #Paris Est

    dt = datetime.datetime.fromisoformat('2024-11-22 15:32:00+00:00')
    timestamp = dt.timestamp()
    roki_request.datetime.seconds = int(timestamp)

    # limit the range to obtain only one journey
    roki_request.range_duration.seconds = 10*60

    resp = send_request(roki_request)
    print("St Dizier  - Paris Est on 2024-11-22")
    # the stop area St Dizier on the day 2024-11-21
    # is concerned by the service alert QOM:Broadcast::3466952993919539358:LOC
    # about "Distributeur de billet hors service à Saint-Dizier."
    print(json.dumps(resp, indent=4, ensure_ascii=False))

    assert len(resp) == 1
    legs = resp[0]["legs"]
    assert len(legs) == 1
    leg = legs[0]
    assert  leg["start_station_name"] == "Saint-Dizier"
    assert leg["end_station_name"] == "Paris Est"
    assert leg["trip_date"] == "20241122"
    assert "QOM:Broadcast::3466952993919539358:LOC" in leg["service_alerts"].keys()


    #######################################

    dt = datetime.datetime.fromisoformat('2024-11-25 15:30:00+00:00')
    timestamp = dt.timestamp()
    roki_request.datetime.seconds = int(timestamp)

    resp = send_request(roki_request)
    print("St Dizier  - Paris Est  on 2024-11-25")
    # the stop area St Dizier on the day 2024-11-25
    # is NOT concerned by the service alert QOM:Broadcast::3466952993919539358:LOC
    print(json.dumps(resp, indent=4, ensure_ascii=False))


    assert len(resp) == 1
    legs = resp[0]["legs"]
    assert len(legs) == 1
    leg = legs[0]
    assert leg["start_station_name"] == "Saint-Dizier"
    assert leg["end_station_name"] == "Paris Est"
    assert leg["trip_date"] == "20241125"
    assert "service_alerts" not in leg.keys()


def deleted_trip_update():
    roki_request = roki_pb2.RangeRequest()
    departure_station = roki_request.departures.stations.add()
    departure_station.station_id = "StopArea:OCE87613141" #Gourdon 

    arrival_stop = roki_request.arrivals.stops.add()
    arrival_stop.stop_id = "StopPoint:OCEINTERCITES-87613000" #Cahors

    dt = datetime.datetime.fromisoformat('2024-11-21 16:46:00+00:00')
    timestamp = dt.timestamp()
    roki_request.datetime.seconds = int(timestamp)

    # limit the range to 10mn obtain only one journey
    roki_request.range_duration.seconds = 60*60

    # we want to compute journeys WITHOUT the realtime schedule from trip_updates
    roki_request.config.realtime_level = roki_pb2.JourneyConfig.RealtimeLevel.BASE
    
    resp = send_request(roki_request)
    print("Gourdon  - Cahors Base schedule")
    # the trip OCESN3635F3657972:2024-11-20T00:27:50Z is valid on the base schedule
    print(json.dumps(resp, indent=4, ensure_ascii=False))

    assert len(resp) == 1
    legs = resp[0]["legs"]
    assert len(legs) == 1
    leg = legs[0]
    assert leg["start_station_name"] == "Gourdon"
    assert leg["end_station_name"] == "Cahors"
    assert leg["trip_id"] == "OCESN3635F3657972:2024-11-20T00:27:50Z"
    assert leg["trip_date"] == "20241121"
    assert "QOM:Broadcast::352957429036049492:LOC" in leg["service_alerts"].keys()
    ####################

     # we now want to compute journeys WITH the realtime schedule from trip_updates
    roki_request.config.realtime_level = roki_pb2.JourneyConfig.RealtimeLevel.REALTIME

    resp = send_request(roki_request)
    print("Gourdon  - Cahors Realtime schedule")
    # the trip OCESN3635F3657972:2024-11-20T00:27:50Z is not valid on realtime
    # and we find no journey
    print(json.dumps(resp, indent=4, ensure_ascii=False))

    assert len(resp) == 0


def send_request(roki_request):
    url = "http://localhost:3000/range"
    data = roki_request.SerializeToString()

    http_resp = requests.get(url, data = data)

    roki_resp = roki_pb2.RangeResponse()
    roki_resp.ParseFromString(http_resp.content)

    resp = roki_response.parse_roki_resp(roki_resp.journeys)
    return resp

lannion_paris()
nantes_marseille()
service_alert_on_trip()
service_alert_on_stop_area()
deleted_trip_update()
import roki_pb2
import datetime

def parse_roki_resp(roki_resp):
    journeys = []
    for journey in roki_resp.journeys:
        journeys.append(parse_journey(journey, roki_resp))
    return journeys

def parse_journey(journey, roki_resp):
    departure_time = parse_timestamp(journey.departure_time)
    arrival_time = parse_timestamp(journey.arrival_time)
    legs = []
    for leg in journey.legs:
        legs.append(parse_leg(leg, roki_resp))
    result = {
        "departure_time" : departure_time,
        "arrival_time" : arrival_time,
        "legs" : legs
    }
    return result

def parse_leg(leg, roki_resp):
    result = {}
    trip = roki_resp.objects.trips[leg.trip_idx.idx]
    result["trip_id"] = trip.id
    trip_date = f"{leg.trip_date.year}{leg.trip_date.month}{leg.trip_date.day}"
    result["trip_date"] = trip_date
    route = roki_resp.objects.routes[trip.route_idx.idx]
    result["route_id"] = route.id
    result["route_name"] = route.short_name
    start = leg.stop_times[0]
    result["start_time"] = parse_timestamp(start.board_time)
    if start.HasField("board_delay"):
        result["start_delay"] = start.board_delay.seconds
    start_stop = roki_resp.objects.stops[start.stop_idx.idx]
    result["start_stop_id"] = start_stop.id
    if start_stop.HasField("station_idx"):
        start_station = roki_resp.objects.stations[start_stop.station_idx.idx]
        result["start_station_name"] = start_station.name
    
    end = leg.stop_times[len(leg.stop_times) - 1]
    result["end_time"] = parse_timestamp(end.debark_time)
    if end.HasField("debark_delay"):
        result["end_delay"] = start.debark_delay.seconds
    end_stop = roki_resp.objects.stops[end.stop_idx.idx]
    result["end_stop_id"] = end_stop.id
    if end_stop.HasField("station_idx"):
        end_station = roki_resp.objects.stations[end_stop.station_idx.idx]
        result["end_station_name"] = end_station.name

    if len(leg.service_alerts) > 0:
        service_alerts = {}
        for service_alert_idx in leg.service_alerts:
            service_alert_proto = roki_resp.objects.service_alerts[service_alert_idx.idx]
            service_alert = parse_service_alert(service_alert_proto)
            service_alerts[service_alert["service_alert_id"]] = service_alert
        result["service_alerts"] = service_alerts
    
    if leg.HasField("trip_update"):
        trip_update = roki_resp.objects.trip_updates[leg.trip_update.idx]
        result["trip_update"] = parse_trip_update(trip_update)
            
    return result


def parse_service_alert(service_alert):
    result = {}
    result["feed_name"] = service_alert.feed_name
    result["timestamp"] = parse_timestamp(service_alert.feed_timestamp)
    result["service_alert_id"] = service_alert.id
    periods = []
    for period in service_alert.active_periods:
        periods.append(parse_period(period))
    result["active_periods"] = periods
    result["cause"] = roki_pb2.ServiceAlert.Cause.Name(service_alert.cause)
    result["effect"] = roki_pb2.ServiceAlert.Effect.Name(service_alert.effect)
    result["severity"] = roki_pb2.ServiceAlert.Severity.Name(service_alert.severity)
    result["url"] = parse_translations(service_alert.url)
    result["header"] = parse_translations(service_alert.header)
    result["description"] = parse_translations(service_alert.description)
    return result


def parse_period(period):
    result = {}
    result["start"] = parse_timestamp(period.start)
    result["end"] = parse_timestamp(period.end)
    return result

def parse_translations(translations):
    result = {}
    if translations.HasField("default"):
        result[""] = translations.text_no_lang
    for translation in translations.translations:
        result[translation.lang] = translation.text
    return result


def parse_trip_update(trip_update):
    result = {}
    result["feed_name"] = trip_update.feed_name
    result["feed_timestamp"] = parse_timestamp(trip_update.feed_timestamp)
    result["trip_update_id"] = trip_update.id
    return result

def parse_timestamp(time):
    dt = datetime.datetime.fromtimestamp(time.seconds, tz=datetime.timezone.utc)
    return str(dt)

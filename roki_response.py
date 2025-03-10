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
    trip = roki_resp.trips[leg.trip_idx]
    result["trip_id"] = trip.id
    result["trip_date"] = leg.trip_date.date
    route = roki_resp.routes[trip.route_idx]
    result["route_id"] = route.id
    result["route_name"] = route.short_name
    start = leg.stop_times[0]
    result["start_time"] = parse_timestamp(start.board_time)
    if start.HasField("board_delay"):
        result["start_delay"] = start.board_delay.seconds
    start_stop = roki_resp.stops[start.stop_idx]
    result["start_stop_id"] = start_stop.id
    if start_stop.HasField("station_idx"):
        start_station = roki_resp.stations[start_stop.station_idx]
        result["start_station_name"] = start_station.name
    
    end = leg.stop_times[len(leg.stop_times) - 1]
    result["end_time"] = parse_timestamp(end.debark_time)
    if end.HasField("debark_delay"):
        result["end_delay"] = start.debark_delay.seconds
    end_stop = roki_resp.stops[end.stop_idx]
    result["end_stop_id"] = end_stop.id
    if end_stop.HasField("station_idx"):
        end_station = roki_resp.stations[end_stop.station_idx]
        result["end_station_name"] = end_station.name

    if len(leg.service_alerts) > 0:
        service_alerts = {}
        for service_alert_idx in leg.service_alerts:
            service_alert_proto = roki_resp.service_alerts[service_alert_idx]
            service_alert = parse_service_alert(service_alert_proto)
            service_alerts[service_alert["service_alert_id"]] = service_alert
        result["service_alerts"] = service_alerts
    
    if leg.HasField("trip_update"):
        trip_update = roki_resp.trip_updates[leg.trip_update]
        result["trip_update"] = parse_trip_update(trip_update)
            
    return result


def parse_service_alert(service_alert):
    result = {}
    result["feed_name"] = service_alert.feed_name
    result["timestamp"] = parse_timestamp(service_alert.feed_timestamp)
    result["service_alert_id"] = service_alert.service_alert_id
    periods = []
    for period in service_alert.active_periods:
        periods.append(parse_period(period))
    result["active_periods"] = periods
    result["cause"] = roki_pb2.Cause.Name(service_alert.cause)
    result["effect"] = roki_pb2.Effect.Name(service_alert.effect)
    result["severity"] = roki_pb2.Severity.Name(service_alert.severity)
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
    if translations.HasField("text_no_lang"):
        result[""] = translations.text_no_lang
    for translation in translations.translations:
        result[translation.lang] = translation.text
    return result


def parse_trip_update(trip_update):
    result = {}
    result["feed_name"] = trip_update.feed_name
    result["feed_timestamp"] = parse_timestamp(trip_update.feed_timestamp)
    result["trip_update_id"] = trip_update.trip_update_id
    return result

def parse_timestamp(time):
    dt = datetime.datetime.fromtimestamp(time.seconds, tz=datetime.timezone.utc)
    return str(dt)

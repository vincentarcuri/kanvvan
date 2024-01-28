import requests



def get_weather(lat, lon) -> dict:
    endpoints = requests.get(f"https://api.weather.gov/points/{lat},{lon}")
    forecast_endpoint = endpoints.json()["properties"]["forecast"]
    response = requests.get(forecast_endpoint)
    forecast = response.json()
    today = forecast["properties"]["periods"][0]
    data = {
        "city": endpoints.json()["properties"]["relativeLocation"]["properties"]["city"],
        "state": endpoints.json()["properties"]["relativeLocation"]["properties"]["state"],
        "temp": today["temperature"],
        "precip": today["probabilityOfPrecipitation"]["value"],
        "humidity": today["relativeHumidity"]["value"],
        "icon": today["icon"],
        "shortForecast": today["shortForecast"],
        "detailedForecast": today["detailedForecast"], 
    }
    return data
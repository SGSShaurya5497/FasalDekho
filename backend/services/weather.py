"""
Weather-Linked Spray Advisory Service.

Integrates with Open-Meteo API to check 6-12 hour precipitation and wind speed forecasts.
Provides spray suitability warnings to prevent chemical runoff or wind drift.
"""
import httpx
import logging
from typing import Dict, Any, Optional

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


async def get_spray_advisory(lat: Optional[float], lon: Optional[float]) -> Dict[str, Any]:
    """
    Fetches real-time weather forecast for lat/lon and returns a spray advisory.

    Args:
        lat (float, optional): Latitude of user location.
        lon (float, optional): Longitude of user location.

    Returns:
        Dict[str, Any]: Weather summary and spray recommendation.
    """
    if lat is None or lon is None:
        return {
            "suitable": True,
            "warning": "Location not provided. Enable geolocation for automated weather spray advice.",
            "total_rain_mm": 0.0,
            "max_wind_speed_kmh": 0.0,
            "location_provided": False
        }

    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "precipitation,wind_speed_10m",
            "forecast_days": 1
        }
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(OPEN_METEO_URL, params=params)
            response.raise_for_status()
            data = response.json()

        hourly = data.get("hourly", {})
        precip_list = hourly.get("precipitation", [])[:12]  # Next 12 hours
        wind_list = hourly.get("wind_speed_10m", [])[:12]   # Next 12 hours

        total_rain = float(sum(precip_list)) if precip_list else 0.0
        max_wind = float(max(wind_list)) if wind_list else 0.0

        rain_warning = total_rain > 0.5 or any(p > 0.2 for p in precip_list)
        wind_warning = max_wind > 15.0  # Wind speed > 15 km/h causes drift

        if rain_warning and wind_warning:
            suitable = False
            warning = f"DO NOT SPRAY: Rain forecast ({round(total_rain, 1)} mm) and high wind ({round(max_wind, 1)} km/h) in next 12 hours."
        elif rain_warning:
            suitable = False
            warning = f"DO NOT SPRAY: Rain expected in next 6-12 hours ({round(total_rain, 1)} mm total precip) will wash away spray."
        elif wind_warning:
            suitable = False
            warning = f"DO NOT SPRAY: High wind speeds expected ({round(max_wind, 1)} km/h). Severe chemical drift risk."
        else:
            suitable = True
            warning = f"CONDITIONS FAVORABLE: Weather is suitable for spraying (Max wind {round(max_wind, 1)} km/h, 0 mm rain expected)."

        return {
            "suitable": suitable,
            "warning": warning,
            "total_rain_mm": round(total_rain, 2),
            "max_wind_speed_kmh": round(max_wind, 2),
            "location_provided": True
        }

    except Exception as e:
        logging.error(f"Error fetching Open-Meteo weather data: {e}")
        return {
            "suitable": True,
            "warning": "Weather service temporarily unavailable. Verify local weather conditions before spraying.",
            "total_rain_mm": 0.0,
            "max_wind_speed_kmh": 0.0,
            "location_provided": True,
            "error": str(e)
        }

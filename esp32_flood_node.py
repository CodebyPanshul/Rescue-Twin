try:
    import ujson as json
except Exception:
    import json
import machine
import network
import time
import os
try:
    import urequests as requests
except Exception:
    requests = None
try:
    from umqtt.simple import MQTTClient
except Exception:
    MQTTClient = None
import dht

SSID = os.getenv("WIFI_SSID") or ""
PASSWORD = os.getenv("WIFI_PASSWORD") or ""
API_URL = os.getenv("API_URL") or ""
MQTT_BROKER = os.getenv("MQTT_BROKER") or ""
MQTT_TOPIC = os.getenv("MQTT_TOPIC") or "rescue/flood/node"
POST_INTERVAL_SEC = int(os.getenv("POST_INTERVAL_SEC") or "30")
LOG_FILE = os.getenv("LOG_FILE") or "data_log.csv"

PIN_DHT = machine.Pin(int(os.getenv("PIN_DHT") or "4"))
PIN_WATER_ADC = int(os.getenv("PIN_WATER_ADC") or "32")
PIN_RAIN_ADC = int(os.getenv("PIN_RAIN_ADC") or "33")
PIN_SOIL_ADC = int(os.getenv("PIN_SOIL_ADC") or "34")
PIN_TDS_ADC = int(os.getenv("PIN_TDS_ADC") or "35")

adc_wl = machine.ADC(machine.Pin(PIN_WATER_ADC))
adc_rain = machine.ADC(machine.Pin(PIN_RAIN_ADC))
adc_soil = machine.ADC(machine.Pin(PIN_SOIL_ADC))
adc_tds = machine.ADC(machine.Pin(PIN_TDS_ADC))
for adc in (adc_wl, adc_rain, adc_soil, adc_tds):
    try:
        adc.atten(machine.ADC.ATTN_11DB)
    except Exception:
        pass
    try:
        adc.width(machine.ADC.WIDTH_12BIT)
    except Exception:
        pass

sensor_dht = dht.DHT11(PIN_DHT)

def read_adc_pct(adc):
    v = adc.read()
    if v is None:
        v = 0
    return max(0.0, min(1.0, v / 4095.0))

def read_tds_ppm():
    v = adc_tds.read()
    if v is None:
        v = 0
    voltage = (v / 4095.0) * 3.3
    ppm = (133.42 * voltage * voltage * voltage - 255.86 * voltage * voltage + 857.39 * voltage) * 0.5
    if ppm < 0:
        ppm = 0
    return ppm

def read_dht():
    try:
        sensor_dht.measure()
        return sensor_dht.temperature(), sensor_dht.humidity()
    except Exception:
        return None, None

def ensure_log():
    if LOG_FILE not in os.listdir():
        f = open(LOG_FILE, "w")
        f.write("ts,water_pct,soil_pct,rain_pct,tds_ppm,temp_c,humidity\n")
        f.close()

def log_row(data):
    ensure_log()
    f = open(LOG_FILE, "a")
    row = "{},{:.3f},{:.3f},{:.3f},{:.1f},{},{}\n".format(
        data["ts"],
        data["water_level_pct"],
        data["soil_moisture_pct"],
        data["rain_intensity_pct"],
        data["tds_ppm"],
        "" if data["temp_c"] is None else data["temp_c"],
        "" if data["humidity"] is None else data["humidity"],
    )
    f.write(row)
    f.close()

def wifi_connect():
    if not SSID:
        return False
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(SSID, PASSWORD)
        t0 = time.ticks_ms()
        while not wlan.isconnected() and time.ticks_diff(time.ticks_ms(), t0) < 15000:
            time.sleep_ms(200)
    return wlan.isconnected()

def http_post(data):
    if not API_URL or requests is None:
        return False
    try:
        headers = {"Content-Type": "application/json"}
        r = requests.post(API_URL, data=json.dumps(data), headers=headers)
        try:
            r.close()
        except Exception:
            pass
        return True
    except Exception:
        return False

def mqtt_publish(data):
    if not MQTT_BROKER or MQTTClient is None:
        return False
    try:
        c = MQTTClient("esp32_flood_node", MQTT_BROKER)
        c.connect()
        c.publish(MQTT_TOPIC, json.dumps(data))
        c.disconnect()
        return True
    except Exception:
        return False

def loop():
    while True:
        water_pct = read_adc_pct(adc_wl)
        soil_pct = read_adc_pct(adc_soil)
        rain_pct = read_adc_pct(adc_rain)
        tds_ppm = read_tds_ppm()
        temp_c, humidity = read_dht()
        data = {
            "ts": int(time.time()),
            "water_level_pct": round(water_pct, 3),
            "soil_moisture_pct": round(soil_pct, 3),
            "rain_intensity_pct": round(rain_pct, 3),
            "tds_ppm": round(tds_ppm, 1),
            "temp_c": temp_c,
            "humidity": humidity,
        }
        log_row(data)
        wifi_ok = wifi_connect()
        if wifi_ok:
            ok_http = http_post(data)
            if not ok_http:
                mqtt_publish(data)
        time.sleep(POST_INTERVAL_SEC)

try:
    loop()
except Exception:
    pass

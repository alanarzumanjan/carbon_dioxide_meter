#include <Wire.h>
#include <SparkFun_SCD4x_Arduino_Library.h>
#include <WiFi.h>
#include <HTTPClient.h>

SCD4x scd;

// Leds working voids definicion
void set_led(int key, bool on);
void show_co2_Level(int co2);
void leds_off();

// WiFi working voids definicion
void wifi_connection();

// WiFi variables
const char* ssid = "AlanLink";
const char* password = "2006AlanLink18!";
String server_endpoint = "http://alantech.id/measurement";
int wifi_pin = 15;

// Leds digit variables
const int leds[8] = {23, 32, 2, 19, 18, 5, 17, 16};
const int co2_levels[8] = {400, 600, 700, 800, 1000, 1200, 1400, 2000};
const bool led_on = true;

void setup() {
  Serial.begin(115200);
  delay(500);

  leds_off(); // All leds is off on start

  // WiFi connection
  WiFi.mode(WIFI_STA);
  delay(200);
  WiFi.persistent(false);
  WiFi.disconnect(true, true);
  WiFi.setSleep(false);
  delay(1000);

  WiFi.begin(ssid, password); // WiFi connection
  wifi_connection(); 

  // check wifi pin work
  pinMode(wifi_pin, OUTPUT);
  digitalWrite(wifi_pin, HIGH);

  // Check SCD41 scanner connection
  Wire.begin(); // SCD41 start, Standart SDA=21, SCL=22 (ESP32-WROOM)
  if (!scd.begin(Wire)) {
    Serial.println("❌ SCD41 not detected!");
    while (1) {}
  }
  scd.startPeriodicMeasurement();
  Serial.println("\n✅ SCD41 ready! Waiting first sample (~5s)...");
}

void loop() {
  if (scd.readMeasurement()) {
    int co2   = scd.getCO2();
    float t   = scd.getTemperature();
    float h   = scd.getHumidity();

    show_co2_Level(co2);
    set_led(0, true); // First led all time is on (co2 is ideal)

    // Measurement print
    Serial.print("CO₂: "); Serial.print(co2); Serial.println(" ppm");
    Serial.print("Temperature: ");   Serial.print(t, 1); Serial.println(" °C");
    Serial.print("Humidity: ");   Serial.print(h, 1); Serial.println(" %");
    Serial.println();
  }

  delay(500);
}

void leds_off(){
  for (int i = 0; i < 8; i++) {
    pinMode(leds[i], OUTPUT);
    set_led(i, false);
  }
  set_led(0, true); // First led all time is on (co2 is ideal)
}

void wifi_connection(){
  unsigned long attempt_time = millis();
  const unsigned long timeout = 15000; // 15 second
  
  Serial.print("WiFi Connecting...");
  Serial.print("\nESP32 IP: ");
  Serial.print(WiFi.localIP());
  while(WiFi.status() != WL_CONNECTED && millis() - attempt_time < timeout){
    delay(1000);
    Serial.print(".");
  }

  if(WiFi.status() == WL_CONNECTED){
    Serial.printf("\n✅ ESP32 Connected to WiFi: %s", ssid);
  } else {
    Serial.println("\n❌ WiFi connection failed!");
  }
}

void set_led(int key, bool on) {
  if (key < 0 || key >= 8) return;

  if (led_on) {
    if (on) {
      digitalWrite(leds[key], HIGH);
    } else {
      digitalWrite(leds[key], LOW);
    }
  } else {
    if (on) {
      digitalWrite(leds[key], LOW);
    } else {
      digitalWrite(leds[key], HIGH);
    }
  }
}

void show_co2_Level(int co2) {
  for (int i = 0; i < 8; i++) {
    set_led(i, co2 >= co2_levels[i]);
  }
}
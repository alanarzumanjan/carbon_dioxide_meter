#include <Wire.h>
#include <SparkFun_SCD4x_Arduino_Library.h>

SCD4x scd;

void setLed(int key, bool on);
void show_co2_Level(int co2);

const int leds[8] = {23, 32, 2, 19, 18, 5, 17, 15};
const int co2_levels[8] = {400, 600, 700, 800, 1000, 1200, 1400, 2000};

const bool led_on = true;

void setup() {
  Serial.begin(115200);
  delay(200);

  // Standart SDA=21, SCL=22 (ESP32-WROOM)
  Wire.begin();

  // All leds is off
  for (int i = 0; i < 8; i++) {
    pinMode(leds[i], OUTPUT);
    setLed(i, false);
  }

  setLed(0, true); // First led all time is on (co2 is ideal)

  if (!scd.begin(Wire)) {
    Serial.println("❌ SCD41 not detected!");
    while (1) {}
  }

  scd.startPeriodicMeasurement();
  Serial.println("✅ SCD41 ready! Waiting first sample (~5s)...");
}

void loop() {
  if (scd.readMeasurement()) {
    int   co2 = scd.getCO2();
    float t   = scd.getTemperature();
    float h   = scd.getHumidity();

    show_co2_Level(co2);
    setLed(0, true); // First led all time is on (co2 is ideal)

    // Measurement print
    Serial.print("CO₂: "); Serial.print(co2); Serial.println(" ppm");
    Serial.print("Temperature: ");   Serial.print(t, 1); Serial.println(" °C");
    Serial.print("Humidity: ");   Serial.print(h, 1); Serial.println(" %");
    Serial.println("=========================");
  }

  delay(50);
}

void setLed(int key, bool on) {
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
    setLed(i, co2 >= co2_levels[i]);
  }
}

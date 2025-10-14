#include <Wire.h>
#include <SparkFun_SCD4x_Arduino_Library.h>

SCD4x scd;

void setup() {
  Serial.begin(115200);
  delay(200);
  // Standart SDA = 21, SCL = 22
  Wire.begin();

  if (!scd.begin(Wire)) {
    Serial.println("❌ SCD41 not detected!");
    while (1) {}
  }

  scd.startPeriodicMeasurement();
  Serial.println("✅ SCD41 ready! Waiting first sample (~5s)...");
}

void loop() {
  if (scd.readMeasurement()) {
    Serial.println("====== Measurement ======");
    Serial.print("CO₂: "); Serial.print(scd.getCO2()); Serial.println(" ppm");
    Serial.print("T: ");   Serial.print(scd.getTemperature(), 1); Serial.println(" °C");
    Serial.print("H: ");   Serial.print(scd.getHumidity(), 1);    Serial.println(" %");
    Serial.println("=========================");
  }

  delay(50);
}

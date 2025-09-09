#include "WiFi.h"

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  Serial.println("Setup done");
}

void loop() {
  Serial.println("Scan Start");

  int n = WiFi.scanNetworks();
  Serial.println("Scan Done");
  if (n == 0){
    Serial.println(" Networks Not Found ");
  } else {
    Serial.println(n);
    Serial.println(" Networks Not Found ");
    for(int i = 0; i < n; ++i){
      Serial.print(i + 1);
      Serial.print(": ");
      Serial.print(WiFi.SSID(i));
      Serial.print(" (");
      Serial.print(WiFi.RSSI(i));
      Serial.print(") ");
      Serial.println((WiFi.encryptionType(i) == WIFI_AUTH_OPEN)?" ":"*");
      delay(10);
    }
  }
  Serial.println("");
  delay(5000);
}

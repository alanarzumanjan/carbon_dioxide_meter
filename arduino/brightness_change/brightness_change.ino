#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid     = "Dark Network";
const char* password = "111alah666!";

String serverUrl = "http://10.221.84.251:5000/message";

String inputMessage = "";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Connected to WiFi!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  Serial.println("\n💬 Enter message:");
}

void loop() {
  if (Serial.available()) {
    inputMessage = Serial.readStringUntil('\n'); 
    inputMessage.trim();

    if (inputMessage.length() > 0) {
      sendMessage(inputMessage);
    }
  }
}

void sendMessage(String msg) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"msg\":\"" + msg + "\"}";

    int httpResponseCode = http.POST(json);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("📩 Server: " + response);
    } else {
      Serial.println("❌ Error: " + String(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("⚠️ WiFi is no");
  }
}
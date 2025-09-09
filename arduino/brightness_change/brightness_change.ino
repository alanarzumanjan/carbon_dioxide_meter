int pin = 19;
int brightness = 0;
int step = 1;

void setup() {
  pinMode(pin, OUTPUT);
}

void loop() {
  digital_Write(pin, brightness);
  brightness_changer();
}

void digital_Write(int pin, int level) {
  const int period = 255;
  if (level < 0){
    level = 0;
  }
  if (level > 255) {
    level = 255;
  }
  
  for (int i = 0; i < period; i++) {
    if (i < level) {
      digitalWrite(pin, HIGH);
    } else {
      digitalWrite(pin, LOW);
    }
    delayMicroseconds(50);
  }
}

void brightness_changer() {
  brightness += step;
  if (brightness >= 255 || brightness <= 0) {
    step = -step;
  }
  delay(100);
}

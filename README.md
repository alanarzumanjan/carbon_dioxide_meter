# Arduino Carbon Dioxide Meter

📟 **Arduino Carbon Dioxide Meter** is a DIY project for measuring indoor CO₂ levels using an Arduino microcontroller and a gas sensor (e.g., MH-Z19, CCS811, or similar).
The project helps monitor air quality, reminding you to ventilate the room and maintain a healthy CO₂ concentration.

## Features

- Measure CO₂ concentration in ppm (parts per million).
- Display data on LCD/OLED screen.
- LED indication (green — normal, yellow — medium, red — high).
- Send sensor data from Arduino to the server.
- View history and statistics via a web interface.

## Hardware Components

- Arduino Uno / Nano / Mega (any compatible microcontroller).
- CO₂ sensor (recommended MH-Z19B or similar).
- LCD 16x2 or OLED display (optional).
- LEDs and resistors for indication.
- Breadboard and jumper wires.

## Project Architecture

The project is divided into three main parts:

### 🔌 Arduino (Hardware Layer)

- Reads CO₂ data from the sensor.
- Sends data via Serial/USB or Wi-Fi (ESP module) to the server.

### 🖥️ Backend (C# / ASP.NET Core)

- Receives sensor data from Arduino.
- Stores CO₂ values in a database.
- Provides REST API for the frontend.

### 🌐 Frontend (React)

- Displays real-time CO₂ levels.
- Graphs for monitoring changes over time.
- Visual alerts for normal/critical values.
- User-friendly web dashboard.

## Use Cases

- Indoor air quality monitoring (home, office, classroom).
- Helps maintain proper ventilation.
- Educational project for learning Arduino, C#, React, and IoT basics.

## Arduino Settings

- **Drivers:** [link](https://www.silabs.com/software-and-tools/usb-to-uart-bridge-vcp-drivers?tab=downloads)
- **Board:** ESP32-WROOM-DA Module
- **Board downloading:** esp32

## To run Frontend

```bash
cd frontend
npm install

npm start
```

## To run Backend

```bash
cd backend
dotnet run
```

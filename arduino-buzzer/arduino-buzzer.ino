#include <CapacitiveSensor.h>

enum BuzzerState {
  RELEASED,
  TOUCHED
};

class Buzzer
{
public:
  // This constructor should not be used
  Buzzer() :
      sendPin_(0),
      receivePin_(0),
      touchThreshold_(0),
      cs_(CapacitiveSensor(0, 0))
  {
  }

  Buzzer(int sendPin, int receivePin, long touchThreshold) :
      sendPin_(sendPin),
      receivePin_(receivePin),
      touchThreshold_(touchThreshold),
      cs_(CapacitiveSensor(sendPin, receivePin))
    {
    }

  long getSensorValue(int samples)
  {
    return cs_.capacitiveSensor(samples);
  }

  void logSensorValue(int samples)
  {
    Serial.print(getSensorValue(samples));
    Serial.print(";");
  }

  // Returns if the buzzer just got touched (changed from its initial state)
  bool gotTouched(int samples)
  {
    long sensorValue = getSensorValue(samples);
    if (state_ == BuzzerState::RELEASED && sensorValue >= touchThreshold_) {
      state_ = BuzzerState::TOUCHED;
      return true;
    } else if (state_ == BuzzerState::TOUCHED && sensorValue < touchThreshold_) {
      state_ = BuzzerState::RELEASED;
    }
    return false;
  }

  void setTouchThreshold(long newThreshold)
  {
    touchThreshold_ = newThreshold;
  }

private:
  int sendPin_;
  int receivePin_;
  long touchThreshold_;
  CapacitiveSensor cs_;

  BuzzerState state_ = BuzzerState::RELEASED;
};

// First available pin
const int pinOffset = 2;

class BuzzerSet
{
public:
  BuzzerSet(int totalBuzzers, long defaultThreshold) :
    totalBuzzers_(totalBuzzers)
  {
    buzzers_ = new Buzzer[totalBuzzers_]; // Allocate memory for pointers

    for (int i = 0; i < totalBuzzers_; ++i) {
      buzzers_[i] = Buzzer(pinOffset + (i * 2), pinOffset + (i * 2) + 1, defaultThreshold); // Create each Buzzer object
    }
  }

  void logSensorValue(int samples)
  {
    for (int i = 0; i < totalBuzzers_; ++i) {
      buzzers_[i].logSensorValue(samples);
    }
    Serial.println();
  }

  // This will print all buzzers that got pressed in the same sample (e.g. 1;4;5)
  void logTouchEvent(int samples)
  {
    bool didLog = false;
    for (int i = 0; i < totalBuzzers_; ++i) {
      if (buzzers_[i].gotTouched(samples)) {
        Serial.print(i);
        Serial.print(";");
        didLog = true;
      }
    }
    if (didLog) {
      Serial.print("\n");
    }
  }

  void setTouchThreshold(int buzzerIndex, long touchThreshold)
  {
    if (buzzerIndex < 0 && buzzerIndex >= totalBuzzers_) {
      Serial.println("ERROR: Attempted to set bad touch threshold for bad buzzer index");
    } else {
      buzzers_[buzzerIndex].setTouchThreshold(touchThreshold);
    }
  }

  ~BuzzerSet() {
    delete[] buzzers_; // Deallocate the array of Buzzer objects
  }

private:
  int totalBuzzers_;
  Buzzer* buzzers_;
};

enum SerialMode {
  LOG_TOUCH,
  LOG_SENSOR,
  UNKNOWN
};

SerialMode stringToSerialMode(const String& str) {
  if (str == "MODE: LOG_TOUCH") {
    return SerialMode::LOG_TOUCH;
  }
  if (str == "MODE: LOG_SENSOR") {
    return SerialMode::LOG_SENSOR;
  }
}

String serialModeToString(const SerialMode& mode) {
  switch (mode) {
    case SerialMode::LOG_TOUCH:
      return "MODE: LOG_TOUCH";
    case SerialMode::LOG_SENSOR:
      return "MODE: LOG_SENSOR";
    default:
      return "ERROR: Touch sensor in unknown mode";
  }
}

BuzzerSet bs = BuzzerSet(1, 700);
SerialMode serialMode = SerialMode::LOG_TOUCH;
// SerialMode serialMode = SerialMode::LOG_SENSOR;
int samples = 30;

const int MAX_INPUT_BUFFER = 64;
char inputBuffer[MAX_INPUT_BUFFER];
int inputIndex = 0; // Current index in the buffer


void setup() {
  Serial.begin(9600);
  Serial.println(serialModeToString(serialMode));
}

void loop() {
  if (Serial.available() > 0) {
    char incomingChar = Serial.read();

    if (incomingChar != '\n' && inputIndex < MAX_INPUT_BUFFER - 1) {
      inputBuffer[inputIndex] = incomingChar;
      inputIndex++;
    } else {
      inputBuffer[inputIndex] = '\0';
      // Serial.print("Received: ");
      // Serial.println(inputBuffer);
      String inputString = String(inputBuffer);

      if (inputString.startsWith("MODE:")) {
        serialMode = stringToSerialMode(inputString);
        Serial.println(serialModeToString(serialMode));
      }
      inputIndex = 0; // Reset for the next input
    }
  }

  switch (serialMode) {
    case SerialMode::LOG_TOUCH:
      bs.logTouchEvent(samples);
      break;
    case SerialMode::LOG_SENSOR:
      bs.logSensorValue(samples);
      break;
    default:
      Serial.println(serialModeToString(serialMode));
      break;
  }
}

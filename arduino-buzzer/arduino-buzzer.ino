#include <CapacitiveSensor.h>

// First available pin
const int pinOffset = 2;
const int MAX_PIN = 13;


enum BuzzerState {
  RELEASED,
  TOUCHED
};

class Buzzer
{
public:
  // // This constructor should not be used
  Buzzer(int sendPin, int receivePin, long touchThreshold) :
      sendPin_(sendPin),
      receivePin_(receivePin),
      touchThreshold_(touchThreshold),
      cs_(CapacitiveSensor(sendPin, receivePin))
    {
      cs_.set_CS_Timeout_Millis(500);
      cs_.set_CS_AutocaL_Millis(500);
    }

  Buzzer() : Buzzer(0, 0, 0)
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

  long getTouchThreshold() const
  {
    return touchThreshold_;
  }

private:
  int sendPin_;
  int receivePin_;
  long touchThreshold_;
  CapacitiveSensor cs_;

  BuzzerState state_ = BuzzerState::RELEASED;
};

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

  void logTouchThreshold()
  {
    for (int i = 0; i < totalBuzzers_; ++i) {
      Serial.print("THRESHOLD:");
      Serial.print(i);
      Serial.print(",");
      Serial.println(buzzers_[i].getTouchThreshold());
    }
  }

  void setTouchThreshold(int buzzerIndex, long touchThreshold)
  {
    if (buzzerIndex < 0 && buzzerIndex >= totalBuzzers_) {
      Serial.println("ERROR:Attempted to set bad touch threshold for bad buzzer index");
    } else {
      buzzers_[buzzerIndex].setTouchThreshold(touchThreshold);
      Serial.print("THRESHOLD:");
      Serial.print(buzzerIndex);
      Serial.print(",");
      Serial.println(buzzers_[buzzerIndex].getTouchThreshold());
    }
  }

  void setTouchThreshold(long touchThreshold)
  {
    for (int i = 0; i < totalBuzzers_; ++i) {
      setTouchThreshold(i, touchThreshold);
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
  if (str == "MODE:LOG_TOUCH") {
    return SerialMode::LOG_TOUCH;
  }
  if (str == "MODE:LOG_SENSOR") {
    return SerialMode::LOG_SENSOR;
  }
  return SerialMode::UNKNOWN;
}

String serialModeToString(const SerialMode& mode) {
  switch (mode) {
    case SerialMode::LOG_TOUCH:
      return "MODE:LOG_TOUCH";
    case SerialMode::LOG_SENSOR:
      return "MODE:LOG_SENSOR";
    default:
      return "MODE:UNKNOWN_MODE";
  }
}

bool parseThresholdString(const String& thresholdString, int& index, long& value) {
  // Find the positions of the delimiters
  int colonPos = thresholdString.indexOf(':');
  if (colonPos == -1) {
    return false;
  }

  int commaPos = thresholdString.indexOf(',');
  if (commaPos == -1 || commaPos <= colonPos) {
    return false;
  }

  // Extract the substrings
  String indexStr = thresholdString.substring(colonPos + 1, commaPos);
  String valueStr = thresholdString.substring(commaPos + 1);

  // Convert the substrings to integers
  index = indexStr.toInt();
  if (index < 0) {
    return false;
  }

  value = valueStr.toInt();
  if (value < 0) {
    return false;
  }

  return true;
}

const int MAX_INPUT_BUFFER = 64;
char inputBuffer[MAX_INPUT_BUFFER];
int inputIndex = 0; // Current index in the buffer

int numberOfBuzzers = 0; // Set to 0 for auto-detection
long touchThreshold = 100;
int samples = 10; // Number of samples for buzzer reads
SerialMode serialMode = SerialMode::LOG_TOUCH;
// SerialMode serialMode = SerialMode::LOG_SENSOR;
BuzzerSet* bs;
void setup() {
  Serial.begin(9600);

  // TODO: Fix this code, for some reason we cannot switch to LOG_SENSOR (just -2)
  if (numberOfBuzzers == 0) {
    for (int i = 0; i < (MAX_PIN - pinOffset) / 2; ++i) {
      CapacitiveSensor cs = CapacitiveSensor(pinOffset + (i * 2), pinOffset + (i * 2) + 1);
      long sensorValue = cs.capacitiveSensor(5);
      if (sensorValue < 0) {
        numberOfBuzzers = i;
        break;
      }
    }
  }

  bs = new BuzzerSet(numberOfBuzzers, touchThreshold);

  // We log at the beginning so the React App knows the Buzzer thresholds and current mode
  Serial.println(serialModeToString(serialMode));
  bs->logTouchThreshold();
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
        SerialMode newMode = stringToSerialMode(inputString);
        if (newMode != SerialMode::UNKNOWN){
          serialMode = newMode;
          Serial.println(serialModeToString(serialMode)); // Confirm change
        }
      } else if (inputString.startsWith("THRESHOLD:")) {
        int buzzerIdx = -1;
        long newThresholdValue = 0;

        bool result = parseThresholdString(inputString, buzzerIdx, newThresholdValue);
        if (result) {
          bs->setTouchThreshold(buzzerIdx, newThresholdValue);
        }
      }
      inputIndex = 0; // Reset for the next input
    }
  }

  switch (serialMode) {
    case SerialMode::LOG_TOUCH:
      bs->logTouchEvent(samples);
      break;
    case SerialMode::LOG_SENSOR:
      bs->logSensorValue(samples);
      break;
    default:
      Serial.println(serialModeToString(serialMode));
      break;
  }
}

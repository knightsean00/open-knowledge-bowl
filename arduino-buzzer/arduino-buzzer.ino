// Changeable constants
const int NUM_BUZZERS = 3;
// The time to wait before a buzzer can returned buzzed again in ms
const unsigned long GRACE_DURATION = 100;

// Less likely to be changed constants
// First available pin
const int pinOffset = 2;
const int MAX_PIN = 13;


class Buzzer
{
public:
  Buzzer(int readPin) : readPin_(readPin), gracePeriod_(0)
  {
    pinMode(readPin_, INPUT);
  }

  Buzzer() : readPin_(0), gracePeriod_(0)
  {
  }

  bool gotTouched()
  {
    // TODO: Potentially do sampling to reduce errors
    unsigned long now = millis();
    if (now < gracePeriod_) {
      return false;
    }

    int touchState = digitalRead(readPin_);
    if (touchState == HIGH) {
      gracePeriod_ = now + GRACE_DURATION;
      return true;
    }
    return false;
  }

private:
  int readPin_;
  unsigned long gracePeriod_;
};

class BuzzerSet
{
public:
  BuzzerSet(int totalBuzzers) : totalBuzzers_(totalBuzzers)
  {
    buzzers_ = new Buzzer[totalBuzzers_]; // Allocate memory for pointers

    for (int i = 0; i < totalBuzzers_; ++i)
    {
      buzzers_[i] = Buzzer(pinOffset + i); // Create each Buzzer object
    }
  }

  // This will print all buzzers that got pressed in the same sample (e.g. 1;4;5)
  void logTouchEvent()
  {
    bool didLog = false;
    for (int i = 0; i < totalBuzzers_; ++i)
    {
      if (buzzers_[i].gotTouched())
      {
        Serial.print(i);
        Serial.print(";");
        didLog = true;
      }
    }
    if (didLog)
    {
      Serial.print("\n");
    }
  }

  ~BuzzerSet()
  {
    delete[] buzzers_; // Deallocate the array of Buzzer objects
  }

private:
  int totalBuzzers_;
  Buzzer *buzzers_;
};

BuzzerSet bs(NUM_BUZZERS);
void setup()
{
  Serial.begin(9600);
}

void loop()
{
  bs.logTouchEvent();
}

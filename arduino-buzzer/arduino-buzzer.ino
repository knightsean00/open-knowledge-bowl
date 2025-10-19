// First available pin
const int pinOffset = 2;
const int MAX_PIN = 13;

enum BuzzerState
{
  RELEASED,
  TOUCHED
};

class Buzzer
{
public:
  Buzzer(int readPin) : readPin_(readPin)
  {
    pinMode(readPin_, INPUT);
  }

  Buzzer() : readPin_(0)
  {
  }

  // Returns if the buzzer just got touched (changed from its initial state)
  bool gotTouched()
  {
    // TODO: Add debouncing?
    int touchState = digitalRead(readPin_);
    return touchState == HIGH;
  }

private:
  int readPin_;

  // BuzzerState state_ = BuzzerState::RELEASED;
};

class BuzzerSet
{
public:
  BuzzerSet(int totalBuzzers, long defaultThreshold) : totalBuzzers_(totalBuzzers)
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

int numberOfBuzzers = 1;
long touchThreshold = 100;
BuzzerSet *bs;
void setup()
{
  Serial.begin(9600);

  bs = new BuzzerSet(numberOfBuzzers, touchThreshold);
}

void loop()
{
  bs->logTouchEvent();
}

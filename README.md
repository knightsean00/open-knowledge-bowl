# open-knowledge-bowl

## What is Knowledge Bowl?

Knowledge Bowl is a quiz competition that is popular in Washington state. These competitions differ from other team-based quiz competitions primarily by the format and layout of the competition itself. Teams are seated together and all individuals on a team share a large buzzer (usually two disconnected metal bars per buzzer). In contrast with other quiz competitions, Knowledge Bowl is extremely team-focused. When teams buzz in, they can discuss as a team for an alloted 15 seconds before they have to answer. This time to work through the problem together as a team is what I believe really differentiates this format. The shared buzzer and the time pressure is what I believe really makes a team bond. On top of that, Knowledge Bowl is relaxed enough to spur inter-team interactions, which is relatively uncommon for other trivia formats.

This repository is meant to make it easier for everyone to build their own buzzers for a relatively cheap cost!

## Building Your Own
### Materials Needed
- Metal Bar
- Arduino (or some microcontroller)
- Speaker wires
- High ohm resistors (I used two 1 mega ohm resistors)
- Electrical tape

In total, these materials can be purchased for less than <$50. Normal Quiz Bowl and Knowledge Bowl systems can cost >$400, not including the continued maintenance needed for the buttons, calibrations, etc.

### Procedures
1. Strip the speaker wire and attach the positive and negative ends to the same metal bar (using electrical tape or some kind of adhesive). We are using the bar as a capacitive sensor, and, as such, will always have current running through it. There will be no closing of circuits.
2. Connect the positive and negative ends of the other side of the speaker wire to a resistor before connecting the circuit to two of the digital pins of the Arduino (digital pins should be sequential starting at pin 2). We need a strong resistor to make it easier to read capacitance values and to protect the microcontroller from the current.
3. Install the `arduino-buzzer.ino` onto the microcontroller and read from serial. The program should automatically detect how many bars are connected and should be put into `LOG_TOUCH` mode. You can switch the modes by typing input into serial. The two available modes are `MODE:LOG_TOUCH` (logs which buzzer was touched) and `MODE:LOG_SENSOR` (logs sensor values for each buzzer, useful for debugging).
4. When the buzzer is working as expected, you can visit the [buzzer-ui](https://knowledge-buzzer.pages.dev/) website or start it locally (instructions in `buzzer-ui`). By default, the website will display `LOG_TOUCH` mode, but if you click on `DEV` at the bottom, you can see a graph of the sensitivity of each buzzer and adjust thresholds on a per-bar basis.
5. You can find a score card and pre-made questions at a pre-hosted [question-ui](https://open-knowledge-bowl.pages.dev/) website or start it locally (instructions in `questions-ui`)

Still have questions? Drop them as an issue in this repository and I will do my best to get to them!

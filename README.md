# open-knowledge-bowl V2

## What is Knowledge Bowl?

Knowledge Bowl is a quiz competition that is popular in Washington state. These competitions differ from other team-based quiz competitions primarily by the format and layout of the competition itself. Teams are seated together and all individuals on a team share a large buzzer (usually two disconnected metal bars per buzzer). In contrast with other quiz competitions, Knowledge Bowl is extremely team-focused. When teams buzz in, they can discuss as a team for an alloted 15 seconds before they have to answer. This time to work through the problem together as a team is what I believe really differentiates this format. The shared buzzer and the time pressure is what I believe really makes a team bond. On top of that, Knowledge Bowl is relaxed enough to spur inter-team interactions, which is relatively uncommon for other trivia formats.

This repository is meant to make it easier for everyone to build their own buzzers for a relatively cheap cost!

## Building Your Own

### Materials Needed
- Metal Bar
- Arduino (or some microcontroller)
- CAT Wires (I used CAT5)
- TTP223 Sensors (purchaseable on Amazon)
- Header pins
- Electrical tape
- JST Connectors
- Wire Crimper
- Soldering Iron
- Solder
- Cardboard
- Breadboard
- Dupont / Jumper wires

In total, these materials can be purchased for less than <$75. Normal Quiz Bowl and Knowledge Bowl systems can cost >$400, not including the continued maintenance needed for the buttons, calibrations, etc.

### Procedures (makes three sensor bars)
1. Take the TTP223 sensor and solder header pins to the VCC, I/O, and GND. Please note that you want the sensor side facing the metal bar. Therefore, I have the long side of the header pins facing away from the sensor side so that the wire can be plugged in from above the metal bar. If you would prefer below, feel free to, but you might encounter problems with gravity straining the connection later on.
2. Cut out a piece of single-walled cardboard that is roughly the shape of the TTP223 sensor. On one of the short sides, make a small cutout to allow the header pin nubs (the side you soldered) to slide in. The cardboard will allow us to reduce the sensitivity of the TTP223 sensor and only detect touches, not proximity to the bar. Feel free to adjust the number / thickness of the cardboard layers based on the sensitivity of your sensor. You can also adjust the sensor by soldering a capacitor, but that makes the project slightly more complex.
3. Cover up the header pin nubs with electrical tape, then tightly tape the TTP223 + cardboard bundled onto the metal bar with the sensor side down.
4. Cut three separate lengths of CAT5 cable (I use ~5m per wire).
5. Strip the CAT5 cable and crimp the wires to be fitted into a JST female connector. One solid wire (I use brown) for VCC, another solid wire for I/O (I use green), and the two corresponding stripped color wires for GND (I stripped brown + stripped green). Do this for each end of each wire (2 sides x 3 wires = 6 total)
6. Plug one end of the CAT5 cables onto the header pins of the TTP223 sensors and plug the other ends into the Arduino. Note that to parallelize the 5V + GND on the microcontroller, you may need to use a breadboard + Dupont/jumper wires.
7. Install the `arduino-buzzer.ino` onto the microcontroller and read from serial. The program should automatically detect how many bars are connected and should be put into `LOG_TOUCH` mode. You can switch the modes by typing input into serial. The two available modes are `MODE:LOG_TOUCH` (logs which buzzer was touched) and `MODE:LOG_SENSOR` (logs sensor values for each buzzer, useful for debugging).
8. When the buzzer is working as expected, you can visit the [buzzer-ui](https://knowledge-buzzer.pages.dev/) website or start it locally (instructions in `buzzer-ui`). By default, the website will display `LOG_TOUCH` mode, but if you click on `DEV` at the bottom, you can see a graph of the sensitivity of each buzzer and adjust thresholds on a per-bar basis.
9. You can find a score card and pre-made questions at a pre-hosted [question-ui](https://open-knowledge-bowl.pages.dev/) website or start it locally (instructions in `questions-ui`)

Still have questions? Drop them as an issue in this repository and I will do my best to get to them!

If you are interested in learning more about a cheaper, but less reliable solution, visit the [V1 branch of the repository](https://github.com/knightsean00/open-knowledge-bowl/tree/v1)!

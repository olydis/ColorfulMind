# ColorfulMind
A simple video post-processor meant to make red stick out - which might be helpful for colorblind people. Created during jacobsHack2015.

## Inspiration
Some time ago we thought about color-blindness and realized how not being able to distinguish certain colors can actually be very dangerous. Especially red-green-blind people are facing a huge challenge in our society: Red is used as the color to express importance (warnings on packages, etc.), to attract attention (fire trucks, fire extinguishers, etc.). Green on the other hand occurs naturally in all sorts of places, is used a lot for packaging (Sprite, ...), and so on.

Our goal was to build a tool bringing back the "sticking out"-experience of the red color to color-blind people.

## What the tool does
It takes a video of a scene as input (e.g. taken with a mobile phone or AR device), processes it by letting red areas flash brightly. To support our development process, especially to have an idea how our post-processing looks like to color-blind people, we also added filters to simulate two kinds of color-blindness. Later we also added a feature trying to detect dangerous situations the person running the app might run into (like accidents) - in production the app would issue an emergency call or similar in such situation.

# Field Desk Flow

An interactive prototype of the **Osteologia** museum booth: a visitor plays an osteology researcher studying the pelvis of an adult male grey wolf.

## The flow

1. Write to the museum and get a reply
2. Sign the visitors' book (a 3D notebook)
3. Turn the crank to open the shelf
4. Pick the box with wolf bones (labels show only the Latin name)
5. Measure the width across the hip bones with the caliper and pick a range
6. See where your wolf lands on the pile of adult males
7. Put everything back and close the shelf

## Controls

The on-screen **knob** (◀ Press ▶) and **crank** slider stand in for the physical booth hardware.

- Arrow keys turn the knob; Enter presses it
- Mouse wheel over the screen turns the crank on the shelf screens
- "Jump to screen" buttons go straight to any step

## Running it

It's a single self-contained `index.html` (images are embedded). Open it in a browser, or serve the folder:

```bash
python3 -m http.server
```

It loads three.js r128 from cdnjs and fonts from Google Fonts, so it needs an internet connection.

## Data

The study figures come from Csanády, Križovský and Hlôška (2019), *Turkish Journal of Zoology* 43(6):580–591: 17 adult male grey wolf pelvises, mean 104.9 mm (SD 6.64) across the hip bones. The dots on the chart are placed from that mean and spread to show the group's shape. They are not the real 17 measurements.

# Field Desk (Osteologia) prototype

An interactive booth screen for the Osteologia exhibit: a visitor writes to a museum, opens a shelf, finds the wolf box, measures the pelvis of an adult male grey wolf and sees where their measurement falls among adult males.

Live site: https://vishvakmichael-code.github.io/osteology/

The screen fills the browser window (16:10, centred). Once the first screen is up, the page quietly loads the later screens' images and the 3D model in the background, so the measure screen opens without waiting. For the booth, put the browser in full screen (Ctrl+Cmd+F on Mac, F11 on Windows). The page loads three.js and fonts from CDNs, so it needs an internet connection, and the 3D model only loads from the website (or a local web server), not from a double-clicked file.

## Screens

| # | Screen | What the visitor does |
|---|---|---|
| 1 | Write to the museum | Reads the email and sends it |
| 2 | You got a response! | Reads the museum's reply |
| 3 | The visitors' book | Signs the 3D notebook |
| 4 | Open the shelf | Turns the crank to open the door |
| 5 | Which box? | Finds the box with the wolf bones (Canis lupus) |
| 6 | At the workstation | Opens the box and picks the pelvis bone |
| 7 | Measure the width | Measures between the green points, writes it on a sticky note; the 3D skeleton shows the pelvis |
| 8 | How wide is it? | Picks the range the measurement lies in (the replica is over 110 mm) |
| 9 | A typical male / Bigger than most | Sees where the wolf falls among 100 adult males |
| 10 | Put everything back | Packs the box, shelves it, closes the door |
| 11 | Publish your reading | Puts the sticky note on the wall |

Controls: the arrow keys turn the knob, Enter presses it, and the mouse wheel turns the crank (screens 4 and 10) or rotates the skeleton (screen 7). Buttons can also be clicked.

## Folders

```
index.html            the whole prototype (HTML, CSS and script in one file)
images/               every image the prototype uses
model/                the 3D wolf skeleton (GLB) for the measure screen
tools/model/          scripts that made the GLB from the original Sketchfab download
archive/              older copies kept for reference
```

## Images

| File | Used on |
|---|---|
| `images/background/museum-wall.jpg` | Background of every screen |
| `images/shelf/shelf.jpg` | The open shelf with the boxes (screens 5 and 10) |
| `images/stickers/fox.png`, `skeleton.png`, `yawn.png`, `skull.png` | Sketch stickers in the corner of the screens |
| `images/tools/gloves.png`, `bubble.png`, `caliper.png` | The tools that go back in the box (screen 10) |
| `images/workstation/box-closed.jpg` | "Open the box on the table" (screen 6) |
| `images/workstation/box-open.jpg` | "Guess and pick the pelvis bone!" (screen 6) |
| `images/measure/pelvis-top.jpg` | "Use the scale to measure the points marked in green" (screen 7); the green points are drawn over it in `index.html` |
| `images/measure/sticky-note.jpg` | "Write the measurement in mm on the sticky note" (screen 7) |
| `images/previous/` | Earlier workstation and measuring photos and the old carved door texture, no longer shown |

To replace a photo, save the new one under the same file name. Until a photo is there, the screen shows a dashed box with its file name.

## The 3D model

`model/wolf-skeleton.glb` was made from "Wolf Skeleton" with `tools/model/optimize-model.mjs`: the 51 Sketchfab chunks were merged, simplified from 2.79 million to about 413,000 triangles, stored compactly (KHR_mesh_quantization: 16-bit positions, 8-bit normals; about 3.3 MB to download), and the pelvis bones (both hip bones and the sacrum, found with `tools/model/original-shells.mjs`) were tagged so a shader can colour them in the brand maroon.

```
node --max-old-space-size=8192 tools/model/optimize-model.mjs <scene.gltf> model/wolf-skeleton.glb 540 1489562,2244336
```

## Study figures

Csanády, Križovský and Hlôška (2019), Turkish Journal of Zoology 43(6):580–591: 17 adult male grey wolf pelvises, mean 104.9 mm (SD 6.64) across the hip bones. The chart's 100 circles follow that mean and spread; they are not real measurements.

## Credits

The 3D skeleton on the measure screen is based on "Wolf Skeleton" (https://sketchfab.com/3d-models/wolf-skeleton-1b447d8c2f7c4e69b40db888fbe3b187) by Ahnaf Tauseef (https://sketchfab.com/ahnaftauseef), licensed under CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/). It was simplified and the pelvis bones were tagged for colouring.

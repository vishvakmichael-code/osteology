# Field Desk (Osteologia) prototype

An interactive booth screen for the Osteologia exhibit: a visitor writes to a museum, opens a shelf, finds the wolf box, measures the pelvis of an adult male grey wolf and sees where their measurement falls among adult males.

Live site: https://vishvakmichael-code.github.io/osteology/

The screen fills the browser window (16:10, centred). Once the first screen is up, the page quietly loads the later screens' images and the 3D model in the background, so the measure screen opens without waiting. For the booth, put the browser in full screen (Ctrl+Cmd+F on Mac, F11 on Windows). The page loads three.js and fonts from CDNs, so it needs an internet connection, and the 3D model only loads from the website (or a local web server), not from a double-clicked file.

## Screens

| # | Screen | What the visitor does |
|---|---|---|
| – | Intro | Big OSTEOLOGIA title; pressing the knob flies the title into the header logo and fades into screen 1. "Start again" returns here |
| 1 | Write to the museum | Reads the email and sends it |
| 2 | You got a response! | Reads the museum's reply |
| 3 | The visitors' book | Signs the 3D notebook |
| 4 | Open the shelf | Turns the crank to open the door |
| 5 | Which box? | Finds the box with the wolf bones (Canis lupus) |
| 6 | At the workstation | Opens the box and takes the pelvis out |
| 7 | Measure the width | A big "Turn the knob" title (like the intro) shows how to rotate the 3D skeleton, then shrinks into the hint; measures between the green points, writes it on a sticky note,. A 2-minute timer runs from the moment the screen opens (red and ticking in the last seconds); at zero it says "time's up", closes the photo and selects Done measuring (`M3_SECONDS` in `index.html`) |
| 8 | Fire protocol: put the bones back | The museum's fire rule: packs the bones in the box, shelves it and closes the door with the crank; a checklist ticks off each step |
| 9 | How wide is it? | Picks the range the measurement lies in (the replica is over 110 mm) |
| 10 | A typical male / Bigger than most | Sees where the wolf falls among 100 adult males; once the chart settles, turning the knob walks a highlight across the four ranges (those circles hop and the count updates), and clicking a circle makes it jump and shows its width |
| 11 | Publish your reading | Three illustrated steps for the sticky-note wall, and why publishing matters |

Controls: the arrow keys turn the knob, Enter presses it (the small knob inside a button pulses to show a press does it), and the mouse wheel turns the crank (screens 4 and 8) or rotates the skeleton (screen 7). Buttons can also be clicked. Back is for staff with a mouse: the knob never selects it.

Sound: short tones made in the browser (no audio files) for turning, pressing, a wrong choice, the crank, packing the box and closing the door. On the chart, colliding circles tap like pebbles (louder when more collide at once), sorting starts with a whoosh and each circle taps as it lands, and the wolf lands with a thump. Add `?mute=1` to the address to turn them off.

## Switched-off features

**Fit the bones** (`FEATURES.fitBones` in `index.html`, off): step 3 on the measure screen, "Try fitting the bones together, like the skeleton", with a "Reveal how they fit" button. The first knob press opens a full-screen photo of the fitted bones (`images/measure/fitted-bones.jpg`), the next press closes it and selects Done measuring. Preview it with `?fit=1` at the end of the address; to turn it on for everyone, set `fitBones: true`.

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
| `images/shelf/shelf.jpg` | The open shelf with the boxes (screens 5 and 8) |
| `images/stickers/skeleton.png`, `skull.png` | Bone sketch stickers in the corner of the screens |
| `images/tools/gloves.png`, `bubble.png`, `caliper.png` | The tools that go back in the box (screen 8) |
| `images/workstation/box-closed.jpg` | "Open the box on the table" (screen 6) |
| `images/workstation/box-open.jpg` | "Guess and pick the pelvis bone!" (screen 6) |
| `images/measure/pelvis-top.jpg` | "Use the scale to measure the points marked in green" (screen 7); the green points are drawn over it in `index.html` |
| `images/publish/take-note.jpg`, `stick-note.jpg`, `draw-portrait.jpg` | The three steps on the publish screen (screen 11) |
| `images/measure/sticky-note.jpg` | "Write the measurement in mm on the sticky note" (screen 7) |
| `images/previous/` | Earlier workstation and measuring photos, the old carved door texture and the two fox sketches (`fox.png`, `yawn.png`), no longer shown |

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

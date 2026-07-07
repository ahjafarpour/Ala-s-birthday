# Birthday Envelope

A small, self-contained birthday page: a red/black/white, all-black-themed
scene where an envelope drifts in, opens on tap, scatters photos across the
screen with a gentle drift, plays a song, and closes with a fade-in/fade-out
message.

## Files

```
index.html   structure
style.css    styling (colors, fonts, animations)
script.js    behavior/timing (envelope, photos, message, audio)
images/      put your photos here
audio/       put your song here
fonts/       put your Agera font files here
```

Open `index.html` directly in a browser — no build step or server needed.

## What you need to add

**1. The Agera font**
Drop your font files into `/fonts` using these exact names (or edit the
`@font-face` paths at the top of `style.css` to match your files):
```
fonts/Agera-Regular.woff2  (or .woff / .otf)
fonts/Agera-Bold.woff2     (or .otf)   — optional, delete the block in
                                          style.css if you only have one weight
```
Until real files are added, the page quietly falls back to Josefin Sans, a
similarly clean, geometric typeface, so it still looks intentional.

**2. Photos**
Replace the image paths in `index.html`:
```html
<div class="photo"><img src="images/photo-1.jpg" alt="Birthday memory 1"></div>
```
Add or remove `<div class="photo">…</div>` blocks for as many photos as you
like — positions, rotation, and drifting motion are assigned automatically
by `script.js`, so no extra edits are needed there.

**3. The song**
Replace `audio/your-song.mp3` with your own file (keep the same filename, or
update the `src` on the `<audio>` tag in `index.html`). It's set to loop by
default — remove the `loop` attribute if you'd rather it play once.

**4. The name / message**
In `index.html`, replace the two `[Name]` placeholders:
- in the tap prompt: `Tap to open dear <span class="name">[Name]</span>`
- in the final message: `Happy Birthday,<br><span class="name">[Name]</span>!`

## How the sequence works

1. Page loads → envelope scales/fades in over 1.5s.
2. 1s later → "Tap to open dear …" fades in above it.
3. Click/tap the envelope → the prompt fades out, the envelope fades away,
   and the song starts playing (browsers require it to start from a direct
   user action, which the click provides).
4. Shortly after → photos fade in one by one at random, non-overlapping
   spots, then continuously drift a few pixels in random directions,
   forever, at random intervals — a slow, ambient motion.
5. A few seconds later → the final message fades in at the center, holds
   for 2 seconds, then fades out.

All of the timings above live in the `CONFIG` object at the top of
`script.js`, in milliseconds, if you want the pacing faster or slower.

## Notes

- Respects `prefers-reduced-motion`: the ambient rotation and most
  transitions shorten automatically for people who have that setting on.
- Works on mobile — the layout, envelope size, and text scale with the
  viewport.
- The thin rotating sunburst and corner brackets are decorative flourishes
  tied to the Art Deco character of the Agera typeface; delete the
  `.sunburst` / `.corner` elements and their CSS if you'd rather keep the
  background plain.

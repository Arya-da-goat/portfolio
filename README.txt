ARYA — DIGITAL EXPERIENCES PORTFOLIO

ROOT FILES
- index.html
- style.css
- script.js
- background-music.wav (originally generated ambient synth instrumental)

DEPLOY TO GITHUB PAGES
1. Extract the ZIP on your device.
2. Upload all four files directly into the root of your GitHub repository. Do not upload the ZIP itself and do not put the files inside a folder.
3. Open the repository's Settings > Pages.
4. Under Build and deployment, select “Deploy from a branch”.
5. Select branch “main” and folder “/(root)”, then click Save.
6. Open Actions and wait for the Pages deployment to finish. Then open the Pages URL.

BACKGROUND MUSIC
- The ZIP includes background-music.wav: an original, locally generated ambient synth instrumental made for this portfolio. It does not rely on a remote music URL.
- Music is OFF on page load. Visitors must press Play / “Enable atmosphere”; browsers may block autoplay with sound, so the site does not try to bypass that restriction.
- The floating sound console supports play/pause, mute, volume, animated visualizer, and collapse/expand. Volume, mute, and console layout preferences are saved when browser storage is available. Music never starts automatically, even if the previous session used it.
- To replace the track, add your own properly licensed audio file next to index.html. For the included WAV, keep its filename as background-music.wav. For an MP3, change the audio element's src in index.html to background-music.mp3 and upload that file to the same root. Use only audio you created or are licensed to use.
- If the audio file is missing or cannot play, the rest of the portfolio still works and the player explains how to fix the audio path.

FEATURES
- Responsive dark sci-fi design with atmospheric lighting and a stable procedural starfield.
- Interactive canvas planet with drag rotation, inertia, pause/reset controls, and marker tooltips.
- Font Awesome Free icons loaded from cdnjs; an internet connection is needed for those icons. Core site content and interactions remain available if the icon CDN is unavailable.
- Responsive mobile navigation, scroll reveals, restrained desktop pointer interactions, and Ctrl/Cmd + K command palette.
- Floating music console with original ambient instrumental, volume control, mute, playback status, and visualizer.
- Copy-email action and contact form that prepares a mailto draft for eliteninja12347@gmail.com. It does not send email automatically.
- No framework, backend, API keys, build process, or package installation required.

NOTES
- Google Fonts are an optional visual enhancement; system fonts remain as fallback if unavailable.
- Work cards are labelled concept studies, not client projects. Replace them with genuine work when available.
- This is a static website and can be hosted on GitHub Pages.

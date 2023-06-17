# FPV telemetry overlay generator

## Show telemetry on GoPro, DJI, etc. video

### Telemetry overlay generated from OpenTX telemetry (ardupilot / betaflight / inav)

The telemetry overlay is displayed on top of the original video in MPV video player as .ssa subtitles.
For players without SSA support telemetry can be burned into video.

https://github.com/Andrey-Svetlichny/fpv-telemetry-overlay-generator/assets/8205024/c6ea3123-7361-428b-9624-70303e45f106

## [More on youtube](https://youtu.be/ykiEDmohgNw)

### Install

#### Windows

Download [latest release](https://github.com/Andrey-Svetlichny/fpv-telemetry-overlay-generator/releases/latest/) (setup or portable in zip archive).

Unpack zip or run setup.

Installer not signed, so Winsows can show warning "Windows protected your PC". Press "More info" and "Run anyway". Installer will create shortcut in Start menu and run the application. 
In case of zip run fpv-telemetry-overlay-generator.exe.

#### Mac and Linux
Build from the source. Should work on both. I don't have Mac to test it. Let me know if it works.

## How to use

Choose log file and video file(s).
To synchonize telemetry with video use shift value.
Press blue button "Generate telemetry" to create SSA files in the same directory as video.

### How to customize

"Edit config" link open config.yml in default editor.
 Parameteres described [here](doc/config.yml)
 
### How to burn telemetry into video
Use [FFmpeg](https://ffmpeg.org/download.html)
```
ffmpeg -i <VIDEO>.MP4 -vf subtitles=<SUBTITLE>.SSA out.MP4
```

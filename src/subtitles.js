const fs = require('fs')
const util = require('util')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const duration = require('dayjs/plugin/duration')

dayjs.extend(customParseFormat)
dayjs.extend(duration)

const header = `[Script Info]
PlayResX: 1280
PlayResY: 720
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, Alignment, Outline
Style: Default, Segoe UI Symbol,36,&HFFFFFF,5,1
Style: A1, Segoe UI Symbol,36,&HFFFFFF,7,1
Style: A2, Segoe UI Symbol,36,&HFFFFFF,4,1
Style: A3, Segoe UI Symbol,36,&HFFFFFF,1,1

[Events]
Format: Start, End, Style, Text
`

const exportSubtitles = async (config, rows) => {
  f = (d) => dayjs.duration(d).format('HH:mm:ss.SSS').slice(0, -1)

  // loop .ssa
  ssaFiles = config.video
    .map((o) => ({ path: Object.keys(o)[0], length: Object.values(o)[0] }))
    .map((o) => ({ path: o.path.replace(/\.[^/.]+$/, '.ssa'), length: o.length }))

  let fileStart = 0
  for (const file of ssaFiles) {
    let fileEnd = fileStart + file.length * 1000
    const rowsPart = rows.filter((r) => fileStart <= r._t && r._t < fileEnd)
    rowsPart.forEach((r) => (r._t = r._t - fileStart))
    // add _time = formatted _t to each row
    rowsPart.forEach((r, i, arr) => (r._time = `${f(r._t)},${f(i === arr.length - 1 ? r._t + 1000 : arr[i + 1]._t)}`))
    exportSubtitlesFile(config, file.path, rowsPart)
    fileStart += file.length * 1000
  }
}

const exportSubtitlesFile = (config, path, rows) => {
  let stream = fs.createWriteStream(path)
  stream.once('open', () => {
    stream.write(header)

    f = (show) =>
      show
        .map((o) => Object.entries(o)[0])
        .map((o) => util.format(o[1], r[o[0]]))
        .join(`\\N`)

    for (r of rows) {
      s =
        `Dialogue: ${r._time},A1,{\\pos(16,16)}${f(config.show.a1)}\n` +
        `Dialogue: ${r._time},A2,{\\pos(16,350)}${f(config.show.a2)}\n` +
        `Dialogue: ${r._time},A3,{\\pos(16,700)}${f(config.show.a3)}\n`
      stream.write(s)
    }
    stream.end()
  })
}

module.exports.exportSubtitles = exportSubtitles

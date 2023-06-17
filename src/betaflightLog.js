const fs = require('fs')
const dayjs = require('dayjs')
const papa = require('papaparse')

const prepareLog = async (config) => {
  // read log
  const file = fs.createReadStream(config.log.file)
  const parsedLog = await new Promise((complete, error) => papa.parse(file, { header: true, complete, error }))
  let rows = parsedLog.data

  // exec config.eval & prepareTime
  config.eval.forEach((expr) => rows.forEach((x) => eval(expr)))
  rows = prepareTime(rows, config).filter((r) => r._t > 0)
  return rows
}

// add _t = time from start to each row
const prepareTime = (rows, config) => {
  rows.forEach((r) => (r._t = dayjs(r.Time, 'HH:mm:ss.SSS')))
  t0 = rows[0]._t.subtract(config.log.shift, 's')
  rows.forEach((r) => (r._t = r._t.diff(t0)))
  return rows
}

module.exports.prepareLog = prepareLog

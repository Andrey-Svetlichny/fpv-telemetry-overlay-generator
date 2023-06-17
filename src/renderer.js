const elLogFile = document.getElementById('logFile')
const elVideoFiles = document.getElementById('videoFiles')
const inputShift = document.getElementById('shift')
const btnLogFile = document.getElementById('btnLogFile')
const btnVideoFiles = document.getElementById('btnVideoFiles')
const btnGenerate = document.getElementById('btnGenerate')
const btnEditConfig = document.getElementById('btnEditConfig')
const error = document.getElementById('error')
const message = document.getElementById('message')

window.api.handleError((event, value) => {
  error.innerText = value
  error.style.display = 'block'
  setTimeout(() => {
    error.style.display = 'none'
  }, 30000)
})

window.api.handleMessage((event, value) => {
  message.innerText = value
  message.style.display = 'block'
  setTimeout(() => {
    message.style.display = 'none'
  }, 10000)
})

window.api.configChanged((event, config) => {
  elLogFile.innerText = config.log.file

  var tbody = config.video
    .map((o) => ({ path: Object.keys(o)[0], length: Object.values(o)[0] }))
    .map((o) => `<tr><td>${o.path}</td><td>${o.length}</td></tr>`)
    .join('\n')
  elVideoFiles.innerHTML = tbody
  inputShift.value = config.log.shift
})

btnLogFile.addEventListener('click', window.api.chooseLog)

btnVideoFiles.addEventListener('click', window.api.chooseVideoFiles)

btnGenerate.addEventListener('click', window.api.generateSubtitles)

btnEditConfig.addEventListener('click', window.api.editConfig)

inputShift.addEventListener('input', () => {
  window.api.setShift(inputShift.value)
})

window.api.getConfig()

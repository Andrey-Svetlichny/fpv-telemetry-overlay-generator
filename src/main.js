const { app, dialog, BrowserWindow, ipcMain, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const YAML = require('yaml')
const chokidar = require('chokidar')
const { getVideoDurationInSeconds } = require('get-video-duration')
const { prepareLog } = require('./betaflightLog.js')
const { exportSubtitles } = require('./subtitles.js')

if (require('electron-squirrel-startup')) app.quit()

const configPath = 'config.yml'
const configTemplatePath = 'resources/config.yml'

let config
let handleError = () => {}
let handleMessage = () => {}
let configChanged = () => {}

const createWindow = async () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  configChanged = () => win.webContents.send('configChanged', config)
  handleError = (message) => win.webContents.send('handleError', message)
  handleMessage = (message) => win.webContents.send('handleMessage', message)
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('getConfig', getConfig)
  ipcMain.handle('chooseLog', chooseLog)
  ipcMain.handle('chooseVideoFiles', chooseVideoFiles)
  ipcMain.handle('setShift', setShift)
  ipcMain.handle('generateSubtitles', generateSubtitles)
  ipcMain.handle('editConfig', editConfig)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function getConfig() {
  try {
    configLoad()
    configChanged()
  } catch (e) {
    handleError(e)
  }
}

async function chooseLog() {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] })
    if (canceled) return
    config.log.file = filePaths[0]
    configSave()
  } catch (e) {
    handleError(e)
  }
}

async function chooseVideoFiles() {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    if (canceled) return

    var ffprobe = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked')

    var files = []
    for (f of filePaths) {
      let o = {}
      try {
        o[f] = await getVideoDurationInSeconds(f, ffprobe)
      } catch (e) {
        o[f] = 600
        handleError(`Unable to determine file length ${f}: ${e.message}`)
      }
      files.push(o)
    }

    config.video = files
    configSave()
  } catch (e) {
    handleError(e)
  }
}

function setShift(event, value) {
  try {
    config.log.shift = value
    configSave()
  } catch (e) {
    handleError(e)
  }
}

async function generateSubtitles() {
  try {
    const rows = await prepareLog(config)
    exportSubtitles(config, rows)
  } catch (e) {
    handleError(e)
  }
}

async function editConfig() {
  try {
    shell.openPath(configPath)
  } catch (e) {
    handleError(e)
  }
}

function configLoad() {
  try {
    let content
    if (fs.existsSync(configPath)) content = fs.readFileSync(configPath, 'utf8')
    else {
      handleMessage(`File ${configPath} does not exists, using default config from ${configTemplatePath}`)
      content = fs.readFileSync(configTemplatePath, 'utf8')
      fs.writeFileSync(configPath, content)
    }
    config = YAML.parse(content)
  } catch (e) {
    handleError(`Error loading config: ${e.message}`)
  }
}

function configSave() {
  try {
    fs.writeFileSync(configPath, YAML.stringify(config))
  } catch (e) {
    handleError(`Error saving config: ${e.message}`)
  }
}

chokidar.watch(configPath, { awaitWriteFinish: { stabilityThreshold: 300 } }).on('change', getConfig)

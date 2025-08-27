const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

let mainWindow: any

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow local API calls
    },
    show: false,
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../assets/icon.png'),
  })

  const isDevelopment = isDev

  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5175')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    if (isDevelopment) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
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
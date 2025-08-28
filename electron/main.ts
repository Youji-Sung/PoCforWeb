const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const { spawn } = require('child_process')

let mainWindow: any
let backendProcess: any

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

  // Force production mode when not in development environment
  const isDevelopment = (process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'electron-dev') && isDev

  console.log('isDev:', isDev)
  console.log('NODE_ENV:', process.env.NODE_ENV)  
  console.log('isDevelopment:', isDevelopment)
  console.log('__dirname:', __dirname)

  if (isDevelopment) {
    console.log('Loading development server...')
    mainWindow.loadURL('http://localhost:5180')
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../index.html')
    console.log('Loading production build from:', indexPath)
    mainWindow.loadFile(indexPath)
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

function startBackend() {
  if (isDev) return // Don't start backend in dev mode
  
  const resourcesPath = (process as any).resourcesPath
  const backendPath = path.join(resourcesPath, 'backend', 'MedicalImageApi.exe')
  console.log('Starting backend at:', backendPath)
  
  backendProcess = spawn(backendPath, [], {
    cwd: path.join(resourcesPath, 'backend'),
    detached: false
  })
  
  backendProcess.on('error', (err: any) => {
    console.error('Backend failed to start:', err)
  })
}

app.whenReady().then(() => {
  startBackend()
  setTimeout(createWindow, 2000) // Wait 2 seconds for backend to start

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
})
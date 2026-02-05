
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "LifeSync AI",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true
  });

  // Em desenvolvimento, pode apontar para o localhost do app Web
  // Em produção, aponta para o build estático
  // win.loadURL('http://localhost:5173'); 
  
  // Exemplo carregando arquivo local (após build do web)
  win.loadFile(path.join(__dirname, '../web/dist/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

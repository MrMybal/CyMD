const { app, BrowserWindow } = require('electron')
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { zipSync, unzipSync, strToU8, strFromU8 } = require('fflate')
const root = path.resolve(__dirname, '..')
const fixture = zipSync({mimetype:strToU8('application/x-cymd'),'document.md':strToU8('# Integration test\n\n![logo](assets/logo.png)'),'assets/logo.png':fs.readFileSync(path.join(root,'public/logo.png'))})
const host = `<!doctype html><html lang="fr"><body><script src="/fixture.js"></script><script src="/editor.js"></script></body></html>`
const fixtureScript = `const state={conversation:'test',project:'test',data:{plugins:[{id:'cymd',enabled:true}]},files:new Set()};async function action(){return {name:'test.cymd',url:'/media/test'}};async function refresh(){};`
let saved
const server = http.createServer(async (req,res)=>{
  const pathname = new URL(req.url,'http://localhost').pathname
  if(pathname==='/api/upload'){
    const chunks=[];for await(const chunk of req)chunks.push(chunk);saved=Buffer.concat(chunks)
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({id:'saved',name:'test.cymd'}));return
  }
  if(pathname==='/'){res.setHeader('Content-Type','text/html');res.end(host);return}
  if(pathname==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(fixtureScript);return}
  if(pathname==='/editor.js'){res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(path.join(__dirname,'cyai/cymd-editor.js')));return}
  if(pathname==='/media/test'){res.end(fixture);return}
  const file=path.join(root,'release/plugin',pathname.replace(/^\/cymd\//,'')||'index.html')
  if(!pathname.startsWith('/cymd/')||!fs.existsSync(file)){res.statusCode=404;res.end();return}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream')
  res.end(fs.readFileSync(file))
})
app.setPath('userData',path.join(root,'output/plugin-smoke-profile'))
const timer=setTimeout(()=>app.exit(2),30000)
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))
app.whenReady().then(async()=>{
 try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const win=new BrowserWindow({show:false,width:1200,height:850,webPreferences:{contextIsolation:true,sandbox:true}})
  await win.loadURL('http://127.0.0.1:'+server.address().port)
  await win.webContents.executeJavaScript('openCymdEditor("test")')
  let frame
  for(let i=0;i<60;i++){
   frame=win.webContents.mainFrame.frames[0]
   if(frame&&await frame.executeJavaScript('Boolean(document.querySelector(".cm-content")?.textContent.includes("Integration test"))'))break
   await wait(100)
  }
  assert.ok(frame)
  assert.ok(await frame.executeJavaScript('document.querySelector(".cm-content").textContent.includes("Integration test")'))
  await frame.executeJavaScript('document.querySelector(".cm-content").focus()')
  win.webContents.insertText('Edited through embedded CyMD ')
  await wait(150)
  await win.webContents.executeJavaScript('document.querySelector(".cymd-save").click()')
  for(let i=0;i<60&&!saved;i++)await wait(100)
  assert.ok(saved)
  const archive=unzipSync(saved)
  assert.ok(strFromU8(archive['document.md']).includes('Edited through embedded CyMD'))
  assert.deepEqual(Buffer.from(archive['assets/logo.png']),fs.readFileSync(path.join(root,'public/logo.png')))
  fs.writeFileSync(path.join(root,'output/plugin-smoke-result.json'),JSON.stringify({ok:true,edited:true,imagePreserved:true}))
  clearTimeout(timer);server.close();win.destroy();app.exit(0)
 }catch(error){fs.writeFileSync(path.join(root,'output/plugin-smoke-result.json'),JSON.stringify({error:String(error.stack)}));app.exit(1)}
})

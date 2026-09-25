const { test } = require('node:test')
const assert = require('node:assert/strict')

test('embedded bridge checks sender, session and save acknowledgement', async () => {
  const original = new Map(['window','document','location','localStorage'].map(key => [key,Object.getOwnPropertyDescriptor(globalThis,key)]))
  const sent=[];let receive
  const parent={postMessage:(message,origin)=>sent.push({message,origin})}
  globalThis.window={parent,addEventListener:(name,cb)=>{if(name==='message')receive=cb},dispatchEvent(){}}
  globalThis.document={documentElement:{lang:'fr'}}
  globalThis.location={search:'?integration=1&parentOrigin=https%3A%2F%2Fhost.test&session=test-session'}
  globalThis.localStorage={getItem(){return 'fr'},setItem(){}}
  const { createServer }=await import('vite')
  const server=await createServer({server:{middlewareMode:true,hmr:false}})
  try {
    const { createEmbeddedPlatform }=await server.ssrLoadModule('/src/platform/embedded.ts')
    const platform=createEmbeddedPlatform();assert.ok(platform.embedded)
    let opened=[];platform.onLoad(file=>opened.push(file));platform.ready()
    assert.equal(sent.at(-1).message.type,'ready');assert.equal(sent.at(-1).origin,'https://host.test')
    const message={protocol:'cymd.integration',version:1,session:'test-session',source:'host',type:'open',name:'example.md',file:new Blob(['# Example'])}
    await receive({origin:'https://evil.test',source:parent,data:message})
    await receive({origin:'https://host.test',source:{},data:message})
    await receive({origin:'https://host.test',source:parent,data:{...message,session:'wrong'}})
    assert.equal(opened.length,0)
    await receive({origin:'https://host.test',source:parent,data:message})
    await receive({origin:'https://host.test',source:parent,data:message})
    assert.equal(opened.length,1);assert.equal(new TextDecoder().decode(opened[0].data),'# Example')
    let completed=false
    const saved=platform.write({name:'example.md',path:null,handle:opened[0].handle},new TextEncoder().encode('updated')).then(()=>{completed=true})
    const request=sent.at(-1).message
    assert.equal(request.type,'save');assert.equal(completed,false)
    await receive({origin:'https://host.test',source:parent,data:{...message,type:'save-result',requestId:request.requestId,ok:true}})
    await saved;assert.equal(completed,true)
    const failed=platform.write({name:'example.md',path:null,handle:opened[0].handle},new Uint8Array([1]))
    const rejected=assert.rejects(failed,/Disk full/)
    await receive({origin:'https://host.test',source:parent,data:{...message,type:'save-result',requestId:sent.at(-1).message.requestId,ok:false,error:'Disk full'}})
    await rejected
    globalThis.location.search='?integration=1&parentOrigin=*&session=x';assert.equal(createEmbeddedPlatform(),null)
  } finally {
    await server.close()
    for(const [key,descriptor] of original){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]}
  }
})

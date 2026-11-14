const CACHE='recoverymap-v1';
self.addEventListener('install',event=>{event.waitUntil((async()=>{const response=await fetch('/');if(!response.ok)throw Error('App shell unavailable');const html=await response.text();const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(m=>m[1]);await (await caches.open(CACHE)).addAll([...new Set(['/',...assets])]);self.skipWaiting();})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('recoverymap-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    // Content-hashed bundles and bundled research files do not need a network round trip.
    if(event.request.mode!=='navigate'&&new URL(event.request.url).pathname!=='/offline-manifest.json'&&cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok){
        const cache=await caches.open(CACHE);
        await cache.put(event.request,response.clone());
        return response;
      }
      // Local/offline proxies may report a failed connection as an HTTP error.
      if(cached)return cached;
      if(event.request.mode==='navigate')return (await caches.match('/'))||response;
      return response;
    }catch{
      if(cached)return cached;
      if(event.request.mode==='navigate')return (await caches.match('/'))||Response.error();
      return Response.error();
    }
  })());
});

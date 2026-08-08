/* 周计划表 — Service Worker，实现离线可用 */
const CACHE='weekly-planner-v1';
const ASSETS=['./','./index.html','./manifest.json'];

// 安装：预缓存核心文件
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

// 激活：清理旧缓存
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

// 请求：缓存优先，回退网络（离线也能开）
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(resp=>{
      // 顺便把新请求到的同源资源存进缓存
      if(resp.ok && e.request.url.startsWith(self.location.origin)){
        const clone=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
      }
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});

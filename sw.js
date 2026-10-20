// Service Worker: เก็บไฟล์หน้าห่อไว้ในเครื่อง เพื่อให้เปิดแอปได้เร็ว
// เวลาแก้ไฟล์ใน GitHub ให้เปลี่ยนเลขเวอร์ชันนี้ (เช่น v2) เพื่อให้มือถือโหลดไฟล์ใหม่
const CACHE = 'insthink-shell-v6';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './config.js',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // ไม่ยุ่งกับ Google

  // ใช้ไฟล์ใหม่จากเน็ตก่อนเสมอ (ลิงก์/การแก้ไขมีผลทันที) ถ้าออฟไลน์ค่อยใช้ของในเครื่อง
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request.mode === 'navigate' ? './index.html' : e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request.mode === 'navigate' ? './index.html' : e.request))
  );
});

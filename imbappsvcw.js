/* imbapp caching service worker for offline */
const curcache = "v3";
const addResourcesToCache = async (resources) => {
  const cache = await caches.open(curcache);
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/imbraw2dng/imbapp.htm",
      "/imbraw2dng/imbapp.json",
      "/imbraw2dng/imbappsvcw.js"
    ]),
  );
});

self.addEventListener("fetch", async (event) => {
  if (event.request.url.indexOf('imbapp.htm') !== -1
  	  && event.request.url.indexOf('imbapp.json') !== -1
  	  && event.request.url.indexOf('imbappsvcw.js') !== -1) {
	 event.respondWith(
		(async function () {
		  try {
			return await fetch(event.request);
		  } catch (err) {
			return caches.match(event.request);
		  }
		})(),
	  );
  }
  else return true;
});

const deleteCache = async (key) => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const cacheKeepList = [curcache];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOldCaches());
});
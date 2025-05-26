/* imbapp caching service worker for offline */
const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v0");
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/imbappx.htm",
      "/imbappx.json",
      "/imbappsvcwx.js"
    ]),
  );
});

self.addEventListener("fetch", async (event) => {
  if (event.request.url.indexOf('imbappx.htm') !== -1 
  	  && event.request.url.indexOf('imbappx.json') !== -1
  	  && event.request.url.indexOf('imbappsvcwx.js') !== -1) {
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
  const cacheKeepList = ["v0"];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOldCaches());
});
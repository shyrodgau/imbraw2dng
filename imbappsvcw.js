/* imbapp caching service worker for offline */
const curcache = "vD"; // next 1
const addResourcesToCache = async (resources) => {
  const cache = await caches.open(curcache);
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "imbapp.htm",
      "imbapp.json",
      "imbappsvcw.js",
      "LICENSE.txt",
      "HISTORY.txt",
      "README",
      "README_ja",
      "README_de"
    ]),
  );
});

self.addEventListener("fetch", async (event) => {
  if (event.request.url.indexOf('imbapp.htm') !== -1
  	  || event.request.url.indexOf('imbapp_ja.htm') !== -1
  	  || event.request.url.indexOf('imbapp_en.htm') !== -1
  	  || event.request.url.indexOf('imbapp_de.htm') !== -1
  	  || event.request.url.indexOf('imbapp.json') !== -1
  	  || event.request.url.indexOf('LICENSE.txt') !== -1
  	  || event.request.url.indexOf('README') !== -1
  	  || event.request.url.indexOf('README_ja') !== -1
  	  || event.request.url.indexOf('README_de') !== -1
  	  || event.request.url.indexOf('HISTORY.txt') !== -1
	  || event.request.url.indexOf('imbappsvcw.js') !== -1) {
	 event.respondWith(
		(async function () {
		  try {
		  	const u = event.request.url;
		  	const resp = await fetch(u);
		  	const tees = resp.body.tee();
            const newResponse = new Response(tees[0], {
                status: resp.status,
                statusText: resp.statusText,
                headers: resp.headers,
                url: u
            });
            const responseToCache = new Response(tees[1], {
                status: resp.status,
                statusText: resp.statusText,
                headers: resp.headers,
                url: u
            });
            const ca = await caches.open(curcache);
	  		ca.put(u, responseToCache);
			return newResponse;
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
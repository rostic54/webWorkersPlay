const staticCacheName = 'site-static-51';
const dynamicCache = 'site-Dynamic-1';

// list of urls for which need to cache data
const assets = [
    '.',
    './index.html',
    './index.html?_ijt=qu3agnkvru7h3nv5o5anmq6h1c',
    './styles/styles.css',
    './scripts/script.js',
    './scripts/classes/Animal.js',
    './scripts/classes/Cat-container.js',
    './scripts/classes/Comparator.js',
    './scripts/classes/Distributor.js',
    './scripts/classes/Dog-container.js',
    './scripts/classes/Motion-controller.js',
    './scripts/classes/Presentation.js',
    './scripts/classes/Camera-manager.js',
    './scripts/classes/Tool.js',
    './scripts/classes/DB.js',
    './scripts/classes/Hints-manager.js',
    './scripts/classes/factories/Animal-factory.js',
    './scripts/classes/factories/Presentation-factory.js',
    './scripts/services/Http.service.js',
    './scripts/services/service-worker-helper.service.js',
    './scripts/services/store.service.js',
    './scripts/workers/worker.js',
    './scripts/workers/worker-api-helper.js',
    './scripts/workers/Worker-helper.js',
    './models/animal-details.js',
    './enum/animal-type.js',
    './enum/containers-id.js',
    './enum/game-events.js',
    './enum/image-classes.js',
    './enum/indexeddb-tables-name.js',
    './img/cat.png',
    './img/dog.jpg',
    './img/trash.svg',
    './img/camera.svg',
    './img/upload.svg',
    './img/favicon.ico',
    './img/default-cat.jpg',
    './img/default-dog.jpg',
    './img/icons/icon-72x72.png',
    './img/icons/icon-96x96.png',
    './img/icons/icon-128x128.png',
    './img/icons/icon-144x144.png',
    './img/icons/icon-152x152.png',
    './img/icons/icon-192x192.png',
    './img/icons/icon-384x384.png',
    './img/icons/icon-512x512.png',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100;400;700&display=swap'
]

self.addEventListener('install', evt => {
    console.log(evt)
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            cache.addAll(assets).then(res => {
                self.skipWaiting();
                console.log('All info were added to cache', res)
            });
        })
    );
})

self.addEventListener('activate', evt => {
    // console.log('SW has been activated')
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCache)
                .map(key => caches.delete(key)))
        })
    )
})

self.addEventListener('fetch', (evt) => {
    if( evt.request.url.indexOf('firestore.google.com') === -1) {
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request)
            }).catch(() => {
                console.log('Wrong URL');
                // window.DB.disableNetwork()
                //     .then(function() {
                //         console.log('FIRBASE IS OFF!!')
                //         // Do offline reading queries
                //         // ...
                //     });
            })
            // FOR DYNAMIC SITE IF IT HAS SEVERAL PAGES
            // caches.match(evt.request).then(cacheRes => {
            //         return cacheRes || fetch(evt.request).then(fetchRes => {
            //             return cache.open(dynamicCache).then(cache => {
            //                 cache.put(evt.request.url, fetchRes.clone());
            //                 return fetchRes
            //             })
            //         });
            //     })
        )
    }
})

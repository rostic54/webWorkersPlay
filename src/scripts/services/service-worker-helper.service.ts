if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then((res) => console.log('server worker is registered', res))
    .catch((err) => console.log('server worker is not registered', err))
}

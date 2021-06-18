const ctx: Worker = self as any;
ctx.addEventListener('message', (e) => {
    const workerHelper = new Worker('worker-api-helper.js',{ type: "module" });
    workerHelper.postMessage(e.data);
    console.log('worker:', e.data);
    workerHelper.onmessage = function (e) {
        ctx.postMessage(e.data);
    }
})


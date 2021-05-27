import {HttpService} from "../services/Http.service.js";

const ctxHelper: Worker = self as any;

 function getPetPicture(): Promise<any> {
    return HttpService.getInstance().getRandomAnimal()
}

ctxHelper.addEventListener('message', (e) => {
    getPetPicture().then(([d]) => {
        ctxHelper.postMessage({...d, ...{animalType: null}});
    });
})

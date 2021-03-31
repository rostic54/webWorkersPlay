// import {AnimalType} from "../../enum/animal-type.js";

const ctxHelper: Worker = self as any;
const animalUrls = [
    {
        type: 'cat',
        url: 'https://api.thecatapi.com/v1/images/search?limit=1&size=full'
    },
    {
        type: 'dog',
        url: 'https://api.thedogapi.com/v1/images/search?limit=1&size=full'
    }
]


 function getPetPicture(typeOfAnimal) {
    const randomAnimal = Math.random() > .5 ? 1 : 0;
    return fetch(animalUrls[randomAnimal].url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': '724b0a85-a654-4937-a37a-3b8d2b698ca7',
        },
    }).then(film => film.json())
    // return await film.json();
}


ctxHelper.addEventListener('message', (e) => {
    getPetPicture(e.data).then(([d]) => {
        // console.log(d)
        // const animalInfo: = {
        //     url: d.url,
        //     w: d.width,
        //     h: d.height,
        //     animalType: AnimalType.CAT
        // };
        ctxHelper.postMessage({...d, ...{animalType: 0}});
    });
})

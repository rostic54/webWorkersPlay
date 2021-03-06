
import {AnimalModel} from "../../interfaces/animal-response.interface";

import IAnimalDetail = AnimalModel.IAnimalDetail;
import {AnimalFactory} from "../classes/factories/Animal-factory.js";
import IAnimalFactory = AnimalModel.IAnimalFactory;

export class WorkerHelper {
  constructor() {
  }

  getAnimal(localCounter) {

    const worker = new Worker('scripts/workers/worker.js',{ type: "module" });

    worker.postMessage(localCounter)
    return new Promise ((res, rej) => {
      worker.onmessage = ({data}: {data: IAnimalDetail}) => {
        const animalFact: IAnimalFactory = new AnimalFactory(data);
        res(animalFact.getCreatedAnimalEntity());
      }
    })
  }
}

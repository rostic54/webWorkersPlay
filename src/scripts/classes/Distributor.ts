import {Animal} from "./Animal";
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;

export class Distributor {
  private static instance: Distributor;
  private static storeElem: Element;
  private storeAnimalEntities: IAnimal[] = [];
  private draggableElement
  private removeFunctionRef;

  private constructor() {
  }

  static getInstance(): Distributor {
    if(!Distributor.instance) {
      Distributor.instance = new Distributor();
      Distributor.storeElem = document.getElementsByClassName('distributor')[0];
    }
    return Distributor.instance;
  }

  public addNewEntity(animal: Animal): void {
    Distributor.storeElem.append(animal.animalImg);
    this.storeAnimalEntities.push(animal);
  }

  public pickUpAnimal(id: string): IAnimal {
    const ind = this.storeAnimalEntities.findIndex((ent: IAnimal) => ent.id === id);
    return this.storeAnimalEntities.splice(ind, 1)[0];
  }


}


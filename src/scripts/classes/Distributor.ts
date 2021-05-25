import {Animal} from "./Animal";
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;

export class Distributor {
  private static instance: Distributor;
  private static storeElem: Element;
  private storeAnimalEntities: IAnimal[] = [];

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

  public clearStore(): void {
    this.storeAnimalEntities.forEach((animal: IAnimal) => animal.removeAllListeners());
    Distributor.storeElem.querySelectorAll("img").forEach((img: HTMLImageElement) => img.remove());
    this.storeAnimalEntities.length = 0;
  }

  public pickUpAnimal(id: string): IAnimal {
    const ind = this.storeAnimalEntities.findIndex((ent: IAnimal) => ent.id === id);
    return this.storeAnimalEntities.splice(ind, 1)[0];
  }
}


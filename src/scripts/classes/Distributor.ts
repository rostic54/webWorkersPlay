import {Animal} from "./Animal";
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;

export class Distributor {
  private storeElem: Element;
  private storeAnimalEntities: IAnimal[] = [];
  private draggableElement
  private removeFunctionRef;

  constructor() {
    this.storeElem = document.getElementsByClassName('distributor')[0];
  }

  public addNewElement(animal: Animal): void {
    this.storeElem.append(animal.animalImg);
    this.storeAnimalEntities.push(animal);
  }

  public addOutListener(img: Element): void {
    const el = this.storeAnimalEntities.find((an: IAnimal) => an.animalImg === img)
    this.draggableElement = el;
    this.removeFunctionRef = this.removeElement();
    this.storeElem.addEventListener('pointerout', this.removeFunctionRef);
  }

  public removeOutListener() {
    if (this.draggableElement.animalImg !== null) {
      this.storeElem.removeEventListener('pointerout', this.removeFunctionRef);
      this.returnToStore();
    }
  }

  private removeElement() {
    document.body.append(this.draggableElement.animalImg);
  }

  private returnToStore() {
      this.storeElem.append(this.draggableElement.animalImg);
      console.log(this.draggableElement);
      // this.draggableElement = null;
  }
}


import {Animal} from "./Animal";
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;

export class Distributor {
  private static instance: Distributor;
  private static storeElem: Element;
  private storeAnimalEntities: IAnimal[] = [];
  private static childElementObserver: MutationObserver;
  private static mutationListeners: Function[] = [];

  private static config = {
    attributes: false,
    childList: true,
    subtree: false
  };

  private constructor() {
  }

  static getInstance(childrenListener?): Distributor {
    if(!Distributor.instance) {
      Distributor.instance = new Distributor();
      Distributor.storeElem = document.getElementsByClassName('distributor')[0];
      Distributor.childElementObserver = new MutationObserver(Distributor.instance.sendToAllListeners);
      Distributor.childElementObserver.observe(Distributor.storeElem, Distributor.config);
    }
    if(childrenListener) {
      Distributor.mutationListeners.push(childrenListener)
    }
    return Distributor.instance;
  }

  static childCounter(mutRec) {

  }

  private sendToAllListeners(mutRec): void {
    if(Distributor.mutationListeners.length > 0) {
      Distributor.mutationListeners.forEach( listener => listener(mutRec))
    }
  }

  public cleanDistributorContainer(className): void {
    Distributor.storeElem?.querySelector(className)?.remove();
    Distributor.storeElem?.classList.remove('empty');
  }

  public insertAddIcon(): void {
    const span = document.createElement('span');
    span.classList.add('plus-icon');
    span.textContent = '+';
    Distributor.storeElem?.append(span);
    Distributor.storeElem?.classList.add('empty');
  }

  public insertLoaderIcon(): void {
    const icon = new Image();
    icon.setAttribute('src', './img/loader.gif');
    icon.setAttribute('class', 'loader');
    this.cleanDistributorContainer('.plus-icon');
    Distributor.storeElem?.append(icon);
    Distributor.storeElem?.classList.add('empty');
  }

  public getDistributorElement(): Element {
    return Distributor.storeElem;
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


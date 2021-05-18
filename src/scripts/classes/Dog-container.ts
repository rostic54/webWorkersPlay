import {AnimalType} from "../../enum/animal-type.js";
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;
import {Distributor} from "./Distributor.js";
import {ContainersId} from "../../enum/containers-id.js";
import {main} from "../script.js";
import {CatContainer} from "./Cat-container.js";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import {AnimalFactory} from "./factories/Animal-factory.js";

export class DogContainer {
  private static instance: DogContainer;
  private containerType = AnimalType.DOG;
  public storeAnimalEntities: IAnimal[] = [];
  private dogsBoxElement: HTMLElement | null;
  private containerObserver;
  private config = {
    attributes: false,
    childList: true,
    subtree: false
  };

  private constructor() {
    this.dogsBoxElement = document.getElementById(ContainersId.DOG);
    this.containerObserver = new MutationObserver(this.addAnimal.bind(this));
    this.containerObserver.observe(this.dogsBoxElement, this.config);
    this.getDogsFromStore();
  }

  public static getInstance(): DogContainer {
    if (!DogContainer.instance) {
      DogContainer.instance = new DogContainer();
    }
    return DogContainer.instance
  }

  public addAnimal(mutRec): void {
    const record = mutRec[0];
    console.log(record.addedNodes[0])
    console.log(record.addedNodes[0]?.getAttribute('class'))
    // if ((record.addedNodes.length === 0 || record.addedNodes[0]?.getAttribute('class') === 'temporary') && record.addedNodes[0]?.nodeName === 'SPAN') {
    if (record.addedNodes.length === 0 || record.addedNodes[0]?.getAttribute('class') !== 'img-wrap') {
      return;
    }
    const img = record.addedNodes[0].querySelector('img');
    const lastLocationId = img.getAttribute('data-from');
    if (record.addedNodes.length > 0 && lastLocationId && lastLocationId !== ContainersId.DOG) {
      let comeFromInstance: Distributor | CatContainer | DogContainer;
      switch (lastLocationId) {
        case ContainersId.CAT:
          comeFromInstance = main.catsContainer;
          break;
        case ContainersId.DOG:
          return;
        default :
          comeFromInstance = main.distributor;
      }
      const insertedElement = comeFromInstance.pickUpAnimal(img.id);
      this.setIdOfContainer(insertedElement.animalImg);
      insertedElement.setAnimalContainerType(this.containerType);
      this.storeAnimalEntities.push(insertedElement);
      this.sendToDb(insertedElement);
    }
    main.checkBtnCondition();
  }

  public pickUpAnimal(id: string) {
    const ind = this.storeAnimalEntities.findIndex((ent: IAnimal) => ent.id === id);
    return this.storeAnimalEntities.splice(ind, 1)[0];
  }

  public getDogsFromStore() {
    main.getAnimalsByContainerType(this.containerType)
      .then((data: IAnimalDetail[]) => {
        this.storeAnimalEntities = data.map((anDetail: IAnimalDetail) => new AnimalFactory(anDetail).getCreatedAnimalEntity());
        this.storeAnimalEntities.forEach((animal: IAnimal) => {
          main.elementImg(animal);
          this.setIdOfContainer(animal.animalImg);
          this.addAnimalToContainer(animal.animalImg);
        })
      })
  }

  public clearContainer() {
    this.storeAnimalEntities.length = 0;
    const children = this.dogsBoxElement?.querySelectorAll('.img-wrap');
    children?.forEach(child => this.dogsBoxElement?.removeChild(child));
  }

  private setIdOfContainer(img: HTMLImageElement) {
    img.setAttribute('data-from', ContainersId.DOG);
  }

  private sendToDb(animal: IAnimal) {
    main.addAnimalToDB(animal.animalInfo);
  }

  private addAnimalToContainer(img: HTMLImageElement): void {
    const wrap = document.createElement('span');
    wrap.classList.add('img-wrap');
    wrap.append(img);
    this.dogsBoxElement?.append(wrap);
  }

  private removeActiveClass(record: MutationRecord): void {
    // mutRecord[0].target.classList.remove('active');

  }

  private animalOverHandler(ev): void {
  }
}

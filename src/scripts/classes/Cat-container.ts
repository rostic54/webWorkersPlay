import {AnimalType} from "../../enum/animal-type.js";
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;
import {Distributor} from "./Distributor.js";
import {ContainersId} from "../../enum/containers-id.js";
import {DogContainer} from "./Dog-container.js";
import {main} from "../script.js";
import {AnimalFactory} from "./factories/Animal-factory.js";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import {ImageClasses} from "../../enum/image-classes.js";

export class CatContainer {
  private static instance: CatContainer;
  private readonly catsBoxElement: HTMLDivElement;
  private readonly distributor: Distributor;
  private containerType = AnimalType.CAT;
  private containerObserver: MutationObserver;
  private config = {
    attributes: false,
    childList: true,
    subtree: false
  };
  public storeAnimalEntities: IAnimal[] = [];

  private constructor() {
    this.distributor = Distributor.getInstance();
    this.catsBoxElement = document.getElementById(ContainersId.CAT) as HTMLDivElement;
    this.containerObserver = new MutationObserver(this.addAnimal.bind(this));
    this.containerObserver.observe(this.catsBoxElement, this.config);
    this.getCatsFromStore();
  }

  public static getInstance(): CatContainer {
    if (!CatContainer.instance) {
      CatContainer.instance = new CatContainer();
    }
    return CatContainer.instance
  }

  public addAnimal(mutRec): void {
    const record = mutRec[0];
    if(record.addedNodes.length === 0 || record.addedNodes[0]?.getAttribute('class') !== 'img-wrap') {
      return;
    }
    const img = record.addedNodes[0].querySelector('img');
    const lastLocationId = img.getAttribute('data-from');
    if (record.addedNodes.length > 0 && lastLocationId && lastLocationId !== ContainersId.CAT) {
      let comeFromInstance: Distributor | CatContainer | DogContainer;
      switch (lastLocationId) {
        case ContainersId.CAT:
          return;
        case ContainersId.DOG:
          comeFromInstance = main.dogsContainer;
          break;
        default :
          comeFromInstance = this.distributor;
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

  public getCatsFromStore() {
    main.getAnimalsByContainerType(this.containerType)
      // .then((data: IAnimalDetail[]) => data.map(animal => ))
      .then((data: IAnimalDetail[]) => {
        this.storeAnimalEntities = data.map((anDetail: IAnimalDetail) => new AnimalFactory(anDetail).getCreatedAnimalEntity());
        this.storeAnimalEntities.forEach((animal: IAnimal) => {
          main.elementImg(animal)
            .then(_ => {
              this.setIdOfContainer(animal.animalImg);
              this.addAnimalToContainer(animal.animalImg);
            });
        })
      })
  }

  public clearContainer() {
    this.storeAnimalEntities.length = 0;
    const children = this.catsBoxElement?.querySelectorAll('.img-wrap');
    children?.forEach(child => this.catsBoxElement?.removeChild(child));
  }

  private setIdOfContainer(img: HTMLImageElement) {
    img.setAttribute('data-from', ContainersId.CAT);
  }


  private sendToDb(animal: IAnimal) {
    main.addAnimalToDB(animal.animalInfo);
  }

  private addAnimalToContainer(img: HTMLImageElement): void {
    const wrap = document.createElement('span');
    wrap.classList.add(ImageClasses.WRAPPER);
    wrap.append(img);
    this.catsBoxElement?.append(wrap);
  }

  private animalOverHandler(ev): void {
    // console.log(ev);
  }
}

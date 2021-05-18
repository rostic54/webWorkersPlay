import {AnimalModel} from "../../interfaces/animal-response.interface";
import {AnimalType} from "../../enum/animal-type.js";
import {CatContainer} from "./Cat-container.js";
import {DogContainer} from "./Dog-container.js";
import IAnimal = AnimalModel.IAnimal;
import {Tool} from "./tool.js";

interface IResults {
  catMismatch: number,
  dogMismatch: number
}

export class Comparator {
  static instance: Comparator;
  toolBox: Tool;
  catsContainerRef: CatContainer;
  dogsContainerRef: DogContainer;

  private constructor() {
    this.toolBox = Tool.getInstance();
    this.catsContainerRef = CatContainer.getInstance();
    this.dogsContainerRef = DogContainer.getInstance();
  }

  public static getInstance(): Comparator {
    if (!Comparator.instance) {
      Comparator.instance = new Comparator();
    }
    return Comparator.instance
  }

  public showResults() {
    const {catMismatch , dogMismatch} = this.checkResults();
    this.createDialog(catMismatch, dogMismatch);
  }

  public checkResults(): IResults {
    let catMismatch: number = 0;
    let dogMismatch: number = 0;
    if (this.catsContainerRef && this.dogsContainerRef) {
      catMismatch = this.calculateMismatch(this.catsContainerRef.storeAnimalEntities, AnimalType.CAT);
      dogMismatch = this.calculateMismatch(this.dogsContainerRef.storeAnimalEntities, AnimalType.DOG);
    }
    return {
      catMismatch,
      dogMismatch
    }
  }

  private createDialog(catMismatch: number, dogMismatch: number) {
    const popup = document.createElement('div');
    const title = document.createElement("h2");
    title.innerHTML = 'Your result:';
    const listOfResults = document.createElement('div');
    listOfResults.innerHTML =
      `<div class="content">
         <div class="row"><h3>Cats Mismatch:   </h3><span>${catMismatch}</span></div>
         <div class="row"><h3>Dogs Mismatch:   </h3><span>${dogMismatch}</span></div>
       </div>
       <span class="close-icon">X</span>`
    popup.append(title, listOfResults);
    popup.classList.add('popup')
    document.body.appendChild(popup);
    const boxShadow = this.toolBox.blackBoxCreator();
    document.body.appendChild(boxShadow);
    const closeBtn = listOfResults.querySelector('.close-icon');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popup.remove();
        boxShadow.remove();
      })
    }
  }

  private calculateMismatch(animalList: IAnimal[], containerType: AnimalType): number {
    return animalList.filter((animal: IAnimal) => animal.type !== containerType).length
  }
}

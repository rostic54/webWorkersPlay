import {AnimalModel} from "../../interfaces/animal-response.interface";
import {AnimalType} from "../../enum/animal-type.js";
import {CatContainer} from "./Cat-container.js";
import {DogContainer} from "./Dog-container.js";
import IAnimal = AnimalModel.IAnimal;
import {Tool} from "./Tool.js";

interface IResults {
  catMismatch: number,
  dogMismatch: number
}

export class Comparator {
  static instance: Comparator;
  public toolBox: Tool;
  public catsContainerRef: CatContainer;
  public dogsContainerRef: DogContainer;
  public listenerIds: any = [];

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
      catMismatch = this.calculateMismatch(this.catsContainerRef.storeAnimalEntities, AnimalType.CAT).length;
      dogMismatch = this.calculateMismatch(this.dogsContainerRef.storeAnimalEntities, AnimalType.DOG).length;
    }
    return {
      catMismatch,
      dogMismatch
    }
  }

  private createDialog(catMismatch: number, dogMismatch: number) {
    const popup = document.createElement('div');
    const container = document.createElement('div');
    const title = document.createElement("h2");
    const download = document.createElement("button");
    download.setAttribute('id', 'downloadResult');
    download.innerHTML = 'Download result';
    title.classList.add('title');
    title.innerHTML = 'Your result:';
    const listOfResults = document.createElement('div');
    listOfResults.innerHTML =
      `<div class="content">
         <div class="row"><p class="label">Cats Mismatch:   </p><span>${catMismatch}</span></div>
         <div class="row"><p class="label">Dogs Mismatch:   </p><span>${dogMismatch}</span></div>
       </div>
       <span class="close-icon">X</span>`
    container.append(title, listOfResults, download);
    container.classList.add('container');
    popup.append(container);
    popup.classList.add('popup')
    document.body.appendChild(popup);
    const boxShadow = this.toolBox.blackBoxCreator();
    document.body.appendChild(boxShadow);
    const closeBtn = listOfResults.querySelector('.close-icon');
    const downloadBtn = popup.querySelector('#downloadResult')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popup.remove();
        boxShadow.remove();
      })
    }

    if(downloadBtn) {
      this.listenerIds.push(downloadBtn.addEventListener('click', () => {
        const resultData = `
         Total Scores of Mismatches:
         Cats container: ${catMismatch}
         Dogs container: ${dogMismatch}`;
        this.toolBox.downloadFile( 'animalResults.txt', resultData)
      }));
    }
  }

  private calculateMismatch(animalList: IAnimal[], containerType: AnimalType): IAnimal[] {
    return animalList
      .map((animal: IAnimal) => {
        animal.removeDrugAndDropListener();
        return animal
      })
      .filter((animal: IAnimal) => animal.type !== containerType)
      .map((animal: IAnimal) => animal.setErrorState())
  }
}

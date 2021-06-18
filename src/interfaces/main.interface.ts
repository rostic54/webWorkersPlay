import {AnimalModel} from "./animal-response.interface";
import {PresentationType} from "./presentation.interface";
import IPresentationDetail = PresentationType.IPresentationDetail;
import {CatContainer} from "../scripts/classes/Cat-container.js";
import {DogContainer} from "../scripts/classes/Dog-container.js";
import {Distributor} from "../scripts/classes/Distributor.js";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import {Tool} from "../scripts/classes/Tool.js";


export interface IMain {
  newGameBtn: HTMLElement | null;
  resultsBtn: HTMLElement | null;
  clearBtn: HTMLElement | null;
  downloadResultBtn: HTMLElement | null;
  makeAnimalPhotoBtn: HTMLElement | null;
  catsContainer: CatContainer;
  dogsContainer: DogContainer;
  distributor: Distributor;
  animalsList: IAnimalDetail[];
  listenerIds: any[];
  toolBox: Tool;
}

import {AnimalModel} from "./animal-response.interface";
import {PresentationType} from "./presentation.interface";
import IPresentationDetail = PresentationType.IPresentationDetail;
import {CatContainer} from "../scripts/classes/Cat-container.js";
import {DogContainer} from "../scripts/classes/Dog-container";


export interface IMain {
  getNewAnimalBtn: HTMLElement | null;
  catsContainer: CatContainer;
  dogsContainer: DogContainer;
  listenerIds: any[];
}

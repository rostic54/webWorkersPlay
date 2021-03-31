import {AnimalModel} from "./animal-response.interface";
import {PresentationType} from "./presentation.interface";
import IPresentationDetail = PresentationType.IPresentationDetail;


export interface IMain {
  btn: HTMLElement | null;
  catBox: Element | null;
  listenerIds: any[];
  // catUrlsBox: IPresentationDetail[];
}

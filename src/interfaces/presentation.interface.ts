import {AnimalModel} from "./animal-response.interface";

export namespace PresentationType {
  import BlobStr = AnimalModel.BlobStr;

  export interface IPresentation {
    src: string;
    width: number;
    height: number;
    addListener(img: HTMLImageElement): void;
    addErrorStateObserver(img: HTMLImageElement): void;
    getPresentationDetail(): IPresentationDetail;
    addAnimalUrl(imgDetail: IPresentationDetail): void
  }

  export interface IPresentationDetail {
    src: string;
    stringFormat?: string;
    width: string;
    height: string;
  }

  export interface IPresentationFactory {
    getCreatedEntity(): IPresentation;
  }
}



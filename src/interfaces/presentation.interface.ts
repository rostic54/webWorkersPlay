export namespace PresentationType {
  export interface IPresentation {
    src: string;
    width: number;
    height: number;
    addListener(img): void;
    getPresentationDetail(): IPresentationDetail;
    addAnimalUrl(imgDetail: IPresentationDetail): void
  }

  export interface IPresentationDetail {
    src: string;
    width: string;
    height: string;
  }

  export interface IPresentationFactory {
    getCreatedEntity(): IPresentation;
  }
}



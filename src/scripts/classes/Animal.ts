import {AnimalModel} from "../../interfaces/animal-response.interface";
import {AnimalType} from "../../enum/animal-type";

import IAnimalDetail = AnimalModel.IAnimalDetail;
import {PresentationType} from "../../interfaces/presentation.interface";
import IPresentation = PresentationType.IPresentation;
import IPresentationDetail = PresentationType.IPresentationDetail;
import IAnimal = AnimalModel.IAnimal;
import {MotionController} from "./Motion-controller.js";

export class Animal implements IAnimal {
  readonly presentationDetail: IPresentation;
  readonly animalInfo: IAnimalDetail;
  private animalElement!: HTMLImageElement;
  private motionController: MotionController;

  constructor(data: IAnimalDetail, PresentationEntity: IPresentation) {
    this.animalInfo = data;
    this.presentationDetail = PresentationEntity;
    this.motionController = MotionController.getInstance();
  }

  get type(): AnimalType {
    return this.animalInfo.type
  }

  get id(): string {
    return this.animalInfo.id;
  }

  get animalDetail(): IAnimalDetail {
    return this.animalInfo
  }

  get animalImg(): HTMLImageElement {
    return this.animalElement
  }

  public setAnimalContainerType(type: AnimalType) {
    this.animalInfo.containerType = type;
  }

  public getDetailForImage(): IPresentationDetail {
    return this.presentationDetail.getPresentationDetail()
  }

  public addListener(img: HTMLImageElement): void {
    this.animalElement = img;
    this.presentationDetail.addListener(img);
    this.dragAndDropEvent(img);
  }

  public addAnimalUrl(imageDetail: IPresentationDetail): void {
    this.presentationDetail.addAnimalUrl(imageDetail);
  }

  public dragAndDropEvent(img): void {
    img.addEventListener('pointerdown', (ev) => {
      if (ev.button === 0 && ev.buttons === 1) {
        this.motionController.movingEventListener(ev);
      }
    })
    img.addEventListener('pointerup', (ev) => {
      if (ev.button === 0 && ev.buttons === 0) {
        this.motionController.fakePointerupEventEmit();
      }
    })
    img.ondragstart = () => false;
  }

}

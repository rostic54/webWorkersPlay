import {AnimalModel} from "../../interfaces/animal-response.interface";
import {AnimalType} from "../../enum/animal-type";

import IAnimalDetail = AnimalModel.IAnimalDetail;
import {PresentationType} from "../../interfaces/presentation.interface";
import IPresentation = PresentationType.IPresentation;
import IPresentationDetail = PresentationType.IPresentationDetail;
import IAnimal = AnimalModel.IAnimal;
import {main} from "../script.js";

export class Animal implements IAnimal{
  readonly animalInfo: IAnimalDetail;
  readonly presentationDetail: IPresentation;
  private animalElement!: HTMLImageElement;
  private moveImgRef;
  private isOutOfStoreListenerAttached: boolean = false;
  private outOfWindowListenerRef;


  constructor(data: IAnimalDetail, PresentationEntity: IPresentation) {
    this.animalInfo = data;
    this.presentationDetail = PresentationEntity;
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

  public getDetailForImage(): IPresentationDetail {
    return this.presentationDetail.getPresentationDetail()
  }

  public addListener(img): void {
    this.animalElement = img;
    this.presentationDetail.addListener(img);
    this.dragAndDropEvent(img);
  }

  public addAnimalUrl(imageDetail: IPresentationDetail): void {
    this.presentationDetail.addAnimalUrl(imageDetail);
  }

  public dragAndDropEvent(img): void {
    img.addEventListener('pointerdown', (ev) => {
      this.movingEventListener();
      this.windowOutListener();
    })
    img.addEventListener('pointerup', () => {
      this.fakePointerupEventEmit();
      })
    img.ondragstart = () => false;
  }

  private movingEventListener(): void {
    this.moveImgRef = this.moveImg.bind(this);
    window.addEventListener('pointermove', this.moveImgRef)
  }

  private windowOutListener() {
    this.outOfWindowListenerRef = this.fakePointerupEventEmit.bind(this);
    document.addEventListener('pointerleave',  this.outOfWindowListenerRef)
  }

  private moveImg(ev) {
    // console.log(ev.target);
    if(!this.isOutOfStoreListenerAttached) {
      main.distributor.addOutListener(this.animalElement!);
    }
    this.isOutOfStoreListenerAttached = true;
    if (this.animalElement) {
      this.animalElement.hidden = true;
      let elemBelow = document.elementFromPoint(ev.clientX, ev.clientY);
      this.animalElement.hidden = false;
      // console.log(elemBelow);
      Object.assign(
        this.animalElement.style,
        {
          position: 'absolute',
          left: `${ev.pageX - this.animalElement.offsetHeight / 2}px`,
          top: `${ev.pageY - this.animalElement.offsetWidth / 2}px`
        }
      )
    }
  }

  private fakePointerupEventEmit() {
    window.removeEventListener('pointermove', this.moveImgRef);
    this.isOutOfStoreListenerAttached = false;
    if(this.animalElement) {
      this.animalElement.style.position = 'static';
      main.distributor.removeOutListener();
    }
    document.removeEventListener('pointerleave', this.outOfWindowListenerRef);
  }

}

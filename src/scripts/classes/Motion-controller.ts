import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;
import {ContainersId} from "../../enum/containers-id.js";
import {IHistoryStorageInterface} from "../../interfaces/history-storage.interface";

const bornTime: IHistoryStorageInterface = {
  containerId: ContainersId.DISTRIBUTOR,
  timeStamp: ''
}

export class MotionController {
  static instance: MotionController;
  private draggableImg: IAnimal | null = null;
  private isOutOfStoreListenerAttached: boolean = false;
  private containerForInserting: Element | null = null;
  private lastHomeContainer!: Element | null;
  private moveImgRef;
  private outOfWindowListenerRef;
  private animalElement!: HTMLImageElement | null;
  private removeFunctionRef;
  private motionHistory = new Map();

  private constructor() {
  }

  public static getInstance(): MotionController {
    if (!MotionController.instance) {
      MotionController.instance = new MotionController();
    }

    return MotionController.instance
  }

  public movingEventListener(ev): void {
    this.animalElement = ev.target;
    const lastLocationId = this.animalElement?.getAttribute('data-from') || ContainersId.DISTRIBUTOR;
    this.lastHomeContainer = document.getElementById(lastLocationId);
    this.moveImgRef = this.moveImg.bind(this);
    this.windowOutListener();
    window.addEventListener('pointermove', this.moveImgRef)
  }

  private addElementMotionHistory(containerToInsert: string): void {
    if (this.animalElement) {
      const existedValue: IHistoryStorageInterface[] = this.motionHistory.get(this.animalElement.id)
        || [{...bornTime, timeStamp: this.animalElement.getAttribute('data-birth')}];
      const historyData: IHistoryStorageInterface[] = [{
        containerId: containerToInsert as ContainersId,
        timeStamp: Date.now().toString()
      }];
      const pathList: IHistoryStorageInterface[] = existedValue.concat(historyData);
      this.motionHistory.set(this.animalElement.id, pathList);
    }
  }

  private windowOutListener() {
    this.outOfWindowListenerRef = this.fakePointerupEventEmit.bind(this);
    document.addEventListener('pointerleave', this.outOfWindowListenerRef)
  }

  private moveImg(ev) {
    this.containerForInserting = this.containersScanner(ev);
    if (ev.button === -1 && ev.buttons === 1) {
      if (!this.isOutOfStoreListenerAttached) {
        this.addContainerOutEventListener();
        this.replaceImgByTemporaryElement();
        this.removeWrapperBeforeMoving();
      }
      this.isOutOfStoreListenerAttached = true;
      if (this.animalElement) {
        this.addActiveMovingClassToImage();
        Object.assign(
          this.animalElement.style,
          {
            position: 'absolute',
            left: `${ev.pageX - this.animalElement.offsetHeight / 2}px`,
            top: `${ev.pageY - this.animalElement.offsetWidth / 2}px`
          }
        )
      }
    } else {
      // unsubscribe from all listeners
      this.fakePointerupEventEmit();
    }
  }

  private containersScanner(ev): Element | null {
    this.animalElement!.hidden = true;
    let elemBelow = document.elementFromPoint(ev.clientX, ev.clientY);
    this.animalElement!.hidden = false;
    const target = elemBelow?.closest('#catsBox') || elemBelow?.closest('#dogsBox');
    if (target) {
      // this.exactInsertingPosition(elemBelow as HTMLElement);
      if (this.containerForInserting === target) {
        this.addActiveClassToContainer();
        this.insertTemporaryToEnd();
      } else {
        this.removeActiveClassFromContainer();
      }
      return target;
    }
    this.removeActiveClassFromContainer();
    this.removeTemporaryFromContainer();
    return null;
  }

  public fakePointerupEventEmit() {
    window.removeEventListener('pointermove', this.moveImgRef);
    if (this.animalElement && this.isOutOfStoreListenerAttached) {
      this.isOutOfStoreListenerAttached = false;
      this.animalElement.style.position = 'static';
      this.containerForInserting = this.containerForInserting === null
        ? this.lastHomeContainer
        : this.containerForInserting;
      this.removeOutListener();
      this.appendTo(this.containerForInserting);
      this.removeActiveClassFromContainer();
      // this.lastHomeContainer = this.containerForInserting;
      this.lastHomeContainer = null;
      this.containerForInserting = null;
    }
    document.removeEventListener('pointerleave', this.outOfWindowListenerRef);
  }

  private addActiveClassToContainer(): void {
    this.containerForInserting?.classList.add('active');
  }

  private removeActiveClassFromContainer(): void {
    this.containerForInserting?.classList.remove('active');
  }

  private addActiveMovingClassToImage(): void {
    this.animalElement?.classList.add('moving')
  }

  private removeActiveMovingClassOfImage(): void {
    this.animalElement?.classList.remove('moving')
  }

  /// listener of document leaving and remove/attache element from initial location

  public addContainerOutEventListener(): void {
    this.removeFunctionRef = this.removeElement();
    this.lastHomeContainer?.addEventListener('pointerout', this.removeFunctionRef);
  }

  public removeOutListener() {
    this.lastHomeContainer?.removeEventListener('pointerout', this.removeFunctionRef);
  }

  private removeElement() {
    if (this.lastHomeContainer && this.lastHomeContainer.children.length === 0) {
      document.body.append(this.animalElement!);
    }
  }

  private replaceImgByTemporaryElement(): void {
    if (this.animalElement) {
      const temporaryElement: HTMLSpanElement = this.createTemporaryElement();
      const wrapper = this.animalElement.closest('.img-wrap');
      this.lastHomeContainer?.append(this.animalElement);
      this.replaceElements(wrapper, temporaryElement);
    }
  }

  private insertTemporaryToEnd(): void {
    if(!this.containerForInserting?.querySelector('.temporary')) {
      const temporaryElement: HTMLSpanElement = this.createTemporaryElement();
      this.containerForInserting?.append(temporaryElement);
    }
  }

  private removeTemporaryFromContainer(): void {
    const temporarySpan = this.containerForInserting?.querySelector('.temporary');
    temporarySpan?.remove();
  }

  private createTemporaryElement(): HTMLSpanElement {
    const temporarySpan = document.createElement('span');
    temporarySpan.classList.add('temporary');
    return temporarySpan
  }

  private appendTo(container) {
    if (this.lastHomeContainer && container.id !== this.lastHomeContainer?.id) {
      this.addElementMotionHistory(container.id);
      this.addLabelFrom(this.lastHomeContainer.id);
    }

    const insertedElement = this.returnInsertedElement();
    const target = container.querySelector('.temporary');

    target ? this.replaceElements(target, insertedElement) : container.append(insertedElement);
    this.removeActiveMovingClassOfImage();
    this.animalElement = null;
  }

  private removeWrapperBeforeMoving(): void {
    const wrap = this.animalElement?.closest('.img-wrap');
    wrap?.remove();
  }

  private returnInsertedElement(): HTMLElement {
    if(this.containerForInserting?.id === ContainersId.DISTRIBUTOR) {
      return this.animalElement!
    }
    const wrap = document.createElement('span');
    wrap.classList.add('img-wrap');
    wrap.append(this.animalElement!);
    return wrap
  }

  private replaceElements(target: Element | null, inserted: HTMLElement): void {
    target?.replaceWith(inserted);
  }

  private exactInsertingPosition(pivotElement: HTMLElement): void {
    console.log('OFFSET:', pivotElement.offsetParent)
  }

  private addLabelFrom(idOfContainer: string): void {
    this.animalElement?.setAttribute('data-from', idOfContainer);
    this.animalElement?.setAttribute('data-birth', Date.now().toString());
  }

}

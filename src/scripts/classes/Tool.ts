import {WorkerHelper} from "../workers/Worker-helper.js";
import {main} from "../script.js";
import {Animal} from "./Animal.js";
import {PresentationType} from "../../interfaces/presentation.interface";
import IPresentationDetail = PresentationType.IPresentationDetail;
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;

class Tool {
  static staticCounter: number = 1;
  static instance: Tool;
  public workerHelper;

  constructor() {
    this.workerHelper = new WorkerHelper();
  }

  public static getInstance(): Tool {
    if (!Tool.instance) {
      Tool.instance = new Tool();
    }

    return Tool.instance
  }

  public putAnimalToDistributorBox(animal: Animal): void {
    this.createAnimalImg(animal);
    main.storeAnimalInDistributor(animal);
  }

  public createAnimalImg(animal: IAnimal): void {
    const imgInfo = animal.getDetailForImage();
    const img = document.createElement("img");
    this.addAnimalUrlToStore(animal, imgInfo);
    img.setAttribute('alt', 'animal-img');
    img.setAttribute('src', imgInfo.src);
    img.setAttribute('w', imgInfo.width);
    img.setAttribute('h', imgInfo.height);
    img.setAttribute('id', animal.id);
    img.setAttribute('data-birth', Date.now().toString())
    animal.addListener(img);
  }

  public requestImage(): void {
    this.workerHelper.getAnimal(Tool.staticCounter)
      .then( img => this.putAnimalToDistributorBox(img));
  }

  public blackBoxCreator(): HTMLDivElement {
    const boxShadowLink = document.createElement('div');
    Object.assign(
      boxShadowLink.style,
      {
        position: 'fixed',
        left: '0',
        top: '0',
        zIndex: '1',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,.4)',
      })

    return boxShadowLink
  }

  public downloadFile(fileName: string, content: string): void {
      let link = document.createElement('a');
      link.download = fileName;
      let blob = new Blob([content], {type: 'type/plain'});
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
  }

  private addAnimalUrlToStore(animal: IAnimal, imgInfo: IPresentationDetail): void {
    animal.addAnimalUrl(imgInfo);
  }

}

export {Tool}

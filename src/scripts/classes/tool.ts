import {WorkerHelper} from "../workers/Worker-helper.js";
import {main} from "../script.js";
import {Animal} from "./Animal.js";
import {PresentationType} from "../../interfaces/presentation.interface";
import IPresentationDetail = PresentationType.IPresentationDetail;
import IPresentation = PresentationType.IPresentation;
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimal = AnimalModel.IAnimal;

class Tool {
  static staticCounter: number = 1;
  public workerHelper;
  // private presentation: IPresentation;

  constructor() {
    this.workerHelper = new WorkerHelper();
  }

  public putAnimalToBox(animal: Animal): void {
    const imgInfo = animal.getDetailForImage();
    const img = document.createElement("img");
    this.addAnimalUrlToStore(animal, imgInfo);
    img.setAttribute('src', imgInfo.src);
    img.setAttribute('w', imgInfo.width);
    img.setAttribute('h', imgInfo.height);
    animal.addListener(img);
    main.attachImgToBox(animal);
    // this.attachPopupListener(img);-
  }

  public requestImage() {
    this.workerHelper.getAnimal(Tool.staticCounter)
      .then( img => this.putAnimalToBox(img));
  }

  private addAnimalUrlToStore(animal: IAnimal, imgInfo: IPresentationDetail): void {
    animal.addAnimalUrl(imgInfo);
  }

}

export {Tool}


import {PresentationType} from "../../../interfaces/presentation.interface";
import IPresentation = PresentationType.IPresentation;
import {Presentation} from "../Presentation.js";
import IPresentationFactory = PresentationType.IPresentationFactory;
import {AnimalModel} from "../../../interfaces/animal-response.interface";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import IPresentationDetail = PresentationType.IPresentationDetail;

export class PresentationFactory implements IPresentationFactory{
  private PresentationEntity!: IPresentation;
  private animalDetail: IAnimalDetail;

  constructor(data: IAnimalDetail) {
    this.animalDetail = data;
    this.PresentationEntity = new Presentation(this.animalDetail);
  }

  getCreatedEntity(): IPresentation {
    return this.PresentationEntity || null
  }

  getPresentationDetail(): IPresentationDetail {
    return this.PresentationEntity.getPresentationDetail()
  }
}

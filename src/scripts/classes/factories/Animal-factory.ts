import {AnimalModel} from "../../../interfaces/animal-response.interface";
import {PresentationType} from "../../../interfaces/presentation.interface";
import {PresentationFactory} from "./Presentation-factory.js";
import {Animal} from "../Animal.js";
import {AnimalType} from "../../../enum/animal-type.js";
import IPresentation = PresentationType.IPresentation;
import IAnimalDetail = AnimalModel.IAnimalDetail;
import IAnimalFactory = AnimalModel.IAnimalFactory;
import IAnimal = AnimalModel.IAnimal;

export class AnimalFactory implements IAnimalFactory{
  public readonly AnimalEntity: IAnimal;
  public PresentationEntity: IPresentation;
  public animalDetail: IAnimalDetail;

  constructor(data: IAnimalDetail) {
    this.animalDetail = data;
    this.animalDetail.type = this.parseUrl(data.url) === -1 ? AnimalType.DOG : AnimalType.CAT;
    this.animalDetail.containerType = data.containerType || AnimalType.DISTRIBUTOR;

    this.PresentationEntity = new PresentationFactory(this.animalDetail).getCreatedEntity();
    this.AnimalEntity = new Animal(this.animalDetail, this.PresentationEntity)
  }

  private parseUrl(urlPath: string) {
    const url = new URL(urlPath);
    return url.hostname.split('.')[1].indexOf('cat')
  }

  public getCreatedAnimalEntity(): IAnimal {
    return this.AnimalEntity;
  }
}

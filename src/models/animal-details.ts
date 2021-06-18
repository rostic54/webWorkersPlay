import {AnimalModel} from "../interfaces/animal-response.interface";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import {AnimalType} from "../enum/animal-type.js";

export class AnimalDetails implements IAnimalDetail {
  breeds = [];
  id = '';
  height = 0;
  url = '';
  width = 0;
  type = -1;
  containerType = AnimalType.NONE;
  stringFormat = '';

  constructor(data) {
    const animalType = AnimalDetails.parseUrl(data.url) === -1 ? AnimalType.DOG : AnimalType.CAT;
    Object.assign(this, {...data, type: animalType});
  }

  static parseUrl(urlPath: string) {
    const url = new URL(urlPath);
    return url.hostname.split('.')[1].indexOf('cat')
  }
}

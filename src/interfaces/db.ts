import {AnimalModel} from "./animal-response.interface";
import IAnimalDetail = AnimalModel.IAnimalDetail;

export interface IDb {
  listenerOfChangesInAnimals(): Promise<IAnimalDetail[]>
}

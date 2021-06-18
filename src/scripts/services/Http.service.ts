import {HttpInterfaces} from "../../interfaces/http.interface";
import IApiDetail = HttpInterfaces.IApiDetail
import {DataBase} from "../classes/DB.js";
import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import {StoreService} from "./store.service.js";
import {IndexeddbTablesName} from "../../enum/indexeddb-tables-name.js";
import {ICreatedAnimalResponseInterface} from "../../interfaces/created-animal-response.interface";

export class HttpService {
  static instance: HttpService;
  private DbInstance: DataBase;
  private StoreService: StoreService

  private animalAPIs: IApiDetail[] = [
    {
      type: 'cat',
      url: 'https://api.thecatapi.com/v1/images',
      headers: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '724b0a85-a654-4937-a37a-3b8d2b698ca7'
        }
      }
    },
    {
      type: 'dog',
      url: 'https://api.thedogapi.com/v1/images',
      headers: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9f4a74e2-aae7-4b0c-9666-486c37e832f2'
        }
      }
    },
  ]


  private constructor() {
    this.DbInstance = DataBase.getInstance();
    this.StoreService = StoreService.getInstance();
  }

  public static getInstance(): HttpService {
    if (!this.instance) {
      this.instance = new HttpService();
    }
    return this.instance;
  }

  public getRandomAnimalAPI(): IApiDetail {
    const randomIndex = Math.random() > .5 ? 1 : 0;
    return this.animalAPIs[randomIndex]
  }

  public getRandomAnimal(getAnimalFromFirestore = false, offlineMode = false): Promise<IAnimalDetail> {
    console.log('NETWORK COND:', navigator.onLine);
    console.log('NETWORK COND PARAM:', offlineMode);
    if (offlineMode || !navigator.onLine) {
      return this.StoreService.getRandomItem();
    }
    if (getAnimalFromFirestore) {
      return this.getRandomAnimalFromFBStore();
    }
    // get an Animal from Cat & Dog public apis and after save new instance to the firestore.
    return fetch(this.getRandomAnimalAPI().url + '/search?limit=1&size=full', this.animalAPIs[0].headers)
      .then(animalDetail => animalDetail.json())
      .then((animalDetail: IAnimalDetail) => {
        this.addNewAnimalToFBStorage(animalDetail);
        return animalDetail
      })
  }

  public getRandomAnimalFromFBStore(): Promise<any> {
    return this.DbInstance.getRandomAnimal()
  }

  public addNewAnimalBlobToFB(name: string, data: string): Promise<boolean> {
    return this.DbInstance.addNewAnimalBlobToOwnFBStorage(name, data)
      .then(res => Promise.resolve(true))
      .catch(err => Promise.resolve(false))
  }

  public sendForValidation(data, typeOfAnimal: string): Promise<Response> {
    const animalInfo = this.animalAPIs.find((api) => api.type === typeOfAnimal);
    const options = {...animalInfo?.headers, body: data, method: 'POST'};
    // @ts-ignore
    delete options.headers['Content-Type'];
    return fetch(animalInfo?.url + '/upload', options);
  }

  public addNewAnimalToFBStorage(animal: IAnimalDetail): Promise<boolean> {
    console.log('Try To store AnimalDetail:', animal);
    return this.DbInstance.addNewAnimalToOwnFBStorage(animal).then(err => {
      if(err) {
        console.log((`Was not added ${animal.id}`))
        return Promise.resolve(false);
      } else {
        console.log((`Was added successfully ${animal.id}`))
        return Promise.resolve(true)
      }
    });
  }

  public addBrandNewAnimalToBothStores(animal: IAnimalDetail): Promise<boolean> {

    return Promise.all([
      this.StoreService.addDataToIndexedDb(animal, IndexeddbTablesName.SOURCE_ANIMAL),
      this.addNewAnimalBlobToFB(animal.id, animal.stringFormat || ''),
      this.addNewAnimalToFBStorage(animal)
    ]).then(([toFBGallery, toIndexed, toFBAnimals]): Promise<boolean> => {
      console.log(`toFBGallery: ${toFBGallery}, toIndexed${toIndexed}, toFBAnimals${toFBAnimals}`);
      return Promise.resolve(toIndexed && toFBGallery && toFBAnimals)
    }).catch(err => {
      console.log('ERROR OF STORING', err);
      return Promise.reject(false);
    })
  }

}

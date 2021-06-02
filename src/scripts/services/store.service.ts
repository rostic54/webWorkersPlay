import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import {AnimalType} from "../../enum/animal-type";

export class StoreService {
  static instance: StoreService
  private openRequest;
  private database;

  private constructor() {
  }

  public static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance
  }

  public isReady(): Promise<any> {
    return new Promise((res, rej) => {
      this.openRequest = indexedDB.open("db", 2);
      this.openRequest.onsuccess = (e) => this.onsuccess(e, res);
      this.openRequest.onupgradeneeded = (e) => this.onupgradeneeded(e);
      this.openRequest.onerror = (e) => {
        console.log('err', e)
        rej(e);
      };
    })
  }

  private onsuccess(ev, response) {
    this.database = ev.target.result;
    response(this.database);
    // console.log(this.db.transaction('animals'), 'readwrite');
  }

  private onupgradeneeded(ev) {
    const db = ev.target.result;

    if (!db.objectStoreNames.contains('animals')) {
      const animalDB = db.createObjectStore('animals', {keyPath: 'id'});
      animalDB.createIndex('type', 'type', {unique: false})
      animalDB.createIndex('containerType', 'containerType', {unique: false})
    }
    if (!db.objectStoreNames.contains('sourceAnimals')) {
      const animalDB = db.createObjectStore('sourceAnimals', {keyPath: 'id'});
      animalDB.createIndex('type', 'type', {unique: false})
      // animalDB.createIndex('animalType', 'animalType', {unique: false})
    }
  }

  // TODO: USE FOR STORE IN BOTH TABLES
  public addDataToDb(animal: IAnimalDetail, tableName) {
    if (this.database) {
      let transAct = this.database.transaction(tableName, 'readwrite');
      // let transAct = this.openRequest.result.transaction('animals', 'readwrite');
      let animalTx = transAct.objectStore(tableName);
      let request = animalTx.put(animal);
      request.onsuccess = (e) => console.log('Was added to DB');
      request.onerror = (err) => console.log('ERROR IN ADD operation:', err)
      transAct.oncomplete = (e) => {
        console.log('transaction finished!', e);
        // this.getAll();
      }
    }
  }

  public getAllAnimals(): Promise<IAnimalDetail[]> {
    if (this.database) {
      let transAct = this.database.transaction('animals', 'readonly');
      let animals = transAct.objectStore('animals');
      const allRequest = animals.getAll();

      return new Promise((res, rej) => {
        allRequest.onsuccess = (e) => {
          res(e.target.result);
        };
        allRequest.onerror = (err) => {
          rej(err)
        }
      })
    }
    return Promise.reject([]);
  }

  public clearStore(): Promise<boolean> {
    if (this.database) {
      let transAct = this.database.transaction('animals', 'readwrite');
      let store = transAct.objectStore('animals');
      let clearRequest = store.clear();
      return new Promise<boolean>((res, rej) => {
        clearRequest.onsuccess = (e) => {
          console.log(e);
          res(e.target);
        };
        clearRequest.onerror = (err) => rej(err)
      })
    }

    return Promise.reject(false);
  }

  public getAllAnimalsByType(typeOfAnimal: number): Promise<IAnimalDetail[]> {
      let transAct = this.database.transaction('animals', 'readonly');
      let animals = transAct.objectStore('animals');
      const typeIndex = animals.index('type');

      //TODO: Search by all with needed type value
      const cursorReq = typeIndex.getAll(typeOfAnimal);

      //TODO: Searching by range.

      // const keyRng = IDBKeyRange.only(0);
      // const cursorReq = typeIndex.openCursor(keyRng);

      return new Promise((res, rej) => {
        cursorReq.onsuccess = (e) => {
          res(e.target.result);
        };
        cursorReq.onerror = (err) => {
          rej(err)
        }
      })
  }

  public getAllAnimalsByContainerType(typeOfContainer: AnimalType): Promise<IAnimalDetail[]> {
      let transAct = this.database.transaction('animals', 'readonly');
      let animals = transAct.objectStore('animals');
      const typeIndex = animals.index('containerType');

      //TODO: Search by all with needed type value
      const cursorReq = typeIndex.getAll(typeOfContainer);

      return new Promise((res, rej) => {
        cursorReq.onsuccess = (e) => {
          res(e.target.result);
        };
        cursorReq.onerror = (err) => {
          rej(err)
        }
      })
  }
}

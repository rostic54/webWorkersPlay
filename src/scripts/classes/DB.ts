import {AnimalModel} from "../../interfaces/animal-response.interface";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import {IDb} from "../../interfaces/db";
import BlobStr = AnimalModel.BlobStr;


export class DataBase implements IDb {
  static instance: DataBase;
  private DbRef;
  public allAnimalDetail;
  public allImagesOfFBInBase64Format;
  public animalsWithoutImg: any = [];

  private constructor() {
    console.log('DB CREATED:', this);
    // @ts-ignore
    this.DbRef = window.DB;
    // this.listenerOfChangesInAnimals();

    // Update animalsDetail in same format
    // this.updateAllAnimal();
  }

  private getCollectionData(collectionName: string = 'animals') {
    return this.DbRef.collection(collectionName)
  }

  public static getInstance(): DataBase {
    if (!DataBase.instance) {
      DataBase.instance = new DataBase();
    }
    return DataBase.instance
  }

  public listenerOfChangesInAnimals(): Promise<IAnimalDetail[]> {
    return new Promise((res, rej) => {

      this.getCollectionData().onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            res(Array(change.doc.data()))
          }
          if (change.type === 'removed') {

          }

        })
      })
    })
  }

  public updateAllAnimal(): Promise<IAnimalDetail> {
    return new Promise((res, rej) => {
      this.getCollectionData().get(doc => {
        this.allAnimalDetail = doc.data();
        console.log('ALL Animal DEtails:', this.allAnimalDetail);

        const animalsDetail = doc.data();
        console.log('BEFORE EDITED ANIMAL:', animalsDetail);
        animalsDetail.forEach(an => {
          if(an.stringFormat && typeof an.stringFormat !== 'string') {
            console.log('EDITED ANIMAL:', an);
            an.stringFormat = an.stringFormat.blobStr || '';
            this.updateAnimalInOwnFBStorage(an);
          }
        })
        res(animalsDetail[0]);
      })
    })
  }

  public getAllImagesInBase65FromFB() {
    this.getCollectionData('animalsImg').get().then(snap => {
      snap.forEach(doc => {
        this.allImagesOfFBInBase64Format = doc.data();
        console.log('ALL IMAGES:', this.allImagesOfFBInBase64Format);
      })

    })
  }

  public getRandomAnimal(): Promise<IAnimalDetail> {
    return new Promise((res, rej) => {
      this.getCollectionData().onSnapshot(snapshot => {
        const collectionLength = snapshot.docChanges().length;
        const random = Math.round(Math.random() * (collectionLength - 1));
        const animalDetail = snapshot.docChanges()[random].doc.data();
        if (animalDetail) {
          this.checkUniqItem(animalDetail.id).then((stringFormat) => {
            res({...animalDetail, stringFormat: stringFormat || ''})
          })
        } else {
          rej('Animal was not found')
        }
      })
    })
  }

  public getImageInBase64Format(id): Promise<string> {
    return new Promise<string>((res, rej) => {
      this.getCollectionData('animalsImg').doc(id).get()
        .then(snapshot => {

          res(snapshot.data()?.blobStr || '');
        })
    })
  }

  // method for synchronization the data between
  public addNewAnimalToOwnFBStorage(animal: IAnimalDetail): Promise<any> {
    return this.getCollectionData('animals').doc(animal.id).set(Object.assign({}, animal))
  }

  public updateAnimalInOwnFBStorage(animal: IAnimalDetail): Promise<void> {
    return this.getCollectionData('animals').doc(animal.id).update(animal)
  }

  public addNewAnimalBlobToOwnFBStorage(name: string, animalBlob: string): Promise<string> {
    return new Promise<string>((res, rej) => {
      this.checkUniqItem(name).then(data => {
        if(data) {
          rej('This Image already Exist')
        }
          res(this.getCollectionData('animalsImg').doc(name).set({blobStr: animalBlob}))

      })
    })
  }

  public checkUniqItem(id) {
    return new Promise<string | BlobStr>((res) => {
      this.getCollectionData('animalsImg').doc(id).get()
        .then(snapshot => {
          const stringUrl = snapshot.data() ? snapshot.data().blobStr || snapshot.data() : '';
          res(stringUrl);
        })
    })
  }

  public enableKeepingDataInIndexedDbForFB(): void {
    this.DbRef.enablePersistence()
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
        }
      });
  }
}

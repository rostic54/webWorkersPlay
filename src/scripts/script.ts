import {IMain} from "../interfaces/main.interface";
import {Tool} from "./classes/Tool.js";
import {Distributor} from "./classes/Distributor.js";
import {Animal} from "./classes/Animal.js";
import {CatContainer} from "./classes/Cat-container.js";
import {DogContainer} from "./classes/Dog-container.js";
import {StoreService} from "./services/store.service.js";
import {AnimalModel} from "../interfaces/animal-response.interface";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import IAnimal = AnimalModel.IAnimal;
import {Comparator} from "./classes/Comparator.js";
import {AnimalType} from "../enum/animal-type";
import {DataBase} from "./classes/DB.js";
import {IndexeddbTablesName} from "../enum/indexeddb-tables-name.js";
import {CameraManager} from "./classes/Camera-manager.js";
import {HintsManager} from "./classes/Hints-manager.js";

class Main implements IMain {
  private storeService!: StoreService;
  private dataBase!: DataBase;
  private comparator!: Comparator;
  private cameraManager!: CameraManager;
  private disablePlayBtn = true;
  private forbidLoadFiles = true;
  public newGameBtn!: HTMLButtonElement | null;
  public resultsBtn!: HTMLButtonElement | null;
  public clearBtn!: HTMLButtonElement | null;
  public downloadResultBtn!: HTMLButtonElement | null;
  public makeAnimalPhotoBtn!: HTMLButtonElement | null;
  public listenerIds: any = [];
  public distributor!: Distributor;
  public catsContainer!: CatContainer;
  public dogsContainer!: DogContainer;
  public animalsList!: IAnimalDetail[];
  public toolBox!: Tool;
  public hintsManager!: HintsManager;

  constructor() {
  }

  public init(): void {
    this.getButtonsRefs();
    this.getAllInstances();
    this.setConditionOfBtns(true);

    this.isStoreReady().then(res => {
      this.storeService.getAllAnimals(IndexeddbTablesName.ANIMALS)
        .then(data => this.animalsList = data)
        .finally(() => console.log('GOTTEN FROM DB: ', this.animalsList))
    });
    this.addEventListeners();
  }

  public isStoreReady(): Promise<any> {
    return this.storeService.isReady()
  }

  public getAnimalsByContainerType(type: AnimalType): Promise<IAnimalDetail[]> {
    return this.isStoreReady()
      .then(() => this.storeService.getAllAnimalsByContainerType(type));
  }

  public addAnimalToDB(animal: IAnimalDetail, tableName = IndexeddbTablesName.ANIMALS ) {
    return this.isStoreReady()
      .then(() => {
        if(tableName === IndexeddbTablesName.SOURCE_ANIMAL) {
          // this.dataBase.addNewAnimalToOwnFBStorage(animal);
        }
        this.storeService.addDataToIndexedDb(animal, tableName)
      });
  }

  public getImage(): void {
    if (this.disablePlayBtn) {
      this.toolBox.requestImage();
      this.distributor.insertLoaderIcon();
    }
  }

  public elementImg(animal: IAnimal): Promise<void> {
    return this.toolBox.createAnimalImg(animal);
  }

  public getDistributor(): Distributor {
    return this.distributor
  }

  public storeAnimalInDistributor(animal: Animal): void {
    this.distributor.addNewEntity(animal);
    this.addAnimalToDB(animal.animalDetail, IndexeddbTablesName.SOURCE_ANIMAL);
  }

  public checkBtnCondition() {
    if (this.resultsBtn !== null) {
      this.resultsBtn.disabled = this.catsContainer.storeAnimalEntities.length === 0 && this.dogsContainer.storeAnimalEntities.length === 0
    }
  }

  public distributorChildrenListener(mutRec) {
    const distributorElem = mutRec[0].target;
    if(distributorElem.children.length > 1) {
      this.distributor.cleanDistributorContainer('.loader');
    } else if (distributorElem.children.length === 0){
      this.distributor.insertAddIcon();
    }
  }

  public clearDistributorContainer(): void {
    this.distributor.clearStore();
  }

  private addEventListeners() {
    const upload = document.getElementById('upload') as HTMLInputElement;
    // upload.addEventListener('change', (data) => {
    //   if (data?.target) {
    //     console.log(data.target.files)
    //   }
    // })

    if(upload) {
      upload.onchange = (ev) => {
        if ( !this.forbidLoadFiles && upload.files) {
          // @ts-ignore
          Array.prototype.forEach.call(upload.files, i => this.toolBox.addImageAsBase64ToFB(i))
        }
      }
    }

    if (this.makeAnimalPhotoBtn !== null) {
      this.listenerIds.push(this.makeAnimalPhotoBtn.addEventListener(
        'click',
        () => {
        this.cameraManager.getAccessToCamera()
      }));
    }
    if (this.newGameBtn !== null) {
      this.listenerIds.push(this.newGameBtn.addEventListener(
        'click',
        () => {
        this.clearStore();
        this.setConditionOfBtns(false);
      }));
    }
    if (this.clearBtn !== null) {
      this.listenerIds.push(this.clearBtn.addEventListener(
        'click',
        () => {
        this.clearStore();
        this.setConditionOfBtns(false);
      }));
    }
    if (this.resultsBtn !== null) {
      this.listenerIds.push(this.resultsBtn.addEventListener(
        'click',
        () => {
          if (this.disablePlayBtn) {
            this.setConditionOfBtns(true);
            this.comparator.showResults();
            this.clearDistributorContainer();
          }
        })
      );
    }
    if(this.distributor !== null) {
      const elem = this.distributor.getDistributorElement();
      this.listenerIds.push(
        elem.addEventListener(
          'pointerup',
          (ev) => {
            if ((ev.target as HTMLElement).className === 'plus-icon') {
              this.getImage();
            }
          }
        )
      )
    }
  }

  private setConditionOfBtns(condition: boolean): void {
    if (this.resultsBtn && this.newGameBtn && this.clearBtn) {
      this.newGameBtn.disabled = !condition;
      this.disablePlayBtn = !condition;
      this.resultsBtn.disabled = condition;
    }
  }

  private getButtonsRefs(): void {
    this.newGameBtn = document.getElementById('newGame') as HTMLButtonElement;
    this.resultsBtn = document.getElementById('checkResult') as HTMLButtonElement;
    this.clearBtn = document.getElementById('clearStores') as HTMLButtonElement;
    this.downloadResultBtn = document.getElementById('downloadResult') as HTMLButtonElement;
    this.makeAnimalPhotoBtn = document.getElementById('camera-access') as HTMLButtonElement;
  }

  private getAllInstances(): void {
    this.storeService = StoreService.getInstance();
    if (this.storeService) {
      this.distributor = Distributor.getInstance(this.distributorChildrenListener.bind(this));
      this.catsContainer = CatContainer.getInstance();
      this.dogsContainer = DogContainer.getInstance();
      this.toolBox = Tool.getInstance();
      this.comparator = Comparator.getInstance();
      this.dataBase = DataBase.getInstance();
      this.cameraManager = CameraManager.getInstance();
      this.hintsManager = HintsManager.getInstance();
    }
  }

  private clearStore(): void {
    this.isStoreReady().then(() => this.storeService.clearStore()).then(res => {
      this.dogsContainer.clearContainer();
      this.catsContainer.clearContainer();
      this.checkBtnCondition();
    })
  }
}

const main = new Main();
main.init();

export {main}

// function checkNotificationPromise() {
//     try {
//         Notification.requestPermission().then();
//     } catch(e) {
//         return false;
//     }
//
//     return true;
// }
//
// function askNotificationPermission() {
//     // function to actually ask the permissions
//     function handlePermission(permission) {
//         // set the button to shown or hidden, depending on what the user answers
//         if(Notification.permission === 'denied' || Notification.permission === 'default') {
//             console.log('show BTN');
//             const n = new Notification("Hi! ", {tag: 'soManyNotification'});
//             // notificationBtn.style.display = 'block';
//
//         } else {
//             console.log('DON\'T show BTN');
//             const n = new Notification("Hi! ", {tag: 'soManyNotification'});
//             // notificationBtn.style.display = 'none';
//         }
//     }
//
//     // Let's check if the browser supports notifications
//     if (!('Notification' in window)) {
//         console.log("This browser does not support notifications.");
//     } else {
//         if(checkNotificationPromise()) {
//             Notification.requestPermission()
//                 .then((permission) => {
//                     handlePermission(permission);
//                 })
//         } else {
//             Notification.requestPermission(function(permission) {
//                 handlePermission(permission);
//             });
//         }
//     }
// }
//
// askNotificationPermission();

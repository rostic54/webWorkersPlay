import {IMain} from "../interfaces/main.interface";
import {Tool} from "./classes/tool.js";
import {Distributor} from "./classes/Distributor.js";
import {Animal} from "./classes/Animal.js";
import {CatContainer} from "./classes/Cat-container.js";
import {DogContainer} from "./classes/Dog-container.js";
import {StoreService} from "./services/store.service.js";
import {AnimalModel} from "../interfaces/animal-response.interface";
import IAnimalDetail = AnimalModel.IAnimalDetail;
import IAnimal = AnimalModel.IAnimal;
import {Comparator} from "./classes/comparator.js";

class Main implements IMain {
  private storeService!: StoreService;
  public startBtn!: HTMLElement | null;
  public resultsBtn!: HTMLButtonElement | null;
  public clearBtn!: HTMLButtonElement | null;
  public downloadResultBtn!: HTMLButtonElement | null;
  public listenerIds: any = [];
  public distributor!: Distributor;
  public catsContainer!: CatContainer;
  public dogsContainer!: DogContainer;
  private comparator!: Comparator;
  public animalsList;
  public toolBox;

  constructor() {
  }

  public init(): void {
    this.startBtn = document.getElementById('startCount');
    this.resultsBtn = document.getElementById('checkResult') as HTMLButtonElement;
    this.clearBtn = document.getElementById('clearStores') as HTMLButtonElement;
    this.downloadResultBtn = document.getElementById('downloadResult') as HTMLButtonElement;
    this.storeService = StoreService.getInstance();
    this.isStoreReady().then(res => {
      console.log('RES IN MAIN:', res);
      this.storeService.getAllAnimals()
        .then(data => this.animalsList = data)
        .finally(() => console.log('GOTTEN FROM DB: ', this.animalsList))
    });
    this.distributor = Distributor.getInstance();
    this.catsContainer = CatContainer.getInstance();
    this.dogsContainer = DogContainer.getInstance();
    this.toolBox = Tool.getInstance();
    this.comparator = Comparator.getInstance();
    this.addEventListeners();
  }

  public isStoreReady(): Promise<any> {
    return this.storeService.isReady()
  }

  public getAnimalsByContainerType(type: number): Promise<IAnimalDetail[]> {
    return this.isStoreReady()
      .then(() => this.storeService.getAllAnimalsByContainerType(type));
  }

  public addAnimalToDB(animal: IAnimalDetail) {
    return this.isStoreReady()
      .then(() => this.storeService.addDataToDb(animal));
  }

  public getImage(): void {
    this.toolBox.requestImage();
  }

  public elementImg(animal: IAnimal) {
    this.toolBox.createAnimalImg(animal);
  }

  public getDistributor(): Distributor {
    return this.distributor
  }

  public storeAnimalInDistributor(animal: Animal): void {
    setTimeout(() => this.distributor.addNewEntity(animal), 0);
  }

  public checkBtnCondition() {
    if (this.resultsBtn !== null) {
      this.resultsBtn.disabled = this.catsContainer.storeAnimalEntities.length === 0 && this.dogsContainer.storeAnimalEntities.length === 0
    }
  }

  private addEventListeners() {
    if (this.startBtn !== null) {
      this.listenerIds.push(this.startBtn.addEventListener('click', () => this.getImage()));
    }
    if (this.clearBtn !== null) {
      this.listenerIds.push(this.clearBtn.addEventListener('click', () => this.clearStore()));
    }
    if (this.resultsBtn !== null) {
      this.resultsBtn.disabled = true;
      this.listenerIds.push(this.resultsBtn.addEventListener(
        'click',
        () => this.comparator.showResults())
      );
    }
    if (this.downloadResultBtn !== null) {
      this.listenerIds.push(this.downloadResultBtn.addEventListener('click', () => {
        const resultsOfGame = this.comparator.checkResults();
        this.toolBox.downloadFile(resultsOfGame)
      }));
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

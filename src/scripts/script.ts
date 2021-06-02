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

class Main implements IMain {
  private storeService!: StoreService;
  private comparator!: Comparator;
  private disablePlayBtn = true;
  public getNewAnimalBtn!: HTMLButtonElement | null;
  public newGameBtn!: HTMLButtonElement | null;
  public resultsBtn!: HTMLButtonElement | null;
  public clearBtn!: HTMLButtonElement | null;
  public downloadResultBtn!: HTMLButtonElement | null;
  public listenerIds: any = [];
  public distributor!: Distributor;
  public catsContainer!: CatContainer;
  public dogsContainer!: DogContainer;
  public animalsList;
  public toolBox;

  constructor() {
  }

  public init(): void {
    this.getButtonsRefs();
    this.getAllInstances();
    this.setConditionOfBtns(false);

    this.isStoreReady().then(res => {
      console.log('RES IN MAIN:', res);
      this.storeService.getAllAnimals()
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

  public addAnimalToDB(animal: IAnimalDetail, tableName = 'animals' ) {
    return this.isStoreReady()
      .then(() => this.storeService.addDataToDb(animal, tableName));
  }

  public getImage(): void {
    if (this.disablePlayBtn) {
      this.toolBox.requestImage();
    }
  }

  public elementImg(animal: IAnimal) {
    this.toolBox.createAnimalImg(animal);
  }

  public getDistributor(): Distributor {
    return this.distributor
  }

  public storeAnimalInDistributor(animal: Animal): void {
    this.addAnimalToDB(animal.animalDetail, 'sourceAnimals');
    setTimeout(() => this.distributor.addNewEntity(animal), 0);
  }

  public checkBtnCondition() {
    if (this.resultsBtn !== null) {
      this.resultsBtn.disabled = this.catsContainer.storeAnimalEntities.length === 0 && this.dogsContainer.storeAnimalEntities.length === 0
    }
  }

  public distributorChildrenListener(mutRec) {
    const distributorElem = mutRec[0].target;
    console.log(distributorElem);
    if(distributorElem.children.length > 1) {
      this.distributor.removeAddIcon();
      this.getNewAnimalBtn!.disabled = true;
    } else if (distributorElem.children.length === 0){
      this.distributor.insertAddIcon();
      this.getNewAnimalBtn!.disabled = false;
    }
  }

  public clearDistributorContainer(): void {
    this.distributor.clearStore();
  }

  private addEventListeners() {

    if (this.getNewAnimalBtn !== null) {
      this.listenerIds.push(this.getNewAnimalBtn.addEventListener(
        'click',
        () => {
        this.getImage();
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
            this.comparator.showResults();
            this.clearDistributorContainer();
          }
          this.setConditionOfBtns(true);
        })
      );
    }
    if(this.distributor !== null) {
      const elem = this.distributor.getDistributorElement();
      this.listenerIds.push(
        elem.addEventListener(
          'click',
          (ev) => {
            console.log(ev);
            if ((ev.target as HTMLElement).className === 'plus-icon') {
              this.getImage();
            }
          }
        )
      )
    }
  }

  private setConditionOfBtns(condition: boolean): void {
    if ( this.getNewAnimalBtn &&  this.resultsBtn && this.newGameBtn) {
      this.getNewAnimalBtn.hidden = condition;
      this.newGameBtn.hidden = !condition;
      this.disablePlayBtn = !condition;
      this.resultsBtn.disabled = condition;
    }
  }

  private getButtonsRefs(): void {
    this.getNewAnimalBtn = document.getElementById('startCount') as HTMLButtonElement;
    this.newGameBtn = document.getElementById('newGame') as HTMLButtonElement;
    this.resultsBtn = document.getElementById('checkResult') as HTMLButtonElement;
    this.clearBtn = document.getElementById('clearStores') as HTMLButtonElement;
    this.downloadResultBtn = document.getElementById('downloadResult') as HTMLButtonElement;
  }

  private getAllInstances(): void {
    this.storeService = StoreService.getInstance();
    if (this.storeService) {
      this.distributor = Distributor.getInstance(this.distributorChildrenListener.bind(this));
      this.catsContainer = CatContainer.getInstance();
      this.dogsContainer = DogContainer.getInstance();
      this.toolBox = Tool.getInstance();
      this.comparator = Comparator.getInstance();
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

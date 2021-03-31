
import {IMain} from "../interfaces/main.interface";
import {Tool} from "./classes/tool.js";
import {Distributor} from "./classes/Distributor.js";
import {Animal} from "./classes/Animal";

class Main implements IMain{
  public btn!: HTMLElement | null;
  public listenerIds: any = [];
  public catBox!: Element;
  public dogBox!: Element;
  public distributor!: Distributor;
  public toolBox;

  constructor() {
  }

  public init(): void {
    this.btn = document.getElementById('startCount');
    this.catBox = document.getElementsByClassName('cats-box')[0];
    this.dogBox = document.getElementsByClassName('dog-box')[0];
    this.distributor = new Distributor();
    if (this.btn !== null) {
      this.listenerIds.push(this.btn.addEventListener('click', () => this.getImage()));
    }
    this.toolBox = new Tool();

  }

  public getImage(): void {
    this.toolBox.requestImage();
  }

  public attachImgToBox(img: Animal): void {
    setTimeout( () => this.distributor.addNewElement(img), 0);
  }
}

const main = new Main();
main.init();

export {main}

// const listenerIds: any = [];
// const catUrlsBox = [];
// let btn: any;
// let catBox;
// init();
// const toolBox = new Tool();
// getImage();
//
// function init() {
//   btn = document.getElementById('startCount');
//   catBox = document.getElementsByClassName('cats-box')[0];
//   if (btn !== null) {
//     listenerIds.push(btn.addEventListener('click', getImage));
//   }
// }
//
// function getImage() {
//   toolBox.requestImage();
// }

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

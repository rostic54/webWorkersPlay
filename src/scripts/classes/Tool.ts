import {WorkerHelper} from "../workers/Worker-helper.js";
import {main} from "../script.js";
import {Animal} from "./Animal.js";
import {HttpService} from "../services/Http.service.js";
import {PresentationType} from "../../interfaces/presentation.interface";
import {AnimalModel} from "../../interfaces/animal-response.interface";
import {AnimalFactory} from "./factories/Animal-factory.js";
import IPresentationDetail = PresentationType.IPresentationDetail;
import IAnimal = AnimalModel.IAnimal;
import {AnimalType} from "../../enum/animal-type.js";

class Tool {
  static staticCounter: number = 1;
  static instance: Tool;
  public workerHelper;
  public httpService: HttpService;
  public defaultCatImage: HTMLImageElement = new Image();
  public defaultDogImage: HTMLImageElement = new Image();
  private amountOfRequests = 0;
  private allowedRequests = 1;
  private isOfflineMode = !navigator.onLine;

  constructor() {
    this.workerHelper = new WorkerHelper();
    this.httpService = HttpService.getInstance();
    this.setDefaultAnimalImages();
    window.addEventListener("online", () => {
      console.log("You are online!");
      this.isOfflineMode = false;
      // @ts-ignore
      window.DB.firestore().enableNetwork()
        .then(() => {
          console.log('FIRBASE IS OK!!')
          // ...
        });
    });
    window.addEventListener("offline", () => {
      console.log("Oh no, you lost your network connection.");
      this.isOfflineMode = true;
      // @ts-ignore
      window.DB.disableNetwork()
        .then(function() {
          console.log('FIRBASE IS OFF!!')
          // Do offline reading queries
          // ...
        });
    });
  }

  public static getInstance(): Tool {
    if (!Tool.instance) {
      Tool.instance = new Tool();
    }

    return Tool.instance
  }

  public putAnimalToDistributorBox(animal: Animal): void {
    this.createAnimalImg(animal)
      .then(() => main.storeAnimalInDistributor(animal));
  }

  public createAnimalImg(animal: IAnimal): Promise<void> {
    const imgInfo = animal.getDetailForImage();
    let img = new Image();
    const defaultNode = animal.type === AnimalType.CAT ? this.defaultCatImage : this.defaultDogImage

    let animalUrlData = imgInfo.stringFormat ? imgInfo.stringFormat : navigator.onLine ? imgInfo.src : defaultNode.src;
    // @ts-ignore
    if(animalUrlData.blobStr) {
      // @ts-ignore
      animalUrlData = animalUrlData.blobStr;
    }
    // this.downloadFile(`${animal.id}.jpg` , imgInfo.src);

    img.setAttribute('alt', 'animal-img');
    // img.setAttribute('src', imgInfo.src);
    img.setAttribute('src', animalUrlData || imgInfo.src);
    // img.setAttribute('src', defaultNode.src);
    img.setAttribute('w', imgInfo.width);
    img.setAttribute('h', imgInfo.height);
    img.setAttribute('id', animal.id);
    img.setAttribute('data-birth', Date.now().toString());
    animal.addListener(img);
    this.addAnimalUrlToStore(animal, imgInfo);
    return Promise.resolve()
  }

  setDefaultAnimalImages(): void {
    this.defaultCatImage.setAttribute('src', './img/default-cat.jpg');
    this.defaultDogImage.setAttribute('src', './img/default-dog.jpg');
  }

  public requestImage(): void {
    if (this.amountOfRequests < this.allowedRequests ) {
      this.amountOfRequests++;
      // Make request directly without the worker for IoS devices.
      // For now make only directly requests to avoid getting data from public apis.
      const source = true || this.isIos() ? this.getPetPictureDetail.bind(this) : this.workerHelper.getAnimal;
      source(Tool.staticCounter)
        .then(img => {
          this.amountOfRequests = 0;
          this.putAnimalToDistributorBox(img)
        })
        .catch(err => {
          this.amountOfRequests = 0;
          console.log('ERROR WHILE GETTING NEW IMAGE', err)
        });
    }
  }


  public getPetPictureDetail(): Promise<any> {
    return this.httpService.getRandomAnimal(true, this.isOfflineMode)
      .then( (data) => {
        const animalFact = this.createNewAnimal(data[0] || data);
        return (animalFact.getCreatedAnimalEntity());
      })
  }

  public createNewAnimal(data) {
    return new AnimalFactory(data)
  }

  public blackBoxCreator(): HTMLDivElement {
    const boxShadowLink = document.createElement('div');
    Object.assign(
      boxShadowLink.style,
      {
        position: 'fixed',
        left: '0',
        top: '0',
        zIndex: '1',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,.4)',
      })

    return boxShadowLink
  }

  public downloadFile(fileName: string, content: string): void {
      let link = document.createElement('a');
      link.download = fileName;
      let blob = new Blob([content], {type: 'type/plain'});
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
  }

  // For uploading images via input [type=file]
  public addImageAsBase64ToFB(fileData) {
    this.convertFileToBase64(fileData)
      .then((convertedData: string) => this.httpService.addNewAnimalBlobToFB(fileData.name.split('.')[0], convertedData))
      .catch(err => console.log(err));
  }

  public convertFileToBase64(fileData): Promise<string> {
    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    return new Promise((res, rej) => {
      reader.onload = ({currentTarget}: ProgressEvent) => {
        if (currentTarget) {
          // @ts-ignore
          res(currentTarget.result);
          console.log(currentTarget);
          // console.log(URL.createObjectURL(upload.files[0]));
        } else {
          rej('Image could not converted');
        }
      }
    })

  }

  public isIos(): boolean {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
      ].includes(navigator.platform)
      || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }

  private addAnimalUrlToStore(animal: IAnimal, imgInfo: IPresentationDetail): void {
    animal.addAnimalUrl(imgInfo);
  }

  public isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

}

export {Tool}

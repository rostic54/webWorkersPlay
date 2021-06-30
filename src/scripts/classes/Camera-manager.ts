import {Tool} from "./Tool.js";
import {HttpService} from "../services/Http.service.js";
import {ICreatedAnimalResponseInterface} from "../../interfaces/created-animal-response.interface";
import {AnimalDetails} from "../../models/animal-details.js";

interface ICameraManager {
  // removeListenerFromBtn(): void
}

export class CameraManager implements ICameraManager {
  static instance: CameraManager;
  public imageCapture;
  public playedStream: Promise<void> | null = null;
  public photoCanvas!: HTMLCanvasElement;
  public contentPhotoCanvas!: CanvasRenderingContext2D;
  private toolBox: Tool;
  private canvas!: HTMLCanvasElement;
  private takePhotoBtn!: HTMLButtonElement;
  private sendToValidateBtn!: HTMLButtonElement;
  private track!: MediaStreamTrack;
  private http: HttpService;
  private imgPhoto!: HTMLImageElement;
  private errorMessage!: HTMLParagraphElement;
  private closeBtn?: HTMLSpanElement;
  private videoRef!: HTMLVideoElement;
  private isActiveSendPhoto = true;
  private popupRef!: HTMLDivElement;
  private boxShadow!: HTMLDivElement;
  private loader!: HTMLImageElement;
  private radioTypeAnimal!: HTMLCollectionOf<HTMLInputElement>;
  private takePhotoFnRef;
  private sendValidateFnRef;
  private blobPhoto;
  private resolveCbForValidate;

  private constructor() {
    this.toolBox = Tool.getInstance();
    this.http = HttpService.getInstance();
    this.imgPhoto = new Image();
    this.imgPhoto.classList.add('hidden', 'photo-preview');
    this.takePhotoFnRef = this.takePhoto.bind(this);
    this.sendValidateFnRef = this.sendImageForValidation.bind(this);
  }

  get contentNode(): HTMLDivElement {
    return this.popupRef.querySelector('.content') as HTMLDivElement
  }

  get checkedAnimalType(): string {
    for (let i = 0; i < this.radioTypeAnimal.length; i++) {
      if (this.radioTypeAnimal[i].checked) {
        return this.radioTypeAnimal[i].value
      }
    }
    return this.radioTypeAnimal[0].value
  }

  public static getInstance() {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager();
    }
    return CameraManager.instance
  }

  private takePhoto() {
    this.errorMessage.innerHTML = '';
    let responseWaiter: Promise<ICreatedAnimalResponseInterface | any>;
    if (this.playedStream !== null) {
      responseWaiter = this.playedStream.then(started => {
        this.contentPhotoCanvas?.drawImage(this.videoRef, 0, 0, this.photoCanvas.width, this.photoCanvas.height);
        return new Promise((resolve, reject) => {
          this.photoCanvas.toBlob(resolve, 'image/png');
        })
      }).then(blobImg => {
        this.imageCapture = blobImg;
        return this.createImageFromBlob(this.imageCapture);
      })
    } else {
      responseWaiter = this.imageCapture.takePhoto()
        .then(this.createImageFromBlob.bind(this))
        .catch(function (error) {
          console.log('takePhoto() error: ', error);
        });
    }
    responseWaiter
      .then(res => res !== undefined ? Promise.resolve(res) : Promise.reject('Saving to stores was failed!'))
      .then((res) => {
        if (res) {
          const animalDetail = new AnimalDetails({
            id: res.id,
            width: res.width,
            height: res.height,
            url: res.url,
            stringFormat: res.stringFormat
          })
          this.http.addBrandNewAnimalToBothStores(animalDetail).then(res => {
            this.removeLoader();
            this.errorMessage.style.color = 'green';
            this.errorMessage.innerHTML = 'Photo was added to store successfully!'
            setTimeout(() => this.killPopup(), 2000);
            console.log('Result of addition to both store', res)
          });
        } else {
          this.addListenerOfTakePhoto();
          this.removeLoader();
          this.takePhotoBtn.disabled = !this.isActiveSendPhoto;
          // this.track.start();
        }
      })
  }

  appendLoader(): void {
    const photo = this.popupRef.querySelector('.photo-preview');
    this.loader = this.popupRef.querySelector('.loader') as HTMLImageElement;
    this.loader?.classList.remove('hidden');
    if (photo && this.loader) {
      this.contentNode?.removeChild(photo);
      // this.contentNode?.append(this.loader);
    }
  }

  removeLoader(): void {
    this.loader?.classList.add('hidden');

    // this.contentNode.removeChild(this.loader);
  }

  private createImageFromBlob(blobImage: Blob): Promise<ICreatedAnimalResponseInterface> {
    // console.log('Took photo:', blobImage);
    this.blobPhoto = blobImage;
    const content = document.querySelector('.content');
    this.imgPhoto.classList.remove('hidden');
    this.imgPhoto.src = URL.createObjectURL(blobImage);
    if (content && this.isActiveSendPhoto) {
      content.appendChild(this.imgPhoto);
    }
    return new Promise((res, rej) => {
      if (this.sendToValidateBtn && this.isActiveSendPhoto) {
        this.resolveCbForValidate = res;
        this.isActiveSendPhoto = false;
        this.sendToValidateBtn.innerText = 'Send TO Validate';
        this.toggleTakePhotoBtn();
        this.toggleSendToValidate();
        this.sendToValidateBtn.addEventListener('click', this.sendValidateFnRef)
      } else {
        rej('Button wasn\'t created')
      }
    })
  }

  public getAccessToCamera() {
    navigator.mediaDevices.enumerateDevices()
      .then(this.gotDevices)
      .then((res: any) => {
        navigator.mediaDevices.getUserMedia({
          // audio: false,
          // video: {
          //   facingMode: this.toolBox.isMobileDevice() ? 'user' : 'user'
          // }
          video: {
            facingMode: 'environment'
            // deviceId: res[0].deviceId
          }
        }).then(stream => {
          this.createAndOpenPopUp();
          // @ts-ignore
          this.videoRef = document.querySelector('video');
          const videoTracks = stream.getVideoTracks()
          this.track = videoTracks[0];
          if ('ImageCapture' in window) {
            this.imageCapture = new ImageCapture(this.track);
            if (this.videoRef) {
              this.videoRef.srcObject = stream;
            }
          } else {
            this.polyfillForIphone(stream);
            this.takePhotoBtn.disabled = true;
          }

        }).catch((error) => {
          console.error(error)
        })
      })
  }

  private gotDevices(deviceInfos) {
    const devices = deviceInfos.filter(dev => {
      if (dev.kind === 'videoinput') {
        // alert(dev);
        return true
      }
    })
    return Promise.resolve(devices)
  }

  private polyfillForIphone(stream: MediaStream): void {
    this.photoCanvas = document.createElement('canvas');
    this.contentPhotoCanvas = this.photoCanvas.getContext('2d') as CanvasRenderingContext2D;

    this.videoRef.srcObject = stream;

    this.videoRef.addEventListener('loadeddata', () => {
      const {videoWidth, videoHeight} = this.videoRef;
      this.photoCanvas.width = videoWidth;
      this.photoCanvas.height = videoHeight;
      this.playedStream = this.videoRef.play();
      this.takePhotoBtn.disabled = false;
    })
  }

  private createAndOpenPopUp() {
    this.popupRef = document.createElement('div');
    this.boxShadow = this.toolBox.blackBoxCreator();
    document.body.appendChild(this.popupRef);
    document.body.appendChild(this.boxShadow);
    const content = this.createContentOfPopup();
    if (!navigator.onLine) {
      this.errorMessage.innerHTML = 'You can\'t use in offline mode'
      this.takePhotoBtn.disabled = true;
    }

    this.popupRef.append(content);

    this.closeBtn = content.querySelector('.close-icon') as HTMLSpanElement;
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', this.killPopup.bind(this));
    }
    this.addListenerOfTakePhoto();
  }

  public addListenerOfTakePhoto() {
    this.takePhotoBtn.addEventListener('click', this.takePhotoFnRef);
  }

  public toggleTakePhotoBtn() {
    this.takePhotoBtn.classList.toggle('hidden')
  }

  public toggleSendToValidate() {
    this.sendToValidateBtn.classList.toggle('hidden');
  }

  private createContentOfPopup(): HTMLDivElement {
    document.body.style.overflow = 'hidden';
    const container = document.createElement('div');
    const title = document.createElement("h2");
    this.takePhotoBtn = document.createElement("button");
    this.sendToValidateBtn = document.createElement('button');
    const content = document.createElement('div');
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = 'X';
    closeBtn.classList.add('close-icon');
    this.takePhotoBtn.setAttribute('id', 'take-photo');
    this.canvas = document.getElementById('animal-grab') as HTMLCanvasElement;
    this.takePhotoBtn.innerHTML = 'Take a Photo';
    title.innerHTML = 'Cathe a Cat or a Dog:';
    content.innerHTML = `
        <div class="type-animal">
          <input type="radio" id="catRadio" name="animal-type" value='cat'" checked>
          <label for="catRadio">Cat</label>
        
          <input type="radio" id="dogRadio" name="animal-type" value='dog'">
          <label for="dogRadio">Dog</label>
        </div>
        <video class="video" playsinline autoplay></video>
        <p class="error-message"></p>
        <img src="img/loader.gif" class="hidden loader" alt="loader">`
    this.errorMessage = content.querySelector('.error-message') as HTMLParagraphElement;
    this.radioTypeAnimal = content.getElementsByTagName('input') as HTMLCollectionOf<HTMLInputElement>;
    content.classList.add('content', 'center');
    title.classList.add('title');
    container.classList.add('container');
    this.popupRef.classList.add('popup')
    this.sendToValidateBtn.classList.add('hidden');
    container.append(title, content, closeBtn, this.takePhotoBtn, this.sendToValidateBtn);
    return container
  }

  public sendImageForValidation() {
    console.log('EVENT FROM SendImage');
    this.appendLoader();
    this.takePhotoBtn.disabled = !this.isActiveSendPhoto;
    this.sendToValidateBtn.disabled = true;
    let formatData = new FormData();
    formatData.append('file', this.blobPhoto);

    this.http.sendForValidation(formatData, this.checkedAnimalType).then((result: Response) => {
      console.log('RESULT OF VALIDATION', result);

      if (result.ok) {
        Promise.all([result.json(), this.toolBox.convertFileToBase64(this.blobPhoto)])
          .then(([responseData, base64Image]) => {
            this.resolveCbForValidate({...responseData, stringFormat: base64Image});
          });
      } else {
        this.isActiveSendPhoto = true;
        this.resolveCbForValidate(null);
        this.toggleSendToValidate();
        this.toggleTakePhotoBtn();
        this.sendToValidateBtn.disabled = false;
        this.errorMessage.innerHTML = 'Animal was not recognized, try again'
      }
    }).catch(err => console.log('UPLOADING ERR', err));
  }

  public killPopup() {
    document.body.style.overflow = 'auto';
    this.playedStream = null;
    this.popupRef.remove();
    this.boxShadow.remove();
    this.isActiveSendPhoto = true;
    this.track?.stop();
  }
}

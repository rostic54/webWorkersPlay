import {PresentationType} from "../../interfaces/presentation.interface";
import IPresentationDetail = PresentationType.IPresentationDetail;
import IPresentation = PresentationType.IPresentation;
import {Tool} from "./Tool.js";
import {ImageClasses} from "../../enum/image-classes.js";

export class Presentation implements IPresentation {
  readonly height: number;
  readonly width: number;
  readonly src: string;
  readonly stringFormat: string;
  private boxShadowLink: HTMLDivElement | null = null;
  private preViewPopup: HTMLDivElement | null = null;
  private presentationUrls: IPresentationDetail[] = [];
  private errorStateObserver: MutationObserver | undefined;
  private showPopup: boolean = true;
  private toolBox = Tool.getInstance();
  private popupHandlerFuncRef;
  private popupCloseEventRef;

  private config = {
    attributes: true,
    childList: false,
    subtree: false
  };

  constructor({height, width, url, stringFormat = ''}) {
    this.height = height;
    this.width = width;
    this.src = url;
    this.stringFormat = stringFormat;
    this.popupCloseEventRef = this.closePreview.bind(this);
  }

  public getPresentationDetail(): IPresentationDetail {
    return {
      src: this.src,
      width: `${this.width}`,
      height: `${this.height}`,
      stringFormat: this.stringFormat
    }
  }

  public addListener(img) {
    this.popupHandlerFuncRef = this.popupOpen.bind(this);
    img.addEventListener('pointerdown', () => this.showPopup = true)
    img.addEventListener('pointerup', this.popupHandlerFuncRef);
    document.addEventListener('pointermove', () => {
      this.showPopup = false;
    })
  }

  public addAnimalUrl(imgDetail: IPresentationDetail): void {
    this.presentationUrls.push(imgDetail);
  }

  public addErrorStateObserver(img: HTMLImageElement) {
    this.errorStateObserver = new MutationObserver(this.reactOnErrorState.bind(this));
    this.errorStateObserver.observe(img, this.config);
  }

  private popupOpen(ev): void {
    if (!this.showPopup || ev.button !== 0 || ev.buttons !== 0) {
      return;
    }
    this.preViewPopup = document.createElement('div');
    const width = Number(ev.target.attributes.w.value) > document.body.clientWidth ? document.body.clientWidth : ev.target.attributes.w.value;
    const height = Number(ev.target.attributes.h.value) > document.body.clientHeight ? document.body.clientHeight : ev.target.attributes.h.value;
    Object.assign(
      this.preViewPopup.style,
      {
        position: 'fixed',
        zIndex: '2',
        top: '50% ',
        left: '50%',
        width: `${width - 20}px`,
        padding: `10px`,
        height: `${height - 20}px`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        border: '10px solid gray',
        marginLeft: `-${(width / 2) + 10}px`,
        marginTop: `-${(height / 2) + 10}px`,
        backgroundImage: `url(${ev.target.attributes.src.value})`
      })
    document.body.append(this.preViewPopup);
    this.createShadowBox();
  }

  private createShadowBox(): void {
    this.boxShadowLink = this.toolBox.blackBoxCreator();
    document.body.append(this.boxShadowLink);

    this.boxShadowLink.addEventListener('pointerup', this.popupCloseEventRef);
    this.preViewPopup?.addEventListener('pointerup', this.popupCloseEventRef);
  }

  private closePreview(ev): void {
    this.boxShadowLink?.removeEventListener('pointerup', this.popupHandlerFuncRef);
    this.preViewPopup?.removeEventListener('pointerup', this.popupHandlerFuncRef);
    this.boxShadowLink?.remove();
    this.preViewPopup?.remove();
  }

  private reactOnErrorState(mutRec): void {
    const wrapper = mutRec[0].target?.closest(`.${ImageClasses.WRAPPER}`);
    if(mutRec[0].attributeName === 'class' && mutRec[0].target.classList.contains(ImageClasses.INCORRECT)) {
      wrapper.classList.add('error');
    } else {
      wrapper?.classList.remove('error');
    }
  }

}

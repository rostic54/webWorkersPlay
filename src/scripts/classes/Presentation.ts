import {PresentationType} from "../../interfaces/presentation.interface";
import IPresentationDetail = PresentationType.IPresentationDetail;
import IPresentation = PresentationType.IPresentation;
import {Tool} from "./tool.js";

export class Presentation implements IPresentation {
  readonly height: number;
  readonly width: number;
  readonly src: string;
  private boxShadowLink: HTMLDivElement | null = null;
  private preViewPopup: HTMLDivElement | null = null;
  private presentationUrls: IPresentationDetail[] = [];
  private showPopup: boolean = true;
  private toolBox = Tool.getInstance();

  constructor({height, width, url}) {
    this.height = height;
    this.width = width;
    this.src = url;
  }

  public getPresentationDetail(): IPresentationDetail {
    return {
      src: this.src,
      width: `${this.width}`,
      height: `${this.height}`
    }
  }

  public addListener(img) {
    // this.popupHandlerFuncRef = this.popupOpen;
    img.addEventListener('pointerdown', () => this.showPopup = true)
    img.addEventListener('pointerup', (ev) => {
      if (this.showPopup && ev.button === 0 && ev.buttons === 0) {
        this.popupOpen(ev);
      }
    });
    document.addEventListener('pointermove', () => {
      this.showPopup = false;
    })
  }

  public addAnimalUrl(imgDetail: IPresentationDetail): void {
    this.presentationUrls.push(imgDetail);
  }

  private popupOpen({target}): void {
    this.preViewPopup = document.createElement('div');
    const width = Number(target.attributes.w.value) > document.body.clientWidth ? document.body.clientWidth : target.attributes.w.value;
    const height = Number(target.attributes.h.value) > document.body.clientHeight ? document.body.clientHeight : target.attributes.h.value;
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
        backgroundImage: `url(${target.attributes.src.value})`
      })
    document.body.append(this.preViewPopup);
    this.createShadowBox();
  }

  private createShadowBox(): void {
    this.boxShadowLink = this.toolBox.blackBoxCreator();
    document.body.append(this.boxShadowLink);

    this.boxShadowLink.addEventListener('click', () => this.closePreview())
    this.preViewPopup?.addEventListener('click', () => this.closePreview())
  }

  private closePreview(): void {
    this.boxShadowLink?.removeEventListener('click', this.popupOpen);
    this.preViewPopup?.removeEventListener('click', this.popupOpen);
    this.boxShadowLink?.remove();
    this.preViewPopup?.remove();
  }

}

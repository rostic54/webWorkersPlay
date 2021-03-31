import { PresentationType} from "../../interfaces/presentation.interface";
import IPresentationDetail = PresentationType.IPresentationDetail;
import IPresentation = PresentationType.IPresentation;

export class Presentation implements IPresentation {
  readonly height: number;
  readonly width: number;
  readonly src: string;
  private boxShadowLink: HTMLDivElement | null = null;
  private preViewPopup: HTMLDivElement | null = null;
  private presentationUrls: IPresentationDetail[] = [];
  private showPopup: boolean = true;

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
      if (this.showPopup) {
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
    Object.assign(
      this.preViewPopup.style,
      {
        width: `${target.attributes.w.value}px`,
        height: `${target.attributes.h.value}px`,
        position: 'fixed',
        zIndex: '2',
        top: '50% ',
        left: '50%',
        marginLeft: `-${target.attributes.w.value / 2}px`,
        marginTop: `-${target.attributes.h.value / 2}px`,
        backgroundImage: `url(${target.attributes.src.value})`
      })
    document.body.append(this.preViewPopup);
    this.createShadowBox();
  }

  private createShadowBox(): void {
    this.boxShadowLink = document.createElement('div');
    Object.assign(
      this.boxShadowLink.style,
      {
        position: 'fixed',
        left: '0',
        top: '0',
        zIndex: '1',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,.4)',
      })
    document.body.append(this.boxShadowLink);
    this.boxShadowLink.addEventListener('click', () => this.closePreview())
    this.preViewPopup?.addEventListener('click', () => this.closePreview())
  }

  private closePreview(): void {
    this.boxShadowLink?.removeEventListener('click', this.popupOpen);
    this.boxShadowLink?.remove();
    this.preViewPopup?.remove();
  }

}

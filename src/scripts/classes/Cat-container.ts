import {AnimalType} from "../../enum/animal-type.js";

export class CatContainer {
  private containerType = AnimalType.CAT;
  private catsBoxElement: HTMLElement | null;

  constructor() {
    this.catsBoxElement = document.getElementById('catsBox');
  }

  public addOverEventListener(): void {
    this.catsBoxElement?.addEventListener('pointerover', this.animalOverHandler);
  }

  private animalOverHandler(ev): void {
    console.log(ev);
  }
}

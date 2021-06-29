import {Distributor} from "./Distributor.js";


export class HintsManager {
  private static instance: HintsManager;
  private swipeHint: HTMLImageElement;
  private distributor: Distributor;
  private swipeReminderIntervalId: number | null = null;
  private swipeReminderTimeoutId: number | null = null;
  private delayForSwipeHintShow = 1000;

  private constructor() {
    this.swipeHint = document.getElementById('swipe-ico') as HTMLImageElement;
    this.distributor = Distributor.getInstance(this.distributorChildrenListener.bind(this));
  }

  static getInstance(): HintsManager {
    if(!HintsManager.instance) {
      HintsManager.instance = new HintsManager();
    }
    return HintsManager.instance
  }

  private runSwipeRemainder() {
    this.stopSwipeRemainderInterval();
    this.swipeReminderIntervalId = window.setInterval( () => {
      this.delayForSwipeHintShow = 4000;
      this.setBlinkCondition(this.swipeHint);
      this.stopSwipeRemainderTimeout();
      this.swipeReminderTimeoutId = window.setTimeout(() => {
        this.setHiddenCondition(this.swipeHint);
      }, 3000)
    }, this.delayForSwipeHintShow)
  }

  private stopSwipeRemainderInterval() {
    this.setHiddenCondition(this.swipeHint);
    this.stopSwipeRemainderTimeout();
    if (this.swipeReminderIntervalId) {
      clearInterval(this.swipeReminderIntervalId);
    }
  }

  private stopSwipeRemainderTimeout() {
    if (this.swipeReminderTimeoutId) {
      clearTimeout(this.swipeReminderTimeoutId);
    }
  }

  private setBlinkCondition(element: Element): void {
    element.classList.add('blink');
    element.classList.remove('hidden');
  }

  private setHiddenCondition(element: Element): void {
    element.classList.remove('blink');
    element.classList.add('hidden');
  }

  public distributorChildrenListener(mutRec) {
    const distributorElem = mutRec[0].target;
    if(distributorElem.children.length > 0 && !distributorElem.classList.contains('empty')) {
      this.runSwipeRemainder();
    } else {
      this.stopSwipeRemainderInterval();
    }
  }


}

import {HttpInterfaces} from "../../interfaces/http.interface";
import IApiDetail = HttpInterfaces.IApiDetail

export class HttpService {
  static instance: HttpService;

  private animalAPIs: IApiDetail[] = [
    {
      type: 'cat',
      url: 'https://api.thecatapi.com/v1/images/search?limit=1&size=full'
    },
    {
      type: 'dog',
      url: 'https://api.thedogapi.com/v1/images/search?limit=1&size=full'
    }
  ]

  private headers = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '724b0a85-a654-4937-a37a-3b8d2b698ca7',
    }
  }

  private constructor() {
  }

  public static getInstance(): HttpService {
    if(!this.instance) {
      this.instance = new HttpService();
    }
    return this.instance;
  }

  public getRandomAnimalAPI(): IApiDetail {
    const randomIndex = Math.random() > .5 ? 1 : 0;
    return this.animalAPIs[randomIndex]
  }

  public getRandomAnimal(): Promise<any>{
    return fetch(this.getRandomAnimalAPI().url, this.headers).then(film => film.json())
  }


}

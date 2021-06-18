export interface ICreatedAnimalResponseInterface extends Response{
  approved: number;
  height: number
  id: string;
  original_filename: string;
  pending: number;
  url: string;
  stringFormat?:string;
  width: number;
}

// approved: 1
// height: 480
// id: "9qk039b_N"
// original_filename: "blob"
// pending: 0
// url: "https://cdn2.thecatapi.com/images/9qk039b_N.png"
// width: 640

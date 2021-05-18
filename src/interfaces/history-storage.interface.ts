import {ContainersId} from "../enum/containers-id";

export interface IHistoryStorageInterface {
  containerId: ContainersId,
  timeStamp: string
}

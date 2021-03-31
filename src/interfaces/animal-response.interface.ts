import {AnimalType} from "../enum/animal-type";
import {PresentationType} from "./presentation.interface";
import IPresentation = PresentationType.IPresentation;
import IPresentationDetail = PresentationType.IPresentationDetail;

export namespace AnimalModel {

    export interface IAnimal {
        animalInfo: IAnimalDetail;
        presentationDetail: IPresentation;
        type: AnimalType;
        id: string;
        animalImg: HTMLImageElement;
        getDetailForImage(): IPresentationDetail;
        addAnimalUrl(imageDetail: IPresentationDetail): void;
    }

    export interface IAnimalDetail {
        breeds: any[];
        id: string;
        height: number;
        url: string;
        width: number;
        type: AnimalType
    }

    export interface IAnimalFactory {
        AnimalEntity: IAnimal;
        PresentationEntity: IPresentation;
        animalDetail: IAnimalDetail;

        getCreatedAnimalEntity(): IAnimal;
    }

}

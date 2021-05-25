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
        setAnimalContainerType(type: AnimalType): void;
        getDetailForImage(): IPresentationDetail;
        addAnimalUrl(imageDetail: IPresentationDetail): void;
        addListener(img: HTMLImageElement): void;
        removeAllListeners(): void;
        setErrorState(): IAnimal;
    }

    export interface IAnimalDetail {
        breeds: any[];
        id: string;
        height: number;
        url: string;
        width: number;
        type: AnimalType;
        containerType: AnimalType;
    }

    export interface IAnimalFactory {
        AnimalEntity: IAnimal;
        PresentationEntity: IPresentation;
        animalDetail: IAnimalDetail;

        getCreatedAnimalEntity(): IAnimal;
    }

}

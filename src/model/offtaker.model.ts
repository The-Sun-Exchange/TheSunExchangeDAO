import { Entity } from "../state/entity";

export interface OfftakerModel extends Entity {
    offtakerId: string;
    name: string;
    accountAddress: string;
}



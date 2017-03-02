import { CouchDoc } from "davenport";

export interface PledgerModel extends CouchDoc {
    pledgerId: string;
    name: string;
    pledgerAddress: string;
}


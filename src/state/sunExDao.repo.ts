import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Rx";

import Client, { CouchDoc, PostPutCopyResponse } from "davenport";

import { Repo } from "./repo";
import { SunExDao } from "../../src/contracts/sunExDao";

export class SunExDaoRepo extends Repo<SunExDao> {
    public findDaoFromAddress(address: string): Observable<SunExDao[]> {
        return super.find({
            address: address
        });
    }
}



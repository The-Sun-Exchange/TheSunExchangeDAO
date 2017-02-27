import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Rx";

import Client, { CouchDoc, PostPutCopyResponse } from "davenport";

export class Repo<ENTITY_T extends CouchDoc> {
    constructor(private databaseUri: string = "http://localhost:5984/", protected client = new Client<ENTITY_T>(databaseUri, "sun_ex_dao")) { }

    create(entity: ENTITY_T): Observable<ENTITY_T> {
        return Observable.fromPromise(this.client.post(entity))
            .mergeMap((response: PostPutCopyResponse) => {
                return Observable.fromPromise(this.client.get(response.id));
            });
    }
    save(entity: ENTITY_T): Observable<ENTITY_T> {
        return Observable.fromPromise(this.client.put(entity._id, entity, entity._rev))
            .mergeMap((response: PostPutCopyResponse) => {
                return Observable.fromPromise(this.client.get(response.id, response.rev));
            });
    }

    remove(entity: ENTITY_T): Observable<void> {
        return Observable.fromPromise(this.client.delete(entity._id, entity._rev));
    }

    find(key: any): Observable<ENTITY_T[]> {
        console.log("find selector = \n" +
            JSON.stringify({
                selector: key
            }));
        return Observable.fromPromise(this.client.find({
            selector: key
        }));
    }

}


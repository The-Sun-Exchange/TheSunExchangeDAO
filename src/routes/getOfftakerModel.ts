import Client, { PostPutCopyResponse, CouchDoc } from "davenport";
import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import { Observable } from "rxjs/Rx";


import { OfftakerModel } from "../model/offtaker.model";




export class GetOfftakerModelRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getOfftakerModelsRoute.");

        router.get("/get_offtaker_model", (req: Request, res: Response, next: NextFunction) => {
            new GetOfftakerModelRoute().getOfftakerModel(req, res, next);
        });
        router.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

    }

    constructor() {
        super();
    }

    public getOfftakerModel(req: Request, res: Response, next: NextFunction) {
        console.log("getOfftakerModel.req.json" + JSON.stringify(req.query));
        if (!req.query.offtakerId) {
            res.json({ applicationError: "offtakerId parameter is required " });
        } else {
            let offtakerId: string = req.query.offtakerId;
            console.log("Finding oftaker for id: " + req.query.offtakerId);
            let offtakerClient = new Client<OfftakerModel>("http://localhost:5984/", "sun_ex_dao");


            Observable.fromPromise(offtakerClient.find({
                selector: {
                    offtakerId: offtakerId
                }
            })).subscribe((offtakerModels: OfftakerModel[]) => {
                console.log("Sending: " + offtakerModels[0]);
                res.json(offtakerModels[0]);
            });
        }
    }
}

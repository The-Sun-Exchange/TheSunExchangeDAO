import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";


import Client, { PostPutCopyResponse, CouchDoc } from "davenport";
import { Observable } from "rxjs/Rx";
import { PledgerModel } from "./pledgerModel";

export class GetPledgerModelRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getPledgerModelRoute.");

        router.get("/get_pledger_model", (req: Request, res: Response, next: NextFunction) => {
            new GetPledgerModelRoute().getPledgerModel(req, res, next);
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

    public getPledgerModel(req: Request, res: Response, next: NextFunction) {
        if (!req.query.pledgerAddress) {
            res.json({ applicationError: "pledgerAddress parameter is required " });
        } else {
            let pledgerAddress: string = req.query.pledgerAddress;
            console.log("GetPledgerModel.getPledgerModel geting pledger for: " + pledgerAddress);

            let pledgerClient = new Client<PledgerModel>("http://localhost:5984/", "sun_ex_dao");

            Observable.fromPromise(pledgerClient.find({
                selector: {
                    pledgerAddress: pledgerAddress
                }
            })).subscribe((pledgerModels: PledgerModel[]) => {
                console.log("Sending: " + pledgerModels[0]);
                res.json(pledgerModels[0]);
            });
        }

    }
}

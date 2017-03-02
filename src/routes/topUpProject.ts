import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";


export class TopUpProjectRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating topUpProjectRoute.");
        router.get("/top_up_project", (req: Request, res: Response, next: NextFunction) => {
            new TopUpProjectRoute().topUpProject(req, res, next);
        });

        router.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });

    }

    constructor() {
        super();
    }

    public topUpProject(req: Request, res: Response, next: NextFunction) {
        console.log("TopUpProjectRouter.topUpProject() query = " + JSON.stringify(req.query));

        let service = new Service();
        let results: string = "";

        if (!req.query.fromAddress) {
            res.json({ applicationError: "fromAddress parameter is required" });
        } else if (!req.query.amount) {
            res.json({ applicationError: "amount parameter is required " });
        } else if (!req.query.toAddress) {
            res.json({ applicationError: "toAddress parameter is required" });
        } else {

            let fromAddress: string = req.query.fromAddress;
            let amount: number = req.query.amount;
            let toAddress: string = req.query.toAddress;

            console.log("TopUpProjectRouter.topUpProject() calling service");
            service.topUpProject(fromAddress, amount, toAddress).subscribe(
                (balance: number) => {
                    console.log("New Project balance =  " + balance);
                    res.json({ balance: balance });
                },
                (error: any) => {
                    console.log("topUpProject ERROR:" + error);
                    res.json({ applicationError: error });
                },
                () => {
                });
        }
    }
}

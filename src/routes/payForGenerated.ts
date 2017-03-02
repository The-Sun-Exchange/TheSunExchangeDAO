import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";


export class PayForGeneratedRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating topUpProjectRoute.");
        router.get("/pay_for_generated", (req: Request, res: Response, next: NextFunction) => {
            new PayForGeneratedRoute().topUpProject(req, res, next);
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
        console.log("PayForGeneratedRouter.topUpProject() query = " + JSON.stringify(req.query));

        let service = new Service();
        let results: string = "";

        if (!req.query.projectAddress) {
            res.json({ applicationError: "projectAddress parameter is required" });
        } else if (!req.query.amount) {
            res.json({ applicationError: "amount parameter is required " });
        } else {

            let amount: number = req.query.amount;
            let projectAddress: string = req.query.projectAddress;

            console.log("PayForGeneratedRouter.topUpProject() calling service");
            service.payForGenerated(projectAddress, amount).subscribe(
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

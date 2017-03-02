import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";


export class TransferFundsRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating transferFundsRoute.");
        router.get("/transfer_funds", (req: Request, res: Response, next: NextFunction) => {
            new TransferFundsRoute().transferFunds(req, res, next);
        });

        router.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });

    }

    constructor() {
        super();
    }

    public transferFunds(req: Request, res: Response, next: NextFunction) {
        console.log("TransferFundsRouter.transferFunds() query = " + JSON.stringify(req.query));

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

            console.log("TransferFundsRouter.transferFunds() calling service");
            service.transferFunds(fromAddress, amount, toAddress).subscribe(
                (transactionId: string) => {
                    console.log("Transaction Id: " + transactionId);
                    res.json({ transactionId: transactionId });
                },
                (error: any) => {
                    console.log("transferFunds ERROR:" + error);
                    res.json({ applicationError: error });
                },
                () => {
                });
        }
    }
}

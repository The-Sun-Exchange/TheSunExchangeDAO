import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { SunExDao } from "../contracts/sunExDao";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";

const Web3: any = require("web3");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class FundAccountRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating fundAccountRoute.");

        router.get("/fund_account", (req: Request, res: Response, next: NextFunction) => {
            new FundAccountRoute().fundAccount(req, res, next);
        });
    }

    constructor() {
        super();
    }

    public fundAccount(req: Request, res: Response, next: NextFunction) {
        let service = new Service();
        let results: string = "";

        if (!req.query.account) {
            res.json({ applicationError: "account parameter is required" });
        } else if (!req.query.amount) {
            res.json({ applicationError: "amount parameter is required " });
        } else {

            let amount: number = req.query.amount;
            let address: string = req.query.account;

            service.fundAccount(address, amount).subscribe(
                (transactionId: string) => {
                    res.json({ transactionId: transactionId });
                },
                (error: any) => {
                    res.json({ applicationError: error });
                },
                () => {
                });
        }
    }
}

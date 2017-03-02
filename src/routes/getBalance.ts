import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { SunExDao } from "../contracts/sunExDao";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";

const Web3: any = require("web3");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class GetBalanceRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getBalanceRoute.");

        router.get("/get_balance", (req: Request, res: Response, next: NextFunction) => {
            new GetBalanceRoute().getBalance(req, res, next);
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

    public getBalance(req: Request, res: Response, next: NextFunction) {
        let service = new Service();
        let results: string = "";

        if (!req.query.account) {
            res.json({ applicationError: "account parameter is required" });
        } else {

            let amount: number = req.query.amount;
            let address: string = req.query.account;

            service.getBalance(address).subscribe(
                (balance: number) => {
                    res.json({ balance: balance });
                },
                (error: any) => {
                    res.json({ applicationError: error });
                },
                () => {
                });
        }
    }
}

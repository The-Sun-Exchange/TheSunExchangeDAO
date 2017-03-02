import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";

const Web3: any = require("web3");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class CreateAccountRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating createDoaRoute.");

        router.get("/create_account", (req: Request, res: Response, next: NextFunction) => {
            new CreateAccountRoute().createAccount(req, res, next);
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

    public createAccount(req: Request, res: Response, next: NextFunction) {
        let service = new Service();
        let results: string = "";

        service.createAccount().subscribe(
            (accountAddress: string) => {
                console.log("address in router: " + accountAddress);
                res.json({ accountAddress: accountAddress });
            },
            (error: any) => {
                res.json({ applicationError: error });
            },
            () => {
            });
    }
}

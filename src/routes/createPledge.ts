import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { SunExPledge } from "../contracts/sunExPledge";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";

const Web3: any = require("web3");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class CreatePledgeRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating createPledgeRoute.");

        router.get("/create_pledge", (req: Request, res: Response, next: NextFunction) => {
            new CreatePledgeRoute().createPledge(req, res, next);
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

    public createPledge(req: Request, res: Response, next: NextFunction) {

        console.log("createPledgeRoute.createPledge");

        if (!req.query.projectAddress) {
            res.json({ applicationError: "projectAddress parameter is required" });
        } else if (!req.query.accountAddress) {
            res.json({ applicationError: "accountAddress parameter is required " });
        } else if (!req.query.amount) {
            res.json({ applicationError: "amount parameter is required " });
        } else {
            let service = new Service();
            let results: string = "";

            let projectAddress: string = req.query.projectAddress;
            let accountAddress: string = req.query.accountAddress;
            let amount: number = req.query.amount;

            service.createPledge(accountAddress, projectAddress, amount).subscribe(
                (pledgeAddress: string) => {
                    res.json({ pledgeAddress: pledgeAddress });
                },
                (error: any) => {
                    res.json({ applicationError: error });
                },
                () => {
                });

        }
    }
}

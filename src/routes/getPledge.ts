import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { SunExPledge } from "../contracts/sunExPledge";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";
import { PledgeListItem } from "../contracts/pledgeListItem";

const Web3: any = require("web3");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class GetPledgeRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getPledgeRoute.");

        router.get("/get_pledge", (req: Request, res: Response, next: NextFunction) => {
            new GetPledgeRoute().getPledge(req, res, next);
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

    public getPledge(req: Request, res: Response, next: NextFunction) {
        if (!req.query.pledgeAddress) {
            res.json({ applicationError: "pledgeAddress parameter is required " });
        } else {
            let service = new Service();
            let results: string = "";

            let pledgeAddress: string = req.query.pledgeAddress;

            service.getPledge(pledgeAddress).subscribe(
                (pledge: PledgeListItem) => {
                    res.json({ pledge: pledge });
                },
                (error: any) => {
                    res.json({ applicationError: error });
                },
                () => {
                });
        }
    }
}

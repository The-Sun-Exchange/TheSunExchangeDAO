import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";
import { PledgeListItem } from "../contracts/pledgeListItem";

const Web3: any = require("web3");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class GetPledgesRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getPledgesRoute.");

        router.get("/get_pledges", (req: Request, res: Response, next: NextFunction) => {
            new GetPledgesRoute().getPledges(req, res, next);
        });
    }

    constructor() {
        super();
    }

    public getPledges(req: Request, res: Response, next: NextFunction) {
        if (!req.query.projectAddress) {
            res.json({ applicationError: "projectAddress parameter is required " });
        } else {
            let service = new Service();
            let results: string = "";


            let projectAddress: string = req.query.projectAddress;


            service.getPledges(projectAddress).subscribe(
                (pledges: PledgeListItem[]) => {
                    res.json({ pledges: pledges });
                },
                (error: any) => {
                    res.json({ applicationError: error });
                },
                () => {
                });

        }
    }
}

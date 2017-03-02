import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { SunExProject } from "../contracts/sunExProject";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";

const Web3: any = require("web3");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class CreateProjectRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating createProjectRoute.");

        router.get("/create_project", (req: Request, res: Response, next: NextFunction) => {
            new CreateProjectRoute().createProject(req, res, next);
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

    public createProject(req: Request, res: Response, next: NextFunction) {

        console.log("createProjectRoute.createProject");

        if (!req.query.fundingTarget) {
            res.json({ applicationError: "fundingTarget parameter is required" });
        } else if (!req.query.daoAddress) {
            res.json({ applicationError: "daoAddress parameter is required " });
        } else {
            let service = new Service();
            let results: string = "";


            let fundingTarget: number = req.query.fundingTarget;
            let daoAddress: string = req.query.daoAddress;


            service.createProject(daoAddress, fundingTarget).subscribe(
                (projectAddress: string) => {
                    console.log("address in router: " + projectAddress);
                    res.json({ projectAddress: projectAddress });
                },
                (error: any) => {
                    res.json({ applicationError: error });
                },
                () => {
                });

        }
    }
}

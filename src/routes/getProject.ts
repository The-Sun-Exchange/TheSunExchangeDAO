import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { SunExProject } from "../contracts/sunExProject";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";
import { ProjectListItem } from "../contracts/projectListItem";

const Web3: any = require("web3");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class GetProjectRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getProjectRoute.");

        router.get("/get_project", (req: Request, res: Response, next: NextFunction) => {
            new GetProjectRoute().getProject(req, res, next);
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

    public getProject(req: Request, res: Response, next: NextFunction) {
        if (!req.query.projectAddress) {
            res.json({ applicationError: "projectAddress parameter is required " });
        } else {
            let service = new Service();
            let results: string = "";

            let projectAddress: string = req.query.projectAddress;

            service.getProject(projectAddress).subscribe(
                (project: ProjectListItem) => {
                    res.json({ project: project });
                },
                (error: any) => {
                    res.json({ applicationError: error });
                },
                () => {
                });

        }
    }
}

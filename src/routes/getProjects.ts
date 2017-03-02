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

export class GetProjectsRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getProjectsRoute.");

        router.get("/get_projects", (req: Request, res: Response, next: NextFunction) => {
            new GetProjectsRoute().getProjects(req, res, next);
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

    public getProjects(req: Request, res: Response, next: NextFunction) {
        if (!req.query.daoAddress) {
            res.json({ applicationError: "daoAddress parameter is required " });
        } else {
            let service = new Service();
            let results: string = "";


            let fundingTarget: number = req.query.fundingTarget;
            let daoAddress: string = req.query.daoAddress;


            service.getProjects(daoAddress).subscribe(
                (projects: ProjectListItem[]) => {
                    res.json({ projects: projects });
                },
                (error: any) => {
                    res.json({ applicationError: error });
                },
                () => {
                });

        }
    }
}

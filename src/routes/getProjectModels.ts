import Client, { PostPutCopyResponse, CouchDoc } from "davenport";
import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import { Observable } from "rxjs/Rx";


import { Service } from "../service";
import { SunExProject } from "../contracts/sunExProject";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";
import { ProjectListItem } from "../contracts/projectListItem";

const Web3: any = require("web3");

interface ProjectModel extends CouchDoc {
    projectId: string;
    projectName: string;
    projectContract: string;
    imageName: string;
    numberOfCells: number;
    pricePerCell: number;
    fundingStartDate: string;
    fundingEndDate: string;
    goLiveDate: string;
    leaseTerm: number;
    installer: string;
    country: string;
    rentalPerCell: number;
    numberOfCellsPledgedFor: number;
    offtakerId: string;
    daoAddress: string;
}


let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
BlockchainProxy.setWeb3(web3);

export class GetProjectModelsRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getProjectModelsRoute.");

        router.get("/get_project_models", (req: Request, res: Response, next: NextFunction) => {
            new GetProjectModelsRoute().getProjectModels(req, res, next);
        });
    }

    constructor() {
        super();
    }

    public getProjectModels(req: Request, res: Response, next: NextFunction) {
        if (!req.query.daoAddress) {
            res.json({ applicationError: "daoAddress parameter is required " });
        } else {
            let daoAddress: string = req.query.daoAddress
            let projectClient = new Client<ProjectModel>("http://localhost:5984/", "sun_ex_dao");

            Observable.fromPromise(projectClient.find({
                selector: {
                    daoAddress: daoAddress// "0xe6112b5d959fdc3f118d8384f3fa166314d81c7e"
                }
            })).subscribe((projectModels: ProjectModel[]) => {
                res.json(projectModels);
            });
        }
    }
}

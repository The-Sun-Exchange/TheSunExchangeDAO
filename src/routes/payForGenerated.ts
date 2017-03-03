import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";
import { ProjectModel } from "./projectModel";

import Client, { PostPutCopyResponse, CouchDoc } from "davenport";
import { Observable } from "rxjs/Rx";


export class PayForGeneratedRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating topUpProjectRoute.");
        router.get("/pay_for_generated", (req: Request, res: Response, next: NextFunction) => {
            new PayForGeneratedRoute().payForGenerated(req, res, next);
        });

        router.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });

    }

    constructor() {
        super();
    }

    public payForGenerated(req: Request, res: Response, next: NextFunction) {
        console.log("PayForGeneratedRouter.payForGenerated() query = " + JSON.stringify(req.query));

        let service = new Service();
        let results: string = "";

        if (!req.query.projectAddress) {
            res.json({ applicationError: "projectAddress parameter is required" });
        } else if (!req.query.amount) {
            res.json({ applicationError: "amount parameter is required " });
        } else {

            let amount: number = req.query.amount;
            let projectAddress: string = req.query.projectAddress;
            let newBalance: number = 0;

            let projectClient = new Client<ProjectModel>("http://localhost:5984/", "sun_ex_dao");
            console.log("PayForGeneratedRouter.payForGenerated() calling service");
            service.payForGenerated(projectAddress, amount)
                .mergeMap((balance: number) => {
                    console.log("New Project balance =  " + balance);
                    newBalance = balance;


                    return Observable
                        .fromPromise(projectClient.find({
                            selector: {
                                projectAddress: projectAddress
                            }
                        }));
                })
                .mergeMap((projectModels: ProjectModel[]) => {
                    let projectModel: ProjectModel = projectModels[0];

                    projectModel.currentCharges = projectModel.currentCharges - amount;

                    return projectClient.put(projectModel._id, projectModel, projectModel._rev);
                }).subscribe((response: PostPutCopyResponse) => {
                    res.json({ balance: newBalance });
                },
                (error: any) => {
                    console.log("topUpProject ERROR:" + error);
                    res.json({ applicationError: error });
                },
                () => {
                });
        }
    }
}

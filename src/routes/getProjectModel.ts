import Client, { PostPutCopyResponse, CouchDoc } from "davenport";
import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import { Observable } from "rxjs/Rx";


import { ProjectModel } from "./projectModel";

export class GetProjectModelRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating getProjectModelsRoute.");

        router.get("/get_project_model", (req: Request, res: Response, next: NextFunction) => {
            new GetProjectModelRoute().getProjectModel(req, res, next);
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

    public getProjectModel(req: Request, res: Response, next: NextFunction) {
        if (!req.query.projectAddress) {
            res.json({ applicationError: "projectAddress parameter is required " });
        } else {
            let projectAddress: string = req.query.projectAddress;
            let projectClient = new Client<ProjectModel>("http://localhost:5984/", "sun_ex_dao");

            Observable.fromPromise(projectClient.find({
                selector: {
                    projectAddress: projectAddress
                }
            })).subscribe((projectModels: ProjectModel[]) => {
                console.log("Sending: " + projectModels[0]);
                res.json(projectModels[0]);
            });
        }
    }
}

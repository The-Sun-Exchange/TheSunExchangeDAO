import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Service } from "../service";

export class AboutRoute extends BaseRoute {

    public static create(router: Router) {
        console.log("Creating aboutRoute.");

        router.get("/about", (req: Request, res: Response, next: NextFunction) => {
            new AboutRoute().about(req, res, next);
        });
        router.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });

    }

    constructor() {
        super();
    }

    public about(req: Request, res: Response, next: NextFunction) {
        let service = new Service();
        let results: string = "";

        service.about().subscribe(
            (aboutMessage: String) => {
                res.json(JSON.stringify(aboutMessage));
            },
            (error) => {
                res.json({ applicationError: error });
            },
            () => {
            });

    }
}

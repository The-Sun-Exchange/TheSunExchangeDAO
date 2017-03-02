import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import { AboutRoute } from "./routes/about";
import { CreateDaoRoute } from "./routes/createDao";
import { CreateProjectRoute } from "./routes/createProject";
import { GetProjectsRoute } from "./routes/getProjects";
import { CreateAccountRoute } from "./routes/createAccount";
import { FundAccountRoute } from "./routes/fundAccount";
import { GetBalanceRoute } from "./routes/getBalance";
import { GetProjectRoute } from "./routes/getProject";
import { CreatePledgeRoute } from "./routes/createPledge";
import { GetPledgesRoute } from "./routes/getPledges";
import { GetPledgeRoute } from "./routes/getPledge";
import { GetProjectModelsRoute } from "./routes/getProjectModels";
import { GetProjectModelRoute } from "./routes/getProjectModel";
import { GetOfftakerModelRoute } from "./routes/getOfftakerModel";
import { TransferFundsRoute } from "./routes/transferFunds";
import { TopUpProjectRoute } from "./routes/topUpProject";
import { GetPledgerModelRoute } from "./routes/getPledgerModel";
import { ConvertProjectRoute } from "./routes/convertProject";
import { PayForGeneratedRoute } from "./routes/payForGenerated";

let cors = require("cors");

export class Server {

    public app: express.Application;

    public static bootstrap(): Server {
        return new Server();
    }

    public config() {
        this.app.use(logger("dev"));

        this.app.use(cors());

        this.app.use(bodyParser.json());

        this.app.use(bodyParser.urlencoded({
            extended: true
        }));

        this.app.use(cookieParser("SECRET_GOES_HERE"));

        this.app.use(methodOverride());

        this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
            err.status = 404;
            next(err);
        });
        this.app.disable("etag");

        this.app.use(errorHandler());
    }

    constructor() {
        this.app = express();

        this.config();

        this.routes();
    }

    public routes() {
        let router: express.Router;
        router = express.Router();

        AboutRoute.create(router);
        CreateDaoRoute.create(router);
        CreateProjectRoute.create(router);
        GetProjectsRoute.create(router);
        CreateAccountRoute.create(router);
        FundAccountRoute.create(router);
        GetBalanceRoute.create(router);
        GetProjectRoute.create(router);
        CreatePledgeRoute.create(router);
        GetPledgesRoute.create(router);
        GetPledgeRoute.create(router);
        GetProjectModelsRoute.create(router);
        GetProjectModelRoute.create(router);
        GetOfftakerModelRoute.create(router);
        TransferFundsRoute.create(router);
        TopUpProjectRoute.create(router);
        GetPledgerModelRoute.create(router);
        ConvertProjectRoute.create(router);
        PayForGeneratedRoute.create(router);
        this.app.use(router);
    }
}

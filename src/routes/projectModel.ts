import { CouchDoc } from "davenport";

export interface ProjectModel extends CouchDoc {
    projectId: string;
    projectName: string;
    projectAddress: string;
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


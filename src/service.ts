import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import { SmartContractFactory } from "./smartContractFacade/smartContractFactory";
import { BlockchainProxy } from "./smartContractFacade/blockchainProxy";
import { SunExPledge } from "./contracts/sunExPledge";
import { SunExDao } from "./contracts/sunExDao";
import { SunExProject } from "./contracts/sunExProject";
import { ProjectListItem } from "./contracts/projectListItem";
import { PledgeListItem } from "./contracts/pledgeListItem";

import { of } from "rxjs/observable/of";

import "rxjs/Rx";

export class Service {

    constructor() {
    }

    public about(): Observable<string> {

        return Observable.create((observer: Observer<string>) => {

            observer.next("The Sun Exchange Blockchain Demo - copyright Jump Software");
            observer.complete();

        });
    }

    public createDao(): Observable<string> {
        return SmartContractFactory.getContract("SunExDao", SunExDao)
            .mergeMap((daoContract: SunExDao) => {
                return BlockchainProxy.deployContract(daoContract);
            })
            .mergeMap((daoContract: SunExDao) => {
                let address: string = daoContract.getAddress();
                console.log("daoAddress in service:" + address);
                return Observable.of(address);
            });
    }


    public createProject(daoAddress: string, fundingTarget: number): Observable<string> {
        console.log("service.createProject");
        return SmartContractFactory.getContract("SunExDao", SunExDao)
            .mergeMap((daoContract: SunExDao) => {
                daoContract.setAddress(daoAddress);
                return daoContract.createProject(fundingTarget);
            })
            .mergeMap((project: SunExProject) => {
                return Observable.of(project.getAddress());
            });
    }

    public getProjects(daoAddress: string): Observable<ProjectListItem[]> {
        return SmartContractFactory.getContract("SunExDao", SunExDao)
            .mergeMap((daoContract: SunExDao) => {
                daoContract.setAddress(daoAddress);
                return daoContract.getProjects();
            })
            .toArray();
    }

    public getProject(projectAddress: string): Observable<ProjectListItem> {
        console.log("Getting project info for " + projectAddress);
        return SmartContractFactory.getContract("SunExProject", SunExProject)
            .mergeMap((projectContract: SunExProject) => {
                projectContract.setAddress(projectAddress);
                return projectContract.getProjectInfo();
            });
    }

    public createAccount(): Observable<string> {
        return BlockchainProxy.createAccount("password");
    }

    public fundAccount(account: string, amount: number): Observable<string> {
        return BlockchainProxy.getCoinbase()
            .mergeMap((coinbase: string) => {
                return BlockchainProxy.transferFunds(coinbase, "password", account, amount);
            });
    };

    public getBalance(account: string): Observable<number> {
        return BlockchainProxy.getBalance(account);
    }

    public createPledge(accountAddress: string, projectAddress: string, amount: number): Observable<string> {
        return SmartContractFactory.getContract("SunExProject", SunExProject)
            .mergeMap((projectContract: SunExProject) => {
                projectContract.setAddress(projectAddress);
                return projectContract.receivePledge(accountAddress, "password", amount);
            })
            .mergeMap((pledge: SunExPledge) => {
                return Observable.of(pledge.getAddress());
            });
    }

    public getPledges(projectAddress: string): Observable<PledgeListItem[]> {
        console.log("Getting pledges for : " + projectAddress);
        return SmartContractFactory.getContract("SunExProject", SunExProject)
            .mergeMap((projectContract: SunExProject) => {
                projectContract.setAddress(projectAddress);
                return projectContract.getPledges();
            }).toArray();
    }

    public getPledge(pledgeAddress: string): Observable<PledgeListItem> {
        console.log("Getting Pledge info for " + pledgeAddress);
        return SmartContractFactory.getContract("SunExPledge", SunExPledge)
            .mergeMap((pledgeContract: SunExPledge) => {
                pledgeContract.setAddress(pledgeAddress);
                return pledgeContract.getPledgeInfo();
            });
    }


}


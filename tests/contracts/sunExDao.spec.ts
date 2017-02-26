// DEBT:
// =====
// 1) The mechanism to merge 2 eventstreams isn't robust in that it
// doesn't deal with timeouts gracefully.

import { SmartContractFactory } from "../../src/smartContractFacade/smartContractFactory";
import { BlockchainProxy } from "../../src/smartContractFacade/blockchainProxy";

import { expect } from "chai";

import { SmartContract } from "../../src/smartContractFacade/smartContract";
import { SunExDao } from "../../src/contracts/sunExDao";
import { SunExProject } from "../../src/contracts/sunExProject";
import { SunExPledge } from "../../src/contracts/sunExPledge";
import { ProjectListItem } from "../../src/contracts/projectListItem";
import { PledgeListItem } from "../../src/contracts/pledgeListItem";

import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/from";
import "rxjs/add/operator/map";
import "rxjs/add/operator/zip";
import "rxjs/add/observable/of";

import { TestSetup } from "../testSetup";

import { SunExDaoRepo } from "../../src/state/sunExDao.repo";

const Web3: any = require("web3");

describe("SunExDao", function () {

    it("SunExDao contract compiles cleanly", function (done: any) {
        this.timeout(15000);
        TestSetup.createDao().subscribe((contract: SunExDao) => {
            expect(contract.getBytecode()).to.not.be.undefined;
        }, done, done);
    });

    it("SunExDao contract deploys", function (done: any) {
        this.timeout(15000);

        SmartContractFactory.getContract("SunExDao", SunExDao)
            .mergeMap((contract: SunExDao) => BlockchainProxy.deployContract(contract))
            .subscribe((contract: SunExDao) => expect(contract.getAddress()).to.not.be.undefined
            , done, done);
    });

    it("SunExDao creates SunExProjects", function (done: any) {
        console.log("Test that SunExDao creates SunExProjects");
        this.timeout(45000);


        let projectContractObservable = TestSetup.createProject();

        projectContractObservable.subscribe((project: SunExProject) => {
            expect(project).to.not.be.undefined;
            expect(project instanceof SunExProject);

        }, (error: any) => {
            console.log("TEST ERROR:" + error);
            done();
        }, done);
    });

    it("SunExDao returns list of projects", function (done: any) {
        this.timeout(60000);
        let dao: SunExDao;
        let projects: ProjectListItem[] = [];
        TestSetup.createDao()
            .mergeMap((createdDao: SunExDao) => {
                dao = createdDao;
                return TestSetup.create2ProjectsForDao(dao);
            })
            .mergeMap((projects: SunExProject[]) => {
                return dao.getProjects();
            })
            .subscribe((projectListItem: ProjectListItem) => {
                projects.push(projectListItem);
            }, (error) => {
                console.log(error);
            }, () => {
                expect(projects.length).to.be.equal(2);
                done();
            });

    });

    /*

    it("a fully paid up projects does nothing but change value on topup", function (done: any) {
        // create the DAO
        // create a project.

        let projectContractObservable = SmartContractFactory.getContract("SunExDao", SunExDao)
            .mergeMap((daoContract: SunExDao) => BlockchainProxy.deployContract(daoContract))
            .mergeMap((daoContract: SunExDao) => daoContract.createProject(100));

        // create a pledger.
        //  fund pledger.

        let pledgerObservable = function (): Observable<string> {
            return Observable.create((observer: Observer<string>) => {
                let pledgerAddress = BlockchainProxy.createAccount("password");
                console.log("Got PledgerAddress: " + pledgerAddress);
                observer.next(pledgerAddress);
                observer.complete();
            });
        };

        let fundPledger = function (pledgerAddress: string): Observable<string> {
            return Observable.create((observer: Observer<string>) => {
                BlockchainProxy.getCoinbase().subscribe((coinbase: string) => {
                    BlockchainProxy.transferFunds(coinbase, "password", pledgerAddress, 11e18)
                        .subscribe(() => {
                            observer.next(pledgerAddress);
                            console.log("Pledger got funds");
                            observer.complete();
                        });
                });
            });
        };

        let fundedPledgerObservable =
            pledgerObservable()
                .mergeMap((pledgerAddress: string) => {
                    BlockchainProxy.unlockAccount(pledgerAddress, "password");
                    return fundPledger(pledgerAddress);
                });

        let fullyFundedProjectObservable = projectContractObservable.zip(fundedPledgerObservable, (project: SunExProject, pledger: string) => {
            return Observable.create((observer: Observer<SunExProject>) => {
                return project.convert();
            });
        });

        // make pledge.
        //    let pledgeMadeObservable =


        // create offtaker.
        //  fund offtaker.
        let offtakerObservable = function (): Observable<string> {
            return Observable.create((observer: Observer<string>) => {
                let offtakerAddress = BlockchainProxy.createAccount("password");
                console.log("Got OfftakerAddress: " + offtakerAddress);
                observer.next(offtakerAddress);
                observer.complete();
            });
        };

        let fundOfftaker = function (offtakerAddress: string): Observable<string> {
            return Observable.create((observer: Observer<string>) => {
                BlockchainProxy.getCoinbase().subscribe((coinbase: string) => {
                    BlockchainProxy.transferFunds(coinbase, "password", offtakerAddress, 11e18)
                        .subscribe(() => {
                            observer.next(offtakerAddress);
                            console.log("Pledger got funds");
                            observer.complete();
                        });
                });
            });
        };

        let fundedOftakerObservable =
            pledgerObservable()
                .mergeMap((offtakerAddress: string) => {
                    BlockchainProxy.unlockAccount(offtakerAddress, "password");
                    return fundOfftaker(offtakerAddress);
                });

        //  have offtaker top up project
        // check pledger ballance to be unchanged.
        // check project ballance to equal top up amount.

        contractObservable.



    });
*/
    /*
   
    
        it("project.getPledges returns the addresses of the pledges made to the project", function (done: any) {
    
            this.timeout(150000);
            let pledgeList = new Array<PledgeListItem>();
    
            let project: SunExProject;
    
            BlockchainProxy.getCoinbase().subscribe((coinbase: string) => {
    
    
                let contractObservable = SmartContractFactory.getContract("SunExDao", SunExDao)
                    .mergeMap((daoContract: SunExDao) => BlockchainProxy.deployContract(daoContract))
                    .mergeMap((daoContract: SunExDao) => daoContract.createProject(100))
                    .mergeMap((projectContract: SunExProject) => {
                        project = projectContract;
                        return project.receivePledge(coinbase, 10);
                    }).mergeMap((p: SunExPledge) => {
                        return project.receivePledge(coinbase, 10);
                    }).mergeMap((p: SunExPledge) => {
                        return project.receivePledge(coinbase, 10);
                    }).mergeMap((d: SunExPledge) => {
                        return project.getPledges();
                    }).subscribe((pledgeListItem: PledgeListItem) => {
                        console.log("got an item: ");
                        pledgeList.push(pledgeListItem);
                    }, (error) => {
                        console.log(JSON.stringify(error));
                    }, () => {
                        expect(pledgeList.length).to.be.equal(3);
    
                        done();
                    });
            });
        });
    
    
    */
    /*
        it(".getProjects returns the addresses of the contracts it manages", function (done: any) {
    
            this.timeout(150000);
            let projectList = new Array<ProjectListItem>();
    
    
            let dao: SunExDao;
    
            let contractObservable = SmartContractFactory.getContract("SunExDao", SunExDao)
                .mergeMap((daoContract: SunExDao) => BlockchainProxy.deployContract(daoContract))
                .mergeMap((daoContract: SunExDao) => {
                    dao = daoContract;
                    return dao.createProject(100);
                })
                .mergeMap((p: SunExProject) => {
                    return dao.createProject(100);
                }).mergeMap((p: SunExProject) => {
                    return dao.createProject(100);
                }).mergeMap((d: SunExProject) => {
                    return dao.getProjects();
                }).subscribe((projectListItem: ProjectListItem) => {
                    projectList.push(projectListItem);
                }, (error) => {
                    console.log(JSON.stringify(error));
                }, () => {
                    expect(projectList.length).to.be.equal(3);
    
    
                    done();
                });
    
        });
    });
    
    */

});



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

const Web3: any = require("web3");

describe("SunExProject", function () {

    it("projects accept pledges", function (done: any) {
        this.timeout(150000);
        console.log("testing that SunExProjects accept pledges");

        let projectObservable = TestSetup.createProject();
        let pledgerObservable = TestSetup.createFundedPledger();


        let projectAndPledgerObservable = projectObservable.zip(pledgerObservable);

        projectAndPledgerObservable.subscribe((parms: [SunExProject, string]) => {
            let project = parms[0];
            let pledger = parms[1];

            console.log("Project at: " + project.getAddress() + "\nPledger at: " + pledger);
            expect(project).to.not.be.undefined;


            project.receivePledge(pledger, "password", 1.23e17).subscribe((pledge: SunExPledge) => {

                expect(pledge).to.not.be.undefined;
                expect(pledge instanceof SunExPledge);
                expect(pledge.getAddress()).to.not.be.equal("");


                console.log("Getting the pledge contract balance");

                pledge.getBalance().subscribe((pledgeBalance: number) => {
                    expect(pledgeBalance).to.be.equal(1.23e17);
                }, (error: any) => {
                    console.log("ERROR WHILE TESTING: " + error);
                }, done);
            }, (error: any) => {
                console.log("ERROR WHILE TESTING: " + error);
                done();
            });
        });
    });
});

import { BlockchainProxy } from "../src/smartContractFacade/blockchainProxy";
import { SmartContractFactory } from "../src/smartContractFacade/smartContractFactory";
import { SmartContract } from "../src/smartContractFacade/smartContract";
import { SunExDao } from "../src/contracts/sunExDao";
import { SunExProject } from "../src/contracts/sunExProject";
import { SunExPledge } from "../src/contracts/sunExPledge";
import { ProjectListItem } from "../src/contracts/projectListItem";
import { PledgeListItem } from "../src/contracts/pledgeListItem";


import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/from";
import "rxjs/add/operator/map";
import "rxjs/add/operator/zip";
import "rxjs/add/observable/of";


const Web3: any = require("web3");

before(() => {
    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
    BlockchainProxy.setWeb3(web3);
});

export namespace TestSetup {

    export function createDao(): Observable<SunExDao> {
        console.log("TestSetup: creating SuneExDao");
        return SmartContractFactory.getContract("SunExDao", SunExDao)
            .mergeMap((daoContract: SunExDao) => BlockchainProxy.deployContract(daoContract));
    }

    export function createProject(): Observable<SunExProject> {
        console.log("TestSetup: creating SuneExProject");
        return TestSetup.createDao()
            .mergeMap((dao: SunExDao) => dao.createProject(2e18));
    }

    export function createProjectForDao(dao: SunExDao): Observable<SunExProject> {
        console.log("TestSetup: creating SuneExProject");
        return dao.createProject(2e18);
    }

    export function createPledger(): Observable<string> {
        console.log("TestSetup: creating pledger address");
        return BlockchainProxy.createAccount("password");
    }

    export function createFundedPledger(): Observable<string> {
        return TestSetup.createPledger()
            .mergeMap((pledger: string) =>
                fundPledger(pledger));
    }

    export function fundPledger(pledgerAddress: string): Observable<string> {
        return BlockchainProxy.getCoinbase()
            .mergeMap((coinbase: string) =>
                BlockchainProxy.transferFunds(coinbase, "password", pledgerAddress, 11e18));
    }

    export function create2ProjectsForDao(dao: SunExDao): Observable<SunExProject[]> {
        return dao.createProject(2e18)
            .zip(dao.createProject(3e18));
    }
}

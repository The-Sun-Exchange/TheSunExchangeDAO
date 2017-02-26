import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/map";

import * as mocha from "mocha";

import { SmartContractFactory } from "../../src/smartContractFacade/smartContractFactory";
import { SmartContract } from "../../src/smartContractFacade/smartContract";
import { BlockchainProxy } from "../../src/smartContractFacade/blockchainProxy";

import { expect } from "chai";

const Web3: any = require("web3");



describe("BlockchainProxy", () => {
    it("connects to geth and return geth version", (done) => {

        BlockchainProxy.getApiVersion().subscribe(
            (version) => {
                expect(version).to.equals("0.18.2");
                done();
            }, done);

    });

});


describe("BlockchainProxy.depolyContract", () => {

    class DummyContract extends SmartContract {
        constructor() {
            super("Dummy", "pragma solidity ^0.4.2; contract Dummy {}");
        }
    }


    class SubContract extends SmartContract {
        constructor() {
            super("SubContract", "contract SubContract {}");
        }
    }



    it("deploys a simple contract", function (done: any) {
        this.timeout(40000);




        SmartContractFactory.getContract("Dummy", DummyContract)
            .mergeMap((compiledContract: DummyContract) => BlockchainProxy.deployContract(compiledContract))
            .map((deployedContract: DummyContract) => {
                console.log("contract deployed");
                expect(deployedContract.getAddress()).to.not.be.undefined;
            })
            .subscribe(done, done);
    });

    it("it compiles and populates the bytecode and the interface of a compound contract", (done) => {

        class CompoundContract extends SmartContract {
            constructor() {
                super("CompoundContract",
                    `
pragma solidity ^0.4.2; 
contract CompoundContract
{
    address subContract;
    function construtor() {
        subContract = new SubContract();
    }
}`
                );
                this.addSubContract(new SubContract());
            }

        }




        SmartContractFactory.getContract("CompoundContract", CompoundContract)
            .map((compiledContract: CompoundContract) => {
                expect(compiledContract).to.not.be.undefined;
                expect(compiledContract.getName()).to.equal("CompoundContract");
                expect(compiledContract.getInterface()).to.equal(
                    "[{\"constant\":false,\"inputs\":[],\"name\":\"construtor\",\"outputs\":[],\"payable\":false,\"type\":\"function\"}]");
                expect(compiledContract.subContract("SubContract").getInterface()).to.equal("[]");
                expect(compiledContract.subContract("SubContract").getName()).to.equal("SubContract");
            }).subscribe(done, done);

    });



});

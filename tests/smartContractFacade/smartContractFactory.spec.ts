import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/map";

import { SmartContractFactory } from "../../src/smartContractFacade/smartContractFactory";
import { SmartContract } from "../../src/smartContractFacade/smartContract";

import { expect } from "chai";

describe("SmartContractFactory.getContract", () => {

    class DummyContract extends SmartContract {
        constructor() {
            super("Dummy", "pragma solidity ^0.4.2; contract Dummy {}");
        }
    }

    it("returns a compiled contract", (done) => {

        let validateContract = (compiledContract: DummyContract) => {
            expect(compiledContract).to.not.be.undefined;
            expect(compiledContract.getName()).to.equal("Dummy");
            expect(compiledContract.getInterface()).to.equal("[]");
            done();
        };

        SmartContractFactory.getContract("Dummy", DummyContract)
            .subscribe(validateContract, done);



    });

});


describe("SmartContractFactory.compileContract", () => {

    class DummyContract extends SmartContract {
        constructor() {
            super("Dummy", "pragma solidity ^0.4.2; contract Dummy {}");
        }
    }


    class SubContract extends SmartContract {
        constructor() {
            super("SubContract", "pragma solidity ^0.4.2; contract SubContract {}");
        }
    }


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


    it("it compiles and populates the bytecode and the interface of a simple contract", (done) => {


        let validateContract = (compiledContract: DummyContract) => {
            expect(compiledContract).to.not.be.undefined;
            expect(compiledContract.getName()).to.equal("Dummy");
            expect(compiledContract.getInterface()).to.equal("[]");
            done();
        };

        SmartContractFactory.getContract("Dummy", DummyContract)
            .subscribe(validateContract, done);

    });

    it("it compiles and populates the bytecode and the interface of a compound contract", (done) => {

        SmartContractFactory.getContract("CompoundContract", CompoundContract)
            .map((compiledContract: CompoundContract) => {

                expect(compiledContract).to.not.be.undefined;
                expect(compiledContract.getName()).to.equal("CompoundContract");


                expect(compiledContract.getInterface()).to.equal(
                    "[{\"constant\":false,\"inputs\":[],\"name\":\"construtor\",\"outputs\":[],\"payable\":false,\"type\":\"function\"}]");
                done();
            }).subscribe();

    });



});


import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import { EventCountingContract } from "./eventCountingContract";
import { SmartContract } from "../../src/smartContractFacade/smartContract";
import { SmartContractFactory } from "../../src/smartContractFacade/smartContractFactory";
import { BlockchainProxy } from "../../src/smartContractFacade/blockchainProxy";

const Web3: any = require("web3");


import { expect } from "chai";

class SubContract extends SmartContract {
    constructor() {
        super("SubContract", "pragma solidity ^0.4.2;contract SubContract {}\n");
    }
}

class CompoundDummyContract extends SmartContract {
    constructor() {
        super("Dummy", "pragma solidity ^0.4.2;contract Dummy {}\n");
        this.addSubContract(new SubContract());
    }
}

class DummyContract extends SmartContract {
    constructor() {
        super("Dummy", "pragma solidity ^0.4.2;contract Dummy {}\n");
    }
}


describe("EventCountingContract inherits SmartContart", function () {
    it("makes the contract methods callable", function (done: any) {
        this.timeout(45000);

        SmartContractFactory.getContract("EventCountingContract", EventCountingContract)
            .mergeMap((contract: EventCountingContract) => BlockchainProxy.deployContract(contract))
            .mergeMap((contract: EventCountingContract) => {
                console.log("calling contract");

                return contract.logEvent("a");
            })
            .subscribe((eventsSoFar: number) => {
                console.log("Waiting for the results");
                expect(eventsSoFar).to.equal(1);
                done();
            });
    });
});


describe("SmartContract.getSource()", () => {

    it("returns the source of a single contract",
        function () {

            let simpleDummy = SmartContractFactory.getContract("DummyContract", DummyContract).subscribe((simpleDummy: DummyContract) => {
                let source = simpleDummy.getSource();
                expect(source).to.equal("pragma solidity ^0.4.2;contract Dummy {}\n");
            });
        });


    it("returns the combined source of a contract with a subcontract",
        function () {


            let simpleDummy = SmartContractFactory.getContract("Dummy", CompoundDummyContract).subscribe((compoundContract: CompoundDummyContract) => {
                let source = compoundContract.getSource();
                expect(source).to.equal("pragma solidity ^0.4.2;contract Dummy {}\npragma solidity ^0.4.2;contract SubContract {}\n");
            });

        });
});




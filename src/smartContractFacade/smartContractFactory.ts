import { SmartContract } from "./smartContract";
import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import { BlockchainProxy } from "./blockchainProxy";

import "rxjs/add/observable/of";

const solc: any = require("solc");
const Web3: any = require("web3");


export namespace SmartContractFactory {

    let web3: any;


    export function getContract<T extends SmartContract>(contractName: string, contractType: any): Observable<T> {
        let contract = new contractType(BlockchainProxy.getWeb3());

        // TODO: optimise by searching for a contract in some sort of cash

        return compileContract(contract);
    };

    export function getContractAtAddress<T extends SmartContract>(contractName: string, contractType: any, address: string): Observable<T> {
        return SmartContractFactory.getContract(contractName, contractType).mergeMap((contract: T) => {
            contract.setAddress(address);
            return Observable.of(contract);
        });
    }

    function compileContract<T extends SmartContract>(contract: T): Observable<T> {
        return Observable.create((observer: Observer<T>) => {

            let compilationResult = solc.compile(contract.getSource(), 0);

            if (compilationResult.errors) {
                observer.error(compilationResult.errors);
                console.log(compilationResult.errors);
                console.log(contract.getSource());

            } else {
                contract.populateWithCompilationResults(compilationResult);

                observer.next(contract);
                observer.complete();
            }
        });
    }
}

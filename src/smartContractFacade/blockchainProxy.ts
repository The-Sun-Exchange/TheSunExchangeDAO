import { SmartContract } from "./smartContract";

import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";

const Web3: any = require("web3");

export namespace BlockchainProxy {
    let web3: any;

    export function createAccount(password: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            observer.next(web3.personal.newAccount(password));
            observer.complete();
        });
    }

    export function setWeb3(pWeb3: any): void {
        if (pWeb3 == null) { throw (" invalid web3"); }
        web3 = pWeb3;
    }

    export function getWeb3(): any {
        if (web3 == null) {
            throw "No web3 configured provider set. Call setWeb3 to set it";
        }
        return web3;
    }

    export function transferFunds(
        sourceAddress: string,
        sourcePassword: string,
        destinationAddress: string,
        amount: number) {

        console.log("BlockchainProxy.transferFunds: " + amount + " from " + sourceAddress + " to " + destinationAddress);
        return Observable.create((observer: Observer<string>) => {
            unlockAccount(sourceAddress, sourcePassword).subscribe(() => {
                let transaction = {
                    from: sourceAddress,
                    to: destinationAddress,
                    gas: 4000000,
                    value: amount
                };

                getWeb3().eth.sendTransaction(
                    transaction,
                    (error: any, results: string) => {
                        if (error) {
                            observer.error("ERROR while creating a project:" + error);
                        } else {
                            observer.next(destinationAddress);
                            observer.complete();
                        }
                    });
            });
        });
    }


    export function getApiVersion(): Observable<string> {
        let versionObservable: Observable<string> =
            Observable.create((observer: Observer<string>) => {

                observer.next(getWeb3().version.api);
                observer.complete();

            });
        return versionObservable;
    }

    export function getCoinbase(): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            getWeb3().eth.getCoinbase((error: any, coinbase: string) => {
                if (error) {
                    observer.error(error);
                } else {
                    observer.next(coinbase);
                    observer.complete();
                }
            });
        });
    }

    export function unlockAccount(account: string, password: string): Observable<void> {
        return Observable.create((observer: Observer<void>) => {

            getWeb3().personal.unlockAccount(account, password, (error: any) => {
                if (error) {
                    observer.error(error);
                } else {
                    observer.next(null);
                    observer.complete();
                }

            });
        });
    }

    export function encodeContractMethodCall(methodSignature: string): string {
        return getWeb3().sha3(methodSignature).substring(0, 10);
    }

    export function sendTransaction(transaction: any): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            getWeb3().eth.sendTransaction(
                transaction,
                (error: any, results: string) => {
                    if (error) {
                        observer.error("ERROR while sending a transaction to the blockchain:" + error);
                    } else {
                        observer.next(results);
                        observer.complete();
                    }

                });
        });
    }

    export function getBalance(address: string): Observable<number> {
        return Observable.create((observer: Observer<number>) => {
            getWeb3().eth.getBalance(address, undefined, (error: any, result: string) => {
                if (!error) {
                    let balance = Number(result);
                    observer.next(balance);
                    observer.complete();
                } else {
                    observer.error("ERROR in BlockChainService.getClientBalance: " + error);
                }
            });
        });
    }



    export function deployContract<T extends SmartContract>(contract: T): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            console.log("getting coinbase");
            getCoinbase().subscribe((coinbase: string) => {
                console.log("got coinbase");


                unlockAccount(
                    coinbase,
                    "password").subscribe(() => {
                        console.log("coinbase unlocked");
                        let web3Contract = getWeb3().eth.contract(
                            JSON.parse(
                                contract.getInterface()));

                        web3Contract.new({
                            from: coinbase,
                            data: contract.getBytecode(),
                            gas: 2000000
                        }, (error: any, contractInstance: any) => {
                            if (!error) {
                                console.log("new contract created");
                                if (contractInstance.address) {
                                    contract.setAddress(contractInstance.address);
                                    observer.next(contract);
                                    observer.complete();
                                }
                            } else {
                                console.log("contract creation error " + error);

                                observer.error(error);
                            }

                        });
                    });
            });
        });
    }
    export function connectContractToAddress(smartContract: SmartContract, address: string): any {
        console.log("BlockchainProxy web3 " + getWeb3());
        let contract = getWeb3().eth.contract(JSON.parse(smartContract.getInterface()));
        return contract.at(address);
    }



}

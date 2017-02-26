
import * as Collections from "typescript-collections";


import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";

import { BlockchainProxy } from "./blockchainProxy";


class ContractInstanceDescriptor {
    name: string;
    address: string;
}

export abstract class SmartContract {
    private subContracts = new Collections.Dictionary<string, SmartContract>();

    protected source: string;
    private bytecode: string;
    private contractInterface: string;

    private name: string;
    private address: string;

    private contractBirth: number;

    constructor(name: string, source: string) {
        this.source = source;
        this.name = name;
        this.contractBirth = (new Date()).getMilliseconds();

    }

    public getContractAge(): number {
        return (new Date()).getMilliseconds() - this.contractBirth;
    }

    protected encodeUint256(value: number): string {
        let template =
            "0000000000000000000000000000000000000000000000000000000000000000";
        let valueInHex = Number(value).toString(16);
        return template.substring(0, 64 - valueInHex.length) + valueInHex;

    }

    protected encodeBytes32(value: string): string {
        let template =
            "0000000000000000000000000000000000000000000000000000000000000000";
        let encodedString: string = "";
        for (let i = 0; i < String(value).length; i++) {
            encodedString = encodedString + Number(String(value).charCodeAt(i)).toString(16);
        }
        let padding: string = template.substring(0, 64 - encodedString.length);

        return encodedString + padding;

    }

    protected getInstance(address: string): any {
        return BlockchainProxy.connectContractToAddress(this, address);
    }

    public populateWithCompilationResults(compilationResult: any) {
        this.setBytecode("0x" + compilationResult.contracts[":" + this.getName()].bytecode);
        this.setInterface(compilationResult.contracts[":" + this.getName()].interface);

        this.subContracts.forEach(
            (contractName, contract) => {
                contract.populateWithCompilationResults(compilationResult);
            });
    }

    public setAddress(address: string) {
        this.address = address;
    }

    public getAddress(): string {
        return this.address;
    }

    protected addSubContract(subContract: SmartContract) {
        this.subContracts.setValue(subContract.getName(), subContract);
    }

    public subContract(contractName: string) {
        return this.subContracts.getValue(contractName);
    }

    public getBalance(): Observable<number> {
        return BlockchainProxy.getBalance(this.getAddress());
    }

    public subContractInstance(contractName: string, address: string) {
        return this.subContract(contractName).getInstance(address);
    }

    public getSource(): string {
        let completeSrc = this.source;

        for (let subContract of this.subContracts.values()) {
            completeSrc += subContract.getSource();
        }
        return completeSrc;
    }

    public getName() {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getInterface() {
        return this.contractInterface;
    }

    public getBytecode() {
        return this.bytecode;
    }
    public setInterface(contractInterface: string) {
        this.contractInterface = contractInterface;
    }

    public setBytecode(bytecode: string) {
        this.bytecode = bytecode;
    }

    public callContractMethod(
        caller: string,
        password: string,
        contractType: any,
        contractName: string,
        methodName: string,
        methodSignature: string,
        parameters: Array<any>,
        value: number = 0): Observable<any> {

        return Observable.create((observer: Observer<any>) => {

            let rawContract = BlockchainProxy.connectContractToAddress(this, this.getAddress());
            let returnEventName: string = methodName + "ReturnEvent";

            let methodConfirmation = rawContract[returnEventName]();

            let resultCount = 0;
            methodConfirmation.watch((error: any, result: any) => {
                if (!error) {
                    observer.next(result.args);
                    resultCount++;
                    if (result.args.listSize == null) {
                        console.log("**** SINGLE RETURN");
                        observer.complete();
                    } else if (resultCount >= result.args.listSize) {
                        console.log("**** LIST COMPLETE ");
                        observer.complete();
                    } else {
                        console.log("**** THERE IS MORE TO COME");
                    }

                } else {
                    observer.error("ERROR while waiting for method confirmation: \n" + error);
                }
            });

            BlockchainProxy.unlockAccount(caller, password).subscribe(() => {

                let parmData: string = "";
                let solidityTypes: string[] = methodSignature.replace("(", "").replace(")", "").split(",");
                console.log(" solidityTypes: " + solidityTypes);
                let typeIndex: number = 0;
                for (let parameter of parameters) {
                    switch (solidityTypes[typeIndex]) {
                        case "bytes32":
                            parmData += this.encodeBytes32(parameter);
                            break;
                        case "uint256":
                            parmData += this.encodeUint256(parameter);
                            break;
                        default:
                            observer.error("SmartContract: No encoder for " + solidityTypes[typeIndex]);
                    }
                    typeIndex++;
                }

                let trandata: string = BlockchainProxy.encodeContractMethodCall(methodName + methodSignature) + parmData;

                let transaction: any;
                if (value > 0) {
                    transaction = {
                        from: caller,
                        to: this.getAddress(),
                        gas: 4000000,
                        data: trandata,
                        value: value
                    };
                } else {
                    transaction = {
                        from: caller,
                        to: this.getAddress(),
                        gas: 4000000,
                        data: trandata
                    };
                }

                BlockchainProxy.sendTransaction(transaction).subscribe((transactionHash: string) => {
                    console.log("method call transaction hash =  " + transactionHash);
                });
            });
        });

    };
}

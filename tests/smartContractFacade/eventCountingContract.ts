import { SmartContract } from "../../src/smartContractFacade/smartContract";
import { SmartContractFactory } from "../../src/smartContractFacade/smartContractFactory";
import { BlockchainProxy } from "../../src/smartContractFacade/blockchainProxy";
import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";

export class EventCountingContract extends SmartContract {
    constructor() {
        super("EventCountingContract", `
pragma solidity ^0.4.2;
contract EventCountingContract{ 
  event logEventReturnEvent(uint logEventReturnValue);

  mapping (bytes32 => uint ) private eventCounts;

  function logEvent(bytes32 eventName) {
    eventCounts[eventName] ++ ;
    logEventReturnEvent(eventCounts[eventName]);
  }

  function getEventCounter(bytes32 eventName) returns(uint){
    return eventCounts[eventName]; 
  }
}

`
        );
    };

    getEventCounter(): number {
        return 0;
    }

    logEvent(eventName: string): Observable<number> {
        return Observable.create((observer: Observer<number>) => {
            let coinbase = BlockchainProxy.getCoinbase().subscribe((coinbase: string) => {
                super.callContractMethod(
                    coinbase,
                    "password",
                    EventCountingContract,
                    "EventCountingContract",
                    "logEvent",
                    "(bytes32)",
                    [eventName]).subscribe((returnValue: any) => {
                        let eventCount: string = returnValue["logEventReturnValue"];
                        observer.next(parseInt(eventCount));
                    });
            });
        });
    }
}

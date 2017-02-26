
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";
import { SmartContract } from "../smartContractFacade/smartContract";

import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";



export class SunExPledge extends SmartContract {
    constructor() {
        super("SunExPledge", `
pragma solidity ^0.4.2;
        
contract SunExPledge { 
    uint pledgedAmount; 
    address pledger;
    address sunExProject;
    event pledgeReverted();
    event pledgeConverted();

    event fundsReceived(address receiver,uint amountRecieved);
  
    function() payable  {
      if (msg.value > 0) {
        fundsReceived(this, msg.value);
      }
    }
     
    function SunExPledge (address _pledger, uint _pledgedAmount) {
        sunExProject =  msg.sender; 
        pledger = _pledger;
        pledgedAmount = _pledgedAmount;
    }
    
    function getPledgerAddress () returns (address) {
      return pledger;
    }

    function getProjectAddress () returns (address) { 
      return sunExProject;
    }
    
    function revert() {
        if(!pledger.call.gas(800000).value(this.balance)()) {
        throw;
        } else {
             pledgeReverted();
        }
       
    }
    
    function getPledgedAmount() returns (uint) {
        return pledgedAmount;
    }

    function convert() {
        if(!sunExProject.call.gas(800000).value(this.balance)()) {
          throw;
        } else {
             pledgeConverted();
        }
    }
} `);
    }


    private callGetter<T_PARM>(memberName: string): Observable<T_PARM> {
        return Observable.create((observer: Observer<T_PARM>) => {
            let coinbase = BlockchainProxy.getCoinbase().subscribe((coinbase: string) => {
                super.callContractMethod(
                    coinbase,
                    "password",
                    SunExPledge,
                    "SunExPledge",
                    "getPledgerAddress",
                    "()",
                    []).subscribe((returnValue: any) => {
                        observer.next(returnValue);
                    });
            });
        });
    }

    public getPledgerAddress(): Observable<string> {
        return this.callGetter<string>("pledgerAddress");
    }

    public getPledgedAmount(): Observable<number> {
        return this.callGetter<number>("pledgerAddress");
    }

}

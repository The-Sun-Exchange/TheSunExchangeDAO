
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";
import { SmartContract } from "../smartContractFacade/smartContract";
import { PledgeListItem } from "./pledgeListItem";

import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";



export class SunExPledge extends SmartContract {
    constructor() {
        super("SunExPledge", `
pragma solidity ^0.4.9;
contract SunExPledge { 
    uint256 pledgedAmount; 
    address pledger;
    address sunExProject;
    event pledgeReverted();
    event pledgeConverted();

    event fundsReceived(address receiver,uint256 amountRecieved);
    event getPledgeInfoReturnEvent(address pledgeAddress, address pledgerAddress, uint256 pledgedAmount,uint256 index, uint256 listSize);
  
    function SunExPledge (address project, address _pledger, uint256 _pledgedAmount) {
        sunExProject =  project; 
        pledger = _pledger;
        pledgedAmount = _pledgedAmount;
    }
    
     function() payable  {
      if (msg.value > 0) {
        fundsReceived(this, msg.value);
      }
    }
    
    function payPledge() payable {
      if (msg.value > 0) {
        fundsReceived(this, msg.value);
      }
    }

    function getPledgeInfo() {
        getPledgeInfoReturnEvent(this,pledger,pledgedAmount,0,1); 
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
    
    function getPledgedAmount() returns (uint256) {
        return pledgedAmount;
    }
    
    function convert() {
        uint256 gas = 800000;
        uint256 valueToSend = this.balance ; 
        if(!sunExProject.call.gas(gas).value(valueToSend)(bytes4(sha3("payProject()")))) {
          throw;
        } 
    }
}
`);
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

    public getPledgeInfo(): Observable<PledgeListItem> {
        return BlockchainProxy.getCoinbase()
            .mergeMap((coinbase: string) => {
                return super.callContractMethod(
                    coinbase,
                    "password",
                    SunExPledge,
                    "SunExPledge",
                    "getPledgeInfo",
                    "()",
                    []
                );
            })
            .mergeMap((returnValue: any) => {
                console.log("Get Pledge returned: " + JSON.stringify(returnValue));
                let listItem: PledgeListItem = returnValue;
                return Observable.of(listItem);
            });
    }
}

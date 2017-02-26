import { SmartContract } from "../smartContractFacade/smartContract";
import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";
import { SmartContractFactory } from "../smartContractFacade/smartContractFactory";
import { PledgeListItem } from "./pledgeListItem";

import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";

import { SunExPledge } from "./sunExPledge";
import { ProjectListItem } from "./projectListItem";

export class SunExProject extends SmartContract {
    constructor() {
        super("SunExProject", `
pragma solidity ^0.4.2;
contract SunExProject{
  address offtaker;
  address [] pledges;
  uint totalPledged;
  uint nPledgers;
  uint256 fundingTarget; 
  
  event receivePledgeReturnEvent(address pledge, address pledger, uint pledgedAmount);
  event getPledgesReturnEvent(address pledge, address pledger, uint pledgedAmount,uint index, uint listSize);
  event fundsReceived(address receiver,uint amountReceived);
  event getProjectInfoReturnEvent(address projectAddress, uint256 nFunders , uint256 totalFunded ,uint256 fundingTarget, uint256 index, uint256 listSize);
  
  function() payable  {
      if (msg.value > 0) {
        fundsReceived(this, msg.value);
      }
  }

  function getProjectInfo() {
    getProjectInfoReturnEvent(this,nPledgers,totalPledged,fundingTarget,0,1);
  }
  
  function getFundingTarget() returns(uint256) {
        return fundingTarget;
  }
    
    function revert() {
      for (uint cPledges = 0 ; cPledges < nPledgers; ++cPledges) {
        address pledgeAddress = pledges[cPledges];
        SunExPledge pledge = SunExPledge(pledgeAddress);
        pledge.revert();
      }
    }
    
    function convert() {
      for (uint cPledges = 0 ; cPledges < nPledgers; ++cPledges) {
        address pledgeAddress = pledges[cPledges];
        SunExPledge pledge = SunExPledge(pledgeAddress);
        pledge.convert();
      }
    }

  function SunExProject (address _offtaker, uint _fundingTarget )  {
    offtaker = _offtaker;
    fundingTarget = _fundingTarget;
  }
  
  function getTotalPledges() returns(uint) {
      return totalPledged;
  }
  
  function getNumberOfPledges () returns (uint) {
    return nPledgers;
  }

  function getPledges() { 
    for (uint cPledges = 0 ; cPledges < nPledgers; ++cPledges) {
        address pledgeAddress = pledges[cPledges];
        SunExPledge pledge = SunExPledge(pledgeAddress);
        getPledgesReturnEvent(pledgeAddress, pledge.getPledgerAddress(),pledge.getPledgedAmount(),cPledges, nPledgers);
    }
  } 
   
  function receivePledge() payable {
      if (totalPledged >= fundingTarget) throw; 
      
      address newPledge = new SunExPledge( msg.sender, msg.value );
   
      pledges.push(newPledge);
      totalPledged += msg.value;
      nPledgers +=1;
      receivePledgeReturnEvent(newPledge, msg.sender, msg.value);
      if(!newPledge.call.gas(800000).value(msg.value )()) throw;
  }
}
`
        );

        super.addSubContract(new SunExPledge());
    }

    public convert(): Observable<SunExProject> {
        return Observable.create((observer: Observer<SunExProject>) => {
        });
    }

    public getProjectInfo(): Observable<ProjectListItem> {
        return BlockchainProxy.getCoinbase()
            .mergeMap((coinbase: string) => {
                return super.callContractMethod(
                    coinbase,
                    "password",
                    SunExProject,
                    "SunExProject",
                    "getProjectInfo",
                    "()",
                    []
                );
            })
            .mergeMap((returnValue: any) => {
                console.log("Get project returned: " + JSON.stringify(returnValue));
                let listItem: ProjectListItem = returnValue;
                return Observable.of(listItem);
            });
    }

    public receivePledge(pledgerAddress: string, password: string, amount: number): Observable<SunExPledge> {
        return BlockchainProxy.getCoinbase()
            .mergeMap((coinbase: string) => {
                return super.callContractMethod(
                    pledgerAddress,
                    password,
                    SunExProject,
                    "SunExProject",
                    "receivePledge",
                    "()",
                    [],
                    amount);
            })
            .mergeMap((returnValue: any) => {
                let pledgeAddress: string = returnValue["pledge"];
                return SmartContractFactory.getContractAtAddress<SunExPledge>("SunExPledge", SunExPledge, pledgeAddress);
            });
    }

    public getPledges(): Observable<PledgeListItem> {
        return BlockchainProxy.getCoinbase()
            .mergeMap((coinbase: string) => {
                return super.callContractMethod(
                    coinbase,
                    "password",
                    SunExProject,
                    "SunProject",
                    "getPledges",
                    "()",
                    []);
            })
            .mergeMap((returnValue: any) => {
                let listItem: PledgeListItem = returnValue;
                return Observable.of(listItem);
            });
    }

    /*          console.log(this.getAddress() + ".getPledges() called ");
  
              var pledgeListItemWatcher = super.getInstance(this.getAddress()).sunExPledgeListItem();
  
              let pledgeItemsReceivedSoFar: number;
              pledgeItemsReceivedSoFar = 0;
  
              pledgeListItemWatcher.watch((error, result) => {
                  console.log("sunExPledgeListItem event received");
                  if (!error) {
                      let pledgeListItem = new PledgeListItem();
  
                      pledgeListItem.pledge = result.args.pledge;
                      pledgeListItem.pledger = result.args.pledger;
                      pledgeListItem.pledgedAmount = result.args.pledgedAmount;
                      pledgeListItem.index = result.args.index;
                      pledgeListItem.listSize = result.args.listSize;
                      console.log(JSON.stringify(pledgeListItem));
  
                      observer.next(pledgeListItem);
                      pledgeItemsReceivedSoFar += 1;
  
                      console.log(JSON.stringify(pledgeItemsReceivedSoFar));
  
                      if (pledgeItemsReceivedSoFar >= result.args.listSize) {
                          console.log("COMLPETING");
                          observer.complete();
                      }
  
                  } else {
                      observer.error("ERROR while getting projects : \n" + error);
                      observer.complete();
                  }
              });
  
              var trandata = BlockchainProxy.encodeContractMethodCall("getPledges()");
  
              BlockchainProxy.getCoinbase().subscribe((coinbase: string) => {
                  BlockchainProxy.unlockAccount(coinbase, "password").subscribe(() => {
  
                      var transaction = {
                          from: coinbase,
                          to: this.getAddress(),
                          gas: 4000000,
                          data: trandata
                      };
  
                      BlockchainProxy.sendTransaction(
                          transaction).subscribe((transactionHash: string) => { },
                          (error: any) => {
                              console.log("ERROR while getting pledges:" + error);
                              observer.error("ERROR while getting pledges:" + error);
                              observer.complete();
                          });
  
                      console.log(" get pledges transaction sent");
                  });
              });
    */
}

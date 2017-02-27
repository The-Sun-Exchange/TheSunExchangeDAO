import { SmartContract } from "../smartContractFacade/smartContract";

import { BlockchainProxy } from "../smartContractFacade/blockchainProxy";
import { SmartContractFactory } from "../smartContractFacade/smartContractFactory";

import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";

import { SunExProject } from "./sunExProject";
import { SunExPledge } from "./sunExPledge";

import { ProjectListItem } from "./projectListItem";

import { Entity } from "../state/entity";

export class SunExDao extends SmartContract implements Entity {


    constructor() {
        super("SunExDao", `
pragma solidity ^0.4.2;
contract SunExDao {
  address [] projects;
  uint nProjects;
  
  event createSunExProjectReturnEvent(address projectAddress)   ;
  event getProjectsReturnEvent(address projectAddress, uint256 nFunders , uint256 totalFunded ,uint256 fundingTarget, uint256 index, uint256 listSize );

  address owner;
  
  function SunExDao() {
      nProjects = 0;
  }
  
  function getProjects() {
   for (uint cProjects = 0 ; cProjects < nProjects ; ++cProjects) {
       
       SunExProject project = SunExProject(projects[cProjects]);
        
        getProjectsReturnEvent(
              projects[cProjects],
              project.getNumberOfPledges(),
              project.getTotalPledges(),
              project.getFundingTarget(), 
              cProjects,
              nProjects);
        
        
    }
  }

  function createSunExProject(uint256 fundingTarget)  {
      owner = msg.sender;
      address projectAddress = new SunExProject(msg.sender,fundingTarget);
      projects.push(projectAddress);
      nProjects +=1;
      createSunExProjectReturnEvent(projectAddress); 
  }
}

`);

        this.addSubContract(new SunExProject());
    }

    public createProject(fundingTarget: number): Observable<SunExProject> {
        console.log("creating project with " + fundingTarget + " as target");
        return BlockchainProxy.getCoinbase()
            .mergeMap((coinbase: string) => {
                return super.callContractMethod(
                    coinbase,
                    "password",
                    SunExDao,
                    "SunExDao",
                    "createSunExProject",
                    "(uint256)",
                    [fundingTarget]);
            }).mergeMap((returnValue: any) => {
                let projectAddress: string = returnValue["projectAddress"];
                return SmartContractFactory.getContractAtAddress<SunExProject>("SunExProject", SunExProject, projectAddress);
            });
    }

    public getProjects(): Observable<ProjectListItem> {
        return BlockchainProxy.getCoinbase()
            .mergeMap((coinbase: string) => {
                return super.callContractMethod(
                    coinbase,
                    "password",
                    SunExDao,
                    "SunExDao",
                    "getProjects",
                    "()",
                    []);
            })
            .mergeMap((returnValue: any) => {
                console.log("Get projects returned: " + JSON.stringify(returnValue));
                let listItem: ProjectListItem = returnValue;
                return Observable.of(listItem);
            });
    }

    /*
        console.log(this.getAddress() + ".getProjects() called ");
 
        var projectListItemWatcher = super.getInstance(this.getAddress()).sunExProjectListItem();
 
        let projectItemsReceivedSoFar: number;
        projectItemsReceivedSoFar = 0;
 
        projectListItemWatcher.watch((error, result) => {
            console.log("sunExProjectCreated event received");
            if (!error) {
                let projectListItem = new ProjectListItem();
 
                projectListItem.projectAddress = result.args.project;
                projectListItem.nFunders = result.args.nFunders;
                projectListItem.totalFunded = result.args.totalFunded;
                projectListItem.fundingTarget = result.args.fundingTarget;
                projectListItem.index = result.args.index;
                projectListItem.listSize = result.args.listSize;
 
 
                console.log(JSON.stringify(result.args));
                console.log(JSON.stringify(projectListItem));
 
                observer.next(projectListItem);
                projectItemsReceivedSoFar += 1;
 
                console.log(JSON.stringify(projectItemsReceivedSoFar));
 
                if (projectItemsReceivedSoFar >= result.args.listSize) {
                    console.log("COMLPETING");
                    observer.complete();
                }
 
            } else {
                observer.error("ERROR while getting projects : \n" + error);
                observer.complete();
            }
        });
 
        var trandata = BlockchainProxy.encodeContractMethodCall("getProjects()");
 
        BlockchainProxy.getCoinbase().subscribe((coinbase) => {
 
            BlockchainProxy.unlockAccount(coinbase, "password").subscribe(() => {
 
                var transaction = {
                    from: coinbase,
                    to: this.getAddress(),
                    gas: 4000000,
                    data: trandata
                };
 
                BlockchainProxy.sendTransaction(
                    transaction).subscribe((transactionHash: string) => { },
                    (error: string) => {
                        console.log("ERROR while getting projects:" + error);
                        observer.error("ERROR while getting projects:" + error);
                    });
 
                console.log(" get projects transaction sent");
            });
        });
 
    */
}

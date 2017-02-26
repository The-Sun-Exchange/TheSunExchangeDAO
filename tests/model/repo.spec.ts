
import { expect } from "chai";
import { assert } from "chai";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/map";
import { Entity } from "../../src/state/entity";
import { Repo } from "../../src/state/repo";


describe("Repo", function () {
    it(" can save and retrieve a test object", function (done) {
        class TestEntity implements Entity {
            constructor(public name: string, public key: string) { }
        }
        class TestEntityRepo extends Repo<TestEntity> {
            public findByKey(key: string): Observable<TestEntity[]> {
                return super.find({ key: key });
            }
        }


        this.timeout(15000);
        console.log("Test that test entity state can be saved to db");
        let repo: TestEntityRepo = new TestEntityRepo();
        let rawTestEntity = new TestEntity("koos", "123");
        let createdTestEntity: TestEntity;


        repo.create(rawTestEntity).mergeMap((freshTestEntity: TestEntity) => {
            createdTestEntity = freshTestEntity;
            return repo.findByKey(createdTestEntity.key);
        }).mergeMap((foundTestEntities: TestEntity[]) => {
            expect(foundTestEntities.length).to.be.equal(1);
            return Observable.of(foundTestEntities[0]);
        }).subscribe((foundTestEntity: TestEntity) => {
            console.log(JSON.stringify(foundTestEntity) + "\n" + JSON.stringify(createdTestEntity));
            expect(foundTestEntity).to.deep.equal(createdTestEntity);
        }, (error: any) => {
            console.log("Error while saving and retrieving test entity:" + error);
            assert.fail(null, error, "error while saving and retrieving");
            done();
        }, () => {
            repo.remove(createdTestEntity);
            done();
        });

    });
});



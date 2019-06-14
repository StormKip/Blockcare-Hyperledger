/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { BlockcareContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('BlockcareTypescriptContract', () => {

    let contract: BlockcareContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new BlockcareContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"blockcare typescript 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"blockcare typescript 1002 value"}'));
    });

    describe('#blockcareTypescriptExists', () => {

        it('should return true for a blockcare typescript', async () => {
            await contract.blockcareExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a blockcare typescript that does not exist', async () => {
            await contract.blockcareExists(ctx, '1003').should.eventually.be.false;
        });

    });

});

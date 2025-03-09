import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbDisconnect, dbReset, initConfig} from '../../../../common.mjs';

// SETUP CONTAINER
const container = await createContainer();
await initConfig(container);

// SETUP ENVIRONMENT
/** @type {Fl64_Paypal_Back_Store_RDb_Repo_Log} */
const repoLog = await container.get('Fl64_Paypal_Back_Store_RDb_Repo_Log$');
const ATTR = repoLog.getSchema().getAttributes();

// TEST CONSTANTS
const REQUEST_TYPE = 'order_create';
const REQUEST_DATA = JSON.stringify({action: 'create', details: {amount: 100}});
const RESPONSE_STATUS = 200;
const RESPONSE_DATA = JSON.stringify({status: 'SUCCESS', transaction_id: 'XYZ123'});
const DATE_NOW = new Date();
let LOG_ID;

// Test Suite for PayPal Log Repository
describe('Fl64_Paypal_Back_Store_RDb_Repo_Log', () => {
    before(async () => {
        await dbReset(container);
        await dbConnect(container);
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should create a new log entry', async () => {
        /** @type {Fl64_Paypal_Back_Store_RDb_Schema_Log.Dto} */
        const dto = repoLog.createDto();
        dto.date_request = DATE_NOW;
        dto.date_response = DATE_NOW;
        dto.request_data = REQUEST_DATA;
        dto.request_type = REQUEST_TYPE;
        dto.response_data = RESPONSE_DATA;
        dto.response_status = RESPONSE_STATUS;

        const {primaryKey} = await repoLog.createOne({dto});
        LOG_ID = primaryKey[ATTR.ID];
        assert.ok(primaryKey, 'Log entry should be created');
    });

    it('should read an existing log entry by ID', async () => {
        const {record} = await repoLog.readOne({key: {id: LOG_ID}});

        assert.ok(record, 'Log entry should exist');
        assert.strictEqual(record.id, LOG_ID, 'Log entry ID should match');
    });

    it('should list all log entries', async () => {
        const logs = await repoLog.readMany({});

        assert.ok(logs.records.length > 0, 'There should be at least one log entry');
    });

    it('should update an existing log entry', async () => {
        const {record} = await repoLog.readOne({key: {id: LOG_ID}});
        record.response_status = 500;

        const {updatedCount} = await repoLog.updateOne({key: {id: LOG_ID}, updates: {response_status: 500}});

        assert.strictEqual(updatedCount, 1, 'One log entry should be updated');
        const {record: updated} = await repoLog.readOne({key: {id: LOG_ID}});
        assert.strictEqual(updated.response_status, 500, 'Log entry status should be updated');
    });

    it('should delete an existing log entry', async () => {
        const {deletedCount} = await repoLog.deleteOne({key: {id: LOG_ID}});

        assert.strictEqual(deletedCount, 1, 'One log entry should be deleted');
    });
});

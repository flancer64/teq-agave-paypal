import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbCreateFkEntities, dbDisconnect, dbReset, initConfig} from '../../../../common.mjs';

// SETUP CONTAINER
const container = await createContainer();
await initConfig(container);

// SETUP ENVIRONMENT
/** @type {Fl64_Paypal_Back_Store_RDb_Repo_Order} */
const repoOrder = await container.get('Fl64_Paypal_Back_Store_RDb_Repo_Order$');
const ATTR = repoOrder.getSchema().getAttributes();

// TEST CONSTANTS
let USER_REF;
const PAYPAL_ORDER_ID = 'ORDER-12345';
const AMOUNT = 99.99;
const CURRENCY = 'USD';
const STATUS = 'CREATED';
const DATE_CREATED = new Date();
let ORDER_ID;

// Test Suite for PayPal Order Repository
describe('Fl64_Paypal_Back_Store_RDb_Repo_Order', () => {
    before(async () => {
        await dbReset(container);
        const {user} = await dbCreateFkEntities(container);
        USER_REF = user.id;
        await dbConnect(container);
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should create a new order entry', async () => {
        /** @type {Fl64_Paypal_Back_Store_RDb_Schema_Order.Dto} */
        const dto = repoOrder.createDto();
        dto.user_ref = USER_REF;
        dto.paypal_order_id = PAYPAL_ORDER_ID;
        dto.amount = AMOUNT;
        dto.currency = CURRENCY;
        dto.status = STATUS;
        dto.date_created = DATE_CREATED;

        const {primaryKey} = await repoOrder.createOne({dto});
        ORDER_ID = primaryKey[ATTR.ID];
        assert.ok(primaryKey, 'Order should be created');
    });

    it('should read an existing order by ID', async () => {
        const {record} = await repoOrder.readOne({key: {id: ORDER_ID}});

        assert.ok(record, 'Order should exist');
        assert.strictEqual(record.id, ORDER_ID, 'Order ID should match');
    });

    it('should list all orders', async () => {
        const orders = await repoOrder.readMany({});

        assert.ok(orders.records.length > 0, 'There should be at least one order');
    });

    it('should update an existing order', async () => {
        const {record} = await repoOrder.readOne({key: {id: ORDER_ID}});
        record.status = 'COMPLETED';

        const {updatedCount} = await repoOrder.updateOne({key: {id: ORDER_ID}, updates: {status: 'COMPLETED'}});

        assert.strictEqual(updatedCount, 1, 'One order should be updated');
        const {record: updated} = await repoOrder.readOne({key: {id: ORDER_ID}});
        assert.strictEqual(updated.status, 'COMPLETED', 'Order status should be updated');
    });

    it('should delete an existing order', async () => {
        const {deletedCount} = await repoOrder.deleteOne({key: {id: ORDER_ID}});

        assert.strictEqual(deletedCount, 1, 'One order should be deleted');
    });
});

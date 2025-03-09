import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbCreateFkEntities, dbDisconnect, dbReset, initConfig} from '../../../../common.mjs';

// SETUP CONTAINER
const container = await createContainer();
await initConfig(container);

// SETUP ENVIRONMENT
/** @type {Fl64_Paypal_Back_Store_RDb_Repo_Order} */
const repoOrder = await container.get('Fl64_Paypal_Back_Store_RDb_Repo_Order$');
/** @type {Fl64_Paypal_Back_Store_RDb_Repo_Payment} */
const repoPayment = await container.get('Fl64_Paypal_Back_Store_RDb_Repo_Payment$');
const ATTR = repoPayment.getSchema().getAttributes();
const A_ORDER = repoOrder.getSchema().getAttributes();

// TEST CONSTANTS
const AMOUNT = 49.99;
const CURRENCY = 'USD';
const PAYER_ID = 'PAYER-67890';
const PAYPAL_ORDER_ID = 'ORDER-12345';
const PAYPAL_PAYMENT_ID = 'PAY-12345';
const STATUS = 'COMPLETED';
const DATE_CAPTURED = new Date();
let ORDER_REF, PAYMENT_ID, USER_REF;

// Test Suite for PayPal Payment Repository
describe('Fl64_Paypal_Back_Store_RDb_Repo_Payment', () => {
    before(async () => {
        await dbReset(container);
        const {user} = await dbCreateFkEntities(container);
        USER_REF = user.id;
        await dbConnect(container);
        const order = repoOrder.createDto();
        order.amount = AMOUNT;
        order.currency = CURRENCY;
        order.date_created = new Date();
        order.paypal_order_id = PAYPAL_ORDER_ID;
        order.status = 'CREATED';
        order.user_ref = USER_REF;
        const {primaryKey} = await repoOrder.createOne({dto: order});
        ORDER_REF = primaryKey[A_ORDER.ID];
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should create a new payment entry', async () => {
        /** @type {Fl64_Paypal_Back_Store_RDb_Schema_Payment.Dto} */
        const dto = repoPayment.createDto();
        dto.order_ref = ORDER_REF;
        dto.paypal_payment_id = PAYPAL_PAYMENT_ID;
        dto.amount = AMOUNT;
        dto.currency = CURRENCY;
        dto.status = STATUS;
        dto.payer_id = PAYER_ID;
        dto.date_captured = DATE_CAPTURED;

        const {primaryKey} = await repoPayment.createOne({dto});
        PAYMENT_ID = primaryKey[ATTR.ID];
        assert.ok(primaryKey, 'Payment should be created');
    });

    it('should read an existing payment by ID', async () => {
        const {record} = await repoPayment.readOne({key: {id: PAYMENT_ID}});

        assert.ok(record, 'Payment should exist');
        assert.strictEqual(record.id, PAYMENT_ID, 'Payment ID should match');
    });

    it('should list all payments', async () => {
        const payments = await repoPayment.readMany({});

        assert.ok(payments.records.length > 0, 'There should be at least one payment');
    });

    it('should update an existing payment', async () => {
        const {record} = await repoPayment.readOne({key: {id: PAYMENT_ID}});
        record.status = 'REFUNDED';

        const {updatedCount} = await repoPayment.updateOne({key: {id: PAYMENT_ID}, updates: {status: 'REFUNDED'}});

        assert.strictEqual(updatedCount, 1, 'One payment should be updated');
        const {record: updated} = await repoPayment.readOne({key: {id: PAYMENT_ID}});
        assert.strictEqual(updated.status, 'REFUNDED', 'Payment status should be updated');
    });

    it('should delete an existing payment', async () => {
        const {deletedCount} = await repoPayment.deleteOne({key: {id: PAYMENT_ID}});

        assert.strictEqual(deletedCount, 1, 'One payment should be deleted');
    });
});

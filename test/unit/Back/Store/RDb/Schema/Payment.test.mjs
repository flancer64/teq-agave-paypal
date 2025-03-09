import {container} from '@teqfw/test';
import assert from 'assert';

// GET OBJECTS FROM CONTAINER
/** @type {Fl64_Paypal_Back_Enum_Payment_Status} */
const PAYMENT_STATUS = await container.get('Fl64_Paypal_Back_Enum_Payment_Status$');
/** @type {Fl64_Paypal_Back_Defaults} */
const DEF = await container.get('Fl64_Paypal_Back_Defaults$');
/** @type {Fl64_Paypal_Back_Store_RDb_Schema_Payment} */
const schema = await container.get('Fl64_Paypal_Back_Store_RDb_Schema_Payment$');

describe('Fl64_Paypal_Back_Store_RDb_Schema_Payment', () => {
    const ATTR = schema.getAttributes();
    const expectedProperties = [
        'amount',
        'currency',
        'date_captured',
        'id',
        'order_ref',
        'payer_id',
        'paypal_payment_id',
        'status',
    ];

    it('should create an RDB DTO with only the expected properties', () => {
        const dto = schema.createDto();
        const dtoKeys = Object.keys(dto).sort();

        // Verify that the DTO has only the expected properties
        assert.deepStrictEqual(dtoKeys, expectedProperties.sort(), 'DTO should contain only the expected properties');

        // Check that each property is initially undefined
        expectedProperties.forEach(prop => {
            assert.strictEqual(dto[prop], undefined, `Property ${prop} should initially be undefined`);
        });
    });

    it('ATTR should contain only the expected properties', () => {
        const attrKeys = Object.keys(ATTR).sort();
        const upperCaseExpectedProperties = expectedProperties.map(p => p.toUpperCase()).sort();

        // Check that ATTR has the expected properties in uppercase
        assert.deepStrictEqual(attrKeys, upperCaseExpectedProperties, 'ATTR should contain only the expected properties in uppercase format');

        // Verify that each uppercase property in ATTR maps correctly to its original property name
        expectedProperties.forEach(prop => {
            assert.strictEqual(ATTR[prop.toUpperCase()], prop, `ATTR.${prop.toUpperCase()} should map to ${prop}`);
        });
    });

    it('should have the correct ENTITY name and primary key', () => {
        assert.equal(schema.getEntityName(), `${DEF.NAME}/fl64/paypal/payment`, 'Entity name should match the expected path');
        assert.deepStrictEqual(schema.getPrimaryKey(), [ATTR.ID], 'Primary key should be set to ID');
    });

    it('should cast payment status to a valid enum', () => {
        Object.values(PAYMENT_STATUS).forEach(status => {
            const dto = schema.createDto({status});
            assert.strictEqual(dto.status, status, `Status should be correctly assigned: ${status}`);
        });
    });

});

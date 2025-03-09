import {container} from '@teqfw/test';
import assert from 'assert';

// GET OBJECTS FROM CONTAINER
/** @type {Fl64_Paypal_Back_Defaults} */
const DEF = await container.get('Fl64_Paypal_Back_Defaults$');
/** @type {Fl64_Paypal_Back_Store_RDb_Schema_Log} */
const schema = await container.get('Fl64_Paypal_Back_Store_RDb_Schema_Log$');

describe('Fl64_Paypal_Back_Store_RDb_Schema_Log', () => {
    const ATTR = schema.getAttributes();
    const expectedProperties = [
        'date_logged',
        'id',
        'request_data',
        'request_type',
        'response_data',
        'response_status',
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
        assert.equal(schema.getEntityName(), `${DEF.NAME}/fl64/paypal/log`, 'Entity name should match the expected path');
        assert.deepStrictEqual(schema.getPrimaryKey(), [ATTR.ID], 'Primary key should be set to ID');
    });

    it('should correctly parse JSON fields', () => {
        const testData = JSON.stringify({
            request_data: {action: 'order_create', details: {amount: 100}},
            response_data: {status: 'SUCCESS', transaction_id: 'XYZ123'},
        });

        const dto = schema.createDto(testData);
        assert.deepStrictEqual(dto.request_data, testData.request_data, 'Request data should be correctly stored');
        assert.deepStrictEqual(dto.response_data, testData.response_data, 'Response data should be correctly stored');
    });

    it('should correctly parse integer fields', () => {
        const testData = {response_status: 200};
        const dto = schema.createDto(testData);
        assert.strictEqual(dto.response_status, 200, 'Response status should be correctly stored as integer');
    });

    it('should correctly handle missing optional fields', () => {
        const dto = schema.createDto({});
        expectedProperties.forEach(prop => {
            assert.strictEqual(dto[prop], undefined, `Property ${prop} should be undefined when missing`);
        });
    });
});

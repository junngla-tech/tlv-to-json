const assert = require('assert');
const TLV = require('../dist');

describe('TLS tests', () => {

    it('Normal valid input string', () => {

        const result = TLV.TLV.toJSON("" +
            "000201" +
            "010212" +
            "2643" +
                "0012com.facebook" +
                "0112597033953038" +
            "02079990997" +
            "52040000" +
            "5303152" +
            "540410.0" +
            "5802US" +
            "5907SHOP   " +
            "6008Beaumont" +
            "8054" +
            "0024com.facebook.pay.options" +
                "0108B0826260" +
                "0203002" +
                "0303002" +
            "8173" +
                "0029com.facebook.pay.options.uuid" +
                "013628c729bb-0b23-4014-9974-da73573cbc84" +
            "6304F556");

        assert.deepEqual(result, JSON.parse('{' +
            '"F00":"01",' +
            '"F01":"12",' +
            '"F26":{' +
                '"F00":"com.facebook",' +
                '"F01":"597033953038",' +
                '"F02":"9990997"' +
            '},' +
            '"F52":"0000",' +
            '"F53":"152",' +
            '"F54":"10.0",' +
            '"F58":"US",' +
            '"F59":"SHOP   ",' +
            '"F60":"Beaumont",' +
            '"F80":{' +
                '"F00":"com.facebook.pay.options",' +
                '"F01":"B0826260",' +
                '"F02":"002",' +
                '"F03":"002"' +
            '},' +
            '"F81":{' +
                '"F00":"com.facebook.pay.options.uuid",' +
                '"F01":"28c729bb-0b23-4014-9974-da73573cbc84"' +
            '},' +
            '"F63":"F556"' +
        '}'));
    });

    it('Valid input string when CRC starts with zero', () => {

        const result = TLV.TLV.toJSON("" +
            "000201" +
            "010212" +
            "2643" +
                "0012com.facebook" +
                "0112597033953038" +
            "02079990997" +
            "52040000" +
            "5303152" +
            "540410.0" +
            "5802US" +
            "5907SHOPIFY" +
            "6008Beaumont" +
            "8054" +
            "0024com.facebook.pay.options" +
                "0108B0826260" +
                "0203002" +
                "0303002" +
            "8173" +
                "0029com.facebook.pay.options.uuid" +
                "013628c729bb-0b23-4014-9974-da73573cbc84" +
            "63040989");

        assert.deepEqual(result, JSON.parse('{' +
            '"F00":"01",' +
            '"F01":"12",' +
            '"F26":{' +
                '"F00":"com.facebook",' +
                '"F01":"597033953038",' +
                '"F02":"9990997"' +
            '},' +
            '"F52":"0000",' +
            '"F53":"152",' +
            '"F54":"10.0",' +
            '"F58":"US",' +
            '"F59":"SHOPIFY",' +
            '"F60":"Beaumont",' +
            '"F80":{' +
            '"F00":"com.facebook.pay.options",' +
                '"F01":"B0826260",' +
                '"F02":"002",' +
                '"F03":"002"' +
            '},' +
            '"F81":{' +
                '"F00":"com.facebook.pay.options.uuid",' +
                '"F01":"28c729bb-0b23-4014-9974-da73573cbc84"' +
            '},' +
            '"F63":"0989"' +
        '}'));
    });

    it('Invalid Checksum on the input string', () => {

        try {
            TLV.TLV.toJSON("00020163040989");
        } catch (e) {
            assert.equal(e.message, "Checksum failed (Calculated: AAE6, Expected: 0989)")
        }
    });

    it('Invalid input string (length is not a number)', () => {

        try {
            TLV.TLV.toJSON("00020163R4AAE6", false);
        } catch (e) {
            assert.equal(e.message, "Input string data is not valid")
        }
    });

    it('Ignore checksum validation', () => {

        const result = TLV.TLV.toJSON("0002016304TEST", false);
        assert.equal(JSON.stringify(result), '{"F00":"01","F63":"TEST"}');
    });
});

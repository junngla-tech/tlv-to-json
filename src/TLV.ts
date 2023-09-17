import crc from 'crc';

/**
 * The TLV main class of this library
 */
export class TLV {

    /**
     * This function parse a TLS string to a JSON object
     * @param data the string to parse
     * @param doValidateChecksum do the data parameter contains checksum?
     */
    public static toJSON = (data: string, doValidateChecksum: boolean = true): object => {

        // Validation of the checksum
        if (doValidateChecksum)
            this.checkCRCOrFail(data);

        try {
            // Trying to parse the input string
            return TLV.parseDataOrFail(data);
        } catch (e) {
            throw new Error('Input string data is not valid');
        }
    }

    /**
     * Calculate a CRC16 of a string
     * @param data the string
     * @return string the 4 characters CRC16
     * @protected
     */
    protected static getCRC(data: string): string {
        return crc.crc16ccitt(data) // Calculate the CRC16 hash
            .toString(16) // Convert to hexadecimal
            .toUpperCase() // Forcing uppercase
            .padStart(4, '0'); // Forcing 4 chars length (16 bits)
    }

    /**
     * Check the validity of checksum for the input string and throw exception if not valid
     * @param data the input string to validate
     * @param expected the expected checksum
     * @protected
     */
    protected static checkCRCOrFail(data: string, expected?: string): void {
        // If no excepted parameter is passed
        if (!expected) return TLV.checkCRCOrFail( // This function is calling himself
            data.substring(0, data.length - 4), // Extracting the data without the last 4 digits (CRC)
            data.substring(data.length - 4), // Extracting the last 4 digits (CRC)
        );

        if (expected) {
            // Calculating the real CRC value
            const crc16 = TLV.getCRC(data);

            // Checking if the calculated value matches the expected value
            if (crc16 !== expected)
                throw new Error(`Checksum failed (Calculated: ${crc16}, Expected: ${expected})`);
        }
    }

    /**
     *
     * @param data the original string
     * @param output the output json object
     * @param offset the char offset from where we should start searching
     * @param depth the structure recursive depth
     * @protected
     */
    protected static parseDataOrFail = (data: string, output : object = {}, offset: number = 0, depth: number = 0): object => {

        // The TLV values (Type, Length, Value)
        const fieldType = TLV.getFieldType(data, offset);
        const fieldLength = TLV.getFieldLength(data, offset);
        let fieldValue: string | object = TLV.getFieldValue(data, fieldLength, offset);

        try {
            // We try to parse the field value as a subfield
            fieldValue = this.parseDataOrFail(fieldValue, {}, 0, depth + 1);
        } catch {
            // field is not an object, it doesn't matter, it's a field
        } finally {
            // We add the field (string or object) to the output object
            output = {...output, ...{ [`T${fieldType}`] : fieldValue}};
        }

        // Is there another field to process?
        if (TLV.getNextFieldOffset(data, offset, fieldLength) > 0) {
            // If yes, we process the following field
            return this.parseDataOrFail(data, output, TLV.getNextFieldOffset(data, offset, fieldLength),  depth);
        }

        return output;
    }

    /**
     * Get the offset of the next field to process
     * @return number The next field offset or -1 if there is no more field to process
     * @protected
     */
    protected static getNextFieldOffset = (data: string, offset: number, length: number) => {
        return data.length > (offset + 2 + 2 + length) ? (offset + 2 + 2 + length) : -1;
    }

    /**
     * Get a TLV field type
     * @param data the original string
     * @param offset the char offset from where we should start searching
     * @protected
     */
    protected static getFieldType = (data: string, offset: number = 0) => {
        if (offset + 2 > data.length)
            throw new Error('This can\'t be a field type');

        return data.substring(offset, offset + 2);
    }

    /**
     * Get a TLV field length
     * @param data the original string
     * @param offset the char offset from where we should start searching
     * @protected
     */
    protected static getFieldLength = (data: string, offset: number = 0): number => {
        if (offset + 2 + 2 > data.length)
            throw new Error('This can\'t be a field length');

        const length = parseInt(data.substring(offset + 2, offset + 2 + 2), 10);

        if (isNaN(length) || length === 0)
            throw new Error('This can\'t be a field length');

        return length;
    }

    /**
     * Get a TLV field value
     * @param data the original string
     * @param length the field char length
     * @param offset the char offset from where we should start searching
     * @protected
     */
    protected static getFieldValue = (data: string, length: number, offset: number = 0) => {
        if (offset + 2 + 2 + length > data.length)
            throw new Error('This can\'t be a field value');

        return data.substring(offset + 2 + 2, offset + 2 + 2 + length);
    }
}

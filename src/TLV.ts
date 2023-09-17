import crc from 'crc';

export class TLV {

    /**
     * This function parse a TLS string to a JSON object
     * @param data the string to parse
     * @param checksum do the data parameter contains checksum?
     */
    public static toJSON = (data: string, checksum: boolean = true): any => {

        if (checksum)
            this.checkCRCOrFail(data);

        try {
            return TLV.parseDataOrFail(data);
        } catch (e) {
            throw new Error("Input string data is not valid");
        }
    }

    /**
     * Calculate a CRC16 of a string
     * @param data the string
     * @return string the 4 characters CRC16
     * @protected
     */
    protected static getCRC(data: string): string {
        return crc.crc16ccitt(data)
            .toString(16)
            .toUpperCase()
            .padStart(4, "0");
    }

    /**
     * Check the validity of checksum for the input string and throw exception if not valid
     * @param data the input string to validate
     * @param expected the expected checksum
     * @protected
     */
    protected static checkCRCOrFail(data: string, expected?: string): void {
        if (!expected) return TLV.checkCRCOrFail(
            data.substring(0, data.length - 4),
            data.substring(data.length - 4),
        );

        if (expected) {
            const crc16 = TLV.getCRC(data);

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
    protected static parseDataOrFail = (data: string, output : any = {}, offset: number = 0, depth: number = 0): undefined | any => {

        const fieldId = TLV.getFieldType(data, offset);
        const fieldLength = TLV.getFieldLength(data, offset);
        const fieldValue = TLV.getFieldValue(data, fieldLength, offset);

        try {
            output[`F${fieldId}`] = this.parseDataOrFail(fieldValue, {}, 0, depth + 1);
        } catch (e) {
            output[`F${fieldId}`] = fieldValue;
        }

        if (TLV.getNextFieldOffset(data, offset, fieldLength) > 0) {
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

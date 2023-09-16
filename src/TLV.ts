import crc from 'crc';

export class TLV {

    /**
     * This function parse a TLS string to a JSON object
     * @param data the string to parse
     * @param checksum do the data parameter contains checksum?
     */
    public static toJSON = (data: string, checksum: boolean = true): any => {

        if (checksum && !this.checkCRC(data)) {
            throw new Error('Checksum failed');
        }

        return TLV._parse(data);
    }

    protected static getCRC(data: string): string {
        return crc.crc16ccitt(data).toString(16).toUpperCase();
    }

    protected static checkCRC(data: string, expected?: string): boolean {
        if (expected) {
            return TLV.getCRC(data) === expected;
        } else {
            return TLV.checkCRC(
                data.substring(0, data.length - 4),
                data.substring(data.length - 4),
            )
        }
    }

    /**
     *
     * @param data the original string
     * @param output the output json object
     * @param offset the char offset from where we should start searching
     * @param depth the structure recursive depth
     */
    protected static _parse = (data: string, output : any = {}, offset: number = 0, depth: number = 0): undefined | any => {

        let fieldId: string;
        let fieldLength: number;
        let fieldValue: string;

        try {
            fieldId = TLV.getFieldID(data, offset);
            fieldLength = TLV.getFieldLength(data, offset);
            fieldValue = TLV.getFieldValue(data, fieldLength, offset);
        } catch (e) { return; }

        const children = this._parse(fieldValue, {}, 0, depth + 1);

        output[`F${fieldId}`] = children || fieldValue;

        const nextOffset = offset + fieldLength + 4;

        if (data.length > nextOffset) {
            return this._parse(data, output, nextOffset, depth);
        } else {
            return output;
        }
    }

    /**
     * Get a TLV field identifier
     * @param data the original string
     * @param offset the char offset from where we should start searching
     */
    protected static getFieldID = (data: string, offset: number = 0) => {
        if (offset + 2 > data.length) throw new Error('This can\'t be a field');
        return data.substring(offset, offset + 2);
    }

    /**
     * Get a TLV field length
     * @param data the original string
     * @param offset the char offset from where we should start searching
     */
    protected static getFieldLength = (data: string, offset: number = 0): number => {
        if (offset + 4 > data.length) throw new Error('This can\'t be a length');
        const length = parseInt(data.substring(offset + 2, offset + 4), 10);

        if (isNaN(length) || length === 0) throw new Error('This can\'t be a length');

        return length;
    }

    /**
     * Get a TLV field value
     * @param data the original string
     * @param length the field char length
     * @param offset the char offset from where we should start searching
     */
    protected static getFieldValue = (data: string, length: number, offset: number = 0) => {
        if (offset + 4 + length > data.length) throw new Error('This can\'t be a value');
        return data.substring(offset + 4, offset + 4 + length);
    }
}

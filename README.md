# TLV string to JSON object

This library provides a simple way to convert TLV complex string to a JSON object

## Example

The input string:
> 00020101021226430012com.facebook011259703395303802079990997520400005303152540410.05802US5907SHOPIFY6008Beaumont80540024com.facebook.pay.options0108B08262600203002030300281730029com.facebook.pay.options.uuid013628c729bb-0b23-4014-9974-da73573cbc8463040989

Calling the JSON parser:
```typescript
// ./example.ts
import { TLV } from 'tlv-to-json';

const json = TLV.toJSON('/* THE INPUT STRING */');

console.log(json.F80.F01); // Print B0826260
```

The output result:
```json
{
    "F00": "01",
    "F01": "12",
    "F26": {
        "F00": "com.facebook",
        "F01": "597033953038",
        "F02": "9990997"
    },
    "F52": "0000",
    "F53": "152",
    "F54": "10.0",
    "F58": "US",
    "F59": "SHOP   ",
    "F60": "Beaumont",
    "F63": "F556",
    "F80": {
        "F00": "com.facebook.pay.options",
        "F01": "B0826260",
        "F02": "002",
        "F03": "002"
    },
    "F81": {
        "F00": "com.facebook.pay.options.uuid",
        "F01": "28c729bb-0b23-4014-9974-da73573cbc84"
    }
}
```

Please note field's names are prefixed with the letter `F`.

## CRC Check

By default, the `toJSON` function assume the input string's last 4 digits are a CRC16 Checksum Hexadecimal.

To disable the checksum verificación you can pass false to the second parameter:
```typescript
const json = TLV.toJSON('/* THE INPUT STRING */', false);
```

In case of checksum error, this message will be displayed:
```
Checksum failed (Calculated: AAE6, Expected: 0989)
```
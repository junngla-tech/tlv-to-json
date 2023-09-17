# TLV string to JSON object

This library provides a simple way to convert TLV string to a JSON object. 

The type and length are fixed in size, and the value field is of variable size.

More information here: https://en.wikipedia.org/wiki/Type–length–value

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
  "T00": "01",
  "T01": "12",
  "T26": {
    "T00": "com.facebook",
    "T01": "597033953038",
    "T02": "9990997"
  },
  "T52": "0000",
  "T53": "152",
  "T54": "10.0",
  "T58": "US",
  "T59": "SHOPIFY",
  "T60": "Beaumont",
  "T80": {
    "T00": "com.facebook.pay.options",
    "T01": "B0826260",
    "T02": "002",
    "T03": "002"
  },
  "T81": {
    "T00": "com.facebook.pay.options.uuid",
    "T01": "28c729bb-0b23-4014-9974-da73573cbc84"
  },
  "T63": "0989"
}
```

Please note field's names are prefixed with the letter `T`.

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
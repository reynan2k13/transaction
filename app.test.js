const api = require('./api.js')

const testObject = {
    "date": "2016-01-05", // operation date in format `Y-m-d`
    "user_id": 1, // user id, integer
    "user_type": "natural", // user type, one of “natural”(natural person) or “juridical”(legal person)
    "type": "cash_in", // operation type, one of “cash_in” or “cash_out”
    "operation": {
        "amount": 200, // operation amount(for example `2.12` or `3`)
        "currency": "EUR" // operation currency `EUR`
    }
}

test('testObject.date', () => {
  expect(testObject.date).toBe('2016-01-05');
});

test('testObject.user_id', () => {
  expect(testObject.user_id).toBe(1);
});

test('testObject.user_type', () => {
  expect(testObject.user_type).toBe('natural');
});

test('testObject.type', () => {
  expect(testObject.type).toBe('cash_in');
});

test('testObject.operation.amount', () => {
  expect(testObject.operation.amount).toBe(200);
});

test('testObject.operation.currency', () => {
  expect(testObject.operation.currency).toBe('EUR');
});

describe('api.getCashIn', () => {
	api.getCashIn( result => {
		expect(result).toBe(result)
	})
});

describe('api.getCashOut', () => {
	api.getCashOut('natural' , result => {
		expect(result).toBe(result)
	})
});

describe('api.getCashOut', () => {
	api.getCashOut('juridical' ,result => {
		expect(result).toBe(result)
	})
});


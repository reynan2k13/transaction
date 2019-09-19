const api = require('./api.js');
const app = require('./app.js')


fetchGetCashIn = (callback) => {
  api.getCashIn( result => {
    callback(result);
    })
}

test('api.getCashIn', done => {
  function callback(data) {
    expect(data).not.toBeNull();
    done();
  }

  fetchGetCashIn(callback);
});

fetchGetCashOut = (callback) => {
  api.getCashOut('natural' , result => {
    callback(result);
  })
}

test('api.getCashOut', done => {
  function callback(data) {
    expect(data).not.toBeNull();
    done();
  }

  fetchGetCashOut(callback);
});

const testUser = [{ "date": "2016-01-05", "user_id": 1, "user_type": "natural", "type": "cash_in", "operation": { "amount": 200.00, "currency": "EUR" } }];
test('test user data' , ()=>{
    expect(testUser[0].date).toBe('2016-01-05');
    expect(testUser[0].user_id).toBe(1);
    expect(testUser[0].user_type).toBe('natural');
    expect(testUser[0].type).toMatch(/cash_in/ ||  /cash_out/);
    expect(testUser[0].operation.amount).toBeGreaterThan(0);
    expect(testUser[0].operation.currency).toBe('EUR');


});

test('getWeek output', () => {
  expect(app.getWeek(testUser[0].date)).toHaveLength(7);
});


test('commissionCashIn ', () => {
  const data = {
      "percents": 0.03,
      "max": {
          "amount": 5,
          "currency": "EUR"
      }
    }
  expect(app.commissionCashIn(testUser[0].operation.amount , data)).toBeGreaterThanOrEqual(0);
});


test('commissionCashOutJuridical ', () => {
  const data = {
      "percents": 0.3,
      "min": {
          "amount": 0.5,
          "currency": "EUR"
      }
  }
  expect(app.commissionCashOutJuridical(testUser[0].operation.amount , data)).toBeGreaterThanOrEqual(0);
});



test('commissionCashOutNatural ', () => {
  const data = {
      "percents": 0.3,
      "week_limit": {
          "amount": 1000,
          "currency": "EUR"
      }
    }
  expect(app.commissionCashOutJuridical(testUser[0].operation.amount , data)).toBeGreaterThanOrEqual(0);
});









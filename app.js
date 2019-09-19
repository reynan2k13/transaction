const http = require('http');
const port = 3000;
const fs = require('fs');
const api = require('./api.js')

let jsonData = './input.json';
let cashInResponse = false,
	cashOutNaturalResponse = false,
	cashOutJuridicalResponse = false;

let cashIn, cashOutNatural, cashOutJuridical, commission;

api.getCashIn( result => {
	cashIn = result;
	cashInResponse = true;
})
api.getCashOut('natural' , (result) => {
	cashOutNatural = result;
	cashOutNaturalResponse = true;
})
api.getCashOut('juridical' , (result) => {
	cashOutJuridical = result;
	cashOutJuridicalResponse = true;
})


const requestHandler = (request, response) => {
  console.log(request.url)
	response.end('Hello Node.js Server!');
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  	if (err) {
    	return console.log('something bad happened', err);
  	}
  // console.log(`server is listening on ${port}`);
})

fs.readFile(jsonData , (err, data) => {
    if (err) throw err;
    calculate(JSON.parse(data));
});


var arrayUser = []; //tmp storage for comparing

// add week monday to sunday
getWeek = (params) => {
	let week = [];
	let curr = new Date(params);
	let first;
	for (let i = 1; i <= 7; i++) {
		
		if(curr.getDay() === 0){
			first = curr.getDate() - 7 + i;
		}else{
			first = curr.getDate() - curr.getDay() + i ;
		}
		let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
		week.push(day)
	}
	return week;
}

commissionCashIn = (amount , data) => {
	let val = amount * data.percents / 100;
		if(val < data.max.amount){
			return val;
		}else{
			return data.max.amount;
		}
}

commissionCashOutNatural = (tmpUser , user , data) => {
	if(tmpUser.remaining_limit > 0){
		let newLimit = tmpUser.remaining_limit - user.operation.amount;
		if(newLimit > 0){
			tmpUser.remaining_limit = newLimit;
			user.commission = 0;
		}else{
			// convert negative number to positive
			user.commission = Math.abs(newLimit * data.percents / 100);
			tmpUser.remaining_limit = 0;
		}
	}else{
		user.commission = user.operation.amount * data.percents / 100;
		tmpUser.remaining_limit = 0;
	}
	
}

commissionCashOutJuridical = (amount , data) => {
	let val = amount * data.percents / 100;
		return val;
}


calculate = (users) => {
	if(cashInResponse && cashOutNaturalResponse && cashOutJuridical){
		for(let x = 0; x<users.length;x++){
			switch(users[x].type){
				case 'cash_in':
					users[x].commission = commissionCashIn(users[x].operation.amount , cashIn);

					break;
				case 'cash_out':
					if(users[x].user_type === 'natural'){
						if(arrayUser.length === 0){
							arrayUser.push({
								user : users[x].user_id,
								week: getWeek(users[x].date),
								remaining_limit : cashOutNatural.week_limit.amount
							})
					
							commissionCashOutNatural(arrayUser[0]  , users[x]  , cashOutNatural);

						}else{
							for(var i=0;i<arrayUser.length;i++){
								if(arrayUser[i].user === users[x].user_id){
									
									if(arrayUser[i].week.indexOf(users[x].date) === -1){
										
										// if date did not match 
										arrayUser[i].week = getWeek(users[x].date);
										arrayUser[i].remaining_limit = cashOutNatural.week_limit.amount;

										commissionCashOutNatural(arrayUser[i]  , users[x]  , cashOutNatural);

									}else{
										
										//if date match
										commissionCashOutNatural(arrayUser[i]  , users[x]  , cashOutNatural);
									}
								}
								else{
									// new user push 
									let isfind = false;
									for(let j=0;j<arrayUser.length;j++){
										if(arrayUser[j].user === users[x].user_id){
											isfind = true;
										}
									}
									if(!isfind){
										arrayUser.push({
											user : users[x].user_id,
											week:  getWeek(users[x].date),
											remaining_limit : cashOutNatural.week_limit.amount
										})
									}

								}
							}
						}
					}else{
						// juridical cash out
						users[x].commission = commissionCashOutJuridical(users[x].operation.amount , cashOutJuridical)	
					}
				break;
			}
			
		}

		evaluate(users)
	}else{
		setTimeout(function() {
			calculate(users)
		}, 1000);
	}
}

//final output show only the computed comission
evaluate = (data) =>{
	for(let x=0;x<data.length;x++){
		process.stdout.write( (parseFloat(data[x].commission).toFixed(2)) + '\n');

	}
}


module.exports = { getWeek , commissionCashIn , commissionCashOutNatural , commissionCashOutJuridical , calculate , evaluate };



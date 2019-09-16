
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
getweek = (params) => {
    const today = new Date(params);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) /8);
}


calculate = (users) => {
	if(cashInResponse && cashOutNaturalResponse && cashOutJuridical){
		for(let x = 0; x<users.length;x++){
			switch(users[x].type){
				case 'cash_in':
					commission = users[x].operation.amount * cashIn.max.amount / 100;
					commission < cashIn.max.amount ? users[x].commission = commission : users[x].commission = cashIn.max.amount;
					break;
				case 'cash_out':
					if(users[x].user_type === 'natural'){
						
						if(arrayUser.length === 0){
							let limit = cashOutNatural.week_limit.amount - users[x].operation.amount;
							if(limit >= 0){
								users[x].remaining_limit = cashOutNatural.week_limit.amount - users[x].operation.amount;
								users[x].commission = 0;
							}else{
								users[x].remaining_limit = 0;
								commission = (limit * cashOutNatural.percents / 100) * -1;
								users[x].commission = commission;
							}
							arrayUser.push({
								user : users[x].user_id,
								week: getweek(users[x].date),
								remaining_limit : users[x].remaining_limit
							})
							
						}else{
							for(var i=0;i<arrayUser.length;i++){
								if(arrayUser[i].user !== users[x].user_id){
									arrayUser.push({
										user : users[x].user_id,
										week: getweek(users[x].date),
										remaining_limit : cashOutNatural.week_limit.amount
									})

									let limit = cashOutNatural.week_limit.amount - users[x].operation.amount;
									if(limit >= 0){
										users[x].remaining_limit = cashOutNatural.week_limit.amount - users[x].operation.amount;
									}else{
										users[x].remaining_limit = 0;
									}
									users[x].remaining_limit = arrayUser[i].remaining_limit;
								}
								else{
									if(arrayUser[i].week !== getweek(users[x].date)){
	
										//reset limit if new week
										arrayUser.push({
											user : users[x].user_id,
											week: getweek(users[x].date),
											remaining_limit : cashOutNatural.week_limit.amount 
										})

									}else{
										let limit = arrayUser[i].remaining_limit - users[x].operation.amount;

										if(limit >= 0){
											users[x].commission = 0;
											users[x].remaining_limit = cashOutNatural.week_limit.amount - users[x].operation.amount;
										}else{
											users[x].commission = users[x].operation.amount * cashOutNatural.percents / 100;
											users[x].remaining_limit = 0;
										}
									}
								}
							}
						}

					}else{
						// juridical cash out
						commission = users[x].operation.amount * cashOutJuridical.percents / 100;
						users[x].commission = commission;
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




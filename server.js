const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const bcrypt = require('bcrypt');
const cors = require('cors');



const saltRounds = 10;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const dataBase = {
	users:[
		{
				id: '321',
				user: 'Chic',
				email: 'chic@mail',
				password: '9876',
				entries: 0,
				joined: new Date()
			},
			{
				id: '123',
				user: 'Dude',
				email: 'dude@mail',
				password: '1234',
				entries: 0,
				joined: new Date()
			}
	]
}

const db = knex({
  client: 'pg',
  connection: {
				    host : '127.0.0.1',
				    user : 'zen',
				    port: 5432,
				    password : '',
				    database : 'ramenDB'
				  }

  // connection: {
  // 		connectionString: process.env.DATABASE_URL,
// 	    host : process.env.HOSTNAME,
// 	    port : 5432,
// 	    user : process.env.USERNAME,
// 	    password : process.env.DB_PASSWORD,
// 	    database : process.env.DATABASE,
// 			ssl: {rejectUnauthorized: false}
// 	  }
});
db.select('*').from('users').then(data =>{
			console.log(data);
	});


app.listen(3000, () =>{ // listen response when connected
	console.log('app is running on port 3000');
})

app.get('/',(req,res)=>{ //basic get response to test
	res.send(dataBase.users);
})

app.post('/login',(req,res)=>{// POST request to login
			let found = false;
			dataBase.users.forEach(user => {
				if((req.body.user === user.user) &&
				req.body.password === user.password){
					found = true;
					// res.json('success');
					let name = dataBase.users[0].user;
					let count = dataBase.users[0].entries;
					let data = {name,count};
					res.json(data);
				}
			});
			if (!found){
				res.status(400).json('error logging in');

			}
		});

app.post('/register',(req,res)=>{ // register new user
			const {user, email, password} = req.body;
			db('users').insert({
				name: user,
				email: email,
				password: password
			}).then(console.log);
			// dataBase.users.push({
			// 	id: '125',
			// 	user: user,
			// 	email: email,
			// 	password: password,
			// 	entries: 0,
			// 	joined: new Date()
			// });
			res.json(
				dataBase.users[dataBase.users.length-1].user
			);
		})

// look up user by id, return user info
app.get('/profile/:id',(req,res)=>{ 
			const { id } = req.params;
			let found = false;
			dataBase.users.forEach(user => {
				if(user.id === id){
					found = true;
					res.json(user);
				}
			});
			if (!found){
				res.status(400).json('not found');
			}
		});

// send in a report, increment entry amount, returns user entry count`  Use to be '/image' in smartbrain app
app.post('/report',(req,res)=>{ 
			const { id } = req.body;
			let found = false;
			dataBase.users.forEach(user => {
				if(user.id === id){
					found = true;
					user.entries++;
					return res.json(user);
				}
			});
			if (!found){
				res.status(400).json('not found');
			}
		});
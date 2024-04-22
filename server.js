const express = require("express");
const bodyParser = require("body-parser");
const knex = require("knex");
const bcrypt = require("bcrypt");
const cors = require("cors");

const mkdirp = require("mkdirp");
const fs = require("fs");
const getDirName = require("path").dirname;

const saltRounds = 10;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = knex({
  client: "pg",
  //   connection: {
  // 				    host : '127.0.0.1',
  // 				    user : 'zen',
  // 				    port: 5432,
  // 				    password : '',
  // 				    database : 'ramenDB'
  // 				  }
  // debug: true

  connection: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.HOSTNAME,
    port: 5432,
    user: process.env.USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    ssl: { rejectUnauthorized: false },
  },
});

//  server functions
db.select("*")
  .from("users")
  .then((data) => {
    console.log("connected to ramenDB!");
  });

app.listen(3000, () => {
  // listen response when connected
  console.log("app is running on port 5432");
});

app.get("/", (req, res) => {
  //basic get response to test
  res.send("success");
});

app.post("/login", (req, res) => {
  // POST request to login
  db.select("email", "hash")
    .from("login") // target db with specific elements
    .where("email", "=", req.body.email) // check if user input matches db data
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash); // compare user pw with database pw
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("unable to get user"));
      } else {
        res.status(400).json("wrong credentials");
      }
    })
    .catch((err) => res.status(400).json("error"));
});

app.post("/register", (req, res) => {
  // register new user
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, saltRounds);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            name: name,
            email: loginEmail[0].email,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => {
    res.status(400).json("unable to register");
  });
});

// look up user by id, return user info
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  db.select("*")
    .from("users")
    .where({
      id: id,
    })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
        console.log(user);
      } else {
        res.status(400).json("not found");
      }
    });
});

// send in a report, increment entry amount, returns user entry count`  Use to be '/image' in smartbrain app
app.post("/report", (req, res) => {
  const { email, resto, noodles, soup, toppings, experience, comments } =
    req.body;
  db.transaction((trx) => {
    trx
      .insert({
        email: email,
        resto: resto,
        noodles: noodles,
        soup: soup,
        toppings: toppings,
        experience: experience,
        comments: comments,
      })
      .where("email", "=", email)
      .into("ratings")
      .returning("email")
      .then((goData) => {
        return trx("users")
          .where("email", "=", email)
          .increment("entries", 1)
          .returning("*");
      })
      .then((user) => {
        // console.log(user);
        return res.json(user[0]);
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("unable to save to db"));
});

// insert JSON data into DB
app.post("/json2db", (req, res) => {
  const {
    resto,
    address,
    city,
    province,
    country,
    postal,
    ratingtotal,
    latlng,
    price,
    rating,
  } = req.body;
  db.transaction((trx) => {
    trx
      .insert({
        resto: resto,
        address: address,
        city: city,
        province: province,
        country: country,
        postal: postal,
        ratingtotal: ratingtotal,
        latlng: latlng,
        price: price,
        rating: rating,
      })
      .where("email", "=", email)
      .into("restaurants")
      .returning("*")
      .then((item) => {
        console.log(item);
        return res.json(item);
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) =>
    // res.status(400).json(err)
    console.error(err)
  );
});

// get ratings data
app.post("/ratings", (req, res) => {
  // console.log(req.body);
  let data = req.body;
  let user = data[data.length - 1];
  let userMail = user.email;
  console.log("checking this user email: ", userMail);
  db.select("email")
    .from("users") // target db with specific elements
    .where("email", "=", userMail) // check if user exists in db
    .then((data) => {
      return db.select("*").from("ratings");
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(400).json("error"));
});

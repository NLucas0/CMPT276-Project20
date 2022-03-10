// store logged in user id
let USER_ID = 0;

const express = require('express')
const bcrypt = require('bcrypt') // for encrypting password
const path = require('path')
const session = require("express-session")
const PORT = process.env.PORT || 5000

const {Pool} = require('pg');
var pool = new Pool({
  connectionString: process.env.DATABASE_URL||"postgres://postgres:root@localhost/aio_dld_database"
  ,ssl:{rejectUnauthorized: false}
})

express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .use(express.urlencoded({extended: false})) //false does not let the id and info go in coockies
    .use(session({
      name: "session",
      secret: 'AIODLD',
      resave: false,
      saveUninitialized: false,
      maxAge: 30 * 60 * 1000, //max time of the info that stays on the coockie is 500 hours?
    }))

    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')

    .get('/', (req, res) => res.render('pages/index'))
    .get('/signup', (req, res) => res.render('pages/signup'))
    .get('/login', (req, res) => res.render('pages/login'))
    //.get('/login/admin', (req, res) => res.render('pages/login'))
    



    //signup
    .post('/signup', async (req, res)=> {
      try{
        const hashedpassword = await bcrypt.hash(req.body.password,10);//creates a encrypted password using bcrypt into size 10, add salt? 
        const username = req.body.username;
        //let email= req.body.email;
        
        const client = await pool.connect();
        var addnewuser = await client.query(`Insert into users values('${username}','${hashedpassword}')`); // what esle to add to the user insert
        

        req.session.user = user;
        if(req.session.user) {
          res.send(`
          Your session id <code>${req.sessionID} </code>
          <br>
          <a href="/landing"> NEXT PAGE </a>
          `)
        } else {
          res.send(`
          Login Failed - bad username or password
          <br>
          <a href='/login.html'>Return to Login</a>
          `)
        }

        client.release();
      } catch(error) {
        res.end(error);
      }
    })

    //login
    .post('/login', async (req, res)=> {
      try{
        let username = req.body.username;
        let password = req.body.password;
        
        const client = await pool.connect();
        var result = await client.query(`SELECT * FROM users WHERE name~*'${username}' AND password='${password}'`);
        var user = result.rows[0];

        req.session.user = user;
        if(req.session.user) {
          res.send(`
          Your session id <code>${req.sessionID} </code>
          <br>
          <a href="/landing"> NEXT PAGE </a>
          `)
        } else {
          res.send(`
          Login Failed - bad username or password
          <br>
          <a href='/login.html'>Return to Login</a>
          `)
        }

        client.release();
      } catch(error) {
        res.end(error);
      }
    })

    .get('/landing', (req,res)=> {
      if (req.session.user){  // logged in??
          res.send(`
              Hi ${req.session.user.name}
          `)
      } else {
          res.redirect('/login.html')
      }
    })
  


    // trading
    .get('/trade', async(req, res)=>{
        try{
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM users`);
            const data = {results: result.rows,
                            id:USER_ID};
            res.render('pages/tradingPage', data);
            client.release();
        }
        catch(error){
            res.send(error);
        }
    })

      // initiate trading. send traders' data to page
    .get('/tradeSelection', async(req, res)=>{
        try{
            const client = await pool.connect();
            const data = {user1: req.query.user1,
                            user2: req.query.user2};
            res.render('pages/tradeSelectionPage', data);
            client.release();
        }
        catch(error){
            res.send(error);
        }
    })

    // admin
    // send all user data to admin page
    .get('/admin', async(req, res)=>{
        try{
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM users`);
            const data = {results: result.rows};
            res.render('pages/adminPage', data);
            client.release();
        }
        catch(error){
            res.send(error);
        }
    })
  

    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

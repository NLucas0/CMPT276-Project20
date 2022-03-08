// store logged in user id
let USER_ID = 0;

const express = require('express')
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
    .use(express.urlencoded({extended: false}))
    .use(session({
      name: "session",
      secret: 'AIODLD',
      resave: false,
      saveUninitialized: false,
      maxAge: 30 * 60 * 1000,
    }))

    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')

    .get('/', (req, res) => res.render('pages/index'))

    //login
    .post('/login', async (req, res)=> {
      try{
        let username = req.body.username;
        let password = req.body.password;
        
        const client = await pool.connect();
        var result = await client.query(`SELECT * FROM users WHERE name~*'${username}' AND password='${password}'`);
        
        var user = result.rows[0];

        req.session.user = user;
        console.log(result.rows[0]);
        console.log(req.session.user.name);
        res.send(`
        Your session id <code>${req.sessionID} </code>
        <br>
        <a href="/landing"> NEXT PAGE </a>
        `)

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

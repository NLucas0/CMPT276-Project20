

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
    .use((req, res, next) => {
      res.locals.user = req.session.user
      next()
    })

    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')

    .get('/', (req, res) => res.redirect('/landing'))
    .get('/signup', (req, res) => res.render('pages/register'))
    .get('/login', (req, res) => res.render('pages/login'))
    //.get('/login/admin', (req, res) => res.render('pages/login'))
    
    //landing
    .get('/landing', (req,res)=> {
      res.render('pages/landing');
    })


    //signup
    .post('/signup', async (req, res)=> {
      const password = req.body.password;
      const username = req.body.username;

      var cardsarray = new Array(4);
      cardsarray[0]=  new Array(10).fill(0);
      cardsarray[1]=  new Array(10).fill(0);
      cardsarray[2]=  new Array(10).fill(0);
      cardsarray[3]=  new Array(10).fill(0);

      await pool.query(`Insert into users (name, password, cards) values('${username}', '${password}', $1)`, [cardsarray]);
      
      res.redirect('/login');
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

    .get('/logout', (req, res)=> {
      req.session.destroy();
      res.redirect('/');
    })
  
    //Pack Opener Box Selection
    .get('/opener', (req,res)=>{
      res.render('pages/pack-nav');
    })

    //Pack Opener Start
    .get('/box/:id', (req,res)=>{
      var boxnum = req.params.id;
      var boxname = 'Placeholder Box';

      if(boxnum == 1) {
        boxname = 'The Ultimate Rising';
      } else if(boxnum == 2) {
        boxname = 'Age Of Discovery';
      } else if(boxnum == 3) {
        boxname = 'Neo Impact';
      } else if(boxnum == 4) {
        boxname = 'Flame Of The Tyrant';
      }

      var data = { num : boxnum, name : boxname, card1 : 0, card2 : 0, card3 : 0 };

      res.render('pages/pack-opener', data);
    })

    //Pack Opener Opening
    .get('/box/:id/open', (req,res)=>{
      var boxnum = req.params.id;
      var boxname = 'Placeholder Box';

      var index1 = 0;
      var index2 = 0;
      var index3 = 0;

      if(boxnum == 1 || boxnum == 3) {
        index1 = Math.floor(Math.random() * 46) + 55;
        index2 = Math.floor(Math.random() * 46) + 55;
        index3 = Math.floor(Math.random() * 54) + 1;
        if(boxnum == 1) {
          boxname = 'The Ultimate Rising';
        } else {
          boxname = 'Neo Impact';
        }
      } else if(boxnum == 2 || boxnum == 4) {
        index1 = Math.floor(Math.random() * 16) + 25;
        index2 = Math.floor(Math.random() * 16) + 25;
        index3 = Math.floor(Math.random() * 24) + 1;
        if(boxnum == 2) {
          boxname = 'Age Of Discovery';
        } else {
          boxname = 'Flame Of The Tyrant';
        }
      }

      var data = { num : boxnum, name : boxname, card1 : index1, card2 : index2, card3 : index3 };

      res.render('pages/pack-opener', data);
    })

    // trading
    .get('/trade', async(req, res)=>{
        try{
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM users`);
            const data = {results: result.rows,
                            id:req.session.user.id};
            res.render('pages/tradingPage', data);
            client.release();
        }
        catch(error){
            res.redirect("/");
        }
    })

      // initiate trading. send traders' data to page
    .get('/tradeSelection', async(req, res)=>{
        try{
            const client = await pool.connect();
            if(!req.session.user){throw error;}
            const data = {user1: req.query.user1,
                            user2: req.query.user2};
            res.render('pages/tradeSelectionPage', data);
            client.release();
        }
        catch(error){
            res.redirect("/");
        }
    })

    // admin
    // send all user data to admin page
    .get('/admin', async(req, res)=>{
        try{
            const client = await pool.connect();
            if(!req.session.user || req.session.user.type != 'ADMIN'){throw error;}
            const result = await client.query(`SELECT * FROM users`);
            const data = {results: result.rows};
            res.render('pages/adminPage', data);
            client.release();
        }
        catch(error){
            res.redirect("/");
        }
    })
  

    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

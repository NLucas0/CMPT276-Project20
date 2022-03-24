const express = require('express')
const bcrypt = require('bcrypt') // for encrypting password
const axios = require('axios') // convenient http request sending
const path = require('path')
const session = require("express-session")
const PORT = process.env.PORT || 5000

const {Pool} = require('pg');
var pool = new Pool({
  connectionString: process.env.DATABASE_URL||"postgres://postgres:186714569@localhost/aio_dld_database"
  //,ssl:{rejectUnauthorized: false}
})

// allow pool to be accessed by other files
exports.pool = pool;

//note api used here is: https://yugiohprices.docs.apiary.io/#
;(async () => { //database transaction for pulling price data for all cards (once on app startup)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const res = await client.query('select * from cards order by card_id')
    for(i=1;i<=280;i++) {
      let cardPriceAverage = 0;
      const cardName = res.rows[i-1].name;
      axios.get(`http://yugiohprices.com/api/get_card_prices/${cardName}`)
        .then(response=>{
          if(response.data.data) {
            cardPriceAverage = response.data.data[0].price_data.data.prices.average;
            client.query('UPDATE cards SET value=$1 WHERE name=$2',[cardPriceAverage,cardName])
          }
          else {
            client.query('UPDATE cards SET value=$1 WHERE name=$2',[0,cardName])
          }
        })
        .catch(error=>{
          console.log(`Error has occurred! Something is wrong with ${cardName}`)
          console.log(error);
        })
    }
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
})().catch(e => console.error(e.stack))

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
    
    // link files
    .use("/trade", require('./endpoints/tradeEndpoints'))
    .use("/deckBuild", require('./endpoints/deckBuildEndpoints'))
    .use("/cardView", require('./endpoints/cardViewingEndpoints'))

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

      var cardsArray = new Array(280).fill(0);
      var friendArray = new Array();
      var tradeArray = new Array();

      await pool.query(`Insert into users (name, password, cards, friends, trades, type) values('${username}', '${password}', $1, $2, $3, 'USER')`, [cardsArray, friendArray, tradeArray]);
      
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
          <a href='/login'>Return to Login</a>
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
    .get('/box/:id/open', async (req,res)=>{
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

      var card1Result = await pool.query(`SELECT * FROM cards WHERE box_id=${boxnum} and in_box_id=${index1}`);
      var card1Data = card1Result.rows[0];
      var card2Result = await pool.query(`SELECT * FROM cards WHERE box_id=${boxnum} and in_box_id=${index2}`);
      var card2Data = card2Result.rows[0];
      var card3Result = await pool.query(`SELECT * FROM cards WHERE box_id=${boxnum} and in_box_id=${index3}`);
      var card3Data = card3Result.rows[0];

      var data = { num : boxnum, name : boxname, card1 : card1Data, card2 : card2Data, card3 : card3Data };

      res.render('pages/pack-opener', data);
    })

    // admin
    // send all user data to admin page
    .get('/admin', async(req, res)=>{
        try{
            const client = await pool.connect();
            if(!req.session.user || req.session.user.type != 'ADMIN'){throw error;}

            const userResult = await client.query(`SELECT * FROM users`);
            const tradeResult = await client.query(`SELECT * FROM trades`);
            const data = {userResults: userResult.rows,
                            tradeResults: tradeResult.rows};
            res.render('pages/adminPage', data);
            client.release();
        }
        catch(error){
            res.redirect("/");
        }
    })

    // delete trade item from /admin
    .post('/deleteUser', async(req, res)=>{
        try{
            const client = await pool.connect();
            if(!req.session.user || req.session.user.type != 'ADMIN'){throw error;}
            await client.query(`DELETE FROM users WHERE id=${req.body.userId}`);
            client.release();
        }
        catch(error){
            res.redirect('/');
        }
    })
  

    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

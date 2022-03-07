// store logged in user id
let USER_ID = 0;

const express = require('express')
const path = require('path')
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

    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')

    .get('/', (req, res) => res.render('pages/index'))


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

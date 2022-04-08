var router = require('express').Router();
const axios = require('axios');
var { pool } = require('../index.js');

//deck viewer main
router.get('/', async(req,res)=> {
    const client = await pool.connect();
    try {
        if(!req.session.user) {
            res.redirect('/');
        }
        else {
            const { rows } = await client.query('select * from cards order by card_id');
            const uCards = await client.query('select cards from users where id=$1',[req.session.user.id]);
            const data = {userCards: uCards.rows[0].cards, allCards: rows}
            res.render('pages/cardDatabase', data);
        }
    } catch(e) {
        console.error(e.stack);
    } finally {
        client.release();
    }
})

router.get('/card/:cardName', async(req,res)=> {
    const client = await pool.connect();
    try {
        let otherCardData;
        //retrieve price data for this card, this is to ensure up-to-date information
        axios.get(`http://yugiohprices.com/api/get_card_prices/${req.params.cardName}`)
        .then(response=>{
            if(response.data.data) {
                otherCardData = response.data.data[0];
                cardPriceAverage = otherCardData.price_data.data.prices.average;
                client.query('UPDATE cards SET value=$1 WHERE name=$2',[cardPriceAverage,req.params.cardName])
            }
            else {
                client.query('UPDATE cards SET value=$1 WHERE name=$2',[0,req.params.cardName])
            }
            (async()=>{
                //now I render info page with the data
                const { rows } = await client.query('select * from cards where name=$1',[req.params.cardName]);
                const result = { cardInfo:rows[0], otherCardInfo:otherCardData };
                res.render('pages/cardInfo',result);
            })();
        })
        .catch(error=>{
            console.log(error);
            res.send(`There was an issue with fetching data for ${req.params.cardName}`);
        })
    } catch(e) {
        console.error(e.stack);
    } finally {
        client.release();
    }
})

router.get('/clear', (req,res)=> {
    if(!req.session.user) {
        res.redirect('/');
    }
    else {
        const qString = `update users set cards=array_fill(0,ARRAY[280]) where id=${req.session.user.id}`;
        pool.query(qString, (err) => {
            if(err) {
                throw err;
            }
        });
        res.redirect('/cardView');
    }
})

module.exports = router;
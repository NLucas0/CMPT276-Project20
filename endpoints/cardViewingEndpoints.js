var router = require('express').Router();
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

router.get('/:cardName', async(req,res)=> {
    try {
        const { rows } = await pool.query('select * from cards where name=$1',[req.params.cardName]);
        const result = { cardInfo:rows[0] };
        res.render('pages/cardInfo',result);
    } catch(e) {
        console.error(e.stack);
    }
})

module.exports = router;
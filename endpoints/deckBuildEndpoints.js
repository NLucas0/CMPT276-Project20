var router = require('express').Router();
const index = require('../index.js');
var pool = index.pool;
module.exports = router;

//deck builder homepage
    //list current users deck, along with a "New Deck" button
router.get('/decks', async (req, res) => {
    try{
        const client = await pool.connect();
        var userDecksQuery = `SELECT * FROM decks WHERE owner_id=${req.session.user.id}`
        const result = await client.query(userDecksQuery);
        const data = {decks: result.rows};
        res.render('pages/deckSelection', data);
        client.release();
    } catch(error) {
        res.end(error);
    }
})
  
      //actual deck builder
router.get('/build', async(req, res) => {
    try {
        const client = await pool.connect();
        var userCollectionQuery = `SELECT cards FROM users WHERE id=${req.session.user.id}`
        const collectionResult = await client.query(userCollectionQuery);
        var cardsQuery = `SELECT * FROM cards order by card_id`;
        const cardsTable = await client.query(cardsQuery);
        const data = {collection: collectionResult.rows[0].cards,
                        cards: cardsTable.rows};
        res.render('pages/deckBuilder', data);

        client.release();
    } catch(error) {
        res.end(error);
    }
})

router.post('/save', async (req, res) => {
    try{
        console.log("Check");
        const client = await pool.connect();
        await client.query(`insert into decks (owner_id, name, cards, extra_deck) values (${req.session.user.id}, '${req.body.name}', $1, $2)`, [req.body.cards, req.body.extra]);
        client.release();
    } catch(error) {
        res.end(error);
        res.redirect('/');
    }
})
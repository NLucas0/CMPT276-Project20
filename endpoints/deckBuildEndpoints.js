var router = require('express').Router();
const index = require('../index.js');
var pool = index.pool;
module.exports = router;

//deck builder homepage
    //list current users deck, along with a "New Deck" button
router.get('/decks', async (req, res) => {
    try{
        if(!req.session.user) {
            throw "Not Logged In";
        }
        const client = await pool.connect();
        var userDecksQuery = `SELECT * FROM decks WHERE owner_id=${req.session.user.id}`
        const result = await client.query(userDecksQuery);
        const data = {decks: result.rows};
        res.render('pages/deckSelection', data);
        client.release();
    } catch(error) {
        res.redirect('/');
    }
})
  
      //actual deck builder
router.get('/build', async(req, res) => {
    try {
        if(!req.session.user) {
            throw "Not Logged In";
        }
        const client = await pool.connect();
        var userCollectionQuery = `SELECT cards FROM users WHERE id=${req.session.user.id}`
        const collectionResult = await client.query(userCollectionQuery);
        var cardsQuery = `SELECT * FROM cards order by card_id`;
        const cardsTable = await client.query(cardsQuery);
        var savedDeck = [];
        const data = {collection: collectionResult.rows[0].cards,
                        cards: cardsTable.rows,
                        deck: savedDeck};
        res.render('pages/deckBuilder', data);

        client.release();
    } catch(error) {
        res.redirect('/');
    }
})

router.get('/edit/:id', async(req, res) => {
    try {
        if(!req.session.user) {
            throw "Not Logged In";
        }
        const client = await pool.connect();
        var userCollectionQuery = `SELECT cards FROM users WHERE id=${req.session.user.id}`
        const collectionResult = await client.query(userCollectionQuery);
        var cardsQuery = `SELECT * FROM cards order by card_id`;
        const cardsTable = await client.query(cardsQuery);
        var deckQuery = `SELECT * FROM decks where id=${req.params.id}`
        const savedDeck = await client.query(deckQuery);
        if(req.session.user.id !== savedDeck.rows[0].owner_id ||
            savedDeck.rows.length < 1) {
            throw "The selected deck does not belong to this user";
        }
        const data = {collection: collectionResult.rows[0].cards,
                        cards: cardsTable.rows,
                        deck: savedDeck.rows[0]};
        res.render('pages/deckBuilder', data);

        client.release();
    } catch(error) {
        res.redirect('/');
    }
})

router.post('/save', async (req, res) => {
    try{
        if(!req.session.user) {
            throw "Not Logged In";
        }
        const client = await pool.connect();
        var existingDeck = await client.query(`SELECT * FROM decks where owner_id=${req.session.user.id} AND name='${req.body.name}'`);
        if(existingDeck.rows == 0) {
            await client.query(`insert into decks (owner_id, name, cards, extra_deck) values (${req.session.user.id}, '${req.body.name}', $1, $2)`, [req.body.cards, req.body.extra]);
        } else {
            await client.query(`UPDATE decks SET cards=$1, extra_deck=$2 WHERE owner_id=${req.session.user.id} AND name='${req.body.name}'`, [req.body.cards, req.body.extra]);
        }
        client.release();
    } catch(error) {
        res.redirect('/');
    }
})
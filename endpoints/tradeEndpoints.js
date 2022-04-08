/** To move endpoints to a seperate file:
    Add to index.js:
        .use("/moduleName", require('./endpoints/filename'))

    Add to top of filename.js:
        var router = require('express').Router();
        const index = require('../index.js');
        var pool = index.pool;
        module.exports = router;
 
    * rename moduleName to whatever you want

    * note this will change all endpoints to /moduleName/endpointName
    (so .get('/test') would be accessed by /moduleName/test)
    (so make sure to rename any get/post requests)

    * add router before all .get and .post statements
    (example: router.get('/'))
 */

/* sources for:
    splitting index.js
        https://stackoverflow.com/questions/4602212/organize-routes-in-node-js?lq=1
    accessing variables from index.js
        https://stackoverflow.com/questions/64823961/accessing-variable-value-from-index-js-to-another-js-file-on-nodejs
*/

var router = require('express').Router();
const index = require('../index.js');
var pool = index.pool;

// trading main page
// send all user data to trade page
// url: /trade
router.get('/', async(req, res)=>{
    try{
        if(!req.session.user){throw error;}
        
        const client = await pool.connect();
        const users = await client.query(`SELECT * FROM users`);
        const trades = await pool.query(`SELECT * FROM trades WHERE sender_id=${req.session.user.id} OR
                                        receiver_id=${req.session.user.id}`);
        const cardData = await getCardData(client, "card_id, image, name");
        const data = {results: users.rows,
                        id:req.session.user.id,
                        trades: trades.rows,
                        cardData: cardData};
        res.status = 200;
        res.render('pages/tradingPage', data);
        client.release();
    }
    catch(error){
        res.status = 401;
        res.redirect("/");
    }
})

// initiate trading. send traders' data to page
// url: /trade/tradeSelection
router.get('/tradeSelection', async(req, res)=>{
    try{
        if(!req.session.user){throw error;}

        const client = await pool.connect();
        const cardResults = await getCardData(client, "card_id, image, value, name, stars");
        
        const data = {user1: req.query.user1,
                    user2: req.query.user2,
                    cardData: cardResults,
                    counter: req.query.counter||-1,
                    offered: req.query.offered||[],
                    wanted: req.query.wanted||[]};
        res.render('pages/tradeSelectionPage', data);
        client.release();
    }
    catch(error){
        res.redirect("/");
    }
})

// make new trade request
// url: /trade/newTradeRequest
// input: sender_id, receiver_id, counter (-1 if not counter trade), offer, request
router.post('/newTradeRequest', async(req, res)=>{
    try{
        if(!req.session.user){throw error;}
        const client = await pool.connect();

        // add new trade to data table
        await client.query(`INSERT INTO trades 
                            (sender_id, receiver_id, status, cards_offered, cards_wanted) VALUES
                            ('${req.body.sender_id}', '${req.body.receiver_id}', 
                            '${req.body.counter == -1?'PENDING':'UPDATED'}',
                            $1, $2)`,[req.body.offer, req.body.request]);

        // add id to user trade list
        let index = await client.query(`SELECT id FROM trades ORDER BY id DESC LIMIT 1`);
        await client.query(`UPDATE users set trades=trades||'{${index.rows[0].id}}' 
                            WHERE id=${req.body.sender_id} OR id=${req.body.receiver_id}`);
        client.release();
    }
    catch(error){
        res.redirect("/");
    }
})

// modify trade status from /admin
// url: /trade/editTradeStatus
// input: newValue, tradeId
router.post('/editTradeStatus', async(req, res)=>{
    try{
        if(!req.session.user){throw error;}
        const client = await pool.connect();

        // set new status
        await client.query(`UPDATE trades SET status='${req.body.newValue}' WHERE id=${req.body.tradeId}`);
        let tradeItem = (await client.query(`SELECT * FROM trades WHERE id=${req.body.tradeId}`)).rows[0];

        switch(req.body.newValue){
            // update cards and remove from receiver trades
            case 'ACCEPTED':
                let check1 = await client.query(`SELECT * FROM users 
                                                WHERE id=${tradeItem.receiver_id} 
                                                AND cards @> $1`, [tradeItem.cards_wanted]);
                let check2 = await client.query(`SELECT * FROM users 
                                                WHERE id=${tradeItem.sender_id} 
                                                AND cards @> $1`,[tradeItem.cards_offered]);
                
                // trade cards if both users own required cards
                if(check1.rows.length > 0 && check2.rows.length > 0){
                    addToArray(client, 'users', tradeItem.cards_offered, 'cards', 'id', tradeItem.receiver_id);
                    addToArray(client, 'users', tradeItem.cards_wanted, 'cards', 'id', tradeItem.sender_id);

                    removeFromArray(client, 'users', tradeItem.cards_wanted, 'cards', 'id', tradeItem.receiver_id);
                    removeFromArray(client, 'users', tradeItem.cards_offered, 'cards', 'id', tradeItem.sender_id);
                }
                else{
                    res.status(400);
                    res.json('MISSING CARDS');
                    await client.query(`UPDATE trades SET status='REJECTED' WHERE id=${req.body.tradeId}`);
                }

                // remove trade from receiver
                removeTrade(client, tradeItem.receiver_id, tradeItem.id);
                break;

            // remove from receiver trades
            case 'REJECTED':
                removeTrade(client, tradeItem.receiver_id, tradeItem.id);
                break;

            // switch receiver/offeror ids
            case 'UPDATED':
                await client.query(`UPDATE trades SET receiver_id=sender_id, sender_id=receiver_id WHERE id=${req.body.tradeId}`);
                break;

            // do nothing
            case 'PENDING':
                break;
        }
        client.release();
    }
    catch(error){
        res.redirect('/');
    }
})

// delete trade item from /admin
// url: /trade/deleteTrade
// input: tradeId
router.post('/deleteTrade', async(req, res)=>{
    try{
        if(!req.session.user){throw error;}
        const client = await pool.connect();

        // delete trade from data table
        let tradeData = await client.query(`SELECT * FROM trades WHERE id=${req.body.tradeId}`);
        await client.query(`DELETE FROM trades WHERE id=${req.body.tradeId}`);

        // delete trade id from involved users
        await client.query(`UPDATE users SET trades=ARRAY_REMOVE(trades, ${req.body.tradeId})
                            WHERE id=${tradeData.rows[0].sender_id} OR id=${tradeData.rows[0].receiver_id}`);
        client.release();
    }
    catch(error){
        res.redirect('/');
    }
})

// add friend
// url: /trade/addFriend
// input: user1, user2
router.post('/addFriend', async(req, res)=>{
    try{
        if(!req.session.user){throw error;}
        const client = await pool.connect();

        await client.query(`UPDATE users SET friends=ARRAY_APPEND(friends, ${req.body.user2}) 
                            WHERE id=${req.body.user1} AND NOT(${req.body.user2} = ANY(friends))`);
        await client.query(`UPDATE users SET friends=ARRAY_APPEND(friends, ${req.body.user1}) 
                            WHERE id=${req.body.user2}`);
        client.release();
    }
    catch(error){
        res.redirect('/');
    }
})

// remove trade from user list
async function removeTrade(client, userId, tradeId){
    await client.query(`UPDATE users SET trades=ARRAY_REMOVE(trades, ${tradeId}) WHERE id=${userId}`);
}

// remove items from table array
async function removeFromArray(client, tableName, elements, arrayName, searchCol, searchTerm){
    for(let element of elements){
        //  save card count before removal to add back duplicates
        let itemCountBefore = await client.query(`SELECT ${arrayName} from ${tableName} WHERE ${searchCol}=${searchTerm}`);
        itemCountBefore = itemCountBefore.rows[0].cards.length;

        await client.query(`UPDATE ${tableName} SET ${arrayName}=ARRAY_REMOVE(${arrayName}, ${element}) WHERE ${searchCol}=${searchTerm}`);
        
        let itemCountAfter = await client.query(`SELECT ${arrayName} from ${tableName} WHERE ${searchCol}=${searchTerm}`);
        itemCountAfter = itemCountAfter.rows[0].cards.length;

        // add back accidentally removed elements
        if(itemCountBefore-1-itemCountAfter > 0){
            addToArray(client, tableName, new Array(itemCountBefore-1-itemCountAfter).fill(element), arrayName, searchCol, searchTerm);
        }
    }
}

// add items to table array
async function addToArray(client, tableName, elements, arrayName, searchCol, searchTerm){
    for(let element of elements){
        await client.query(`UPDATE ${tableName} SET ${arrayName}=ARRAY_APPEND(${arrayName},${element}) WHERE ${searchCol}=${searchTerm}`);
    }
}

// get specific card data
async function getCardData(client, attributes="*", contraints=""){
    let results = await client.query(`SELECT ${attributes} from cards ${contraints}`);
    return results.rows;
}

module.exports = router;
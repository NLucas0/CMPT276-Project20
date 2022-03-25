const { expect } = require('chai');

describe('New Deck Test', function() {
    it('should create a new user on /signup POST', function(done) {
        // var num_users0 = res.body.length;

        global.chai.request(global.server).post('/signup').send({'username':'tester','password':'mctesty'})
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });

    });

    it('should login on /login POST', function(done) {
        global.chai.request(global.server).post('/login').send({'username':'tester','password':'mctesty'})
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });
    })
  
    it('should list all users Decks on /deckBuild/decks', function(done){
        global.chai.request(global.server).post('/login').send({'username':'tester','password':'mctesty'})
            .end(function(err, res) {
            global.chai.request(global.server).get('/deckBuild/decks').end(function(err,res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
            });
            done();
        });
    });

    it('should add a single deck on /deckBuild/save', function(done) {
        global.chai.request(global.server).post('/login').send({'username':'tester','password':'mctesty'})
            .end(function(err, res) {
                global.chai.request(global.server).get('/deckBuild/decks').end(function(err,res){
                    var numDecks = res.body.length;
                    global.chai.request(global.server).post('/deckBuild/save').send({'name':'testDeck', 'cards':'{}','extra':'{}'})
                        .end(function(err, res) {
                            global.chai.request(global.server).get('/deckBuild/decks').end(function(err,res){
                                var numDecksAfter = res.body.length;
                                (numDecks-numDecksAfter).should.equal(1);
                                res.should.have.status(200);
                                res.should.be.json;
                                res.body.should.be.a('array');
                                res.body[length-1].name.should.equal('testDeck');
                            });
                        });
                    });
            done();
        });
    });

    it('should not add a deck on /deckBuild/save, with existing name and owner_id', function(done) {
        global.chai.request(global.server).post('/login').send({'username':'tester','password':'mctesty'})
            .end(function(err, res) {
                global.chai.request(global.server).get('/deckBuild/decks').end(function(err,res){
                    var numDecks = res.body.length;
                    global.chai.request(global.server).post('/deckBuild/save').send({'name':'testDeck', 'cards':'{}','extra':'{}'})
                        .end(function(err, res) {
                            global.chai.request(global.server).get('/deckBuild/decks').end(function(err,res){
                                var numDecksAfter = res.body.length;
                                (numDecks-numDecksAfter).should.equal(0);
                                res.should.have.status(200);
                                res.should.be.json;
                                res.body.should.be.a('array');
                                res.body[length-1].name.should.equal('testDeck');
                            });
                        });
                    });
            done();
        });
    });
});

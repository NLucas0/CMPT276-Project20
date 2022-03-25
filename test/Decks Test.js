var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
var should = chai.should(); // chai assertion library

chai.use(chaiHttp);  // creates mock server - testing

describe('New Deck Test', function() {
  
//   it('should list all users Decks on /deckBuild/decks', function(done){
//     chai.request(server).get('/decks').end(function(err,res){
//       res.should.have.status(200);
//       res.should.be.json;
//       res.body.should.be.a('array');
//       done();
//     });
//   });

});

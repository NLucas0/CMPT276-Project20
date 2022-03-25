//import {} from '/scripts/trade.js';
//import {} from '/scripts/tradeSelection.js';
// add export before all function calls
const { expect } = require('chai');

describe('trade tests', function(){
    // before(function(){})
    // after(function(){})
    // beforeEach(function(){})
    // afterEach('optional description', function(){})

    describe("#test 1", function(){
        it('shoudl work', function(done){
            global.chai.request(global.server).get('/test').end(function(err,res){
              res.should.have.status(200);
              res.should.be.json;
              res.body.should.equal('test');
              done();
            });
          });
        
    });
});
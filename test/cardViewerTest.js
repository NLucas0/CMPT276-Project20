describe('cardView', function() {
    it('should correctly load the data into the page', function(done) {
        global.chai.request(global.server).post('/login').send({'username':'tester','password':'mctesty'})
            .end(function(err, res) {
            res.should.have.status(200);
            global.chai.request(global.server).get('/cardView')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                })
            done();
        });
    })
})
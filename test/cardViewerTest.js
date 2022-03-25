describe('cardView', function() {
    it('should correctly load the data into the page', function(done) {
        global.chai.request(global.server).get('/cardView')
            .end(function(error,res) {
                res.should.have.status(200);
                done();
            })
    })

})
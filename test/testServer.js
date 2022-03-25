global.chai = require('chai');
var chaiHttp = require('chai-http');
global.server = require('../index');
global.should = global.chai.should();

chai.use(chaiHttp);

// run npm test in terminal to run tests
// mocha.run() in js

require('./tradeTest.js');
require('./cardViewerTest.js');
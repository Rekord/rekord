var express       = require('express');
var app           = express();
var bodyParser    = require('body-parser');
var uuid          = require('node-uuid');

// configure app to use bodyParser()
// this will let us get the data from a POST

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(allowCrossDomain);

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// ADD array.find( property, value ) 
Array.prototype.find = function(property, value) {
  for (var i = 0; i < this.length; i++) {
    var row = this[i];
    if (row[property] === value) {
      return i;
    }
  }
  return -1;
};

// The in-memory database
var database = {};
var getTable = function(type) {
  var table = database[ type ]
  if (!table) {
    database[ type ] = table = [];
  }
  return table;
};

// GET many & POST
router.route('/:type')
  .get(function(req, res) {
    var table = getTable( req.params.type );
    res.json( table );
  })
  .post(function(req, res) {
    var table = getTable( req.params.type );
    var row = req.body;
    if (!row.id) {
      row.id = uuid.v1();
    }
    var index = table.find( 'id', row.id );
    if ( index === -1 ) {
      table.push( row ); 
    } else {
      var actualRow = table[ index ];
      for (var prop in row) {
        actualRow[ prop ] = row[ prop ];
      }
    }
    res.json({id:row.id});
  })
;
// GET one, PUT, & DELETE
router.route('/:type/:id')
  .get(function(req, res) {
    var table = getTable( req.params.type );
    var id = req.params.id;
    var index = table.find( 'id', id );
    if ( index === -1 ) {
      res.sendStatus(404);
    } else {
      res.json( table[ index ] );
    }
  })
  .put(function(req, res) {
    var table = getTable( req.params.type );
    var id = req.params.id;
    var row = req.body;
    var index = table.find( 'id', id );
    if ( index === -1 ) {
      row.id = id;
      table.push( row );
      res.json({});
    } else {
      var actualRow = table[ index ];
      for (var prop in row) {
        actualRow[ prop ] = row[ prop ];
      }
      res.json({});
    }
  })
  .delete(function(req, res) {
    var table = getTable( req.params.type );
    var id = req.params.id;
    var index = table.find( 'id', id );
    if ( index !== -1 ) {
      table.splice( index, 1 );
      res.json({});
    } else {
      res.sendStatus(404);
    }
  })
;

// GET one, PUT, & DELETE
router.route('/:type/:id1/:id2')
  .get(function(req, res) {
    var table = getTable( req.params.type );
    var id = req.params.id1 + '/' + req.params.id2;
    var index = table.find( '$id', id );
    if ( index === -1 ) {
      res.sendStatus(404);
    } else {
      res.json( table[ index ] );
    }
  })
  .put(function(req, res) {
    var table = getTable( req.params.type );
    var id = req.params.id1 + '/' + req.params.id2;
    var row = req.body;
    var index = table.find( '$id', id );
    if ( index === -1 ) {
      row.$id = id;
      table.push( row );
      res.json({});
    } else {
      var actualRow = table[ index ];
      for (var prop in row) {
        actualRow[ prop ] = row[ prop ];
      }
      res.json({});
    }
  })
  .delete(function(req, res) {
    var table = getTable( req.params.type );
    var id = req.params.id1 + '/' + req.params.id2;
    var index = table.find( '$id', id );
    if ( index !== -1 ) {
      table.splice( index, 1 );
      res.json({});
    } else {
      res.sendStatus(404);
    }
  })
;


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);

console.log('API listening on ' + port);
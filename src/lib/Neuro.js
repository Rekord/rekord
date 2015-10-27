
/*
new Neuro({
  name: 'name',
  rest: 'http://api/name',
  pubsub: 'http://url:port',
  channel: 'houseid',
  token: 'userid',
  timestamp: 'updated_at',              // server returns new updated_at & old, old is compared against current
  key: 'id',
  fields: ['id', 'name', 'updated_at'],
//  encode: function() {},
//  decode: function() {}
});
*/

function Neuro(options)
{
  var database = new NeuroDatabase( options );

  var model = new Function('return function ' + options.className + '(props) { this.$reset( props ) }')();
  model.prototype = new NeuroModel( database );
  model.db = database;

  database.model = model;
  database.init();

  Neuro.debug( Neuro.Events.CREATION, options, database );

  return {
    Database: database, 
    Model: model
  };
}

eventize( Neuro );

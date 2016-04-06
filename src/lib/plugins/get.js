Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.get = function( input, callback, context )
  {
    if ( isFunction( callback ) )
    {
      db.grabModel( input, callback, context );
    }
    else
    {
      var key = db.buildKeyFromInput( input );

      return db.get( key );
    }
  };
});
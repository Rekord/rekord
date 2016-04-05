Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.boot = function( input )
  {
    if ( isArray( input ) )
    {
      return new ModelCollection( db, input, true );
    }
    else if ( isObject( input ) )
    {
      return db.putRemoteData( input );
    }

    return input;
  };
});

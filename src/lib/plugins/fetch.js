Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.fetch = function( input )
  {
    var key = db.buildKeyFromInput( input );
    var instance = db.get( key );

    if ( !instance )
    {
      instance = db.buildObjectFromKey( key );

      if ( isObject( input ) )
      {
        instance.$set( input );
      }
    }

    instance.$refresh();

    return instance;
  };
});
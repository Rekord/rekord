Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.grab = function( input, callback, context )
  {
    var callbackContext = context || this;
    var key = db.buildKeyFromInput( input );
    var instance = db.get( key );

    if ( instance )
    {
      callback.call( callbackContext, instance );
    }
    else
    {
      db.grabModel( input, function(instance)
      {
        if ( instance )
        {
          callback.call( callbackContext, instance )
        }
        else
        {
          model.fetch( input, callback, context );
        }
      });
    }

    return instance;
  };
});
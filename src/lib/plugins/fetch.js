Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.fetch = function( input, callback, context )
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

    if ( isFunction( callback ) )
    {
      var callbackContext = context || this;

      instance.$once( Model.Events.RemoteGets, function()
      {
        callback.call( callbackContext, instance );
      });
    }

    instance.$refresh();

    return instance;
  };
});

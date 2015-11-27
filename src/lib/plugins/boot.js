Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.boot = function( input )
  {
    return db.putRemoteData( input );
  };
});
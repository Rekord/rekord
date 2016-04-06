Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.refresh = function( callback, context )
  {
    return db.refresh( callback, context );
  };
});

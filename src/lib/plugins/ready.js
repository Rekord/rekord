Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.ready = function( callback, context, persistent )
  {
    db.ready( callback, context, persistent );
  };
});

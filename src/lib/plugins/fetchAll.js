Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.fetchAll = function(callback, context)
  {
    db.refresh( callback, context );

    return db.models;
  };
});
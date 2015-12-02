Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.fetchAll = function(onFinish)
  {
    db.refresh( onFinish );

    return db.models;
  };
});
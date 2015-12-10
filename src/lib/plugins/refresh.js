Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.refresh = function(onFinish)
  {
    return db.refresh( onFinish );
  };
});
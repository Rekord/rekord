Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.all = function()
  {
    return db.models;
  };
});
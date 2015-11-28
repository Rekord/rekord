Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.where = function(whereProperties, whereValue, whereEquals)
  {
    return new NeuroQuery( db, whereProperties, whereValue, whereEquals );
  };
});
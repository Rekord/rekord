Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.find = function(whereProperties, whereValue, whereEquals)
  {
    return db.models.firstWhere( whereProperties, whereValue, whereEquals );
  };
});
Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.first = model.find = function(whereProperties, whereValue, whereEquals)
  {
    return db.models.firstWhere( whereProperties, whereValue, whereEquals );
  };
});

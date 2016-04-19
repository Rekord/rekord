Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  model.filtered = function(whereProperties, whereValue, whereEquals)
  {
    return db.models.filtered( whereProperties, whereValue, whereEquals );
  };
});

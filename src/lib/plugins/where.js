Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  model.where = function(whereProperties, whereValue, whereEquals, out)
  {
    return db.models.where(whereProperties, whereValue, whereEquals, out);
  };
});

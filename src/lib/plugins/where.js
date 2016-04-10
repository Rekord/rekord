Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  model.where = function(whereProperties, whereValue, whereEquals)
  {
    // return db.models.filtered( whereProperties, whereValue, whereEquals );
    return new Query( db, whereProperties, whereValue, whereEquals );
  };
});

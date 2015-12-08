Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.create = function( props )
  {
    var instance = isObject( props ) ? 
      db.createModel( props ) : 
      db.instantiate();

    instance.$save();

    return instance;
  };
});
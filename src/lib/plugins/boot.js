Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.boot = function( input )
  {
    var instance = new model( input );

    instance.$local = instance.$toJSON( false );
    instance.$local.$saved = instance.$saved = instance.$toJSON( true );
    instance.$addOperation( NeuroSaveNow );

    return instance;
  };
});
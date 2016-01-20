Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  var methods = collapse( options.methods, NeuroDatabase.Defaults.methods );

  if ( !isEmpty( methods ) )
  {
    transfer( methods, model.prototype );
  }
});

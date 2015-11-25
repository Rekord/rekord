Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  if ( isObject( options.methods ) )
  {
    transfer( options.methods, model.prototype );
  }
});
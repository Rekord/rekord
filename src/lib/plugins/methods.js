Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var methods = collapse( options.methods, Database.Defaults.methods );

  if ( !isEmpty( methods ) )
  {
    transfer( methods, model.prototype );
  }
});

Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var methods = collapse( options.methods, Defaults.methods );

  if ( !isEmpty( methods ) )
  {
    addMethods( model.prototype, methods );
  }
});

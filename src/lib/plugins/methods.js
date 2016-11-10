addPlugin(function(model, db, options)
{
  var methods = collapse( options.methods, Defaults.methods );

  if ( !isEmpty( methods ) )
  {
    Class.methods( model, methods );
  }
});

addPlugin(function(model, db, options)
{
  var staticMethods = collapse( options.staticMethods, Defaults.staticMethods );

  if ( !isEmpty( staticMethods ) )
  {
    Class.props( model, staticMethods );
  }
});

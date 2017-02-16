addPlugin(function(model, db, options)
{
  var traits = options.traits || Defaults.traits;

  if ( !isEmpty( traits ) )
  {
    if ( isFunction( traits ) )
    {
      traits = traits( model, db, options );
    }

    if ( isArray( traits ) )
    {
      for (var i = 0; i < traits.length; i++)
      {
        var trait = traits[ i ];

        if ( isFunction( trait ) )
        {
          trait = trait( model, db, options );
        }

        if ( isObject( trait ) )
        {
          Class.methods( model, trait );
        }
        else
        {
          throw 'traits are expected to be an object with methods or a function which returns an object of methods';
        }
      }
    }
    else
    {
      throw 'traits are expected to be an array or a function which returns an array';
    }
  }
});

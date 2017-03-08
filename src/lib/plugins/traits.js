var IGNORE_TRAITS = { traits: true };

addPlugin(function(options)
{
  var traits = options.traits || Defaults.traits;

  if ( !isEmpty( traits ) )
  {
    if ( isFunction( traits ) )
    {
      traits = traits( options );
    }

    if ( isArray( traits ) )
    {
      for (var i = 0; i < traits.length; i++)
      {
        var trait = traits[ i ];

        if ( isFunction( trait ) )
        {
          trait = trait( options );
        }

        if ( isObject( trait ) )
        {
          merge( options, trait, IGNORE_TRAITS );
        }
        else
        {
          throw 'traits are expected to be an object or a function which returns an object of methods';
        }
      }
    }
    else
    {
      throw 'traits are expected to be an array or a function which returns an array';
    }
  }

}, true );

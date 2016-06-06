

function applyOptions( target, options, defaults, secret )
{
  options = options || {};

  function setProperty(prop, value)
  {
    if ( isFunction( value ) )
    {
      addMethod( target, prop, value );
    }
    else
    {
      target[ prop ] = value;
    }
  }

  for (var defaultProperty in defaults)
  {
    var defaultValue = defaults[ defaultProperty ];
    var option = options[ defaultProperty ];
    var valued = isValue( option );

    if ( !valued && defaultValue === undefined )
    {
      throw defaultProperty + ' is a required option';
    }
    else if ( valued )
    {
      setProperty( defaultProperty, option );
    }
    else
    {
      setProperty( defaultProperty, copy( defaultValue ) );
    }
  }

  for (var optionProperty in options)
  {
    if ( !(optionProperty in defaults) )
    {
      setProperty( optionProperty, options[ optionProperty ] );
    }
  }

  if ( secret )
  {
    target.$options = options;
  }
  else
  {
    target.options = options;
  }
}

/**
 * Determines whether the properties on one object equals the properties on
 * another object.
 *
 * @memberof Rekord
 * @param {Object} test -
 *    The object to test for matching.
 * @param {String|String[]} testFields -
 *    The property name or array of properties to test for equality on `test`.
 * @param {Object} expected -
 *    The object with the expected values.
 * @param {String|String[]} expectedFields -
 *    The property name or array of properties to test for equality on `expected`.
 * @param {equalityCallback} [equals] -
 *    The equality function which compares two values and returns whether they
 *    are considered equivalent.
 * @return {Boolean} -
 *    True if the `testFields` properties on `test` are equivalent to the
 *    `expectedFields` on `expected` according to the `equals` function.
 */
function propsMatch(test, testFields, expected, expectedFields, equals)
{
  var equality = equals || Rekord.equals;

  if ( isString( testFields ) ) // && isString( expectedFields )
  {
    return equality( test[ testFields ], expected[ expectedFields ] );
  }
  else // if ( isArray( testFields ) && isArray( expectedFields ) )
  {
    for (var i = 0; i < testFields.length; i++)
    {
      var testProp = testFields[ i ];
      var expectedProp = expectedFields[ i ];

      if ( !equality( test[ testProp ], expected[ expectedProp ] ) )
      {
        return false;
      }
    }

    return true;
  }

  return false;
}

// Determines whether the given model has the given fields
function hasFields(model, fields, exists)
{
  if ( isArray( fields ) )
  {
    for (var i = 0; i < fields.length; i++)
    {
      if ( !exists( model[ fields[ i ] ] ) )
      {
        return false;
      }
    }

    return true;
  }
  else // isString( fields )
  {
    return exists( model[ fields ] );
  }
}


function grab(obj, props, copyValues)
{
  var grabbed = {};

  for (var i = 0; i < props.length; i++)
  {
    var p = props[ i ];

    if ( p in obj )
    {
      grabbed[ p ] = copyValues ? copy( obj[ p ] ) : obj[ p ];
    }
  }

  return grabbed;
}

function pull(obj, props, copyValues)
{
  if ( isString( props ) )
  {
    var pulledValue = obj[ props ];

    return copyValues ? copy( pulledValue ) : pulledValue;
  }
  else // isArray( props )
  {
    var pulled = [];

    for (var i = 0; i < props.length; i++)
    {
      var p = props[ i ];
      var pulledValue = obj[ p ];

      pulled.push( copyValues ? copy( pulledValue ) : pulledValue );
    }

    return pulled;
  }
}

function transfer(from, to)
{
  for (var prop in from)
  {
    to[ prop ] = from[ prop ];
  }

  return to;
}

function collapse()
{
  var target = {};

  for (var i = 0; i < arguments.length; i++)
  {
    var a = arguments[ i ];

    if ( isObject( a ) )
    {
      for (var prop in a)
      {
        if ( !(prop in target) )
        {
          target[ prop ] = a[ prop ];
        }
      }
    }
  }

  return target;
}

function clean(x)
{
  for (var prop in x)
  {
    if ( prop.charAt(0) === '$' )
    {
      delete x[ prop ];
    }
  }

  return x;
}

function cleanFunctions(x)
{
  for (var prop in x)
  {
    if ( isFunction( x[prop] ) )
    {
      delete x[ prop ];
    }
  }

  return x;
}

function copy(x, copyHidden)
{
  if (x === null || x === undefined || typeof x !== 'object' || isFunction(x) || isRegExp(x))
  {
    return x;
  }

  if (isArray(x))
  {
    var c = [];

    for (var i = 0; i < x.length; i++)
    {
      c.push( copy(x[i], copyHidden) );
    }

    return c;
  }

  if (isDate(x))
  {
    return new Date( x.getTime() );
  }

  var c = {};

  for (var prop in x)
  {
    if (copyHidden || prop.charAt(0) !== '$')
    {
      c[ prop ] = copy( x[prop], copyHidden );
    }
  }

  return c;
}

function diff(curr, old, props, comparator)
{
  var d = {};

  for (var i = 0; i < props.length; i++)
  {
    var p = props[ i ];

    if (!comparator( curr[ p ], old[ p ] ) )
    {
      d[ p ] = copy( curr[ p ] );
    }
  }

  return d;
}


/**
 * A function which takes a value (typically an object) and returns a true or
 * false value.
 *
 * @callback whereCallback
 * @param {Any} value -
 *    The value to test.
 * @return {Boolean} -
 *    Whether or not the value passed the test.
 * @see Rekord.createWhere
 * @see Rekord.saveWhere
 */

/**
 * An expression which can be used to generate a function for testing a value
 * and returning a boolean result. The following types can be given and will
 * result in the following tests:
 *
 * - `String`: If a string & value are given - the generated function will test
 *    if the object has a property with the given value. If a string is given
 *    and no value is given - the generated function will test if the object
 *    has the property and a non-null value.
 * - `Object`: If an object is given - the generated function will test all
 *    properties of the given object and return true only if the object being
 *    tested has the same values.
 * - `Array`: If an array is given - each element in the array is passed as
 *    arguments to generate a new function. The returned function will only
 *    return true if all generated functions return true - otherwise false.
 * - `whereCallback`: A function can be given which is immediately returned as
 *    the test function.
 *
 * @typedef {String|Object|Array|whereCallback} whereInput
 */


/**
 * A map of saved {@link whereCallback} functions.
 *
 * @type {Object}
 */
var Wheres = {};

/**
 * Saves a function created with {@link Rekord.createWhere} to a cache of
 * filter functions which can be created more quickly in subsequent calls. It's
 * advised to make use of saved where's even in simpler scenarios for several
 * reasons:
 *
 * - You can name a comparison which is self documenting
 * - When refactoring, you only need to modify a single place in the code
 * - It's slightly more efficient (time & memory) to cache filter functions
 *
 * ```javascript
 * Rekord.saveWhere('whereName', 'field', true);
 * Rekord.createWhere('whereName'); // returns the same function except quicker
 * ```
 *
 * @memberof Rekord
 * @param {String} name -
 *    The name of the filter function to save for later use.
 * @param {String|Object|Array|whereCallback} [properties] -
 *    See {@link Rekord.createWhere}
 * @param {Any} [value] -
 *    See {@link Rekord.createWhere}
 * @param {equalityCallback} [equals=Rekord.equalsStrict] -
 *    See {@link Rekord.createWhere}
 * @see Rekord.createWhere
 */
function saveWhere(name, properties, values, equals)
{
  var where = createWhere( properties, values, equals );

  Wheres[ name ] = where;

  return where;
}

/**
 * Creates a function which returns a true or false value given a test value.
 * This is also known as a filter function.
 *
 * ```javascript
 * Rekord.createWhere('field', true);  // when an object has property where field=true
 * Rekord.createWhere('field'); // when an object has the property named field
 * Rekord.createWhere(function(){}); // a function can be given which is immediately returned
 * Rekord.createWhere(['field', function(){}, ['field', true]]); // when an object meets all of the above criteria
 * Rekord.createWhere({foo: 1, bar: 2}); // when an object has foo=1 and bar=2
 * Rekord.createWhere('field', true, myEquals); // A custom comparison function can be given.
 * Rekord.createWhere(); // always returns true
 * ```
 *
 * @memberof Rekord
 * @param {whereInput} [properties] -
 *    The first expression used to generate a filter function.
 * @param {Any} [value] -
 *    When the first argument is a string this argument will be treated as a
 *    value to compare to the value of the named property on the object passed
 *    through the filter function.
 * @param {equalityCallback} [equals=Rekord.equalsStrict] -
 *    An alternative function can be used to compare to values.
 * @return {whereCallback} -
 *    A function which takes a value (typically an object) and returns a true
 *    or false value.
 * @see Rekord.saveWhere
 */
function createWhere(properties, value, equals)
{
  var equality = equals || equalsStrict;

  if ( isFunction( properties ) )
  {
    return properties;
  }
  else if ( isArray( properties ) )
  {
    var parsed = [];

    for (var i = 0; i < properties.length; i++)
    {
      var where = properties[ i ];

      parsed.push( isArray( where ) ? createWhere.apply( this, where ) : createWhere( where ) );
    }

    return function whereMultiple(model)
    {
      for (var i = 0; i < parsed.length; i++)
      {
        if ( !parsed[ i ]( model ) )
        {
          return false;
        }
      }

      return true;
    };
  }
  else if ( isObject( properties ) )
  {
    var props = [];

    for (var prop in properties)
    {
      props.push({
        tester:   exprEqualsTester( properties[ prop ], equality ),
        resolver: createPropertyResolver( prop )
      });
    }

    return function whereEqualsObject(model)
    {
      for (var i = 0; i < props.length; i++)
      {
        var prop = props[ i ];

        if ( !prop.tester( prop.resolver( model ) ) )
        {
          return false;
        }
      }

      return true;
    };
  }
  else if ( isString( properties ) )
  {
    if ( properties in Wheres )
    {
      return Wheres[ properties ];
    }

    var resolver = createPropertyResolver( properties );

    if ( isValue( value ) )
    {
      var tester = exprEqualsTester( value, equality );

      return function whereEqualsValue(model)
      {
        return tester( resolver( model ) );
      };
    }
    else
    {
      return function whereHasValue(model)
      {
        return isValue( resolver( model ) );
      };
    }
  }
  else
  {
    return function whereAll(model)
    {
      return true;
    };
  }
}

function expr(func)
{
  func.expression = true;

  return func;
}

function exprEquals(value, test, equals)
{
  return isExpr( value ) ? value( test, equals ) : equals( value, test );
}

function exprEqualsTester(value, equals)
{
  if ( isExpr( value ) )
  {
    return function tester(test)
    {
      return value( test, equals );
    };
  }

  return function tester(test)
  {
    return equals( value, test );
  };
}

function isExpr(x)
{
  return isFunction( x ) && x.expression;
}

function not(x)
{
  if ( isExpr( x ) )
  {
    return expr(function notExpr(value, equals)
    {
      return !x( value, equals );
    });
  }

  if ( isFunction( x ) )
  {
    return function notWhere(value)
    {
      return !x( value );
    };
  }

  return expr(function notValue(value, equals)
  {
    return !equals( value, x );
  });
}

function oneOf(input)
{
  var values = isArray( input ) ? input : AP.slice.call( arguments );

  return expr(function oneOfValue(value, equals)
  {
    for (var i = 0; i < values.length; i++)
    {
      if (exprEquals( values[ i ], value, equals ) )
      {
        return true;
      }
    }

    return false;
  });
}

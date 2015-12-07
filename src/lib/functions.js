

/**
 * Determines whether the given variable is defined.
 *
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is defined, otherwise false.
 */
function isDefined(x)
{
  return x !== undefined;
}

/**
 * Determines whether the given variable is a function.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is a function, otherwise false.
 */
function isFunction(x)
{
  return !!(x && x.constructor && x.call && x.apply);
}

/**
 * Determines whether the given variable is a Neuro object. A Neuro object is a
 * constructor for a model and also has a Database variable. A Neuro object is
 * strictly created by the Neuro function.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is a Neuro object, otherwise false.
 */
function isNeuro(x)
{
  return !!(x && x.Database && isFunction( x ) && x.prototype instanceof NeuroModel);
}

/**
 * Determines whether the given variable is a string.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is a string, otherwise false.
 */
function isString(x)
{
  return typeof x === 'string';
}

/**
 * Determines whether the given variable is a valid number. NaN and Infinity are
 * not valid numbers.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is a valid number, otherwise false.
 */
function isNumber(x)
{
  return typeof x === 'number' && !isNaN(x);
}

/**
 * Determines whether the given variable is a boolean value.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is a boolean value, otherwise false.
 */
function isBoolean(x)
{
  return typeof x === 'boolean';
}

/**
 * Determines whether the given variable is an instance of Date.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is an instance of Date, otherwise false.
 */
function isDate(x)
{
  return x instanceof Date;
}

/**
 * Determines whether the given variable is an instance of RegExp.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is an instance of RegExp, otherwise false.
 */
function isRegExp(x)
{
  return x instanceof RegExp;
}

/**
 * Determines whether the given variable is an instance of Array.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is an instance of Array, otherwise false.
 */
function isArray(x)
{
  return x instanceof Array;
}

/**
 * Determines whether the given variable is a non-null object. As a note, 
 * Arrays are considered objects.
 * 
 * @memberOf Neuro
 * @param  {Any} x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is a non-null object, otherwise false.
 */
function isObject(x)
{
  return x !== null && typeof x === 'object';
}

/**
 * Converts the given variable to an array of strings. If the variable is a 
 * string it is split based on the delimiter given. If the variable is an 
 * array then it is returned. If the variable is any other type it may result 
 * in an error.
 * 
 * @memberOf Neuro
 * @param  {String|String[]} x
 *         The variable to convert to an Array.
 * @param  {String} [delimiter]
 *         The delimiter to split if the given variable is a string.
 * @return {String[]} -
 *         The array of strings created.
 */
function toArray(x, delimiter)
{
  return x instanceof Array ? x : x.split( delimiter );
}

/**
 * Determines whether the given variable is not null and is not undefined.
 * 
 * @memberOf Neuro
 * @param  {Any}  x
 *         The variable to test.
 * @return {Boolean} -
 *         True if the variable is non-null and not undefined.
 */
function isValue(x)
{
  return !!(x !== undefined && x !== null);
}

/**
 * Finds the index of a variable in an array optionally using a custom 
 * comparison function. If the variable is not found in the array then `false`
 * is returned.
 * 
 * @memberOf Neuro
 * @param  {Array} arr
 *         The array to search through.
 * @param  {Any} x
 *         The variable to search for.
 * @param  {Function} [comparator]
 *         The function to use which compares two values and returns a truthy
 *         value if they are considered equivalent. If a comparator is not given
 *         then strict comparison is used to determine equivalence.
 * @return {Number|Boolean} -
 *         The index in the array the variable exists at, otherwise false if
 *         the variable wasn't found in the array.
 */
function indexOf(arr, x, comparator)
{
  var cmp = comparator || equalsStrict;

  for (var i = 0, n = arr.length; i < n; i++)
  {
    if ( cmp( arr[i], x ) )
    {
      return i;
    }
  }

  return false;
}

/**
 * A function that doesn't perform any operations.
 * 
 * @memberOf Neuro
 */
function noop()
{

}

/**
 * Returns the given function with the given context (`this`). This also has the
 * benefits of returning a "copy" of the function which makes it ideal for use
 * in listening on/once events and off events.
 * 
 * @memberOf Neuro
 * @param  {Object} context
 *         The value of `this` for the given function.
 * @param  {Function}
 *         The function to invoke with the given context.
 * @return {Function} -
 *         A new function which is a copy of the given function with a new context.
 */
function bind(context, func)
{
  return function bindedFunction()
  {
    func.apply( context, arguments );
  };
}

/**
 * Generates a UUID using the random number method.
 * 
 * @memberOf Neuro
 * @return {String} -
 *         The generated UUID.
 */
function uuid() 
{
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function S4() 
{
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function propsMatch(test, testFields, expected, expectedFields)
{
  if ( isString( testFields ) ) // && isString( expectedFields )
  {
    return test[ testFields ] === expected[ expectedFields ];
  }
  else // if ( isArray( testFields ) && isArray( expectedFields ) )
  {
    for (var i = 0; i < testFields.length; i++)
    {
      var testProp = testFields[ i ];
      var expectedProp = expectedFields[ i ];

      if ( !equals( test[ testProp ], expected[ expectedProp ] ) )
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

// Copies a constructor function returning a function that can be called to 
// return an instance and doesn't invoke the original constructor.
function copyConstructor(func)
{
  function F() {};
  F.prototype = func.prototype;
  return F;
}

function extend(parent, child, override)
{
  // Avoid calling the parent constructor
  parent = copyConstructor( parent );
  // Child instances are instanceof parent
  child.prototype = new parent()
  // Copy new methods into child prototype
  transfer( override, child.prototype )
  // Set the correct constructor
  child.prototype.constructor = child;
}

// Creates a factory for instantiating
function factory(constructor)
{
  function F(args)
  {
    return constructor.apply( this, args );
  }

  F.prototype = constructor.prototype;

  return function()
  {
    return new F( arguments );
  };
}

function extendArray(parent, child, override)
{

  // If direct extension of array is supported...
  if ( extendArraySupported() )
  {
    extend( parent, child, override );
    child.create = factory( child );
  }
  // Otherwise copy all of the methods
  else
  {
    // Avoid calling the parent constructor
    parent = copyConstructor( parent );

    // TODO fix for IE8
    child.create = function()
    {
      var created = new parent();
      child.apply( created, arguments );
      transfer( override, created );
      return created;
    };
  }
}

// Is directly extending an array supported?
function extendArraySupported()
{
  if ( extendArraySupported.supported === undefined )
  {
    function EA() {};
    EA.prototype = [];
    var eq = new EA();
    eq.push(0);
    extendArraySupported.supported = (eq.length === 1);
  }

  return extendArraySupported.supported;
}

function transfer(from, to)
{
  for (var prop in from)
  {
    to[ prop ] = from[ prop ];
  }

  return to;
}

function swap(a, i, k)
{
  var t = a[ i ];
  a[ i ] = a[ k ];
  a[ k ] = t;
}

function applyOptions( target, options, defaults )
{
  for (var prop in defaults)
  {
    var defaultValue = defaults[ prop ];
    var option = options[ prop ];

    if ( !option && defaultValue === undefined )
    {
      throw ( prop + ' is a required option' );
    }
    else if ( isValue( option ) )
    {
      target[ prop ] = option;
    }
    else
    {
      target[ prop ] = copy( defaultValue );
    }
  }

  target.options = options;
}

function camelCaseReplacer(match)
{
  return match.length === 1 ? match.toUpperCase() : match.charAt(1).toUpperCase(); 
}

function toCamelCase(name)
{
  return name.replace( toCamelCase.REGEX, camelCaseReplacer );
}

toCamelCase.REGEX = /(^.|_.)/g;

function collect(a)
{
  var values = arguments.length > 1 || !isArray(a) ? Array.prototype.slice.call( arguments ) : a;

  return new NeuroCollection( values );
}

function evaluate(x)
{
  if ( !isValue( x ) )
  {
    return x;
  }

  if ( isNeuro( x ) )
  {
    return new x();
  }
  if ( isFunction( x ) )
  {
    return x();
  }

  return copy( x );
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

function sizeof(x)
{
  if ( isArray(x) || isString(x) )
  {
    return x.length;
  }
  else if ( isObject(x) )
  {
    var properties = 0;

    for (var prop in x)
    {
      properties++;
    }

    return properties;
  }
  
  return 0;
}

function isEmpty(x)
{
  if (x === null || x === void 0 || x === 0) 
  {
    return true;
  }
  if (isArray(x) || isString(x)) 
  {
    return x.length === 0;
  }
  if (isDate(x)) 
  {
    return x.getTime() === 0 || isNaN( x.getTime() );
  }
  if (isObject(x)) 
  {
    for (var prop in x) 
    {
      return false;
    }
    return true;
  }

  return false;
}

function equalsStrict(a, b)
{
  return a === b;
}

function equalsCompare(a, b)
{
  return compare( a, b ) === 0;
}

function equals(a, b)
{
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a !== a && b !== b) return true; // NaN === NaN

  var at = typeof a;
  var bt = typeof b;
  if (at !== bt) return false;

  var aa = isArray(a);
  var ba = isArray(b);
  if (aa !== ba) return false;

  if (aa) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (isDate(a)) {
    return isDate(b) && equals( a.getTime(), b.getTime() );
  }
  if (isRegExp(a)) {
    return isRegExp(b) && a.toString() === b.toString();
  }

  if (at === 'object') {
    for (var p in a) {
      if (p.charAt(0) !== '$' && !isFunction(a[p])) {
        if (!(p in b) || !equals(a[p], b[p])) {
          return false;
        }
      }
    }
    for (var p in b) {
      if (p.charAt(0) !== '$' && !isFunction(b[p])) {
        if (!(p in a)) {
          return false;
        }
      }
    }
    return true;
  }

  return false;
}

function compareNumbers(a, b) 
{
  return (a === b ? 0 : (a < b ? -1 : 1));
}

function compare(a, b, nullsFirst)
{
  if (a == b) 
  {
    return 0;
  }

  var av = isValue( a );
  var bv = isValue( b );

  if (av !== bv)
  {
    return (av && !nullsFirst) || (bv && nullsFirst) ? -1 : 1;
  }

  if (isDate(a)) 
  {
    a = a.getTime();
  }
  if (isDate(b)) 
  {
    b = b.getTime();
  }
  if (isNumber(a) && isNumber(b)) 
  {
    return compareNumbers(a, b);
  }
  if (isArray(a) && isArray(b)) 
  {
    return compareNumbers(a.length, b.length);
  }
  if (isBoolean(a) && isBoolean(b))
  {
    return a ? -1 : 1;
  }
  
  return (a + '').localeCompare(b + '');
}

function isSorted(comparator, array)
{
  if ( !comparator )
  {
    return true;
  }

  for (var i = 0, n = array.length - 1; i < n; i++)
  {
    if ( comparator( array[ i ], array[ i + 1 ] ) > 0 )
    {
      return false;
    }
  }

  return true;
}

Neuro.Comparators = {};

function saveComparator(name, comparator, nullsFirst)
{
  return Neuro.Comparators[ name ] = createComparator( comparator, nullsFirst );
}

function addComparator(second, comparator, nullsFirst)
{
  var first = createComparator( comparator, nullsFirst );

  if ( !isFunction( second ) )
  {
    return first;
  }

  return function compareCascading(a, b) 
  {
    var d = first( a, b );

    return d !== 0 ? d : second( a, b );
  };
}

function createComparator(comparator, nullsFirst)
{
  if ( isFunction( comparator ) )
  {
    return comparator;
  }
  else if ( isString( comparator ) )
  {
    if ( comparator in Neuro.Comparators )
    {
      return Neuro.Comparators[ comparator ];
    }

    if ( comparator.charAt(0) === '-' )
    {
      comparator = comparator.substring( 1 );

      return function compareObjects(a, b)
      {
        var av = isValue( a ) ? a[ comparator ] : a;
        var bv = isValue( b ) ? b[ comparator ] : b; 

        return compare( bv, av, !nullsFirst );
      };
    }
    else
    {
      return function compareObjects(a, b)
      {
        var av = isValue( a ) ? a[ comparator ] : a;
        var bv = isValue( b ) ? b[ comparator ] : b; 

        return compare( av, bv, nullsFirst );
      };
    }
  }
  else if ( isArray( comparator ) )
  {
    var parsed = [];

    for (var i = 0; i < comparator.length; i++)
    {
      parsed[ i ] = createComparator( comparator[ i ], nullsFirst );
    }

    return function compareObjectsCascade(a, b)
    {
      var d = 0;

      for (var i = 0; i < parsed.length && d === 0; i++)
      {
        d = parsed[ i ]( a, b );
      }

      return d;
    };
  }

  return null;
}

Neuro.NumberResolvers = {};

function saveNumberResolver(name, numbers)
{
  return Neuro.NumberResolvers[ name ] = createNumberResolver( numbers );
}

function createNumberResolver(numbers)
{
  if ( isFunction( numbers ) )
  {
    return numbers;
  }
  else if ( isString( numbers ) )
  {
    if ( numbers in Neuro.NumberResolvers )
    {
      return Neuro.NumberResolvers[ numbers ];
    }

    return function resolveNumber(model)
    {
      return isValue( model ) ? parseFloat( model[ numbers ] ) : undefined;
    };
  }
  else
  {
    return function resolveNumber(value)
    {
      return parseFloat( value );
    };
  }
}

Neuro.PropertyResolvers = {};

function savePropertyResolver(name, properties, delim)
{
  return Neuro.PropertyResolvers[ name ] = createPropertyResolver( properties, delim );
}

function createPropertyResolver(properties, delim)
{
  if ( isFunction( properties ) )
  {
    return properties;
  }
  else if ( isString( properties ) )
  {
    if ( properties in Neuro.PropertyResolvers )
    {
      return Neuro.PropertyResolvers[ properties ];
    }

    return function resolveProperty(model)
    {
      return model[ properties ];
    };
  }
  else if ( isArray( properties ) )
  {
    return function resolveProperties(model)
    {
      return pull( model, properties ).join( delim );
    };
  }
  else if ( isObject( properties ) )
  {
    var propsArray = [];
    var propsResolver = [];

    for (var prop in properties)
    {
      propsArray.push( prop );
      propsResolver.push( createPropertyResolver( properties[ prop ], delim ) );
    }

    return function resolvePropertyObject(model)
    {
      var pulled = [];

      for (var i = 0; i < prop.length; i++)
      {
        pulled.push( propsResolver[ i ]( model[ propsArray[ i ] ] ) );
      }

      return pulled.join( delim );
    };
  } 
  else
  {
    return function resolveNone(model)
    {
      return model;
    }
  }
}

Neuro.Wheres = {};

function saveWhere(name, properties, values, equals)
{
  return Neuro.Wheres[ name ] = createWhere( properties, values, equals );
}

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
    return function whereEqualsObject(model)
    {
      for (var prop in properties)
      {
        if ( !equality( model[ prop ], properties[ prop ] ) )
        {
          return false;
        }
      }

      return true;
    };
  }
  else if ( isString( properties ) )
  {
    if ( properties in Neuro.Wheres )
    {
      return Neuro.Wheres[ properties ];
    }

    if ( isValue( value ) )
    { 
      return function whereEqualsValue(model)
      {
        return equality( model[ properties ], value );
      };
    }
    else
    {
      return function whereHasValue(model)
      {
        return isValue( model[ properties ] );
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

Neuro.Havings = {};

function saveHaving(name, having)
{
  return Neuro.Havings[ name ] = createHaving( having );
}

function createHaving(having)
{
  if ( isFunction( having ) )
  {
    return having;
  }
  else if ( isString( having ) )
  {
    if ( having in Neuro.Havings )
    {
      return Neuro.Havings[ having ];
    }

    return function hasValue(model)
    {
      return isValue( model ) && isValue( model[ having ] );
    };
  }
  else
  {
    return function hasAll()
    {
      return true;
    };
  }
}


function parse(expr, base)
{
  var valid = true;
  
  expr.replace( parse.REGEX, function(prop) 
  {
    if (!valid) 
    {
      return;
    }

    if ( isArray( base ) ) 
    {
      var i = parseInt(prop);

      if (!isNaN(i)) 
      {
        base = base[ i ];
      }
      else 
      {
        valid = false;
      }
    }
    else if ( isObject( base ) ) 
    {
      if (prop in base) 
      {
        var value = base[ prop ];
        base = isFunction(value) ? value() : value;
      } 
      else 
      {
        valid = false;
      }
    } 
    else 
    {
      valid = false;
    }
  });
  
  return valid ? base : void 0;
}

parse.REGEX = /([\w$]+)/g;

function format(template, base)
{
  return template.replace( format.REGEX, function(match)
  {
    return parse( match, base );
  });
}

format.REGEX = /\{[^\}]+\}/g;

function createFormatter(template)
{
  return function formatter(base)
  {
    return format( template, base );
  };
}
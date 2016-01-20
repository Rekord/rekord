(function(global, undefined)
{



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
      var parsed = createComparator( comparator.substring( 1 ), !nullsFirst );

      return function compareObjectsReversed(a, b)
      {
        return -parsed( a, b );
      };
    }
    else if ( comparator.indexOf('{') !== -1 )
    {
      return function compareFormatted(a, b)
      {
        var af = format( comparator, a );
        var bf = format( comparator, b );

        return af.localeCompare( bf );
      };
    }
    else if ( comparator.indexOf('.') !== -1 )
    {
      return function compareExpression(a, b)
      {
        var ap = parse( comparator, a );
        var bp = parse( comparator, b );

        return compare( ap, bp, nullsFirst );
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

function addEventFunction(target, functionName, events, secret)
{
  var on = secret ? '$on' : 'on';
  var off = secret ? '$off' : 'off';

  target[ functionName ] = function(callback, context)
  {
    var subject = this;
    var unlistened = false;

    function listener() 
    {
      var result = callback.apply( context || subject, arguments );

      if ( result === false )
      {
        unlistener();
      }
    };

    function unlistener()
    {
      if ( !unlistened )
      {
        subject[ off ]( events, listener );
        unlistened = true;
      }
    }

    subject[ on ]( events, listener );

    return unlistener;
  };
}

/**
 * Adds functions to the given object (or prototype) so you can listen for any 
 * number of events on the given object, optionally once. Listeners can be 
 * removed later.
 *
 * The following methods will be added to the given target:
 *
 *     target.on( events, callback, [context] )
 *     target.once( events, callback, [context] )
 *     target.off( events, callback )
 *     target.trigger( events, [a, b, c...] )
 *
 * Where... 
 * - `events` is a string of space delimited events.
 * - `callback` is a function to invoke when the event is triggered.
 * - `context` is an object that should be the `this` when the callback is 
 *   invoked. If no context is given the default value is the object which has 
 *   the trigger function that was invoked.
 *
 * @method eventize
 * @for Core
 * @param {Object} target The object to add `on`, `once`, `off`, and `trigger` 
 *    functions to.
 */
function eventize(target, secret)
{

  var CALLBACK_FUNCTION = 0;
  var CALLBACK_CONTEXT = 1;
  var CALLBACK_GROUP = 2;

  var triggerId = 0;

  /**
   * **See:** {{#crossLink "Core/eventize:method"}}{{/crossLink}}
   * 
   * @class eventize
   */

  // Adds a listener to $this
  function onListeners($this, property, events, callback, context)
  {
    if ( !isFunction( callback ) )
    {
      return noop;
    }

    var events = toArray( events, ' ' );
    var listeners = $this[ property ];

    if ( !isDefined( listeners ) )
    {
      listeners = $this[ property ] = {};
    }
    
    for (var i = 0; i < events.length; i++)
    {
      var eventName = events[ i ];
      var eventListeners = listeners[ eventName ];

      if ( !isDefined( eventListeners ) )
      {
        eventListeners = listeners[ eventName ] = [];
      }
      
      eventListeners.push( [ callback, context || $this, 0 ] );
    }

    return function ignore()
    {
      for (var i = 0; i < events.length; i++)
      {
        offListeners( listeners, events[ i ], callback );
      }
    };
  };
  
  /**
   * Listens for every occurrence of the given events and invokes the callback
   * each time any of them are triggered.
   * 
   * @method on
   * @for eventize
   * @param {String|Array|Object} events
   * @param {Function} callback
   * @param {Object} [context]
   * @chainable
   */
  function on(events, callback, context)
  {
    return onListeners( this, '$$on', events, callback, context );
  }
  
  /**
   * Listens for the next occurrence for each of the given events and invokes
   * the callback when any of the events are triggered.
   * 
   * @method once
   * @for eventize
   * @param {String|Array|Object} events
   * @param {Function} callback
   * @param {Object} [context]
   * @chainable
   */
  function once(events, callback, context)
  {
    return onListeners( this, '$$once', events, callback, context );
  }

  function after(events, callback, context)
  {
    return onListeners( this, '$$after', events, callback, context );
  }
  
  // Removes a listener from an array of listeners.
  function offListeners(listeners, event, callback)
  {
    if (listeners && event in listeners)
    {
      var eventListeners = listeners[ event ];
      
      for (var k = eventListeners.length - 1; k >= 0; k--)
      {
        if (eventListeners[ k ][ CALLBACK_FUNCTION ] === callback)
        {
          eventListeners.splice( k, 1 );
        }
      }  
    }
  }

  // Deletes a property from the given object if it exists
  function deleteProperty(obj, prop)
  {
    if ( obj && prop in obj )
    {
      delete obj[ prop ];
    }
  }
  
  /**
   * Stops listening for a given callback for a given set of events.
   *
   * **Examples:**
   *
   *     target.off();           // remove all listeners
   *     target.off('a b');      // remove all listeners on events a & b
   *     target.off(['a', 'b']); // remove all listeners on events a & b
   *     target.off('a', x);     // remove listener x from event a
   * 
   * @method off
   * @for eventize
   * @param {String|Array|Object} [events]
   * @param {Function} [callback]
   * @chainable
   */
  function off(events, callback)
  {
    // Remove ALL listeners
    if ( !isDefined( events ) )
    {
      deleteProperty( this, '$$on' );
      deleteProperty( this, '$$once' );
      deleteProperty( this, '$$after' );
    }
    else
    {
      var events = toArray( events, ' ' );

      // Remove listeners for given events
      if ( !isFunction( callback ) )
      {
        for (var i = 0; i < events.length; i++)
        {
          deleteProperty( this.$$on, events[i] );
          deleteProperty( this.$$once, events[i] );
          deleteProperty( this.$$after, events[i] );
        }
      }
      // Remove specific listener
      else
      {
        for (var i = 0; i < events.length; i++)
        {
          offListeners( this.$$on, events[i], callback );
          offListeners( this.$$once, events[i], callback );
          offListeners( this.$$after, events[i], callback );
        }
      }
    }

    return this;
  }

  // Triggers listeneers for the given event
  function triggerListeners(listeners, event, args, clear)
  {
    if (listeners && event in listeners)
    {
      var eventListeners = listeners[ event ];
      var triggerGroup = ++triggerId;
     
      for (var i = 0; i < eventListeners.length; i++)
      {
        var callback = eventListeners[ i ];

        if ( callback )
        {
          if ( callback[ CALLBACK_GROUP ] !== triggerGroup )
          {
            callback[ CALLBACK_GROUP ] = triggerGroup;
            callback[ CALLBACK_FUNCTION ].apply( callback[ CALLBACK_CONTEXT ], args );

            if ( callback !== eventListeners[ i ] )
            {
              i = -1;
            }
          }
        }
      }
      
      if ( clear )
      {
        delete listeners[ event ];
      }
    }
  }
  
  /**
   * Triggers a single event optionally passing an argument to any listeners.
   * 
   * @method trigger
   * @for eventize
   * @param {String} event
   * @param {Array} args
   * @chainable
   */
  function trigger(events, args)
  {
    var events = toArray( events, ' ' );

    for (var i = 0; i < events.length; i++)
    {
      var e = events[ i ];

      triggerListeners( this.$$on, e, args, false );
      triggerListeners( this.$$once, e, args, true );
      triggerListeners( this.$$after, e, args, false )
    }

    return this;
  }

  if ( secret )
  {
    target.$on = on;
    target.$once = once;
    target.$after = after;
    target.$off = off;
    target.$trigger = trigger;
  }
  else
  {
    target.on = on;
    target.once = once;
    target.after = after;
    target.off = off;
    target.trigger = trigger;
  }
};

/**
 * Creates a Neuro object given a set of options. A Neuro object is also the
 * constructor for creating instances of the Neuro object defined.
 *
 * @namespace
 * @param {Object} options
 *        The options of
 */
function Neuro(options)
{
  if ( options.name in Neuro.cache )
  {
    return Neuro.cache[ options.name ];
  }

  var database = new NeuroDatabase( options );

  var model = new Function('return function ' + database.className + '(props, remoteData) { this.$init( props, remoteData ) }')();
  model.prototype = new NeuroModel( database );

  database.Model = model;
  model.Database = database;

  Neuro.trigger( Neuro.Events.Plugins, [model, database, options] );

  Neuro.cache[ database.name ] = model;
  Neuro.cache[ database.className ] = model;

  if ( Neuro.autoload )
  {
    database.loadBegin(function onLoadFinish(success)
    {
      if ( success )
      {
        database.loadFinish();
      }
    });
  }
  else
  {
    Neuro.unloaded.push( database );
  }

  Neuro.trigger( Neuro.Events.Initialized, [model] );

  Neuro.debug( Neuro.Debugs.CREATION, database, options );

  return model;
}

Neuro.autoload = false;

Neuro.unloaded = [];

Neuro.load = function(callback, context)
{
  var callbackContext = context || this;
  var loading = Neuro.unloaded.slice();
  var loaded = [];
  var loadedSuccess = [];

  Neuro.unloaded.length = 0;

  function onLoadFinish(success, db)
  {
    loadedSuccess.push( success );
    loaded.push( db );

    if ( loaded.length === loading.length )
    {
      for (var k = 0; k < loaded.length; k++)
      {
        var db = loaded[ k ];
        var success = loadedSuccess[ k ];

        if ( success )
        {
          db.loadFinish();
        }
      }

      if ( callback )
      {
        callback.call( callbackContext );
      }
    }
  }

  for (var i = 0; i < loading.length; i++)
  {
    loading[ i ].loadBegin( onLoadFinish );
  }
};

Neuro.cache = {};

Neuro.get = function(name, callback, context)
{
  var cached = Neuro.cache[ name ];
  var callbackContext = context || global;

  if ( isFunction( callback ) )
  {
    if ( cached )
    {
      callback.call( callbackContext, cached );
    }
    else
    {
      function checkNeuro()
      {
        var cached = Neuro.cache[ name ];

        if ( cached )
        {
          callback.call( callbackContext, cached );
          off();
        }
      }

      var off = Neuro.on( Neuro.Events.Initialized, checkNeuro );
    }
  }

  return cached;
};

eventize( Neuro );

Neuro.Events =
{
  Initialized:  'initialized',
  Plugins:      'plugins',
  Online:       'online',
  Offline:      'offline'
};

Neuro.Cascade =
{
  None:       0,
  Local:      1,
  Rest:       2,
  NoLive:     3,
  Live:       4,
  NoRest:     5,
  Remote:     6,
  All:        7
};

Neuro.Cache =
{
  None:       'none',
  Pending:    'pending',
  All:        'all'
};

Neuro.Store =
{
  None:   0,
  Model:  1,
  Key:    2,
  Keys:   3
};

Neuro.Save =
{
  None:   0,
  Model:  4,
  Key:    5,
  Keys:   6
};

Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.all = function()
  {
    return db.models;
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.boot = function( input )
  {
    if ( isArray( input ) )
    {
      return new NeuroModelCollection( db, input, true );
    }
    else if ( isObject( input ) )
    {
      return db.putRemoteData( input );
    }

    return input;
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.collect = function(a)
  {
    var models = arguments.length > 1 || !isArray(a) ?
      Array.prototype.slice.call( arguments ) : a;

    return new NeuroModelCollection( db, models );
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.create = function( props )
  {
    var instance = isObject( props ) ? 
      db.createModel( props ) : 
      db.instantiate();

    instance.$save();

    return instance;
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  if ( isObject( options.dynamic ) )
  {
    for ( var property in options.dynamic )
    {
      var definition = options.dynamic[ property ];

      addDynamicProperty( model.prototype, property, definition );
    }
  }
});

function addDynamicProperty(modelPrototype, property, definition)
{
  var get = isFunction( definition ) ? definition : 
          ( isObject( definition ) && isFunction( definition.get ) ? definition.get : noop );
  var set = isObject( definition ) && isFunction( definition.set ) ? definition.set : noop;

  if ( Object.defineProperty )
  {
    Object.defineProperty( modelPrototype, property, 
    {
      configurable: false,
      enumerable: true,
      get: get,
      set: set
    });
  }
  else
  {
    var $init = modelPrototype.$init;

    modelPrototype.$init = function()
    {
      $init.apply( this, arguments );

      var lastCalculatedValue = this[ property ] = get.apply( this );

      var handleChange = function()
      {
        var current = this[ property ];

        if ( current !== lastCalculatedValue )
        {
          set.call( this, current );
        }
        else
        {
          lastCalculatedValue = this[ property ] = get.apply( this );
        }
      };

      this.$after( NeuroModel.Events.Changes, handleChange, this );
    };
  }
}

Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  var events = options.events;

  if ( isObject( events ) )
  {
    var modelEvents = [];
    var databaseEvents = [];

    for ( var eventType in events )
    {
      var callback = events[ eventType ];
      var eventName = toCamelCase( eventType );

      var databaseEventString = NeuroDatabase.Events[ eventName ];
      var modelEventString = NeuroModel.Events[ eventName ];

      if ( databaseEventString )
      {
        parseEventListeners( databaseEventString, callback, false, databaseEvents );
      }

      if ( modelEventString )
      {
        parseEventListeners( modelEventString, callback, true, modelEvents );
      }
    }

    applyEventListeners( db, databaseEvents );

    if ( modelEvents.length )
    {
      var $init = model.prototype.$init;

      model.prototype.$init = function()
      {
        $init.apply( this, arguments );

        applyEventListeners( this, modelEvents );
      };
    }
  }

});

function parseEventListeners(events, callback, secret, out)
{
  var map = {
    on:     secret ? '$on' : 'on',
    once:   secret ? '$once' : 'once',
    after:  secret ? '$after' : 'after'
  };

  var listeners = out || [];

  if ( isFunction( callback ) )
  {
    listeners.push(
    {
      when: map.on,
      events: events,
      invoke: callback
    });
  }
  else if ( isArray( callback ) && callback.length === 2 && isFunction( callback[0] ) )
  {
    listeners.push(
    {
      when: map.on,
      events: events,
      invoke: callback[0],
      context: callback[1]
    });
  }
  else if ( isObject( callback ) )
  {
    for ( var eventType in callback )
    {
      if ( eventType in map )
      {
        var subcallback = callback[ eventType ];
        var when = map[ eventType ];

        if ( isFunction( subcallback ) )
        {
          listeners.push(
          {
            when: when,
            events: events,
            invoke: subcallback
          });
        }
        else if ( isArray( subcallback ) && subcallback.length === 2 && isFunction( subcallback[0] ) )
        {
          listeners.push(
          {
            when: when,
            events: events,
            invoke: subcallback[0],
            context: subcallback[1]
          });
        }
      }
    }
  }

  return listeners;
}

function applyEventListeners(target, listeners)
{
  for (var i = 0; i < listeners.length; i++)
  {
    var l = listeners[ i ];

    target[ l.when ]( l.events, l.invoke, l.context );
  }
}
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  var extend = options.extend;

  if ( !isNeuro( extend ) )
  {
    return;
  }

  var defaults = NeuroDatabase.Defaults;
  var edb = extend.Database;
  var eoptions = edb.options;

  function tryOverwrite(option)
  {
    if ( !options[ option ] )
    {
      db[ option ] = edb[ option ];
    }
  }

  function tryMerge(option)
  {
    var dbo = db[ option ];
    var edbo = edb[ option ];

    for (var prop in edbo)
    {
      if ( !(prop in dbo ) )
      {
        dbo[ prop ] = edbo[ prop ];
      }
    }
  }

  function tryUnshift(options, sourceOptions)
  {
    var source = edb[ sourceOptions || options ];
    var target = db[ options ];

    for (var i = source.length - 1; i >= 0; i--)
    {
      var k = indexOf( target, source[ i ] );

      if ( k !== false )
      {
        target.splice( k, 1 );
      }

      target.unshift( source[ i ] );
    }
  }

  tryOverwrite( 'keySeparator' );
  tryMerge( 'defaults' );
  tryMerge( 'ignoredFields' );
  tryOverwrite( 'loadRelations' );
  tryOverwrite( 'loadRemote' );
  tryOverwrite( 'autoRefresh' );
  tryOverwrite( 'cache' );
  tryOverwrite( 'fullSave' );
  tryOverwrite( 'fullPublish' );
  tryMerge( 'encodings' );
  tryMerge( 'decodings' );
  tryOverwrite( 'summarize' );
  tryUnshift( 'fields' );
  tryUnshift( 'saveFields', 'fields' );

  if ( !options.comparator )
  {
    db.setComparator( eoptions.comparator, eoptions.comparatorNullsFirst );
  }

  if ( !options.revision )
  {
    db.setRevision( eoptions.revision );
  }

  if ( !options.summarize )
  {
    db.setSummarize( eoptions.summarize );
  }

  for (var name in edb.relations)
  {
    if ( name in db.relations )
    {
      continue;
    }

    var relation = edb.relations[ name ];
    var relationCopy = new relation.constructor();

    relationCopy.init( db, name, relation.options );

    if ( relationCopy.save )
    {
      db.saveFields.push( name );
    }

    db.relations[ name ] = relationCopy;
    db.relationNames.push( name );
  }

  db.rest   = Neuro.rest( db );
  db.store  = Neuro.store( db );
  db.live   = Neuro.live( db );

});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.fetch = function( input, callback, context )
  {
    var key = db.buildKeyFromInput( input );
    var instance = db.get( key );

    if ( !instance )
    {
      instance = db.buildObjectFromKey( key );

      if ( isObject( input ) )
      {
        instance.$set( input );
      }
    }

    if ( isFunction( callback ) )
    {
      var callbackContext = context || this;

      instance.$once( NeuroModel.Events.RemoteGets, function()
      {
        callback.call( callbackContext, instance );
      });
    }

    instance.$refresh();

    return instance;
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.fetchAll = function(callback, context)
  {
    db.refresh( callback, context );

    return db.models;
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.find = function(whereProperties, whereValue, whereEquals)
  {
    return db.models.firstWhere( whereProperties, whereValue, whereEquals );
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.get = function( input, callback, context )
  {
    if ( isFunction( callback ) )
    {
      db.grabModel( input, callback, context );
    }
    else
    {
      var key = db.buildKeyFromInput( input );

      return db.get( key );
    }
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.grab = function( input, callback, context )
  {
    var callbackContext = context || this;
    var key = db.buildKeyFromInput( input );
    var instance = db.get( key );

    if ( instance )
    {
      callback.call( callbackContext, instance );
    }
    else
    {
      db.grabModel( input, function(instance)
      {
        if ( instance )
        {
          callback.call( callbackContext, instance )
        }
        else
        {
          model.fetch( input, callback, context );
        }
      });
    }

    return instance;
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.grabAll = function( callback, context )
  {
    var callbackContext = context || this;
    var models = db.models;

    if ( models.length )
    {
      callback.call( callbackContext, models );
    }
    else
    {
      db.ready(function()
      {
        if ( models.length )
        {
          callback.call( callbackContext, models );
        }
        else
        {
          db.refresh(function()
          {
            callback.call( callbackContext, models );
          });
        }
      });
    }

    return models;
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  if ( isObject( options.methods ) )
  {
    transfer( options.methods, model.prototype );
  }
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.query = function(query)
  {
    var q = new NeuroRemoteQuery( db, query );

    if ( isValue( query ) )
    {
      q.sync();      
    }

    return q;
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.ready = function( callback, context, persistent )
  {
    db.ready( callback, context, persistent );
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.refresh = function( callback, context )
  {
    return db.refresh( callback, context );
  };
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  var time = options.timestamps;
  var timeAsDate = options.timestampsAsDate;
  var currentTimestamp = timeAsDate ? currentDate : currentTime;

  if ( !time )
  {
    return;
  }

  function currentTime()
  {
    return new Date().getTime();
  }

  function currentDate()
  {
    return new Date();
  }

  function encode(x)
  {
    return x instanceof Date ? x.getTime() : x;
  }

  function decode(x)
  {
    return isNumber( x ) ? new Date( x ) : (isString( x ) && Date.parse ? Date.parse( x ) : x);
  }

  function addTimestamp(field)
  {
    var i = indexOf( db.fields, field );

    if ( i === false )
    {
      db.fields.push( field );
      db.saveFields.push( field );
    }

    if ( !(field in db.defaults) )
    {
      db.defaults[ field ] = currentTimestamp;
    }

    if ( options.timestampsAsDate )
    {
      if ( !(field in db.encodings) )
      {
        db.encodings[ field ] = encode;
      }
      if ( !(field in db.decodings ) )
      {
        db.decodings[ field ] = decode;
      }
    }
  }

  function addCreatedAt(field)
  {
    addTimestamp( field );

    db.ignoredFields[ field ] = true;
  }

  function addUpdatedAt(field)
  {
    addTimestamp( field );

    db.ignoredFields[ field ] = true;

    var $save = model.prototype.$save;

    model.prototype.$save = function()
    {
      this[ field ] = currentTimestamp();

      $save.apply( this, arguments );
    };
  }

  function addTimestampField(type, field)
  {
    switch (type) {
      case 'created_at':
        return addCreatedAt( field );
      case 'updated_at':
        return addUpdatedAt( field );
      default:
        return addTimestamp( field );
    }
  }

  if ( isString( time ) )
  {
    addTimestampField( time, time );
  }
  else if ( isArray( time ) )
  {
    for (var i = 0; i < time.length; i++)
    {
      addTimestampField( time[ i ], time[ i ] );
    }
  }
  else if ( isObject( time ) )
  {
    for (var prop in time)
    {
      addTimestampField( prop, time[ prop ] );
    }
  }
  else
  {
    addCreatedAt( 'created_at' );
    addUpdatedAt( 'updated_at' );
  }
});
Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.where = function(whereProperties, whereValue, whereEquals)
  {
    return new NeuroQuery( db, whereProperties, whereValue, whereEquals );
  };
});

Neuro.debug = function(event, source)  /*, data.. */
{
  // up to the user
};

Neuro.Debugs = {

  CREATION: 0,                // options

  REST: 1,                    // options
  AUTO_REFRESH: 73,           // 

  REMOTE_UPDATE: 2,           // encoded, NeuroModel
  REMOTE_CREATE: 3,           // encoded, NeuroModel
  REMOTE_REMOVE: 4,           // NeuroModel
  REMOTE_LOAD: 5,             // encoded[]
  REMOTE_LOAD_OFFLINE: 6,     // 
  REMOTE_LOAD_ERROR: 7,       // status
  REMOTE_LOAD_REMOVE: 8,      // key
  REMOTE_LOAD_RESUME: 22,     // 

  LOCAL_LOAD: 9,              // encoded[]
  LOCAL_RESUME_DELETE: 10,    // NeuroModel
  LOCAL_RESUME_SAVE: 11,      // NeuroModel
  LOCAL_LOAD_SAVED: 12,       // NeuroModel

  REALTIME_SAVE: 13,          // encoded, key
  REALTIME_REMOVE: 14,        // key

  SAVE_VALUES: 15,            // encoded, NeuroModel
  SAVE_PUBLISH: 16,           // encoded, NeuroModel
  SAVE_CONFLICT: 17,          // encoded, NeuroModel
  SAVE_UPDATE_FAIL: 18,       // NeuroModel
  SAVE_ERROR: 19,             // NeuroModel, status
  SAVE_OFFLINE: 20,           // NeuroModel
  SAVE_RESUME: 21,            // NeuroModel
  SAVE_REMOTE: 25,            // NeuroModel
  SAVE_DELETED: 40,           // NeuroModel

  SAVE_OLD_REVISION: 48,      // NeuroModel, encoded

  SAVE_LOCAL: 23,             // NeuroModel
  SAVE_LOCAL_ERROR: 24,       // NeuroModel, error
  SAVE_LOCAL_DELETED: 38,     // NeuroModel
  SAVE_LOCAL_BLOCKED: 39,     // NeuroModel

  SAVE_REMOTE_DELETED: 41,    // NeuroModel, [encoded]
  SAVE_REMOTE_BLOCKED: 42,    // NeuroModel

  REMOVE_PUBLISH: 26,         // key, NeuroModel
  REMOVE_LOCAL: 27,           // key, NeuroModel
  REMOVE_MISSING: 28,         // key, NeuroModel
  REMOVE_ERROR: 29,           // status, key, NeuroModel
  REMOVE_OFFLINE: 30,         // NeuroModel
  REMOVE_RESUME: 31,          // NeuroModel
  REMOVE_REMOTE: 32,          // NeuroModel
  REMOVE_CANCEL_SAVE: 47,     // NeuroModel

  REMOVE_LOCAL: 33,           // NeuroModel
  REMOVE_LOCAL_ERROR: 34,     // NeuroModel, error
  REMOVE_LOCAL_BLOCKED: 44,   // NeuroModel
  REMOVE_LOCAL_NONE: 45,      // NeuroModel
  REMOVE_LOCAL_UNSAVED: 46,   // NeuroModel

  REMOVE_REMOTE_BLOCKED: 43,  // NeuroModel

  GET_LOCAL_SKIPPED: 104,     // NeuroModel
  GET_LOCAL: 105,             // NeuroModel, encoded
  GET_LOCAL_ERROR: 106,       // NeuroModel, e
  GET_REMOTE: 107,            // NeuroModel, data
  GET_REMOTE_ERROR: 108,      // NeuroModel, data, status

  ONLINE: 35,                 //
  OFFLINE: 36,                //

  PUBSUB_CREATED: 37,         // PubSub

  HASONE_INIT: 53,            // NeuroHasOne
  HASONE_NINJA_REMOVE: 49,    // NeuroModel, relation
  HASONE_INITIAL_PULLED: 51,  // NeuroModel, initial
  HASONE_INITIAL: 52,         // NeuroModel, initial
  HASONE_CLEAR_MODEL: 54,     // relation
  HASONE_SET_MODEL: 55,       // relation
  HASONE_PRESAVE: 56,         // NeuroModel, relation
  HASONE_POSTREMOVE: 57,      // NeuroModel, relation
  HASONE_CLEAR_KEY: 58,       // NeuroModel, local
  HASONE_UPDATE_KEY: 59,      // NeuroModel, local, NeuroModel, foreign
  HASONE_LOADED: 60,          // NeuroModel, relation, [NeuroModel]
  HASONE_QUERY: 111,          // NeuroModel, NeuroRemoteQuery, queryOption, query
  HASONE_QUERY_RESULTS: 112,  // NeuroModel, NeuroRemoteQuery

  BELONGSTO_INIT: 61,          // NeuroHasOne
  BELONGSTO_NINJA_REMOVE: 62,  // NeuroModel, relation
  BELONGSTO_NINJA_SAVE: 63,    // NeuroModel, relation
  BELONGSTO_INITIAL_PULLED: 64,// NeuroModel, initial
  BELONGSTO_INITIAL: 65,       // NeuroModel, initial
  BELONGSTO_CLEAR_MODEL: 66,   // relation
  BELONGSTO_SET_MODEL: 67,     // relation
  BELONGSTO_POSTREMOVE: 69,    // NeuroModel, relation
  BELONGSTO_CLEAR_KEY: 70,     // NeuroModel, local
  BELONGSTO_UPDATE_KEY: 71,    // NeuroModel, local, NeuroModel, foreign
  BELONGSTO_LOADED: 72,        // NeuroModel, relation, [NeuroModel]
  BELONGSTO_QUERY: 113,        // NeuroModel, NeuroRemoteQuery, queryOption, query
  BELONGSTO_QUERY_RESULTS: 114,// NeuroModel, NeuroRemoteQuery

  HASMANY_INIT: 74,             // NeuroHasMany
  HASMANY_NINJA_REMOVE: 75,     // NeuroModel, NeuroModel, relation
  HASMANY_NINJA_SAVE: 76,       // NeuroModel, NeuroModel, relation
  HASMANY_INITIAL: 77,          // NeuroModel, relation, initial
  HASMANY_INITIAL_PULLED: 78,   // NeuroModel, relation
  HASMANY_REMOVE: 79,           // relation, NeuroModel
  HASMANY_SORT: 80,             // relation
  HASMANY_ADD: 81,              // relation, NeuroModel
  HASMANY_LAZY_LOAD: 82,        // relation, NeuroModel[]
  HASMANY_INITIAL_GRABBED: 83,  // relation, NeuroModel
  HASMANY_NINJA_ADD: 84,        // relation, NeuroModel
  HASMANY_AUTO_SAVE: 85,        // relation
  HASMANY_PREREMOVE: 86,        // NeuroModel, relation
  HASMANY_POSTSAVE: 87,         // NeuroModel, relation
  HASMANY_QUERY: 115,           // NeuroModel, NeuroRemoteQuery, queryOption, query
  HASMANY_QUERY_RESULTS: 116,   // NeuroModel, NeuroRemoteQuery

  HASMANYTHRU_INIT: 88,             // NeuroHasMany
  HASMANYTHRU_NINJA_REMOVE: 89,     // NeuroModel, NeuroModel, relation
  HASMANYTHRU_NINJA_SAVE: 90,       // NeuroModel, NeuroModel, relation
  HASMANYTHRU_NINJA_THRU_REMOVE: 91,// NeuroModel, NeuroModel, relation
  HASMANYTHRU_INITIAL: 92,          // NeuroModel, relation, initial
  HASMANYTHRU_INITIAL_PULLED: 93,   // NeuroModel, relation
  HASMANYTHRU_REMOVE: 94,           // relation, NeuroModel
  HASMANYTHRU_SORT: 95,             // relation
  HASMANYTHRU_ADD: 96,              // relation, NeuroModel
  HASMANYTHRU_LAZY_LOAD: 97,        // relation, NeuroModel[]
  HASMANYTHRU_INITIAL_GRABBED: 98,  // relation, NeuroModel
  HASMANYTHRU_NINJA_ADD: 99,        // relation, NeuroModel
  HASMANYTHRU_AUTO_SAVE: 100,       // relation
  HASMANYTHRU_PREREMOVE: 101,       // NeuroModel, relation
  HASMANYTHRU_POSTSAVE: 102,        // NeuroModel, relation  
  HASMANYTHRU_THRU_ADD: 103,        // relation, NeuroModel
  HASMANYTHRU_THRU_REMOVE: 68,      // relation, NeuroModel, NeuroModel
  HASMANYTHRU_QUERY: 117,           // NeuroModel, NeuroRemoteQuery, queryOption, query
  HASMANYTHRU_QUERY_RESULTS: 118,   // NeuroModel, NeuroRemoteQuery

  HASREMOTE_INIT: 50,               // NeuroHasRemote
  HASREMOTE_SORT: 121,              // relation
  HASREMOVE_NINJA_REMOVE: 109,      // NeuroModel, NeuroModel, relation
  HASREMOVE_NINJA_SAVE: 110,        // NeuroModel, NeuroModel, relation
  HASREMOVE_QUERY: 119,             // NeuroModel, NeuroRemoteQuery, queryOption, query
  HASREMOVE_QUERY_RESULTS: 120      // NeuroModel, NeuroRemoteQuery
};

// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(database)
{
  
  return {

    // success ( data[] )
    // failure ( data[], status )
    all: function( success, failure )
    {
      success( [] );
    },

    // success( data )
    // failure( data, status )
    get: function( model, success, failure )
    {
      failure( null, -1 );
    },

    // success ( data )
    // failure ( data, status )
    create: function( model, encoded, success, failure )
    {
      success( {} );
    },

    // success ( data )
    // failure ( data, status )
    update: function( model, encoded, success, failure )
    {
      success( {} );
    },

    // success ( data )
    // failure ( data, status )
    remove: function( model, success, failure )
    {
      success( {} );
    },

    // success ( data[] )
    // failure ( data[], status )
    query: function( query, success, failure )
    {
      success( [] );
    }

  };

};
/**
 * A factory function for returning an object capable of storing objects for
 * retrieval later by the application.
 * 
 * @param  {NeuroDatabase} database
 *         The database this store is for.
 * @return {Object} -
 *         An object with put, remove, and all functions.
 */
Neuro.store = function(database)
{
  return {

    /**
     * Places a record in the store with the given key.
     * 
     * @param  {String|Number} key
     *         The key to store the record as.
     * @param  {Object} record
     *         The record to store.
     * @param  {function} success
     *         A function to invoke when the record is successfully stored with
     *         the key. The arguments of the function should be the key and 
     *         record passed to this function.
     * @param  {function} failure
     *         A function to invoke when the record failed to be stored with the
     *         key. The arguments of the function should be the key, record, and
     *         an error that occurred if available.
     */
    put: function(key, record, success, failure) 
    { 
      success( key, record );
    },

    // TODO
    get: function(key, success, failure)
    {
      failure( key, void 0 );
    },

    /**
     * Removes a record from the store with the given key.
     * 
     * @param  {String|Number} key
     *         The key to remove from the store.
     * @param  {function} success
     *         A function to invoke when the record doesn't exist in the store.
     *         The arguments of the function are the removedValue (if any) and
     *         the key passed to this function.
     * @param  {function} failure
     *         A function to invoke when there was an issue removing the key
     *         from the store. The arguments of the function are the key given
     *         to this function and an error that occurred if available.
     */
    remove: function(key, success, failure) 
    {
      success( key );
    },

    /**
     * Returns all records and their keys to the given success callback.
     * 
     * @param  {function} success
     *         The function to invoke with the array of records and an array
     *         of keys.
     * @param  {function} failure
     *         The function to invoke with the error that occurred if available.
     */
    all: function(success, failure) 
    {
      success( [], [] );
    }

  };

};

/**
 * The factory responsible for creating a service which publishes operations
 * and receives operations that have occurred. The first argument is a reference
 * to the NeuroDatabase and the second argument is a function to invoke when a
 * live operation occurs. This function must return a function that can be passed
 * an operation to be delegated to other clients.
 * 
 * @param  {NeuroDatabase} database
 *         The database this live function is for.
 * @return {function} -
 *         The function which sends operations.
 */
Neuro.live = function(database)
{
  return {

    save: function(model, data)
    {
      // ignore save
    },

    remove: function(model)
    {
      // ignore remove
    }

  };
};

// Initial online
Neuro.online = window.navigator.onLine !== false;

Neuro.forceOffline = false;

// Set network status to online and notify all listeners
Neuro.setOnline = function()
{
  Neuro.online = true;
  Neuro.debug( Neuro.Debugs.ONLINE );
  Neuro.trigger( Neuro.Events.Online );
};

// Set network status to offline and notify all listeners
Neuro.setOffline = function()
{
  Neuro.online = false;
  Neuro.debug( Neuro.Debugs.OFFLINE );
  Neuro.trigger( Neuro.Events.Offline );
};

// This must be called manually - this will try to use built in support for 
// online/offline detection instead of solely using status codes of 0.
Neuro.listenToNetworkStatus = function()
{
  if (window.addEventListener) 
  {
    window.addEventListener( Neuro.Events.Online, Neuro.setOnline, false );
    window.addEventListener( Neuro.Events.Offline, Neuro.setOffline, false );
  } 
  else 
  {
    document.body.ononline = Neuro.setOnline;
    document.body.onoffline = Neuro.setOffline;
  }
};

// Check to see if the network status has changed.
Neuro.checkNetworkStatus = function()
{
  var online = window.navigator.onLine;

  if ( Neuro.forceOffline ) 
  {
    online = false;
  }

  if (online === true && Neuro.online === false) 
  {
    Neuro.setOnline();
  }

  else if (online === false && Neuro.online === true) 
  {
    Neuro.setOffline();
  }
};


function NeuroDatabase(options)
{
  var defaults = NeuroDatabase.Defaults;

  // Apply the options to this database!
  applyOptions( this, options, defaults );

  // Apply options not specified in defaults
  for (var prop in options)
  {
    if ( !(prop in defaults) )
    {
      this[ prop ] = options[ prop ];
    }
  }

  // If key fields aren't in fields array, add them in
  var key = this.key;
  var fields = this.fields;
  if ( isArray( key ) )
  {
    for (var i = key.length - 1; i >= 0; i--)
    {
      if ( indexOf( fields, key[ i ] ) === false )
      {
        fields.unshift( key[ i ] );
      }
    }
  }
  else // isString( key )
  {
    if ( indexOf( fields, key ) === false )
    {
      fields.unshift( key );
    }
  }

  // Properties
  this.keys = toArray( this.key );
  this.models = new NeuroModelCollection( this );
  this.all = {};
  this.loaded = {};
  this.className = this.className || toCamelCase( this.name );
  this.initialized = false;
  this.pendingRefresh = false;
  this.localLoaded = false;
  this.remoteLoaded = false;
  this.firstRefresh = false;
  this.pendingOperations = 0;
  this.afterOnline = false;
  this.saveFields = copy( fields );

  // Prepare
  this.prepare( this, options );

  // Services
  this.rest   = Neuro.rest( this );
  this.store  = Neuro.store( this );
  this.live   = Neuro.live( this );

  // Functions
  this.setComparator( this.comparator, this.comparatorNullsFirst );
  this.setRevision( this.revision );
  this.setSummarize( this.summarize );

  // Relations
  this.relations = {};
  this.relationNames = [];

  for (var relationType in options)
  {
    if ( !(relationType in Neuro.Relations) )
    {
      continue;
    }

    var RelationClass = Neuro.Relations[ relationType ];

    if ( !(RelationClass.prototype instanceof NeuroRelation ) )
    {
      continue;
    }

    var relationMap = options[ relationType ];

    for ( var name in relationMap )
    {
      var relationOptions = relationMap[ name ];
      var relation = new RelationClass();

      relation.init( this, name, relationOptions );

      if ( relation.save )
      {
        this.saveFields.push( name );
      }

      this.relations[ name ] = relation;
      this.relationNames.push( name );
    }
  }
}

function defaultEncode(data)
{
  var encodings = this.encodings;

  for (var prop in data)
  {
    if ( prop in encodings )
    {
      data[ prop ] = encodings[ prop ]( data[ prop ] );
    }
  }

  return data;
}

function defaultDecode(rawData)
{
  var decodings = this.decodings;

  for (var prop in rawData)
  {
    if ( prop in decodings )
    {
      rawData[ prop ] = decodings[ prop ]( rawData[ prop ] );
    }
  }

  return rawData;
}

function defaultSummarize(model)
{
  return model.$key();
}

NeuroDatabase.Events =
{
  NoLoad:       'no-load',
  RemoteLoad:   'remote-load',
  LocalLoad:    'local-load',
  Updated:      'updated',
  ModelAdded:   'model-added',
  ModelUpdated: 'model-updated',
  ModelRemoved: 'model-removed',
  Loads:        'no-load remote-load local-load',
  Changes:      'updated'
};

NeuroDatabase.Defaults =
{
  name:                 undefined,  // required
  className:            null,       // defaults to toCamelCase( name )
  key:                  'id',
  keySeparator:         '/',
  fields:               [],
  ignoredFields:        {},
  defaults:             {},
  comparator:           null,
  comparatorNullsFirst: null,
  revision:             null,
  loadRelations:        true,
  loadRemote:           true,
  autoRefresh:          true,
  cache:                Neuro.Cache.All,
  fullSave:             false,
  fullPublish:          false,
  encodings:            {},
  decodings:            {},
  prepare:              noop,
  encode:               defaultEncode,
  decode:               defaultDecode,
  summarize:            defaultSummarize
};

NeuroDatabase.prototype =
{

  // Notifies a callback when the database has loaded (either locally or remotely).
  ready: function(callback, context, persistent)
  {
    var db = this;
    var callbackContext = context || db;
    var invoked = false;

    if ( db.initialized )
    {
      callback.call( callbackContext, db );

      invoked = true;
    }
    else
    {
      function onReady()
      {
        if ( !persistent )
        {
          off();
        }
        if ( !invoked || persistent )
        {
          if ( callback.call( callbackContext, db ) === false )
          {
            off();
          }

          invoked = true;
        }
      }

      var off = db.on( NeuroDatabase.Events.Loads, onReady );
    }

    return invoked;
  },

  // Determines whether the given object has data to save
  hasData: function(saving)
  {
    if ( !isObject( saving ) )
    {
      return false;
    }

    for (var prop in saving)
    {
      if ( !this.ignoredFields[ prop ] )
      {
        return true;
      }
    }

    return false;
  },

  // Grab a model with the given input and notify the callback
  grabModel: function(input, callback, context, remoteData)
  {
    var db = this;
    var callbackContext = context || db;
    var grabbed = false;

    function checkModel()
    {
      var result = db.parseModel( input, remoteData );

      if ( result !== false && !grabbed )
      {
        grabbed = true;
        callback.call( callbackContext, result );
      }

      return result === null ? false : true;
    }

    if ( checkModel() )
    {
      db.ready( checkModel, db, true );
    }
  },

  // Parses the model from the given input
  //
  // Returns false if the input doesn't resolve to a model at the moment
  // Returns null if the input doesn't resolve to a model and all models have been remotely loaded
  //
  // parseModel( Neuro )
  // parseModel( Neuro.Model )
  // parseModel( 'uuid' )
  // parseModel( ['uuid'] )
  // parseModel( modelInstance )
  // parseModel( {name:'new model'} )
  // parseModel( {id:4, name:'new or existing model'} )
  //
  parseModel: function(input, remoteData)
  {
    var db = this;
    var hasRemote = db.remoteLoaded || !db.loadRemote;

    if ( !isValue( input ) )
    {
      return hasRemote ? null : false;
    }

    if ( isNeuro( input ) )
    {
      input = new input();
    }

    var key = db.buildKeyFromInput( input );

    if ( input instanceof db.Model )
    {
      return input;
    }
    else if ( key in db.all )
    {
      var model = db.all[ key ];

      if ( isObject( input ) )
      {
        if ( remoteData )
        {
          db.putRemoteData( input, key, model );
        }
        else
        {
          model.$set( input );
        }
      }

      return model;
    }
    else if ( isObject( input ) )
    {
      if ( remoteData )
      {
        return db.putRemoteData( input );
      }
      else
      {
        return db.instantiate( db.decode( input ) );
      }
    }
    else if ( hasRemote )
    {
      return null;
    }

    return false;
  },

  // Removes the key from the given model
  removeKey: function(model)
  {
    var k = this.key;

    if ( isArray(k) )
    {
      for (var i = 0; i < k.length; i++)
      {
        delete model[ k[i] ];
      }
    }
    else
    {
      delete model[ k ];
    }
  },

  // Builds a key string from the given model and array of fields
  buildKey: function(model, fields)
  {
    var key = this.buildKeys( model, fields );

    if ( isArray( key ) )
    {
      key = key.join( this.keySeparator );
    }

    return key;
  },

  // Builds a key (possibly array) from the given model and array of fields
  buildKeys: function(model, fields)
  {
    var key = null;

    if ( isArray( fields ) )
    {
      key = [];

      for (var i = 0; i < fields.length; i++)
      {
        key.push( model[ fields[i] ] );
      }
    }
    else
    {
      key = model[ fields ];

      if (!key)
      {
        key = model[ fields ] = uuid();
      }
    }

    return key;
  },

  // Builds a key from various types of input.
  buildKeyFromInput: function(input)
  {
    if ( input instanceof this.Model )
    {
      return input.$key();
    }
    else if ( isArray( input ) ) // && isArray( this.key )
    {
      return this.buildKeyFromArray( input );
    }
    else if ( isObject( input ) )
    {
      return this.buildKey( input, this.key );
    }

    return input;
  },

  // Builds a key from an array
  buildKeyFromArray: function(arr)
  {
    return arr.join( this.keySeparator );
  },

  // Gets the key from the given model
  getKey: function(model, quietly)
  {
    var key = this.key;
    var modelKey = this.buildKey( model, key );

    if ( hasFields( model, key, isValue ) )
    {
      return modelKey;
    }
    else if ( !quietly )
    {
      throw 'Composite key not supplied.';
    }

    return false;
  },

  // Gets the key from the given model
  getKeys: function(model)
  {
    return this.buildKeys( model, this.key );
  },

  buildObjectFromKey: function(key)
  {
    var db = this;

    var props = {};

    if ( isArray( db.key ) )
    {
      if ( isString( key ) )
      {
        key = key.split( db.keySeparator );
      }

      for (var i = 0; i < db.key.length; i++)
      {
        props[ db.key[ i ] ] = key[ i ];
      }
    }
    else
    {
      props[ db.key ] = key;
    }

    return db.instantiate( props );
  },

  // Sorts the models & notifies listeners that the database has been updated.
  updated: function()
  {
    this.sort(); // TODO remove
    this.trigger( NeuroDatabase.Events.Updated );
  },

  // Sets a revision comparision function for this database. It can be a field
  // name or a function. This is used to avoid updating model data that is older
  // than the model's current data.
  setRevision: function(revision)
  {
    if ( isFunction( revision ) )
    {
      this.revisionFunction = revision;
    }
    else if ( isString( revision ) )
    {
      this.revisionFunction = function(a, b)
      {
        var ar = isObject( a ) && revision in a ? a[ revision ] : undefined;
        var br = isObject( b ) && revision in b ? b[ revision ] : undefined;

        return ar === undefined || br === undefined ? false : compare( ar, br ) > 0;
      };
    }
    else
    {
      this.revisionFunction = function(a, b)
      {
        return false;
      };
    }
  },

  // Sets a comparator for this database. It can be a field name, a field name
  // with a minus in the front to sort in reverse, or a comparator function.
  setComparator: function(comparator, nullsFirst)
  {
    this.models.setComparator( comparator, nullsFirst );
  },

  addComparator: function(comparator, nullsFirst)
  {
    this.models.addComparator( comparator, nullsFirst );
  },

  setSummarize: function(summarize)
  {
    if ( isFunction( summarize ) )
    {
      this.summarize = summarize;
    }
    else if ( isString( summarize ) )
    {
      if ( indexOf( this.fields, summarize ) !== false )
      {
        this.summarize = function(model)
        {
          return isValue( model ) ? model[ summarize ] : model;
        };
      }
      else
      {
        this.summarize = createFormatter( summarize );
      }
    }
    else
    {
      this.summarize = function(model)
      {
        return model.$key();
      };
    }
  },

  // Sorts the database if it isn't sorted.
  sort: function()
  {
    this.models.resort();
  },

  // Determines whether this database is sorted.
  isSorted: function()
  {
    return this.models.isSorted();
  },

  clean: function()
  {
    var db = this;
    var keys = db.models.keys;
    var models = db.models;

    db.all = {};

    for (var i = 0; i < keys.length; i++)
    {
      db.all[ keys[ i ] ] = models[ i ];
    }
  },

  // Handles when we receive data from the server - either from
  // a publish, refresh, or values being returned on a save.
  putRemoteData: function(encoded, key, model, overwrite)
  {
    if ( !isObject( encoded ) )
    {
      return model;
    }

    var db = this;
    var key = key || db.getKey( encoded );
    var model = model || db.all[ key ];
    var decoded = db.decode( copy( encoded ) );

    // Reject the data if it's a lower revision
    if ( model )
    {
      var revisionRejected = this.revisionFunction( model, encoded );

      if ( revisionRejected )
      {
        Neuro.debug( Neuro.Debugs.SAVE_OLD_REVISION, db, model, encoded );

        return model;
      }
    }

    // If the model already exists, update it.
    if ( model )
    {
      var keyFields = db.keys;

      for (var i = 0; i < keyFields.length; i++)
      {
        var k = keyFields[ i ];
        var mk = model[ k ];
        var dk = decoded[ k ];

        if ( isValue( mk ) && isValue( dk ) && mk !== dk )
        {
          throw 'Model keys cannot be changed.';
        }
      }

      db.all[ key ] = model;

      if ( !model.$saved )
      {
        model.$saved = {};
      }

      var current = model.$toJSON( true );
      var conflicts = {};
      var conflicted = false;
      var updated = {};
      var notReallySaved = isEmpty( model.$saved );
      var relations = db.relations;

      for (var prop in encoded)
      {
        if ( prop.charAt(0) === '$' )
        {
          continue;
        }

        if ( prop in relations )
        {
          model.$set( prop, encoded[ prop ], true );

          continue;
        }

        var currentValue = current[ prop ];
        var savedValue = model.$saved[ prop ];

        if ( notReallySaved || overwrite || equals( currentValue, savedValue ) )
        {
          model[ prop ] = decoded[ prop ];
          updated[ prop ] = encoded[ prop ];

          if ( model.$local )
          {
            model.$local[ prop ] = encoded[ prop ];
          }
        }
        else
        {
          conflicts[ prop ] = encoded[ prop ];
          conflicted = true;
        }

        model.$saved[ prop ] = copy( encoded[ prop ] );
      }

      if ( conflicted )
      {
        model.$trigger( NeuroModel.Events.PartialUpdate, [encoded, conflicts] );
      }
      else
      {
        model.$trigger( NeuroModel.Events.FullUpdate, [encoded, updated] );
      }

      model.$trigger( NeuroModel.Events.RemoteUpdate, [encoded] );

      model.$addOperation( NeuroSaveNow );

      if ( !db.models.has( key ) )
      {
        db.models.put( key, model );
        db.trigger( NeuroDatabase.Events.ModelAdded, [model, true] );
      }
    }
    // The model doesn't exist, create it.
    else
    {
      model = db.createModel( decoded, true );

      if ( db.cache === Neuro.Cache.All )
      {
        model.$local = model.$toJSON( false );
        model.$local.$status = model.$status;
        model.$saved = model.$local.$saved = model.$toJSON( true );

        model.$addOperation( NeuroSaveNow );
      }
      else
      {
        model.$saved = model.$toJSON( true );
      }
    }

    return model;
  },

  createModel: function(decoded, remoteData)
  {
    var db = this;
    var model = db.instantiate( decoded, remoteData );
    var key = model.$key();

    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.trigger( NeuroDatabase.Events.ModelAdded, [model, remoteData] );
    }

    return model;
  },

  destroyLocalUncachedModel: function(model, key)
  {
    var db = this;

    if ( model )
    {
      if ( model.$hasChanges() )
      {
        delete model.$saved;

        db.removeKey( model );

        model.$trigger( NeuroModel.Events.Detach );

        return false;
      }

      delete db.all[ key ];

      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );

      model.$trigger( NeuroModel.Events.RemoteAndRemove );

      Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, model );

      return true;
    }

    return false;
  },

  destroyLocalCachedModel: function(model, key)
  {
    var db = this;

    if ( model )
    {
      // If a model was removed remotely but the model has changes - don't remove it.
      if ( model.$hasChanges() )
      {
        // Removed saved history and the current ID
        delete model.$saved;
        delete model.$local.$saved;

        db.removeKey( model );
        db.removeKey( model.$local );

        model.$trigger( NeuroModel.Events.Detach );

        model.$addOperation( NeuroSaveNow );

        return false;
      }

      model.$addOperation( NeuroRemoveNow );

      delete db.all[ key ];

      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );

      model.$trigger( NeuroModel.Events.RemoteAndRemove );

      Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, model );
    }
    else
    {
      db.store.remove( key, function(removedValue)
      {
        if (removedValue)
        {
          Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, removedValue );
        }
      });

      // The model didn't exist
      return false;
    }

    return true;
  },

  // Destroys a model locally because it doesn't exist remotely
  destroyLocalModel: function(key)
  {
    var db = this;
    var model = db.all[ key ];

    if ( db.cache === Neuro.Cache.All )
    {
      return db.destroyLocalCachedModel( model, key );
    }
    else
    {
      return db.destroyLocalUncachedModel( model, key );
    }
  },

  loadFinish: function()
  {
    var db = this;

    for (var key in db.loaded)
    {
      var model = db.loaded[ key ];

      if ( model.$status === NeuroModel.Status.RemovePending )
      {
        Neuro.debug( Neuro.Debugs.LOCAL_RESUME_DELETE, db, model );

        model.$addOperation( NeuroRemoveRemote );
      }
      else
      {
        if ( model.$status === NeuroModel.Status.SavePending )
        {
          Neuro.debug( Neuro.Debugs.LOCAL_RESUME_SAVE, db, model );

          model.$addOperation( NeuroSaveRemote );
        }
        else
        {
          Neuro.debug( Neuro.Debugs.LOCAL_LOAD_SAVED, db, model );
        }

        db.models.put( key, model, true );
      }
    }

    db.loaded = {};
    db.updated();

    if ( db.loadRemote )
    {
      if ( db.pendingOperations === 0 )
      {
        db.refresh();
      }
      else
      {
        db.firstRefresh = true;
      }
    }
  },

  loadBegin: function(onLoaded)
  {
    var db = this;

    function onLocalLoad(records, keys)
    {
      Neuro.debug( Neuro.Debugs.LOCAL_LOAD, db, records );

      for (var i = 0; i < records.length; i++)
      {
        var encoded = records[ i ];
        var key = keys[ i ];
        var decoded = db.decode( copy( encoded, true ) );
        var model = db.instantiate( decoded, true );

        model.$local = encoded;
        model.$saved = encoded.$saved;

        if ( model.$status !== NeuroModel.Status.Removed )
        {
          db.loaded[ key ] = model;
          db.all[ key ] = model;
        }
      }

      db.initialized = true;
      db.localLoaded = true;

      db.trigger( NeuroDatabase.Events.LocalLoad, [db] );

      onLoaded( true, db );
    }

    function onLocalError()
    {
      db.loadNone();

      onLoaded( false, db );
    }

    if ( db.loadRemote && db.autoRefresh )
    {
      Neuro.after( Neuro.Events.Online, db.onOnline, db );
    }

    if ( db.cache === Neuro.Cache.None )
    {
      db.loadNone();

      onLoaded( false, db );
    }
    else
    {
      db.store.all( onLocalLoad, onLocalError );
    }
  },

  loadNone: function()
  {
    var db = this;

    if ( db.loadRemote )
    {
      db.refresh();
    }
    else
    {
      db.initialized = true;
      db.trigger( NeuroDatabase.Events.NoLoad, [db] );
    }
  },

  onOnline: function()
  {
    this.afterOnline = true;

    if ( this.pendingOperations === 0 )
    {
      this.onOperationRest();
    }
  },

  onOperationRest: function()
  {
    var db = this;

    if ( ( db.autoRefresh && db.remoteLoaded && db.afterOnline ) || db.firstRefresh )
    {
      db.afterOnline = false;
      db.firstRefresh = false;

      Neuro.debug( Neuro.Debugs.AUTO_REFRESH, db );

      db.refresh();
    }
  },

  // Loads all data remotely
  refresh: function(callback, context)
  {
    var db = this;
    var callbackContext = context || db;

    function onModels(models)
    {
      var mapped = {};

      for (var i = 0; i < models.length; i++)
      {
        var model = db.putRemoteData( models[ i ] );

        if ( model )
        {
          var key = model.$key();

          mapped[ key ] = model;
        }
      }

      var keys = db.models.keys();

      for (var i = 0; i < keys.length; i++)
      {
        var k = keys[ i ];

        if ( !(k in mapped) )
        {
          var old = db.models.get( k );

          if ( old.$saved )
          {
            Neuro.debug( Neuro.Debugs.REMOTE_LOAD_REMOVE, db, k );

            db.destroyLocalModel( k );
          }
        }
      }

      db.initialized = true;
      db.remoteLoaded = true;

      db.trigger( NeuroDatabase.Events.RemoteLoad, [db] );

      db.updated();

      Neuro.debug( Neuro.Debugs.REMOTE_LOAD, db, models );

      if ( callback )
      {
        callback.call( callbackContext, db.models );
      }
    }

    function onLoadError(models, status)
    {
      if ( status === 0 )
      {
        Neuro.checkNetworkStatus();

        if ( !Neuro.online )
        {
          db.pendingRefresh = true;

          Neuro.once( 'online', db.onRefreshOnline, db );
        }

        Neuro.debug( Neuro.Debugs.REMOTE_LOAD_OFFLINE, db );
      }
      else
      {
        Neuro.debug( Neuro.Debugs.REMOTE_LOAD_ERROR, db, status );

        db.initialized = true;
        db.trigger( NeuroDatabase.Events.NoLoad, [db] );
      }

      if ( callback )
      {
        callback.call( callbackContext, db.models );
      }
    }

    db.rest.all( onModels, onLoadError );
  },

  onRefreshOnline: function()
  {
    var db = this;

    Neuro.debug( Neuro.Debugs.REMOTE_LOAD_RESUME, db );

    if ( db.pendingRefresh )
    {
      db.pendingRefresh = false;

      db.refresh();
    }
  },

  // Returns a model
  get: function(key)
  {
    return this.all[ this.buildKeyFromInput( key ) ];
  },

  filter: function(isValid)
  {
    var all = this.all;
    var filtered = [];

    for (var key in all)
    {
      var model = all[ key ];

      if ( isValid( model ) )
      {
        filtered.push( model );
      }
    }

    return filtered;
  },

  liveSave: function(key, encoded)
  {
    this.putRemoteData( encoded, key );
    this.updated();

    Neuro.debug( Neuro.Debugs.REALTIME_SAVE, this, encoded, key );
  },

  liveRemove: function(key)
  {
    if ( this.destroyLocalModel( key ) )
    {
      this.updated();
    }

    Neuro.debug( Neuro.Debugs.REALTIME_REMOVE, this, key );
  },

  // Return an instance of the model with the data as initial values
  instantiate: function(data, remoteData)
  {
    return new this.Model( data, remoteData );
  },

  addReference: function(model)
  {
    this.all[ model.$key() ] = model;
  },

  // Save the model
  save: function(model, cascade)
  {
    var db = this;

    if ( model.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_DELETED, db, model );

      return;
    }

    var key = model.$key();
    var existing = db.models.has( key );

    if ( existing )
    {
      db.trigger( NeuroDatabase.Events.ModelUpdated, [model] );

      model.$trigger( NeuroModel.Events.UpdateAndSave );
    }
    else
    {
      db.models.put( key, model );
      db.trigger( NeuroDatabase.Events.ModelAdded, [model] );
      db.updated();

      model.$trigger( NeuroModel.Events.CreateAndSave );
    }

    model.$addOperation( NeuroSaveLocal, cascade );
  },

  // Remove the model
  remove: function(model, cascade)
  {
    var db = this;

    // If we have it in the models, remove it!
    this.removeFromModels( model );

    // If we're offline and we have a pending save - cancel the pending save.
    if ( model.$status === NeuroModel.Status.SavePending )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_CANCEL_SAVE, db, model );
    }

    model.$status = NeuroModel.Status.RemovePending;

    model.$addOperation( NeuroRemoveLocal, cascade );
  },

  removeFromModels: function(model)
  {
    var db = this;
    var key = model.$key();

    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );
      db.updated();

      model.$trigger( NeuroModel.Events.Removed );
    }
  },

  refreshModel: function(model, cascade)
  {
    model.$addOperation( NeuroGetLocal, cascade );
  }

};

eventize( NeuroDatabase.prototype );
addEventFunction( NeuroDatabase.prototype, 'change', NeuroDatabase.Events.Changes );


/**
 * An instance
 *
 * @constructor
 * @memberOf Neuro
 * @alias Model
 * @param {Neuro.Database} db
 *        The database instance used in model instances.
 */
function NeuroModel(db)
{
  this.$db = db;

  /**
   * @property {NeuroDatabase} $db
   *           The reference to the database this model is stored in.
   */

  /**
   * @property {Object} [$saved]
   *           An object of encoded data representing the values saved remotely.
   *           If this object does not exist - the model hasn't been created
   *           yet.
   */

  /**
   * @property {Object} [$local]
   *           The object of encoded data that is stored locally. It's $saved
   *           property is the same object as this $saved property.
   */

  /**
   * @property {Boolean} $status
   *           Whether there is a pending save for this model.
   */
}

NeuroModel.Events =
{
  Created:              'created',
  Saved:                'saved',
  PreSave:              'pre-save',
  PostSave:             'post-save',
  PreRemove:            'pre-remove',
  PostRemove:           'post-remove',
  PartialUpdate:        'partial-update',
  FullUpdate:           'full-update',
  Updated:              'updated',
  Detach:               'detach',
  Change:               'change',
  CreateAndSave:        'created saved',
  UpdateAndSave:        'updated saved',
  KeyUpdate:            'key-update',
  RelationUpdate:       'relation-update',
  Removed:              'removed',
  RemoteUpdate:         'remote-update',
  LocalSave:            'local-save',
  LocalSaveFailure:     'local-save-failure',
  LocalSaves:           'local-save local-save-failure',
  RemoteSave:           'remote-save',
  RemoteSaveFailure:    'remote-save-failure',
  RemoteSaveOffline:    'remote-save-offline',
  RemoteSaves:          'remote-save remote-save-failure remote-save-offline',
  LocalRemove:          'local-remove',
  LocalRemoveFailure:   'local-remove-failure',
  LocalRemoves:         'local-remove local-remove-failure',
  RemoteRemove:         'remote-remove',
  RemoteRemoveFailure:  'remote-remove-failure',
  RemoteRemoveOffline:  'remote-remove-offline',
  RemoteRemoves:        'remote-remove remote-remove-failure remote-remove-offline',
  LocalGet:             'local-get',
  LocalGetFailure:      'local-get-failure',
  LocalGets:            'local-get local-get-failure',
  RemoteGet:            'remote-get',
  RemoteGetFailure:     'remote-get-failure',
  RemoteGetOffline:     'remote-get-offline',
  RemoteGets:           'remote-get remote-get-failure remote-get-offline',
  RemoteAndRemove:      'remote-remove removed',
  SavedRemoteUpdate:    'saved remote-update',
  Changes:              'saved remote-update key-update relation-update removed change'
};

NeuroModel.Status =
{
  Synced:         0,
  SavePending:    1,
  RemovePending:  2,
  Removed:        3
};

NeuroModel.Blocked =
{
  toString: true
};

NeuroModel.prototype =
{

  $init: function(props, remoteData)
  {
    this.$status = NeuroModel.Status.Synced;
    this.$operation = null;
    this.$relations = {};
    this.$dependents = {};

    if ( remoteData )
    {
      var key = this.$db.getKey( props );

      this.$db.all[ key ] = this;
      this.$set( props, void 0, remoteData );
    }
    else
    {
      this.$reset( props );
    }

    if ( this.$db.loadRelations )
    {
      var databaseRelations = this.$db.relations;

      for (var name in databaseRelations)
      {
        var relation = databaseRelations[ name ];

        if ( !relation.lazy )
        {
          this.$getRelation( name, void 0, remoteData );
        }
      }
    }
  },

  $load: function(relations)
  {
    if ( isArray( relations ) )
    {
      for (var i = 0; i < relations.length; i++)
      {
        this.$getRelation( relations[ i ] );
      }
    }
    else if ( isString( relations ) )
    {
      this.$getRelation( relations );
    }
    else
    {
      var databaseRelations = this.$db.relations;

      for (var name in databaseRelations)
      {
        this.$getRelation( name );
      }
    }
  },

  $reset: function(props)
  {
    var def = this.$db.defaults;
    var fields = this.$db.fields;
    var relations = this.$db.relations;
    var keyFields = this.$db.key;

    if ( isObject( def ) )
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];
        var defaultValue = def[ prop ];
        var evaluatedValue = evaluate( defaultValue );

        this[ prop ] = evaluatedValue;
      }

      for (var prop in relations)
      {
        if ( prop in def )
        {
          var defaultValue = def[ prop ];
          var evaluatedValue = evaluate( defaultValue );
          var relation = this.$getRelation( prop );

          relation.set( this, evaluatedValue );
        }
      }
    }
    else
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];

        this[ prop ] = undefined;
      }
    }

    var key = false;

    // First try pulling key from properties
    if ( props )
    {
      key = this.$db.getKey( props, true );
    }

    // If the key wasn't specified, try generating it on this model
    if ( key === false )
    {
      key = this.$db.getKey( this, true );
    }
    // The key was specified in the properties, apply it to this model
    else
    {
      if ( isString( keyFields ) )
      {
        this[ keyFields ] = key;
      }
      else // if ( isArray( keyFields ) )
      {
        for (var i = 0; i < keyFields.length; i++)
        {
          var k = keyFields[ i ];

          this[ k ] = props[ k ];
        }
      }
    }

    // The key exists on this model - place the reference of this model
    // in the all map and set the cached key.
    if ( key !== false )
    {
      this.$db.all[ key ] = this;
      this.$$key = key;
    }

    // Set the remaing properties
    this.$set( props );
  },

  $set: function(props, value, remoteData)
  {
    if ( isObject( props ) )
    {
      for (var prop in props)
      {
        this.$set( prop, props[ prop ], remoteData );
      }
    }
    else if ( isString( props ) )
    {
      if ( NeuroModel.Blocked[ props ] )
      {
        return;
      }

      var relation = this.$getRelation( props, value, remoteData );

      if ( relation )
      {
        relation.set( this, value, remoteData );
      }
      else
      {
        this[ props ] = value;
      }
    }

    if ( isValue( props ) )
    {
      this.$trigger( NeuroModel.Events.Change, [props, value] );
    }
  },

  $get: function(props, copyValues)
  {
    if ( isArray( props ) )
    {
      return grab( this, props, copyValues );
    }
    else if ( isObject( props ) )
    {
      for (var p in props)
      {
        props[ p ] = copyValues ? copy( this[ p ] ) : this[ p ];
      }

      return props;
    }
    else if ( isString( props ) )
    {
      if ( NeuroModel.Blocked[ props ] )
      {
        return;
      }

      var relation = this.$getRelation( props );

      if ( relation )
      {
        var values = relation.get( this );

        return copyValues ? copy( values ) : values;
      }
      else
      {
        return copyValues ? copy( this[ props ] ) : this[ props ];
      }
    }
  },

  $decode: function()
  {
    this.$db.decode( this );
  },

  $isDependentsSaved: function(callbackOnSaved, contextOnSaved)
  {
    var dependents = this.$dependents;

    for (var uid in dependents)
    {
      var dependent = dependents[ uid ];

      if ( !dependent.$isSaved() )
      {
        function onDependentSave()
        {
          callbackOnSaved.apply( contextOnSaved || this, arguments );
          off();
        }

        var off = dependent.$once( NeuroModel.Events.RemoteSaves, onDependentSave );

        return false;
      }
    }

    return true;
  },

  $relate: function(prop, relate)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.relate( this, relate );
    }
  },

  $unrelate: function(prop, unrelated)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.unrelate( this, unrelated );
    }
  },

  $isRelated: function(prop, related)
  {
    var relation = this.$getRelation( prop );

    return relation && relation.isRelated( this, related );
  },

  $getRelation: function(prop, initialValue, remoteData)
  {
    var databaseRelations = this.$db.relations;
    var relation = databaseRelations[ prop ];

    if ( relation )
    {
      if ( !(prop in this.$relations) )
      {
        relation.load( this, initialValue, remoteData );
      }

      return relation;
    }

    return false;
  },

  $save: function(setProperties, setValue, cascade)
  {
    if ( this.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_DELETED, this.$db, this );

      return false;
    }

    var cascade =
      (arguments.length === 3 ? cascade :
        (arguments.length === 2 && isObject( setProperties ) && isNumber( setValue ) ? setValue :
          (arguments.length === 1 && isNumber( setProperties ) ?  setProperties : Neuro.Cascade.All ) ) );

    this.$db.addReference( this );

    this.$set( setProperties, setValue );

    this.$trigger( NeuroModel.Events.PreSave, [this] );

    this.$db.save( this, cascade );

    this.$trigger( NeuroModel.Events.PostSave, [this] );
  },

  $remove: function(cascade)
  {
    if ( this.$exists() )
    {
      this.$trigger( NeuroModel.Events.PreRemove, [this] );

      this.$db.remove( this, cascade );

      this.$trigger( NeuroModel.Events.PostRemove, [this] );
    }
  },

  $refresh: function(cascade)
  {
    this.$db.refreshModel( this, cascade );
  },

  $cancel: function(reset)
  {
    if ( this.$saved )
    {
      this.$save( this.$saved );
    }
    else if ( reset )
    {
      this.$reset();
    }
  },

  $clone: function(properties)
  {
    // If field is given, evaluate the value and use it instead of value on this object
    // If relation is given, call clone on relation

    var db = this.$db;
    var key = db.key;
    var fields = db.fields;
    var relations = db.relations;
    var values = {};

    for (var i = 0; i < fields.length; i++)
    {
      var f = fields[ i ];

      if ( properties && f in properties )
      {
        values[ f ] = evaluate( properties[ f ] );
      }
      else if ( f in this )
      {
        values[ f ] = copy( this[ f ] );
      }
    }

    if ( isString( key ) )
    {
      delete values[ key ];
    }

    var cloneKey = db.getKey( values );
    var modelKey = this.$key();

    if ( cloneKey === modelKey )
    {
      throw 'A clone cannot have the same key as the original model.';
    }

    for (var relationName in relations)
    {
      if ( properties && relationName in properties )
      {
        relations[ relationName ].clone( this, values, properties[ relationName ] );
      }
    }

    return db.instantiate( values );
  },

  $push: function(fields)
  {
    this.$savedState = this.$db.encode( grab( this, fields || this.$db.fields, true ) );
  },

  $pop: function(dontDiscard)
  {
    if ( isObject( this.$savedState ) )
    {
      this.$set( this.$savedState );

      if ( !dontDiscard )
      {
        this.$discard();
      }
    }
  },

  $discard: function()
  {
    delete this.$savedState;
  },

  $exists: function()
  {
    return !this.$isDeleted() && this.$db.models.has( this.$key() );
  },

  $addOperation: function(OperationType, cascade)
  {
    var operation = new OperationType( this, cascade );

    if ( !this.$operation )
    {
      this.$operation = operation;
      this.$operation.execute();
    }
    else
    {
      this.$operation.queue( operation );
    }
  },

  $toJSON: function( forSaving )
  {
    var encoded = this.$db.encode( grab( this, this.$db.fields, true ) );

    var databaseRelations = this.$db.relations;
    var relations = this.$relations;

    for (var name in relations)
    {
      databaseRelations[ name ].encode( this, encoded, forSaving );
    }

    return encoded;
  },

  $change: function()
  {
    this.$trigger( NeuroModel.Events.Change );
  },

  $key: function(quietly)
  {
    if ( !this.$$key )
    {
      this.$$key = this.$db.getKey( this, quietly );
    }

    return this.$$key;
  },

  $keys: function()
  {
    return this.$db.getKeys( this );
  },

  $uid: function()
  {
    return this.$db.name + '$' + this.$key();
  },

  $hasKey: function()
  {
    return hasFields( this, this.$db.key, isValue );
  },

  $isSynced: function()
  {
    return this.$status === NeuroModel.Status.Synced;
  },

  $isPending: function()
  {
    return this.$status === NeuroModel.Status.SavePending;
  },

  $isDeleted: function()
  {
    return this.$status >= NeuroModel.Status.RemovePending;
  },

  $isSaved: function()
  {
    return !!this.$saved;
  },

  $isSavedLocally: function()
  {
    return !!this.$local;
  },

  $isNew: function()
  {
    return !(this.$saved || this.$local);
  },

  $getChanges: function(alreadyEncoded)
  {
    var saved = this.$saved;
    var encoded = alreadyEncoded || this.$toJSON( true );
    var fields = this.$db.saveFields;

    return saved ? diff( encoded, saved, fields, equals ) : encoded;
  },

  $hasChanges: function()
  {
    if (!this.$saved)
    {
      return true;
    }

    var ignore = this.$db.ignoredFields;
    var encoded = this.$toJSON( true );
    var saved = this.$saved;

    for (var prop in encoded)
    {
      var currentValue = encoded[ prop ];
      var savedValue = saved[ prop ];

      if ( ignore[ prop ] )
      {
        continue;
      }

      if ( !equals( currentValue, savedValue ) )
      {
        return true;
      }
    }

    return false;
  },

  toString: function()
  {
    return this.$db.className + ' ' + JSON.stringify( this.$toJSON() );
  }

};

eventize( NeuroModel.prototype, true );
addEventFunction( NeuroModel.prototype, '$change', NeuroModel.Events.Changes, true );


/**
 * A NeuroMap has the key-to-value benefits of a map and iteration benefits of an
 * array. This is especially beneficial when most of the time the contents of 
 * the structure need to be iterated and order doesn't matter (since removal 
 * performs a swap which breaks insertion order).
 *
 * @constructor
 * @memberOf Neuro
 * @alias Map
 */
function NeuroMap()
{
  /**
   * An array of the values in this map.
   * @member {Array}
   */
  this.values = [];

  /**
   * An array of the keys in this map.
   * @type {Array}
   */
  this.keys = [];

  /**
   * An object of key to index mappings.
   * @type {Object}
   */
  this.indices = {};
}

NeuroMap.prototype =
{

  /**
   * Resets the map by initializing the values, keys, and indexes.
   * 
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  reset: function()
  {
    this.values.length = 0;
    this.keys.length = 0;
    this.indices = {};

    return this;
  },

  /**
   * Puts the value in the map by the given key.
   *
   * @param {String} key
   * @param {V} value
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  put: function(key, value)
  {
    if ( key in this.indices )
    {
      this.values[ this.indices[ key ] ] = value;
    }
    else
    {
      this.indices[ key ] = this.values.length;
      this.values.push( value );
      this.keys.push( key );
    }

    return this;
  },

  /**
   * Returns the value mapped by the given key.
   *
   * @param {String} key
   * @return {V}
   */
  get: function(key)
  {
    return this.values[ this.indices[ key ] ];
  },

  /**
   * Removes the value by a given key
   *
   * @param {String} key
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  remove: function(key)
  {
    var index = this.indices[ key ];

    if ( isNumber( index ) )
    {
      this.removeAt( index );
    }

    return this;
  },

  /**
   * Removes the value & key at the given index.
   *
   * @param {Number} index
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  removeAt: function(index)
  {
    var key = this.keys[ index ];
    var lastValue = this.values.pop();
    var lastKey = this.keys.pop();

    if ( index < this.values.length )
    {
      this.values[ index ] = lastValue;
      this.keys[ index ] = lastKey;
      this.indices[ lastKey ] = index;
    }

    delete this.indices[ key ];

    return this;
  },

  /**
   * Returns whether this map has a value for the given key.
   *
   * @param {String} key
   * @return {Boolean}
   */
  has: function(key)
  {
    return key in this.indices;
  },

  /**
   * Returns the number of elements in the map.
   *
   * @return {Number}
   */
  size: function()
  {
    return this.values.length;
  },

  subtract: function(map, dest)
  {
    var out = dest || new NeuroMap();
    var n = this.size();
    var values = this.values;
    var keys = this.keys;

    for (var i = 0; i < n; i++)
    {
      var v = values[ i ];
      var k = keys[ i ];

      if ( !map.has( k ) )
      {
        out.put( k, v );
      }
    }

    return out;
  },

  /**
   * Passes all values & keys in this map to a callback and if it returns a 
   * truthy value then the key and value are placed in the destination map.
   * 
   * @param  {Function} callback [description]
   * @param  {Neuro.Map} [dest]     [description]
   * @return {Neuro.Map}            [description]
   */
  filter: function(callback, dest)
  {
    var out = dest || new NeuroMap();
    var n = this.size();
    var values = this.values;
    var keys = this.keys;

    for (var i = 0; i < n; i++)
    {
      var v = values[ i ];
      var k = keys[ i ];

      if ( callback( v, k ) )
      {
        out.put( k, v );
      }
    }

    return out;
  },

  /**
   * Reverses the order of the underlying values & keys.
   * 
   * @return {Neuro.Map} -
   *         The referense to this map.
   */
  reverse: function()
  {
    var max = this.size() - 1;
    var half = Math.ceil( max / 2 );

    for (var i = 0; i < half; i++)
    {
      swap( this.values, i, max - i );
      swap( this.keys, i, max - i );
    }

    this.rebuildIndex();

    return this;
  },

  /**
   * 
   * @param  {function}  comparator [description]
   * @return {Boolean}            [description]
   */
  isSorted: function(comparator)
  {
    return isSorted( comparator, this.values );
  },

  /**
   * Sorts the underlying values & keys given a value compare function.
   * 
   * @param  {function} comparator
   *         A function which accepts two values and returns a number used for
   *         sorting. If the first argument is less than the second argument, a
   *         negative number should be returned. If the arguments are equivalent
   *         then 0 should be returned, otherwise a positive number should be
   *         returned.
   * @return {NeuroMap} -
   *         The reference to this map.
   */
  sort: function(comparator)
  {
    var map = this;

    // Sort this partition!
    function partition(left, right)
    {
      var pivot = map.values[ Math.floor((right + left) / 2) ];
      var i = left;
      var j = right;

      while (i <= j) 
      {
        while (comparator( map.values[i], pivot ) < 0) i++
        while (comparator( map.values[j], pivot ) > 0) j--;

        if (i <= j) {
          swap( map.values, i, j );
          swap( map.keys, i, j );
          i++;
          j--;
        }
      }

      return i;
    }

    // Quicksort
    function qsort(left, right)
    {
      var index = partition( left, right );

      if (left < index - 1) 
      {
        qsort( left, index - 1 );
      }

      if (index < right) 
      {
        qsort( index, right );
      }
    }

    var right = this.size() - 1;

    // Are there elements to sort?
    if ( right > 0 )
    {
      qsort( 0, right );

      this.rebuildIndex();
    }

    return this;
  },

  /**
   * Rebuilds the index based on the keys.
   * 
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  rebuildIndex: function()
  {
    this.indices = {};

    for (var i = 0, l = this.keys.length; i < l; i++)
    {
      this.indices[ this.keys[ i ] ] = i;
    }

    return this;
  }

};
function NeuroCollection(values)
{
  this.addAll( values );
}

NeuroCollection.Events =
{
  Add:            'add',
  Adds:           'adds',
  Sort:           'sort',
  Remove:         'remove',
  Removes:        'removes',
  Updates:        'updates',
  Reset:          'reset',
  Cleared:        'cleared',
  Changes:        'add adds sort remove removes updates reset cleared'
};

extendArray( Array, NeuroCollection, 
{

  setComparator: function(comparator, nullsFirst)
  {
    this.comparator = createComparator( comparator, nullsFirst );
    this.resort();

    return this;
  },

  addComparator: function(comparator, nullsFirst)
  {
    this.comparator = addComparator( this.comparator, comparator, nullsFirst );
    this.resort();

    return this;
  },

  isSorted: function(comparator, nullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, nullsFirst ) : this.comparator;

    return isSorted( cmp, this );
  },

  resort: function(comparator, nullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, nullsFirst ) : this.comparator;

    if ( !isSorted( cmp, this ) )
    {
      this.sort( cmp );
      this.trigger( NeuroCollection.Events.Sort, [this] );
    }

    return this;
  },

  page: function(pageSize, pageIndex)
  {
    return new NeuroPage( this, pageSize, pageIndex );
  },

  filtered: function(whereProperties, whereValue, whereEquals)
  {
    var filter = createWhere( whereProperties, whereValue, whereEquals );

    return new NeuroFilteredCollection( this, filter );
  },

  filter: function(whereProperties, whereValue, whereEquals)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var target = new this.constructor();

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];

      if ( where( a ) )
      {
        target.add( a );
      }
    }

    return target;
  },

  subtract: function(collection, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];
      var exists = false;

      for (var j = 0; j < collection.length && !exists; j++)
      {
        exists = equals( a, collection[ j ] );
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  intersect: function(collection, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < collection.length; i++)
    {
      var a = collection[ i ];
      var exists = false;

      for (var j = 0; j < this.length && !exists; j++)
      {
        exists = equals( a, this[ j ] );
      }

      if (exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  complement: function(collection, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < collection.length; i++)
    {
      var a = collection[ i ];
      var exists = false;

      for (var j = 0; j < this.length && !exists; j++)
      {
        exists = equals( a, this[ j ] );
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  clear: function()
  {
    this.length = 0;
    this.trigger( NeuroCollection.Events.Cleared, [this] );
  },

  add: function(value, delaySort)
  {
    this.push( value );
    this.trigger( NeuroCollection.Events.Add, [this, value] );

    if ( !delaySort )
    {
      this.resort();
    }
  },

  addAll: function(values, delaySort)
  {
    if ( isArray( values ) && values.length )
    {
      this.push.apply( this, values );
      this.trigger( NeuroCollection.Events.Adds, [this, values] );

      if ( !delaySort )
      {
        this.resort();
      }
    }
  },

  removeAt: function(i, delaySort)
  {
    if (i >= 0 && i < this.length)
    {
      var removing = this[ i ];

      this.splice( i, 1 );
      this.trigger( NeuroCollection.Events.Remove, [this, removing, i] );

      if ( !delaySort )
      {
        this.resort();
      }
    }
  },

  remove: function(value)
  {
    var i = this.indexOf( value );

    if ( i !== -1 )
    {
      this.removeAt( i );
    }
  },

  removeAll: function(values, equals, delaySort)
  {
    if ( isArray( values ) && values.length )
    {
      var removed = [];

      for (var i = 0; i < values.length; i++)
      {
        var value = values[ i ];
        var k = this.indexOf( value, equals );

        if ( k !== -1 )
        {
          this.splice( k, 1 );
          removed.push( value );
        }
      }

      this.trigger( NeuroCollection.Events.Removes, [this, removed] );

      if ( !delaySort )
      {
        this.resort();
      }

      return removed;
    }
  },

  removeWhere: function(whereProperties, whereValue, whereEquals)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var removed = [];

    for (var i = this.length - 1; i >= 0; i--)
    {
      var value = this[ i ];
      
      if ( where( value ) )
      {
        this.splice( i, 1 );
        removed.push( value );
      }
    }

    this.trigger( NeuroCollection.Events.Removes, [this, removed] );
    this.resort();

    return removed;
  },

  indexOf: function(value, equals)
  {
    var equality = equals || equalsStrict;

    for (var i = 0; i < this.length; i++)
    {
      if ( equality( value, this[ i ] ) )
      {
        return i;
      }
    }

    return -1;
  },

  insertAt: function(i, value, delaySort)
  {
    this.splice( i, 0, value );
    this.trigger( NeuroCollection.Events.Add, [this, value] );

    if ( !delaySort )
    {
      this.resort();
    }
  },

  minModel: function(comparator)
  {
    var cmp = createComparator( comparator || this.comparator, false );
    var min = undefined;

    for (var i = 0; i < this.length; i++)
    {
      if ( cmp( min, this[i] ) > 0 )
      {
        min = this[i];
      }
    }

    return min;
  },

  maxModel: function(comparator)
  {
    var cmp = createComparator( comparator || this.comparator, true );
    var max = undefined;

    for (var i = 0; i < this.length; i++)
    {
      if ( cmp( max, this[i] ) < 0 )
      {
        max = this[i];
      }
    }

    return max;
  },

  min: function(properties, delim)
  {
    var resolver = createPropertyResolver( properties, delim );
    var min = undefined;

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( compare( min, resolved, false ) > 0 )
      {
        min = resolved;
      }
    }

    return min;
  },

  max: function(properties, delim)
  {
    var resolver = createPropertyResolver( properties, delim );
    var max = undefined;

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( compare( max, resolved, true ) < 0 )
      {
        max = resolved;
      }
    }

    return max;
  },

  firstWhere: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        return model;
      }
    }

    return null;
  },

  first: function(properties, delim)
  {
    var resolver = createPropertyResolver( properties, delim );

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( isValue( resolved ) )
      {
        return resolved;
      }
    }
  },

  lastWhere: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );

    for (var i = this.length - 1; i >= 0; i--)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        return model;
      }
    }

    return null;
  },

  last: function(properties, delim)
  {
    var resolver = createPropertyResolver( properties, delim );

    for (var i = this.length - 1; i >= 0; i--)
    {
      var resolved = resolver( this[ i ] );

      if ( isValue( resolved ) )
      {
        return resolved;
      }
    }
  },

  aggregate: function(resolver, validator, process, getResult)
  {
    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( validator( resolved ) )
      {
        process( resolved );
      }
    }

    return getResult();
  },

  sum: function(numbers)
  {
    var resolver = createNumberResolver( numbers );
    var result = 0;

    function process(x)
    {
      result += x;
    }

    function getResult()
    {
      return result;
    }

    return this.aggregate( resolver, isNumber, process, getResult );
  },

  avg: function(numbers)
  {
    var resolver = createNumberResolver( numbers );
    var result = 0;
    var total = 0;

    function process(x)
    {
      result += x;
      total++;
    }

    function getResult()
    {
      return total === 0 ? 0 : result / total;
    }

    return this.aggregate( resolver, isNumber, process, getResult );
  },

  countWhere: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );
    var met = 0;

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        met++;
      }
    }

    return met;
  },

  count: function(properties)
  {
    if ( !isValue( properties ) )
    {
      return this.length;
    }

    var resolver = createPropertyResolver( properties );
    var result = 0;

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( isValue( resolved ) )
      {
        result++;
      }
    }

    return result;
  },

  pluck: function(values, keys, valuesDelim, keysDelim)
  {
    var valuesResolver = createPropertyResolver( values, valuesDelim );

    if ( keys )
    {
      var keysResolver = createPropertyResolver( keys, keysDelim );
      var result = {};
      
      for (var i = 0; i < this.length; i++)
      {
        var model = this[ i ];
        var value = valuesResolver( model );
        var key = keysResolver( model );

        result[ key ] = value;
      }

      return result;
    }
    else
    {
      var result = [];

      for (var i = 0; i < this.length; i++)
      {
        var model = this[ i ];
        var value = valuesResolver( model );

        result.push( value );
      }

      return result;
    }
  },

  each: function(callback, context)
  {
    var callbackContext = context || this;

    for (var i = 0; i < this.length; i++)
    {
      callback.call( context, this[ i ], i );
    }
  },

  reduce: function(reducer, initialValue)
  {
    for (var i = 0; i < this.length; i++)
    {
      initialValue = reducer( initialValue, this[ i ] );
    }

    return initialValue;
  },

  random: function()
  {
    var i = Math.floor( Math.random() * this.length );

    return this[ i ];
  },

  chunk: function(chunkSize, out)
  {
    var outer = out || [];
    var outerIndex = 0;
    var inner = outer[ outerIndex ] = outer[ outerIndex ] || [];
    var innerIndex = 0;

    for (var i = 0; i < this.length; i++)
    {
      inner[ innerIndex ] = this[ i ];

      if ( ++innerIndex >= chunkSize )
      {
        innerIndex = 0;
        outerIndex++;
        inner.length = chunkSize;
        inner = outer[ outerIndex ] = outer[ outerIndex ] || [];
      }
    }

    if ( innerIndex !== 0 )
    {
      outerIndex++;
    }

    inner.length = innerIndex;
    outer.length = outerIndex;

    return outer;
  },

  where: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );
    var result = [];

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        result.push( model );
      }
    }

    return result;
  },

  contains: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        return true;
      }
    }

    return false;
  },

  toArray: function()
  {
    return this.slice();
  },

  group: function(grouping)
  {
    var by = createPropertyResolver( grouping.by, grouping.bySeparator || '/' );
    var having = createHaving( grouping.having );
    var select = grouping.select || {};
    var map = {};

    if ( isString( grouping.by ) )
    {
      if ( !(grouping.by in select) )
      {
        select[ grouping.by ] = 'first';
      }
    }
    else if ( isArray( grouping.by ) )
    {
      for (var prop in grouping.by)
      {
        if ( !(prop in select) )
        {
          select[ prop ] = 'first';
        }
      }
    }

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];
      var key = by( model );
      var group = map[ key ];

      if ( !group )
      {
        group = map[ key ] = new this.constructor();
      }

      group.add( model, true );
    }

    var groupings = new this.constructor();

    groupings.setComparator( grouping.comparator, grouping.comparatorNullsFirst );

    for (var key in map)
    {
      var grouped = {};
      var groupArray = map[ key ];

      for (var propName in select)
      {
        var aggregator = select[ propName ];

        if ( isString( aggregator ) )
        {
          grouped[ propName ] = groupArray[ aggregator ]( propName );
        }
        else if ( isFunction( aggregator ) )
        {
          grouped[ propName ] = aggregator( groupArray, propName );
        }
      }

      if ( grouping.track !== false )
      {
        grouped.$group = groupArray;
      }

      if ( grouping.count !== false )
      {
        grouped.$count = groupArray.length;
      }

      if ( having( grouped ) )
      {
        groupings.push( grouped );        
      }
    }

    groupings.resort();

    return groupings;
  }

});

eventize( NeuroCollection.prototype );
addEventFunction( NeuroCollection.prototype, 'change', NeuroCollection.Events.Changes );
function NeuroFilteredCollection(base, filter)
{
  this.onAdd      = bind( this, this.handleAdd );
  this.onAdds     = bind( this, this.handleAdds );
  this.onRemove   = bind( this, this.handleRemove );
  this.onRemoves  = bind( this, this.handleRemoves );
  this.onReset    = bind( this, this.handleReset );
  this.onUpdates  = bind( this, this.handleUpdates );
  this.onCleared  = bind( this, this.handleCleared );

  this.init( base, filter );
}

extendArray( NeuroCollection, NeuroFilteredCollection,
{
  init: function(base, filter)
  {
    if ( this.base !== base )
    {
      if ( this.base )
      {
        this.disconnect();
      }

      this.base = base;
      this.connect();
    }

    this.filter = filter;
    this.sync();
  },

  setFilter: function(whereProperties, whereValue, whereEquals)
  {
    this.filter = createWhere( whereProperties, whereValue, whereEquals );
    this.sync();
  },

  connect: function()
  {
    this.base.on( NeuroCollection.Events.Add, this.onAdd );
    this.base.on( NeuroCollection.Events.Adds, this.onAdds );
    this.base.on( NeuroCollection.Events.Remove, this.onRemove );
    this.base.on( NeuroCollection.Events.Removes, this.onRemoves );
    this.base.on( NeuroCollection.Events.Reset, this.onReset );
    this.base.on( NeuroCollection.Events.Updates, this.onUpdates );
    this.base.on( NeuroCollection.Events.Cleared, this.onClear );
  },

  disconnect: function()
  {
    this.base.off( NeuroCollection.Events.Add, this.onAdd );
    this.base.off( NeuroCollection.Events.Adds, this.onAdds );
    this.base.off( NeuroCollection.Events.Remove, this.onRemove );
    this.base.off( NeuroCollection.Events.Removes, this.onRemoves );
    this.base.off( NeuroCollection.Events.Reset, this.onReset );
    this.base.off( NeuroCollection.Events.Updates, this.onUpdates );
    this.base.off( NeuroCollection.Events.Cleared, this.onClear );
  },

  sync: function()
  {
    var base = this.base;
    var filter = this.filter;

    this.length = 0;

    for (var i = 0; i < base.length; i++)
    {
      var value = base[ i ];

      if ( filter( value ) )
      {
        this.push( value );
      }
    }

    this.trigger( NeuroCollection.Events.Reset, [this] );
  },

  handleAdd: function(collection, value)
  {
    var filter = this.filter;

    if ( filter( value ) )
    {
      this.add( value );
    }
  },

  handleAdds: function(collection, values)
  {
    var filter = this.filter;
    var filtered = [];

    for (var i = 0; i < values.length; i++)
    {
      var value = values[ i ];

      if ( filter( value ) )
      {
        filtered.push( value );
      }
    }

    this.addAll( filtered );
  },

  handleRemove: function(collection, value)
  {
    this.remove( value );
  },

  handleRemoves: function(collection, values)
  {
    this.removeAll( values );
  },

  handleReset: function(collection)
  {
    this.sync();
  },

  handleUpdates: function(collection, updates)
  {
    var filter = this.filter;

    for (var i = 0; i < updates.length; i++)
    {
      var value = updates[ i ];

      if ( filter( value ) )
      {
        this.add( value, true );
      }
      else
      {
        this.remove( value, true );
      }
    }

    this.resort();
  },

  handleCleared: function(collection)
  {
    this.clear();
  }

});
function NeuroModelCollection(database, models, remoteData)
{
  this.init( database, models, remoteData );
}

extendArray( NeuroCollection, NeuroModelCollection, 
{

  init: function(database, models, remoteData)
  {
    this.map = new NeuroMap();
    this.map.values = this;
    this.database = database;
    this.reset( models, remoteData );
  },

  resort: function(comparator, comparatorNullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, comparatorNullsFirst ) : this.comparator;

    if ( !isSorted( cmp, this ) )
    {
      this.map.sort( cmp );
      this.trigger( NeuroCollection.Events.Sort, [this] );
    }
  },

  buildKeyFromInput: function(input)
  {
    return this.database.buildKeyFromInput( input );
  },

  parseModel: function(input, remoteData)
  {
    return this.database.parseModel( input, remoteData );
  },

  subtract: function(models, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];
      var key = a.$key();
      var exists = false;

      if ( models instanceof NeuroModelCollection )
      {
        exists = models.has( key );
      }
      else
      {
        for (var i = 0; i < models.length && !exists; i++)
        {
          var modelKey = this.buildKeyFromInput( models[ i ] );

          exists = (key === modelKey);
        }
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  intersect: function(models, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < models.length; i++)
    {
      var a = models[ i ];
      var key = this.buildKeyFromInput( a );

      if ( this.has( key ) )
      {
        target.push( a );
      }
    }

    return target;
  },

  complement: function(models, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < models.length; i++)
    {
      var a = models[ i ];
      var key = this.buildKeyFromInput( a );

      if ( !this.has( key ) )
      {
        target.push( a );
      }
    }

    return target;
  },

  clear: function()
  {
    return this.map.reset();
  },

  reset: function(models, remoteData)
  {
    var map = this.map;

    map.reset();

    if ( isArray( models ) )
    {
      for (var i = 0; i < models.length; i++)
      {
        var model = models[ i ];
        var parsed = this.parseModel( model, remoteData );

        if ( parsed )
        {
          map.put( parsed.$key(), parsed );
        }
      }
    }
    else if ( isObject( models ) )
    {
      var parsed = this.parseModel( models, remoteData );

      if ( parsed )
      {
        map.put( parsed.$key(), parsed );
      }
    }

    this.trigger( NeuroCollection.Events.Reset, [this] );
    this.resort();
  },

  add: function(model, delaySort)
  {
    this.map.put( model.$key(), model );
    this.trigger( NeuroCollection.Events.Add, [this, model] );

    if ( !delaySort )
    {
      this.resort();
    }
  },

  addAll: function(models, delaySort)
  {
    if ( isArray( models ) )
    {
      for (var i = 0; i < models.length; i++)
      {
        var model = models[ i ];

        this.map.put( model.$key(), model );
      }

      this.trigger( NeuroCollection.Events.Adds, [this, models] );

      if ( !delaySort )
      {
        this.resort();
      }
    }
  },

  put: function(key, model, delaySort)
  {
    this.map.put( key, model );
    this.trigger( NeuroCollection.Events.Add, [this, model] );

    if ( !delaySort )
    {
      this.resort();
    }
  },

  has: function(key)
  {
    return this.map.has( key );
  },

  get: function(key)
  {
    return this.map.get( key );
  },

  remove: function(input, delaySort)
  {
    var key = this.buildKeyFromInput( input );
    var removing = this.map.get( key );

    if ( removing )
    {
      this.map.remove( key );
      this.trigger( NeuroCollection.Events.Remove, [this, removing, input] );

      if ( !delaySort )
      {
        this.resort();
      }
    }
  },

  removeAll: function(inputs, delaySort)
  {
    var map = this.map;
    var removed = [];

    for (var i = 0; i < inputs.length; i++)
    {
      var key = this.buildKeyFromInput( inputs[ i ] );
      var removing = map.get( key );

      if ( removing )
      {
        map.remove( key );
        removed.push( removing );
      }
    }

    this.trigger( NeuroCollection.Events.Removes, [this, removed] );

    if ( !delaySort )
    {
      this.resort();
    }

    return removed;
  },

  indexOf: function(input)
  {
    var key = this.buildKeyFromInput( input );
    var index = this.map.indices[ key ];

    return index === undefined ? -1 : index;
  },

  rebuild: function()
  {
    this.map.rebuildIndex();
  },

  keys: function()
  {
    return this.map.keys;
  },

  reverse: function()
  {
    this.map.reverse();
  },

  removeWhere: function(callRemove, whereProperties, whereValue, whereEquals)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var removed = [];

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];
      var key = model.$key();

      if ( where( model ) )
      {
        this.map.remove( key );
        removed.push( model );

        if ( callRemove )
        {
          model.$remove();
        }
      }
    }

    this.trigger( NeuroCollection.Events.Removes, [this, removed] );
    this.resort();

    return removed;
  },

  update: function(props, value, remoteData)
  {
    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      model.$set( props, value, remoteData );
      model.$save();
    }

    this.trigger( NeuroCollection.Events.Updates, [this, this] );
    this.resort();

    return this;
  },

  updateWhere: function(where, props, value, remoteData)
  {
    var updated = [];

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        model.$set( props, value, remoteData );
        model.$save();   

        updated.push( model );     
      }
    }

    this.trigger( NeuroCollection.Events.Updates, [this, updated] );
    this.resort();

    return updated;
  }

});

function NeuroRelationCollection(database, model, relator)
{
  this.model = model;
  this.relator = relator;
  
  this.init( database );
}

extendArray( NeuroModelCollection, NeuroRelationCollection,
{

  set: function(input)
  {
    this.relator.set( this.model, input );
  },
  
  relate: function(input)
  {
    this.relator.relate( this.model, input );
  },
  
  unrelate: function(input)
  {
    this.relator.unrelate( this.model, input );
  },
  
  isRelated: function(input)
  {
    return this.relator.isRelated( this.model, input );
  }

});
function NeuroDiscriminateCollection(collection, discriminator, discriminatorsToModel)
{
  collection.discriminator = discriminator;
  collection.discriminatorsToModel = discriminatorsToModel;

  collection.buildKeyFromInput = function(input)
  {
    if ( isObject( input ) )
    {
      var discriminatedValue = input[ this.discriminator ];
      var model = this.discriminatorsToModel[ discriminatedValue ];

      if ( model )
      {
        return model.Database.buildKeyFromInput( input );
      }
    }
    
    return input;
  };

  collection.parseModel = function(input, remoteData)
  {
    var discriminatedValue = input[ this.discriminator ];
    var model = this.discriminatorsToModel[ discriminatedValue ];

    return model ? model.Database.parseModel( input, remoteData ) : null;
  };

  return collection;
}
function NeuroQuery(database, whereProperties, whereValue, whereEquals)
{
  this.onModelAdd     = bind( this, this.handleModelAdded );
  this.onModelRemoved = bind( this, this.handleModelRemoved );
  this.onModelUpdated = bind( this, this.handleModelUpdated );

  this.init( database );
  this.connect();
  this.setWhere( whereProperties, whereValue, whereEquals );
}

extendArray( NeuroModelCollection, NeuroQuery,
{

  setWhere: function(whereProperties, whereValue, whereEquals)
  {
    this.where = createWhere( whereProperties, whereValue, whereEquals );
    this.sync();
  },

  connect: function()
  {
    this.database.on( NeuroDatabase.Events.ModelAdded, this.onModelAdd );
    this.database.on( NeuroDatabase.Events.ModelRemoved, this.onModelRemoved );
    this.database.on( NeuroDatabase.Events.ModelUpdated, this.onModelUpdated );
  },

  disconnect: function()
  {
    this.database.off( NeuroDatabase.Events.ModelAdded, this.onModelAdd );
    this.database.off( NeuroDatabase.Events.ModelRemoved, this.onModelRemoved );
    this.database.off( NeuroDatabase.Events.ModelUpdated, this.onModelUpdated );
  },

  sync: function()
  {
    var where = this.where;
    var map = this.map;
    var models = this.database.models;

    map.reset();

    for (var i = 0; i < models.length; i++)
    {
      var model = models[ i ];

      if ( where( model ) )
      {
        map.put( model.$key(), model );
      }
    }

    this.trigger( NeuroCollection.Events.Reset, [this] );
  },

  handleModelAdded: function(model, remoteData)
  {
    if ( this.where( model ) )
    {
      this.add( model );
    }
  },

  handleModelRemoved: function(model)
  {
    this.remove( model );
  },

  handleModelUpdated: function(model, remoteData)
  {
    var key = model.$key();

    if ( this.map.has( key ) )
    {
      if ( !this.where( model ) )
      {
        this.remove( model );
      }
    }
    else
    {
      if ( this.where( model ) )
      {
        this.add( model );
      }
    }
  }

});
function NeuroRemoteQuery(database, query)
{
  this.init( database );
  this.query = query;
  this.status = NeuroRemoteQuery.Status.Success;

  this.onSuccess = bind( this, this.handleSuccess );
  this.onFailure = bind( this, this.handleFailure );
}

NeuroRemoteQuery.Status =
{
  Pending:    'pending',
  Success:    'success',
  Failure:    'failure'
};

NeuroRemoteQuery.Events = 
{
  Ready:      'ready',
  Success:    'success',
  Failure:    'failure'
};

extendArray( NeuroQuery, NeuroRemoteQuery, 
{

  setQuery: function(query, skipSync, clearPending)
  {
    this.query = query;

    if ( !skipSync )
    {
      this.sync( clearPending );
    }

    return this;
  },

  sync: function(clearPending)
  {
    this.status = NeuroRemoteQuery.Status.Pending;

    if ( clearPending )
    {
      this.cancel();
    }

    this.database.rest.query( this.query, this.onSuccess, this.onFailure );

    return this;
  },

  cancel: function()
  {
    this.off( NeuroRemoteQuery.Events.Ready );
    this.off( NeuroRemoteQuery.Events.Success );
    this.off( NeuroRemoteQuery.Events.Failure );

    return this;
  },

  ready: function(callback, context)
  {
    if ( this.status === NeuroRemoteQuery.Status.Pending )
    {
      this.once( NeuroRemoteQuery.Events.Ready, callback, context );
    }
    else
    {
      callback.call( context, this );
    }

    return this;
  },

  success: function(callback, context)
  {
    if ( this.status === NeuroRemoteQuery.Status.Pending )
    {
      this.once( NeuroRemoteQuery.Events.Success, callback, context );
    }
    else if ( this.status === NeuroRemoteQuery.Status.Success )
    {
      callback.call( context, this );
    }

    return this;
  },

  failure: function(callback, context)
  {
    if ( this.status === NeuroRemoteQuery.Status.Pending )
    {
      this.once( NeuroRemoteQuery.Events.Failure, callback, context );
    }
    else if ( this.status === NeuroRemoteQuery.Status.Failure )
    {
      callback.call( context, this );
    }
    
    return this;
  },

  handleSuccess: function(models)
  {
    this.status = NeuroRemoteQuery.Status.Success;
    this.reset( models, true );
    this.off( NeuroRemoteQuery.Events.Failure, this.onFailure );
    this.trigger( NeuroRemoteQuery.Events.Ready, [this] );
    this.trigger( NeuroRemoteQuery.Events.Success, [this] );
  },

  handleFailure: function(models, error)
  {
    this.status = NeuroRemoteQuery.Status.Failure;
    this.off( NeuroRemoteQuery.Events.Success, this.onSuccess );
    this.trigger( NeuroRemoteQuery.Events.Ready, [this] );
    this.trigger( NeuroRemoteQuery.Events.Failure, [this] );
  }

});
function NeuroPage(collection, pageSize, pageIndex)
{
  this.onChanges = bind( this, this.handleChanges );
  this.pageSize = pageSize;
  this.pageIndex = pageIndex || 0;
  this.pageCount = 0;
  this.setCollection( collection );
}

NeuroPage.Events = 
{
  Change:       'change',
  Changes:      'change'
};

extendArray( Array, NeuroPage, 
{

  setPageSize: function(pageSize)
  {
    this.pageSize = pageSize;
    this.handleChanges();
  },

  setPageIndex: function(pageIndex)
  {
    var actualIndex = Math.max( 0, Math.min( pageIndex, this.pageCount - 1 ) );

    if ( actualIndex !== this.pageIndex )
    {
      this.pageIndex = actualIndex;
      this.update();
      this.trigger( NeuroPage.Events.Change, [ this ] );
    }
  },

  setCollection: function(collection)
  {
    if ( collection !== this.collection )
    {
      if ( this.collection )
      {
        this.disconnect();
      }

      this.collection = collection;
      this.connect();
      this.handleChanges( true );
    }
  },

  connect: function()
  {
    this.collection.on( NeuroCollection.Events.Changes, this.onChanges );
  },

  disconnect: function()
  {
    this.collection.off( NeuroCollection.Events.Changes, this.onChanges );
  },

  next: function()
  {
    this.setPageIndex( this.pageIndex + 1 );
  },

  prev: function()
  {
    this.setPageIndex( this.pageIndex - 1 );
  },

  jump: function(to)
  {
    this.setPageIndex( to );
  },

  first: function()
  {
    this.setPageIndex( 0 );
  },

  last: function()
  {
    this.setPageIndex( this.pageCount - 1 );
  },

  handleChanges: function(forceApply)
  {
    var n = this.collection.length;
    var pageCount = Math.ceil( n / this.pageSize );
    var pageIndex = Math.max( 0, Math.min( this.pageIndex, pageCount - 1 ) );
    var apply = forceApply || this.pageIndex !== pageIndex || this.length !== this.pageSize;
    var changes = apply || this.pageCount !== pageCount;

    this.pageIndex = pageIndex;
    this.pageCount = pageCount;
    
    if ( apply )
    {
      this.update(); 
    }
    if ( changes )
    {
      this.trigger( NeuroPage.Events.Change, [ this ] );
    }
  },

  update: function()
  {
    var source = this.collection;
    var n = source.length;
    var start = this.pageIndex * this.pageSize;
    var end = Math.min( start + this.pageSize, n );
    var length = end - start;

    this.length = length;

    for (var i = 0; i < length; i++)
    {
      this[ i ] = source[ start++ ];
    }
  },

  toArray: function()
  {
    return this.slice();
  }

});

eventize( NeuroPage.prototype );
addEventFunction( NeuroPage.prototype, 'change', NeuroPage.Events.Changes );

function NeuroOperation()
{
}

NeuroOperation.prototype =
{
  reset: function(model, cascade)
  {
    this.model = model;
    this.cascade = isNumber( cascade ) ? cascade : Neuro.Cascade.All;
    this.db = model.$db;
    this.next = null;
    this.finished = false;
  },

  canCascade: function(cascade)
  {
    var expected = cascade || this.cascading;
    var actual = this.cascade;

    return (expected & actual) !== 0;
  },

  notCascade: function(expected)
  {
    var actual = this.cascade;

    return (expected & actual) === 0;
  },

  queue: function(operation)
  {
    if ( this.next && !operation.interrupts )
    {
      this.next.queue( operation );
    }
    else
    {
      this.next = operation;
    }
  },

  tryNext: function(OperationType)
  {
    var setNext = !this.next;

    if ( setNext )
    {
      this.next = new OperationType( this.model, this.cascade );
    }

    return setNext;
  },

  insertNext: function(OperationType)
  {
    var op = new OperationType( this.model, this.cascade );

    op.next = this.next;
    this.next = op;
  },

  execute: function()
  {
    this.db.pendingOperations++;

    this.run( this.db, this.model );
  },

  run: function(db, model)
  {
    throw 'NeuroOperation.run Not implemented';
  },

  finish: function()
  {
    if ( !this.finished )
    {
      this.finished = true;

      if ( this.model.$operation = this.next )
      {
        this.next.execute();
      }

      this.db.pendingOperations--;

      if ( this.db.pendingOperations === 0 )
      {
        this.db.onOperationRest();
      }
    }

    return this;
  },

  success: function()
  {
    return bind( this, this.handleSuccess );
  },

  handleSuccess: function()
  {
    this.onSuccess.apply( this, arguments );
    this.finish();
  },

  onSuccess: function()
  {

  },

  failure: function()
  {
    return bind( this, this.handleFailure );
  },

  handleFailure: function()
  {
    this.onFailure.apply( this, arguments );
    this.finish();
  },

  onFailure: function()
  {

  }

};

function NeuroGetLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroGetLocal,
{

  cascading: Neuro.Cascade.Local,

  interrupts: false,

  type: 'NeuroGetLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( NeuroModel.Events.LocalGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() && db.cache === Neuro.Cache.All )
    {
      db.store.get( model.$key(), this.success(), this.failure() );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.GET_LOCAL_SKIPPED, model );

      model.$trigger( NeuroModel.Events.LocalGet, [model] );

      this.insertNext( NeuroGetRemote ); 
      this.finish();
    }
  },

  onSuccess: function(key, encoded)
  {
    var model = this.model;

    if ( isObject( encoded ) )
    {
      model.$set( encoded );
    }

    Neuro.debug( Neuro.Debugs.GET_LOCAL, model, encoded );

    model.$trigger( NeuroModel.Events.LocalGet, [model] );

    if ( this.canCascade( Neuro.Cascade.Rest ) && !model.$isDeleted() )
    {
      this.insertNext( NeuroGetRemote );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.GET_LOCAL, model, e );

    model.$trigger( NeuroModel.Events.LocalGetFailure, [model] );

    if ( this.canCascade( Neuro.Cascade.Rest ) && !model.$isDeleted()  )
    {
      this.insertNext( NeuroGetRemote );
    }
  }

});

function NeuroGetRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroGetRemote,
{

  cascading: Neuro.Cascade.Rest,

  interrupts: false,

  type: 'NeuroGetRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( NeuroModel.Events.RemoteGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() )
    {
      db.rest.get( model, this.success(), this.failure() );
    }
    else
    {
      model.$trigger( NeuroModel.Events.RemoteGet, [model] );

      this.finish();
    }
  },

  onSuccess: function(data)
  {
    var db = this.db;
    var model = this.model;

    if ( isObject( data ) )
    {
      db.putRemoteData( data, model.$key(), model, true );
    }

    Neuro.debug( Neuro.Debugs.GET_REMOTE, model, data );

    model.$trigger( NeuroModel.Events.RemoteGet, [model] );
  },

  onFailure: function(data, status)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.GET_REMOTE_ERROR, model, data, status );

    if ( status === 0 )
    {
      model.$trigger( NeuroModel.Events.RemoteGetOffline, [model] );
    }
    else
    {  
      model.$trigger( NeuroModel.Events.RemoteGetFailure, [model] );
    }
  }

});

function NeuroRemoveCache(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroRemoveCache,
{

  cascading: Neuro.Cascade.None,

  interrupts: true,

  type: 'NeuroRemoveCache',

  run: function(db, model)
  {
    if ( db.cache == Neuro.Cache.None )
    {
      this.finish();
    }
    else
    {
      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  }

});
function NeuroRemoveLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroRemoveLocal, 
{

  cascading: Neuro.Cascade.Local,

  interrupts: true,

  type: 'NeuroRemoveLocal',

  run: function(db, model)
  {
    model.$status = NeuroModel.Status.RemovePending;

    if ( db.cache === Neuro.Cache.None || !model.$local || !this.canCascade() )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_NONE, model );

      model.$trigger( NeuroModel.Events.LocalRemove, [model] );

      this.insertNext( NeuroRemoveRemote );
      this.finish();
    }
    else if ( model.$saved )
    {
      model.$local.$status = model.$status;

      db.store.put( model.$key(), model.$local, this.success(), this.failure() );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_UNSAVED, model );

      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_LOCAL, model );

    model.$trigger( NeuroModel.Events.LocalRemove, [model] );

    if ( model.$saved && this.canCascade( Neuro.Cascade.Remote ) )
    {
      model.$addOperation( NeuroRemoveRemote, this.cascade );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_ERROR, model, e );

    model.$trigger( NeuroModel.Events.LocalRemoveFailure, [model] );

    if ( model.$saved && this.canCascade( Neuro.Cascade.Remote ) )
    {
      model.$addOperation( NeuroRemoveRemote, this.cascade );
    }
  }

});
function NeuroRemoveNow(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroRemoveNow,
{

  cascading: Neuro.Cascade.Local,

  interrupts: true,

  type: 'NeuroRemoveNow',

  run: function(db, model)
  {
    var key = model.$key();

    model.$status = NeuroModel.Status.RemovePending;

    db.removeFromModels( model );

    if ( db.cache === Neuro.Cache.None || !this.canCascade() )
    {
      this.finishRemove();
      this.finish();
    }
    else
    {
      db.store.remove( key, this.success(), this.failure() );
    }
  },

  onSuccess: function()
  {
    this.finishRemove();
  },

  onFailure: function()
  {
    this.finishRemove();
  },

  finishRemove: function()
  {
    var model = this.model;

    model.$status = NeuroModel.Status.Removed;

    delete model.$local;
    delete model.$saving;
    delete model.$publish;
    delete model.$saved;
  }

});
function NeuroRemoveRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroRemoveRemote,
{

  cascading: Neuro.Cascade.Remote,

  interrupts: true,

  type: 'NeuroRemoveRemote',

  run: function(db, model)
  {
    if ( this.notCascade( Neuro.Cascade.Rest ) )
    {
      this.liveRemove();

      model.$trigger( NeuroModel.Events.RemoteRemove, [model] );

      this.finish();
    }
    else 
    {
      model.$status = NeuroModel.Status.RemovePending;

      db.rest.remove( model, this.success(), this.failure() );
    }
  },

  onSuccess: function(data)
  {
    this.finishRemove();
  },

  onFailure: function(data, status)
  {
    var model = this.model;
    var key = model.$key();

    if ( status === 404 || status === 410 )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_MISSING, model, key );

      this.finishRemove();
    }
    else if ( status !== 0 ) 
    {
      Neuro.debug( Neuro.Debugs.REMOVE_ERROR, model, status, key );

      model.$trigger( NeuroModel.Events.RemoteRemoveFailure, [model] );
    }
    else
    {
      // Looks like we're offline!
      Neuro.checkNetworkStatus();

      // If we are offline, wait until we're online again to resume the delete
      if (!Neuro.online) 
      {
        Neuro.once( 'online', this.handleOnline, this );
        
        model.$trigger( NeuroModel.Events.RemoteRemoveOffline, [model] );
      }
      else
      {
        model.$trigger( NeuroModel.Events.RemoteRemoveFailure, [model] );
      }

      Neuro.debug( Neuro.Debugs.REMOVE_OFFLINE, model );
    }
  },

  finishRemove: function()
  {
    var db = this.db;
    var model = this.model;
    var key = model.$key();

    Neuro.debug( Neuro.Debugs.REMOVE_REMOTE, model, key );

    // Successfully removed!
    model.$status = NeuroModel.Status.Removed;

    // Successfully Removed!
    model.$trigger( NeuroModel.Events.RemoteRemove, [model] );

    // Remove from local storage now
    this.insertNext( NeuroRemoveNow );

    // Remove it live!
    this.liveRemove();

    // Remove the model reference for good!
    delete db.all[ key ];
  },

  liveRemove: function()
  {
    if ( this.canCascade( Neuro.Cascade.Live ) )
    {
      var db = this.db;
      var model = this.model;
      var key = model.$key();

      // Publish REMOVE
      Neuro.debug( Neuro.Debugs.REMOVE_PUBLISH, model, key );

      db.live.remove( model );
    }
  },

  handleOnline: function()
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_RESUME, model );

    model.$addOperation( NeuroRemoveRemote );
  }

});


function NeuroSaveLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroSaveLocal,
{

  cascading: Neuro.Cascade.Local,

  interrupts: false,

  type: 'NeuroSaveLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_LOCAL_DELETED, model );
    
      model.$trigger( NeuroModel.Events.LocalSaveFailure, [model] );

      this.finish();
    }
    else if ( db.cache === Neuro.Cache.None || !this.canCascade() )
    {
      if ( this.canCascade( Neuro.Cascade.Remote ) )
      {
        if ( this.tryNext( NeuroSaveRemote ) )
        {
          this.markSaving( db, model );  
        }
      }

      model.$trigger( NeuroModel.Events.LocalSave, [model] );

      this.finish();
    }
    else
    {
      var key = model.$key();
      var local = model.$toJSON( false );
      
      this.markSaving( db, model );

      if ( model.$local )
      {
        transfer( local, model.$local );
      }
      else
      {
        model.$local = local;

        if ( model.$saved )
        {
          model.$local.$saved = model.$saved;
        }
      }

      model.$local.$status = model.$status;
      model.$local.$saving = model.$saving;
      model.$local.$publish = model.$publish;

      db.store.put( key, model.$local, this.success(), this.failure() );
    }
  },

  markSaving: function(db, model)
  {
    var remote = model.$toJSON( true );
    var changes = model.$getChanges( remote );

    var saving = db.fullSave ? remote : changes;
    var publish = db.fullPublish ? remote : changes;

    model.$status = NeuroModel.Status.SavePending;
    model.$saving = saving;
    model.$publish = publish;
  },

  clearLocal: function(model)
  {
    model.$status = NeuroModel.Status.Synced;

    model.$local.$status = model.$status;
    
    delete model.$local.$saving;
    delete model.$local.$publish;

    this.insertNext( NeuroSaveNow );
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_LOCAL, model );

    if ( this.cascade )
    {
      this.tryNext( NeuroSaveRemote );
    }
    else
    {
      this.clearLocal( model );
    }

    model.$trigger( NeuroModel.Events.LocalSave, [model] );
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_LOCAL_ERROR, model, e );

    if ( this.cascade )
    {
      this.tryNext( NeuroSaveRemote );
    }
    else
    {
      this.clearLocal( model );
    }
    
    model.$trigger( NeuroModel.Events.LocalSaveFailure, [model] );
  }

});

function NeuroSaveNow(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroSaveNow,
{

  cascading: Neuro.Cascade.Local,

  interrupts: false,

  type: 'NeuroSaveNow',

  run: function(db, model)
  {
    var key = model.$key();
    var local = model.$local;

    if ( db.cache === Neuro.Cache.All && key && local && this.canCascade() )
    {
      db.store.put( key, local, this.success(), this.failure() );
    }
    else
    {
      this.finish();
    }
  }

});
function NeuroSaveRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroSaveRemote,
{

  cascading: Neuro.Cascade.Remote,

  interrupts: false,

  type: 'NeuroSaveRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_REMOTE_DELETED, model );

      this.markSynced( model, true, NeuroModel.Events.RemoteSaveFailure );
      this.finish();
    }
    else if ( !model.$isDependentsSaved( this.tryAgain, this ) )
    {
      this.finish();
    }
    else if ( !db.hasData( model.$saving ) || this.notCascade( Neuro.Cascade.Rest ) )
    {
      this.liveSave();
      this.markSynced( model, true, NeuroModel.Events.RemoteSave );
      this.finish();
    }
    else
    {
      model.$status = NeuroModel.Status.SavePending;

      if ( model.$saved )
      {
        db.rest.update( model, model.$saving, this.success(), this.failure() );
      }
      else
      {
        db.rest.create( model, model.$saving, this.success(), this.failure() );
      }
    }
  },

  onSuccess: function(data)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_REMOTE, model );

    this.handleData( data );
  },

  onFailure: function(data, status)
  {
    var operation = this;
    var db = this.db;
    var model = this.model;

    // A non-zero status means a real problem occurred
    if ( status === 409 ) // 409 Conflict
    {
      Neuro.debug( Neuro.Debugs.SAVE_CONFLICT, model, data );

      this.handleData( data );
    }
    else if ( status === 410 || status === 404 ) // 410 Gone, 404 Not Found
    {
      Neuro.debug( Neuro.Debugs.SAVE_UPDATE_FAIL, model );

      this.insertNext( NeuroRemoveNow );

      model.$trigger( NeuroModel.Events.RemoteSaveFailure, [model] );
    }
    else if ( status !== 0 ) 
    {          
      Neuro.debug( Neuro.Debugs.SAVE_ERROR, model, status );

      this.markSynced( model, true, NeuroModel.Events.RemoteSaveFailure );
    } 
    else 
    {
      // Check the network status right now
      Neuro.checkNetworkStatus();

      // If not online for sure, try saving once online again
      if (!Neuro.online) 
      {
        Neuro.once( 'online', this.handleOnline, this );

        model.$trigger( NeuroModel.Events.RemoteSaveOffline, [model] );
      }
      else
      {
        this.markSynced( model, true, NeuroModel.Events.RemoteSaveFailure );
      }

      Neuro.debug( Neuro.Debugs.SAVE_OFFLINE, model );
    }
  },

  markSynced: function(model, saveNow, eventType)
  {
    model.$status = NeuroModel.Status.Synced;

    this.clearPending( model );

    if ( saveNow )
    {
      this.insertNext( NeuroSaveNow ); 
    }

    if ( eventType )
    {
      model.$trigger( eventType, [model] );
    }
  },

  clearPending: function(model)
  {
    delete model.$saving;
    delete model.$publish;

    if ( model.$local )
    {
      model.$local.$status = model.$status;

      delete model.$local.$saving;
      delete model.$local.$publish;
    }
  },

  handleData: function(data)
  {
    var db = this.db;
    var model = this.model;
    var saving = model.$saving;

    // Check deleted one more time before updating model.
    if ( model.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_REMOTE_DELETED, model, data );

      return this.clearPending( model );
    }

    Neuro.debug( Neuro.Debugs.SAVE_VALUES, model, saving );

    // If the model hasn't been saved before - create the record where the 
    // local and model point to the same object.
    if ( !model.$saved )
    {
      model.$saved = model.$local ? (model.$local.$saved = {}) : {}; 
    }

    // Tranfer all saved fields into the saved object
    transfer( saving, model.$saved );
    
    // Update the model with the return data
    if ( !isEmpty( data ) )
    {
      db.putRemoteData( data, model.$key(), model );
    }    

    this.liveSave();
    this.markSynced( model, false, NeuroModel.Events.RemoteSave );
    
    if ( db.cache === Neuro.Cache.Pending )
    {
      this.insertNext( NeuroRemoveCache );
    }
    else
    {
      this.insertNext( NeuroSaveNow ); 
    }
  },

  liveSave: function()
  {
    var db = this.db;
    var model = this.model;

    if ( this.canCascade( Neuro.Cascade.Live ) && db.hasData( model.$publish ) )
    {
      // Publish saved data to everyone else
      Neuro.debug( Neuro.Debugs.SAVE_PUBLISH, model, model.$publish );

      db.live.save( model, model.$publish );
    }
  },

  handleOnline: function()
  {
    var model = this.model;

    if ( model.$status === NeuroModel.Status.SavePending )
    { 
      model.$addOperation( NeuroSaveRemote, this.cascade );

      Neuro.debug( Neuro.Debugs.SAVE_RESUME, model );
    }
  },

  tryAgain: function()
  {
    var model = this.model;

    model.$addOperation( NeuroSaveRemote, this.cascade );
  }

});

function NeuroRelation()
{

}

Neuro.Relations = {};

NeuroRelation.Defaults = 
{
  model:                null,
  lazy:                 false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

NeuroRelation.prototype =
{

  debugQuery: null,
  debugQueryResults: null,

  getDefaults: function(database, field, options)
  {
    return NeuroRelation.Defaults;
  },

  /**
   * Initializes this relation with the given database, field, and options.
   *
   * @param  {Neuro.Database} database [description]
   * @param  {String} field    [description]
   * @param  {Object} options  [description]
   */
  init: function(database, field, options)
  {
    applyOptions( this, options, this.getDefaults( database, field, options ) );

    this.database = database;
    this.name = field;
    this.options = options;
    this.pendingLoads = [];
    this.pendingRemoteDatas = [];
    this.pendingInitials = [];
    this.initialized = false;
    this.property = this.property || (indexOf( database.fields, this.name ) !== false);
    this.discriminated = !isEmpty( this.discriminators );

    if ( this.discriminated )
    {
      transfer( NeuroPolymorphic, this );
    }

    this.setReferences( database, field, options );
  },

  setReferences: function(database, field, options)
  {
    if ( !isNeuro( this.model ) )
    {
      Neuro.get( this.model, this.setModelReference( database, field, options ), this );
    }
    else
    {
      this.onInitialized( database, field, options );
    }
  },

  /**
   *
   */
  setModelReference: function(database, field, options)
  {
    return function(neuro)
    {
      this.model = neuro;

      this.onInitialized( database, field, options );
    };
  },

  /**
   *
   */
  onInitialized: function(database, fields, options)
  {

  },

  finishInitialization: function()
  {
    this.initialized = true;

    var pending = this.pendingLoads;
    var initials = this.pendingInitials;
    var remotes = this.pendingRemoteDatas;

    for (var i = 0; i < pending.length; i++)
    {
      this.handleLoad( pending[ i ], initials[ i ], remotes[ i ] );
    }

    pending.length = 0;
    initials.length = 0;
    remotes.length = 0;
  },

  /**
   * Loads the model.$relation variable with what is necessary to get, set,
   * relate, and unrelate models. If property is true, look at model[ name ]
   * to load models/keys. If it contains values that don't exist or aren't
   * actually related
   *
   * @param  {Neuro.Model} model [description]
   */
  load: function(model, initialValue, remoteData)
  {
    if ( !this.initialized )
    {
      this.pendingLoads.push( model );
      this.pendingInitials.push( initialValue );
      this.pendingRemoteDatas.push( remoteData );
    }
    else
    {
      this.handleLoad( model, initialValue, remoteData );
    }
  },

  handleLoad: function(model, initialValue, remoteData)
  {

  },

  set: function(model, input, remoteData)
  {

  },

  relate: function(model, input, remoteData)
  {

  },

  unrelate: function(model, input)
  {

  },

  isRelated: function(model, input)
  {

  },

  clone: function(model, clone, properties)
  {

  },

  get: function(model)
  {
    return model.$relations[ this.name ].related;
  },

  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      var related = relation.related;

      if ( isArray( related ) )
      {
        out[ this.name ] = this.getStoredArray( related, mode );
      }
      else // if ( isObject( related ) )
      {
        out[ this.name ] = this.getStored( related, mode );
      }
    }
  },

  ready: function(callback)
  {
    this.model.Database.ready( callback, this );
  },

  listenToModelAdded: function(callback)
  {
    this.model.Database.on( NeuroDatabase.Events.ModelAdded, callback, this );
  },

  executeQuery: function(model)
  {
    var queryOption = this.query;
    var query = isString( queryOption ) ? format( queryOption, model ) : queryOption;
    var remoteQuery = this.model.query( query );

    Neuro.debug( this.debugQuery, this, model, remoteQuery, queryOption, query );

    remoteQuery.ready( this.handleExecuteQuery( model ), this );

    return remoteQuery;
  },

  handleExecuteQuery: function(model)
  {
    return function onExecuteQuery(remoteQuery)
    {
      Neuro.debug( this.debugQueryResults, this, model, remoteQuery );

      for (var i = 0; i < remoteQuery.length; i++)
      {
        this.relate( model, remoteQuery[ i ], true );
      }
    };
  },

  createRelationCollection: function(model)
  {
    return new NeuroRelationCollection( this.model.Database, model, this );
  },

  createCollection: function()
  {
    return new NeuroModelCollection( this.model.Database );
  },

  parseModel: function(input, remoteData)
  {
    return this.model.Database.parseModel( input, remoteData );
  },

  grabInitial: function( model, fields )
  {
    if ( hasFields( model, fields, isValue ) )
    {
      return pull( model, fields );
    }
  },

  grabModel: function(input, callback, remoteData)
  {
    this.model.Database.grabModel( input, callback, this, remoteData );
  },

  grabModels: function(relation, initial, callback, remoteData)
  {
    var db = this.model.Database;

    for (var i = 0; i < initial.length; i++)
    {
      var input = initial[ i ];
      var key = db.buildKeyFromInput( input );

      relation.pending[ key ] = true;

      db.grabModel( input, callback, this, remoteData );
    }
  },

  setProperty: function(relation)
  {
    if ( this.property )
    {
      var model = relation.parent;
      var propertyName = this.name;
      var applied = !!relation.dynamicSet;

      if ( !applied && this.dynamic && Object.defineProperty )
      {
        var relator = this;

        Object.defineProperty( model, propertyName,
        {
          enumerable: true,

          set: function(input)
          {
            relator.set( model, input );
          },
          get: function()
          {
            return relation.related;
          }
        });

        applied = relation.dynamicSet = true;
      }

      if ( !applied )
      {
        model[ propertyName ] = relation.related;
      }

      if ( relation.lastRelated !== relation.related )
      {
        relation.lastRelated = relation.related;

        model.$trigger( NeuroModel.Events.RelationUpdate, [this, relation] );
      }
    }
  },

  isModelArray: function(input)
  {
    if ( !isArray( input ) )
    {
      return false;
    }

    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.key;

    if ( !isArray( relatedKey ) )
    {
      return true;
    }

    if ( relatedKey.length !== input.length )
    {
      return true;
    }

    for ( var i = 0; i < input.length; i++ )
    {
      if ( !isNumber( input[ i ] ) && !isString( input[ i ] ) )
      {
        return true;
      }
    }

    return false;
  },

  clearFields: function(target, targetFields, remoteData, cascade)
  {
    var changes = this.clearFieldsReturnChanges( target, targetFields );

    if ( changes && !remoteData && this.auto && !target.$isNew() )
    {
      target.$save( cascade );
    }

    return changes;
  },

  clearFieldsReturnChanges: function(target, targetFields)
  {
    var changes = false;

    if ( isString( targetFields ) )
    {
      if ( target[ targetFields ] )
      {
        target[ targetFields ] = null;
        changes = true;
      }
    }
    else // isArray ( targetFields )
    {
      for (var i = 0; i < targetFields.length; i++)
      {
        var targetField = targetFields[ i ];

        if ( target[ targetField ] )
        {
          target[ targetField ] = null;
          changes = true;
        }
      }
    }

    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields, remoteData)
  {
    var changes = this.updateFieldsReturnChanges( target, targetFields, source, sourceFields );

    if ( changes )
    {
      if ( this.auto && !target.$isNew() && !remoteData )
      {
        target.$save();
      }

      target.$trigger( NeuroModel.Events.KeyUpdate, [target, source, targetFields, sourceFields] );
    }

    return changes;
  },

  updateFieldsReturnChanges: function(target, targetFields, source, sourceFields)
  {
    var changes = false;

    if ( isString( targetFields ) ) // && isString( sourceFields )
    {
      var targetValue = target[ targetFields ];
      var sourceValue = source[ sourceFields ];

      if ( !equals( targetValue, sourceValue ) )
      {
        target[ targetFields ] = sourceValue;
        changes = true;
      }
    }
    else // if ( isArray( targetFields ) && isArray( sourceFields ) )
    {
      for (var i = 0; i < targetFields.length; i++)
      {
        var targetField = targetFields[ i ];
        var targetValue = target[ targetField ];
        var sourceField = sourceFields[ i ];
        var sourceValue = source[ sourceField ];

        if ( !equals( targetValue, sourceValue ) )
        {
          target[ targetField ] = copy( sourceValue );
          changes = true;
        }
      }
    }

    return changes;
  },

  getStoredArray: function(relateds, mode)
  {
    if ( !mode )
    {
      return null;
    }

    var stored = [];

    for (var i = 0; i < relateds.length; i++)
    {
      var related = this.getStored( relateds[ i ], mode );

      if ( related !== null )
      {
        stored.push( related );
      }
    }

    return stored;
  },

  getStored: function(related, mode)
  {
    if ( related )
    {
      switch (mode)
      {
      case Neuro.Save.Model:
        return related.$toJSON( true );

      case Neuro.Store.Model:
        if ( related.$local )
        {
          return related.$local;
        }
        else
        {
          var local = related.$toJSON( false );

          if ( related.$saved )
          {
            local.$saved = related.$saved;
          }

          return local;
        }

      case Neuro.Save.Key:
      case Neuro.Store.Key:
        return related.$key();

      case Neuro.Save.Keys:
      case Neuro.Store.Keys:
        return related.$keys();

      }
    }

    return null;
  }

};

function NeuroRelationSingle()
{
}


extend( NeuroRelation, NeuroRelationSingle, 
{

  debugInit: null,
  debugClearModel: null,
  debugSetModel: null,
  debugLoaded: null,
  debugClearKey: null,
  debugUpdateKey: null,

  onInitialized: function(database, field, options)
  {
    if ( !this.discriminated )
    {
      var relatedDatabase = this.model.Database;

      this.local = this.local || ( relatedDatabase.name + '_' + relatedDatabase.key );
    }

    Neuro.debug( this.debugInit, this );

    this.finishInitialization();
  },

  set: function(model, input, remoteData)
  {
    if ( isEmpty( input ) )
    {
      this.unrelate( model, undefined, remoteData );
    }
    else
    {
      var relation = model.$relations[ this.name ];
      var related = this.parseModel( input, remoteData );

      if ( related && !relation.isRelated( related ) )
      {
        this.clearModel( relation );
        this.setRelated( relation, related, remoteData );
      }
    }
  },

  relate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input, remoteData );
    
    if ( related )
    {
      if ( relation.related !== related )
      {
        this.clearModel( relation );
        this.setRelated( relation, related, remoteData );
      }
    }
  },

  unrelate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input );

    if ( !related || relation.related === related )
    {
      this.clearRelated( relation, remoteData );
    }
  },

  isRelated: function(model, input)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input );

    return related === relation.related;
  },

  setRelated: function(relation, related, remoteData)
  {
    if ( !related.$isDeleted() )
    {
      this.setModel( relation, related );
      this.updateForeignKey( relation.parent, related, remoteData );
      this.setProperty( relation );
    }
  },

  clearRelated: function(relation, remoteData)
  {
    if ( remoteData )
    {
      var related = relation.related;

      if ( related && related.$isPending() )
      {
        return;
      }
    }

    this.clearModel( relation );
    this.clearForeignKey( relation.parent );
    this.setProperty( relation );
  },

  clearModel: function(relation)
  {
    var related = relation.related;

    if ( related )
    {
      Neuro.debug( this.debugClearModel, this, relation );

      if (relation.onSaved) related.$off( NeuroModel.Events.Saved, relation.onSaved );
      if (relation.onRemoved) related.$off( NeuroModel.Events.Removed, relation.onRemoved );

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;

      delete relation.parent.$dependents[ related.$uid() ];
    }
  },

  setModel: function(relation, related)
  {
    if (relation.onSaved) related.$on( NeuroModel.Events.Saved, relation.onSaved, this );
    if (relation.onRemoved) related.$on( NeuroModel.Events.Removed, relation.onRemoved, this );

    relation.related = related;
    relation.dirty = true;
    relation.loaded = true;
    
    relation.parent.$dependents[ related.$uid() ] = related;

    Neuro.debug( this.debugSetModel, this, relation );
  },

  handleModel: function(relation, remoteData)
  {
    return function(related) 
    {
      var model = relation.parent;

      Neuro.debug( this.debugLoaded, this, model, relation, related );

      if ( relation.loaded === false ) 
      {
        if ( related && !related.$isDeleted() ) 
        {
          this.setModel( relation, related, remoteData );
          this.updateForeignKey( model, related, remoteData );
        }
        else
        {
          if ( this.query )
          {
            relation.query = this.executeQuery( model );
          }
          else
          {
            this.clearForeignKey( model, remoteData );
          }
        }

        relation.loaded = true;

        this.setProperty( relation );
      }
    };
  },

  isRelatedFactory: function(model)
  {
    var local = this.local;

    return function hasForeignKey(related)
    {
      return propsMatch( model, local, related, related.$db.key );
    };
  },

  clearForeignKey: function(model, remoteData)
  {
    var local = this.local;

    Neuro.debug( this.debugClearKey, this, model, local );

    this.clearFields( model, local, remoteData );
  },

  updateForeignKey: function(model, related, remoteData)
  {
    var local = this.local;
    var foreign = related.$db.key;

    Neuro.debug( this.debugUpdateKey, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign, remoteData );
  }

});
function NeuroRelationMultiple()
{
}


extend( NeuroRelation, NeuroRelationMultiple, 
{

  debugAutoSave: null,
  debugInitialGrabbed: null,
  debugSort: null,

  handleExecuteQuery: function(model)
  {
    return function onExecuteQuery(remoteQuery)
    {
      var relation = model.$relations[ this.name ];

      Neuro.debug( this.debugQueryResults, this, model, remoteQuery );

      this.bulk( relation, function()
      {
        for (var i = 0; i < remoteQuery.length; i++)
        {
          this.addModel( relation, remoteQuery[ i ], true );
        }
      });

      this.sort( relation );
      this.checkSave( relation, true );
    };
  },

  bulk: function(relation, callback, remoteData)
  {
    relation.delaySorting = true;
    relation.delaySaving = true;

    callback.apply( this );

    relation.delaySorting = false;
    relation.delaySaving = false;

    this.sort( relation );
    this.checkSave( relation, remoteData );
  },
  
  set: function(model, input, remoteData)
  {
    if ( isEmpty( input ) )
    {
      this.unrelate( model, undefined, remoteData );
    }
    else
    {
      var relation = model.$relations[ this.name ];
      var existing = relation.related;
      var given = this.createCollection();

      if ( this.isModelArray( input ) )
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ], remoteData );

          if ( related )
          {
            given.add( related );
          }
        }
      }
      else
      {
        var related = this.parseModel( input, remoteData );

        if ( related )
        {
          given.add( related );
        }
      }

      var removing = existing.subtract( given );
      var adding = given.subtract( existing );
      
      this.bulk( relation, function()
      {
        for (var i = 0; i < adding.length; i++)
        {
          this.addModel( relation, adding[ i ], remoteData );
        }

        for (var i = 0; i < removing.length; i++)
        {
          this.removeModel( relation, removing[ i ], remoteData );
        }
        
      }, remoteData);
    }
  },

  relate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ], remoteData );

          if ( related )
          {
            this.addModel( relation, related, remoteData );
          }
        }
      });
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input, remoteData );

      if ( related )
      {
        this.addModel( relation, related, remoteData );
      }
    }
  },

  unrelate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      { 
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ] );

          if ( related )
          {
            this.removeModel( relation, related, remoteData );
          }
        }
      });
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input );

      if ( related )
      {
        this.removeModel( relation, related, remoteData );
      }
    }
    else
    {
      var all = relation.related;

      this.bulk( relation, function()
      { 
        for (var i = all.length - 1; i >= 0; i--)
        {
          this.removeModel( relation, all[ i ], remoteData );
        }
      });
    }
  },

  isRelated: function(model, input)
  {
    var relation = model.$relations[ this.name ];
    var existing = relation.related;
    
    if ( this.isModelArray( input ) )
    {
      for (var i = 0; i < input.length; i++)
      {
        var related = this.parseModel( input[ i ] );

        if ( related && !existing.has( related.$key() ) )
        {
          return false;
        }
      }

      return input.length > 0;
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input );

      return related && existing.has( related.$key() );
    }

    return false;
  },

  canRemoveRelated: function(related, remoteData)
  {
    return !remoteData || !related.$isPending();
  },

  checkSave: function(relation, remoteData)
  {
    if ( !relation.delaySaving && !remoteData && relation.parent.$exists() )
    {
      if ( this.store === Neuro.Store.Model || this.save === Neuro.Save.Model )
      {
        Neuro.debug( this.debugAutoSave, this, relation );

        relation.parent.$save();
      }
    }
  },

  handleModel: function(relation, remoteData)
  {
    return function (related)
    {
      var pending = relation.pending;
      var key = related.$key();

      if ( key in pending )
      {
        Neuro.debug( this.debugInitialGrabbed, this, relation, related );

        this.addModel( relation, related, remoteData );

        delete pending[ key ];
      }
    };
  },

  sort: function(relation)
  {
    var related = relation.related;
    
    if ( !relation.delaySorting )
    {
      Neuro.debug( this.debugSort, this, relation );

      related.resort( this.comparator );
     
      relation.parent.$trigger( NeuroModel.Events.RelationUpdate, [this, relation] );
    }
  }

});
function NeuroBelongsTo()
{
}

Neuro.Relations.belongsTo = NeuroBelongsTo;

NeuroBelongsTo.Defaults = 
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  local:                null,
  cascade:              Neuro.Cascade.Local,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelationSingle, NeuroBelongsTo, 
{

  type: 'belongsTo',

  debugInit:          Neuro.Debugs.BELONGSTO_INIT,
  debugClearModel:    Neuro.Debugs.BELONGSTO_CLEAR_MODEL,
  debugSetModel:      Neuro.Debugs.BELONGSTO_SET_MODEL,
  debugLoaded:        Neuro.Debugs.BELONGSTO_LOADED,
  debugClearKey:      Neuro.Debugs.BELONGSTO_CLEAR_KEY,
  debugUpdateKey:     Neuro.Debugs.BELONGSTO_UPDATE_KEY,
  debugQuery:         Neuro.Debugs.BELONGSTO_QUERY,
  debugQueryResults:  Neuro.Debugs.BELONGSTO_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return NeuroBelongsTo.Defaults;
  },

  handleLoad: function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] = 
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      related: null,
      loaded: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_REMOVE, this, model, relation );

        model.$remove( this.cascade );
        this.clearRelated( relation );
      },

      onSaved: function()
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_SAVE, this, model, relation );

        if ( !relation.isRelated( relation.related ) )
        {
          model.$remove( this.cascade );
          this.clearRelated( relation );
        }
      }
    };

    model.$on( NeuroModel.Events.PostRemove, this.postRemove, this );
    model.$on( NeuroModel.Events.KeyUpdate, this.onKeyUpdate, this );

    if ( isEmpty( initialValue ) )
    {
      initialValue = this.grabInitial( model, this.local );
      
      if ( initialValue )
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL_PULLED, this, model, initialValue );        
      }
    }

    if ( !isEmpty( initialValue ) )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL, this, model, initialValue );

      this.grabModel( initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  },

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_POSTREMOVE, this, model, relation );

      this.clearModel( relation );
      this.setProperty( relation );
    }
  },

  onKeyUpdate: function(model, related, modelFields, relatedFields)
  {
    if ( this.local === modelFields )
    {
      var relation = model.$relations[ this.name ];

      if ( relation && related !== relation.related )
      {
        this.clearModel( relation );
        this.setModel( relation, related );
        this.setProperty( relation );
      }        
    }
  }

});
function NeuroHasOne()
{
}

Neuro.Relations.hasOne = NeuroHasOne;

NeuroHasOne.Defaults = 
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  local:                null,
  cascade:              Neuro.Cascade.All,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelationSingle, NeuroHasOne, 
{

  type: 'hasOne',

  debugInit:          Neuro.Debugs.HASONE_INIT,
  debugClearModel:    Neuro.Debugs.HASONE_CLEAR_MODEL,
  debugSetModel:      Neuro.Debugs.HASONE_SET_MODEL,
  debugLoaded:        Neuro.Debugs.HASONE_LOADED,
  debugClearKey:      Neuro.Debugs.HASONE_CLEAR_KEY,
  debugUpdateKey:     Neuro.Debugs.HASONE_UPDATE_KEY,
  debugQuery:         Neuro.Debugs.HASONE_QUERY,
  debugQueryResults:  Neuro.Debugs.HASONE_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return NeuroHasOne.Defaults;
  },

  handleLoad: function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] = 
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      related: null,
      loaded: false,
      dirty: false,
      saving: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Debugs.HASONE_NINJA_REMOVE, this, model, relation );

        this.clearRelated( relation );
      }
    };

    model.$on( NeuroModel.Events.PreSave, this.preSave, this );
    model.$on( NeuroModel.Events.PostRemove, this.postRemove, this );

    if ( isEmpty( initialValue ) )
    {
      initialValue = this.grabInitial( model, this.local );
      
      if ( initialValue )
      {
        Neuro.debug( Neuro.Debugs.HASONE_INITIAL_PULLED, this, model, initialValue );        
      }
    }

    if ( !isEmpty( initialValue ) )
    {
      Neuro.debug( Neuro.Debugs.HASONE_INITIAL, this, model, initialValue );

      this.grabModel( initialValue, this.handleModel( relation ), remoteData );      
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  },

  clone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      var relatedClone = related.$clone( properties );

      this.updateFieldsReturnChanges( clone, this.local, relatedClone, relatedClone.$db.key );

      clone[ this.name ] = relatedClone;
    }
  },

  preSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && relation.related )
    {
      var related = relation.related;  

      if ( relation.dirty || related.$hasChanges() )
      {
        Neuro.debug( Neuro.Debugs.HASONE_PRESAVE, this, model, relation );

        relation.saving = true;

        related.$save();

        relation.saving = false;
        relation.dirty = false;
      }
    }
  },

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      if ( this.cascade )
      {
        Neuro.debug( Neuro.Debugs.HASONE_POSTREMOVE, this, model, relation );

        this.clearModel( relation );
      }
    }
  },

  clearModel: function(relation)
  {
    var related = relation.related;

    if ( related )
    {
      Neuro.debug( this.debugClearModel, this, relation );

      related.$off( NeuroModel.Events.Removed, relation.onRemoved );

      if ( this.cascade && !related.$isDeleted() )
      {
        related.$remove( this.cascade );
      }

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;

      delete relation.parent.$dependents[ related.$uid() ];
    }
  }

});
function NeuroHasMany()
{
}

Neuro.Relations.hasMany = NeuroHasMany;

NeuroHasMany.Defaults = 
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  cascadeRemove:        Neuro.Cascade.Local,
  cascadeSave:          Neuro.Cascade.None,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelationMultiple, NeuroHasMany, 
{

  type: 'hasMany',

  debugAutoSave:        Neuro.Debugs.HASMANY_AUTO_SAVE,
  debugInitialGrabbed:  Neuro.Debugs.HASMANY_INITIAL_GRABBED,
  debugSort:            Neuro.Debugs.HASMANY_SORT,
  debugQuery:           Neuro.Debugs.HASMANY_QUERY,
  debugQueryResults:    Neuro.Debugs.HASMANY_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return NeuroHasMany.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.foreign = this.foreign || ( database.name + '_' + database.key );
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );
    this.clearKey = this.ownsForeignKey();

    Neuro.debug( Neuro.Debugs.HASMANY_INIT, this );

    this.finishInitialization();
  },

  handleLoad: function(model, initialValue, remoteData)
  {
    var relator = this;
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      pending: {},
      isRelated: this.isRelatedFactory( model ),
      related: this.createRelationCollection( model ),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_SAVE, relator, model, this, relation );

        if ( !relation.isRelated( this ) )
        {
          relator.removeModel( relation, this );
        }
        else
        {
          relator.sort( relation );
          relator.checkSave( relation );
        }
      }

    };

    model.$on( NeuroModel.Events.PostSave, this.postSave, this );
    model.$on( NeuroModel.Events.PreRemove, this.preRemove, this );

    // When models are added to the related database, check if it's related to this model
    this.listenToModelAdded( this.handleModelAdded( relation ) );

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initialValue ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_INITIAL, this, model, relation, initialValue );

      this.grabModels( relation, initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.HASMANY_INITIAL_PULLED, this, model, relation );

      this.ready( this.handleLazyLoad( relation ) );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  },

  clone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      var relateds = [];

      this.updateFieldsReturnChanges( properties, this.foreign, clone, model.$db.key );

      properties[ this.foreign ] = clone[ model.$db.key ];

      for (var i = 0; i < related.length; i++)
      {
        relateds.push( related[ i ].$clone( properties ) );
      }

      clone[ this.name ] = relateds;
    }
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeSave )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_POSTSAVE, this, model, relation );

      relation.saving = true;
      relation.delaySaving = true;

      var models = relation.related;

      for (var i = 0; i < models.length; i++)
      {
        var related = models[ i ];

        if ( !related.$isDeleted() && related.$hasChanges() )
        {
          related.$save( this.cascadeSave );
        }
      }

      relation.saving = false;
      relation.delaySaving = false;
    }
  },

  preRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeRemove )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_PREREMOVE, this, model, relation );

      this.bulk( relation, function()
      {
        var models = relation.related;

        for (var i = models.length - 1; i >= 0; i--)
        {
          var related = models[ i ];

          related.$remove( this.cascadeRemove );
        }
      });
    }
  },

  handleModelAdded: function(relation)
  {
    return function (related, remoteData)
    {
      if ( relation.isRelated( related ) )
      {
        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_ADD, this, relation, related );

        this.addModel( relation, related, remoteData );
      }
    };
  },

  handleLazyLoad: function(relation)
  {
    return function (relatedDatabase)
    {
      var related = relatedDatabase.filter( relation.isRelated );

      Neuro.debug( Neuro.Debugs.HASMANY_LAZY_LOAD, this, relation, related );

      if ( related.length )
      {
        this.bulk( relation, function()
        {
          for (var i = 0; i < related.length; i++)
          {
            this.addModel( relation, related[ i ] );
          }
        });
      }
      else if ( this.query )
      {
        relation.query = this.executeQuery( relation.parent );
      }
    };
  },

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    { 
      Neuro.debug( Neuro.Debugs.HASMANY_ADD, this, relation, related );

      target.put( key, related );

      related.$on( NeuroModel.Events.Removed, relation.onRemoved );
      related.$on( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      related.$dependents[ model.$uid() ] = model;

      this.updateForeignKey( model, related, remoteData );

      this.sort( relation );

      if ( !remoteData )
      {
        this.checkSave( relation );
      }
    }

    return adding;
  },

  removeModel: function(relation, related, remoteData)
  {
    if ( !this.canRemoveRelated( related, remoteData ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var pending = relation.pending;
    var key = related.$key();

    if ( target.has( key ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( NeuroModel.Events.Removed, relation.onRemoved );
      related.$off( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      delete related.$dependents[ model.$uid() ];

      if ( this.cascadeRemove )
      {
        related.$remove( this.cascadeRemove );
      }
      
      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ key ];
  },

  ownsForeignKey: function()
  {
    var foreign = this.foreign;
    var relatedKey = this.model.Database.key;

    if ( isString( foreign ) )
    {
      if ( isArray( relatedKey ) )
      {
        return indexOf( relatedKey, foreign ) === false;
      }
      else        
      {
        return relatedKey !== foreign;
      }
    }
    else // if ( isArray( ))
    {
      if ( isArray( relatedKey ) )
      {
        for (var i = 0; i < foreign.length; i++)
        {
          if ( indexOf( relatedKey, foreign[ i ] ) !== false )
          {
            return false;
          }
        }
        return true;
      }
      else
      {
        return indexOf( foreign, relatedKey ) === false;
      }
    }

    return true;
  },

  updateForeignKey: function(model, related, remoteData)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    this.updateFields( related, foreign, model, local, remoteData );
  },

  clearForeignKey: function(related, cascade)
  {
    if ( this.clearKey )
    {
      var foreign = this.foreign;

      this.clearFields( related, foreign, false, cascade );
    }
  },

  isRelatedFactory: function(model)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    return function(related)
    {
      return propsMatch( related, foreign, model, local );
    };
  }

});
function NeuroHasManyThrough()
{
}

Neuro.Relations.hasManyThrough = NeuroHasManyThrough;

NeuroHasManyThrough.Defaults = 
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  through:              undefined,
  local:                null,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  cascadeRemove:        Neuro.Cascade.NoRest,
  cascadeSave:          Neuro.Cascade.All,
  cascadeSaveRelated:   Neuro.Cascade.None,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelationMultiple, NeuroHasManyThrough, 
{

  type: 'hasManyThrough',

  debugAutoSave:        Neuro.Debugs.HASMANYTHRU_AUTO_SAVE,
  debugInitialGrabbed:  Neuro.Debugs.HASMANYTHRU_INITIAL_GRABBED,
  debugSort:            Neuro.Debugs.HASMANYTHRU_SORT,
  debugQuery:           Neuro.Debugs.HASMANYTHRU_QUERY,
  debugQueryResults:    Neuro.Debugs.HASMANYTHRU_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return NeuroHasManyThrough.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    if ( !this.discriminated )
    {
      var relatedDatabase = this.model.Database;

      this.foreign = this.foreign || ( relatedDatabase.name + '_' + relatedDatabase.key );
    }

    this.local = this.local || ( database.name + '_' + database.key );
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    if ( !isNeuro( options.through ) )
    {
      Neuro.get( options.through, this.setThrough, this );
    }
    else
    {
      this.setThrough( options.through );
    }

    Neuro.debug( Neuro.Debugs.HASMANYTHRU_INIT, this );
  },

  setThrough: function(through)
  {
    this.through = through;

    this.finishInitialization();
  },

  handleLoad: function(model, initialValue, remoteData)
  {
    var that = this;
    var throughDatabase = this.through.Database;
 
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      pending: {},
      related: this.createRelationCollection( model ),
      throughs: new NeuroMap(),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_REMOVE, that, model, this, relation );

        that.removeModel( relation, this );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_SAVE, that, model, this, relation );

        that.sort( relation );
        that.checkSave( relation );
      },

      onThroughRemoved: function() // this = through removed
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_THRU_REMOVE, that, model, this, relation );

        that.removeModelFromThrough( relation, this );
      }

    };

    // Populate the model's key if it's missing
    model.$on( NeuroModel.Events.PostSave, this.postSave, this );
    model.$on( NeuroModel.Events.PreRemove, this.preRemove, this );

    // When models are added to the related database, check if it's related to this model
    throughDatabase.on( NeuroDatabase.Events.ModelAdded, this.handleModelAdded( relation ), this );

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initialValue ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_INITIAL, this, model, relation, initialValue );

      this.grabModels( relation, initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_INITIAL_PULLED, this, model, relation );

      throughDatabase.ready( this.handleLazyLoad( relation ), this );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  },

  clone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      clone[ this.name ] = related.slice();
    }
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeSave )
    {
      var throughs = relation.throughs.values;

      for (var i = 0; i < throughs.length; i++)
      {
        var through = throughs[ i ];

        if ( !through.$isDeleted() && through.$hasChanges() )
        {
          through.$save( this.cascadeSave );
        }
      }
    }

    if ( relation && this.cascadeSaveRelated )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_PRESAVE, this, model, relation );

      relation.saving = true;
      relation.delaySaving = true;

      var models = relation.related;

      for (var i = 0; i < models.length; i++)
      {
        var related = models[ i ];

        if ( !related.$isDeleted() && related.$hasChanges() )
        {
          related.$save( this.cascadeSaveRelated );
        }
      }

      relation.saving = false;
      relation.delaySaving = false;
    }
  },

  preRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeRemove )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_PREREMOVE, this, model, relation );

      this.bulk( relation, function()
      {
        var throughs = relation.throughs.values;

        for (var i = 0; i < throughs.length; i++)
        {
          var through = throughs[ i ];

          through.$remove( this.cascadeRemove );
        }
      });
    }
  },

  handleModelAdded: function(relation)
  {
    return function (through, remoteData)
    {
      if ( relation.isRelated( through ) && !relation.throughs.has( through.$key() ) )
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_ADD, this, relation, through );

        this.addModelFromThrough( relation, through, remoteData );
      }
    };
  },

  handleLazyLoad: function(relation)
  {
    return function (throughDatabase)
    {
      var throughs = throughDatabase.filter( relation.isRelated );

      Neuro.debug( Neuro.Debugs.HASMANYTHRU_LAZY_LOAD, this, relation, throughs );

      if ( throughs.length )
      {
        this.bulk( relation, function()
        {
          for (var i = 0; i < throughs.length; i++)
          {
            this.addModelFromThrough( relation, throughs[ i ] );
          }
        });
      }
      else if ( this.query )
      {
        relation.query = this.executeQuery( relation.parent );
      }
    };
  },

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() )
    {
      return;
    }

    var adding = this.finishAddModel( relation, related, remoteData );

    if ( adding )
    {
      this.addThrough( relation, related, remoteData );
    }
    
    return adding;
  },

  addThrough: function(relation, related, remoteData)
  {
    var throughDatabase = this.through.Database;
    var throughKey = this.createThroughKey( relation, related );

    throughDatabase.grabModel( throughKey, this.onAddThrough( relation, remoteData ), this, remoteData );
  },

  onAddThrough: function(relation, remoteData)
  {
    return function onAddThrough(through)
    {
      this.finishAddThrough( relation, through, remoteData );
    };
  },

  addModelFromThrough: function(relation, through, remoteData)
  {
    if ( through.$isDeleted() )
    {
      return;
    }

    // TODO polymoprhic logic
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.buildKey( through, this.foreign );

    relatedDatabase.grabModel( relatedKey, this.onAddModelFromThrough( relation, through, remoteData ), this, remoteData );
  },

  onAddModelFromThrough: function(relation, through, remoteData)
  {
    return function onAddModelFromThrough(related)
    {
      if ( related )
      {
        this.finishAddThrough( relation, through, remoteData );
        this.finishAddModel( relation, related, remoteData );
      }
    };
  },

  finishAddThrough: function(relation, through, remoteData)
  {
    var model = relation.parent;
    var throughs = relation.throughs;
    var throughKey = through.$key();

    if ( !throughs.has( throughKey ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_THRU_ADD, this, relation, through );

      throughs.put( throughKey, through );

      through.$on( NeuroModel.Events.Removed, relation.onThroughRemoved );

      through.$dependents[ model.$uid() ] = model;

      if ( !remoteData && this.cascadeSave )
      {
        if ( model.$isSaved() )
        {
          through.$save( this.cascadeSave );
        }
        else
        {
          through.$save( Neuro.Cascade.None );
        }
      }
    }
  },

  finishAddModel: function(relation, related, remoteData)
  {
    var relateds = relation.related;
    var relatedKey = related.$key();
    var adding = !relateds.has( relatedKey );

    if ( adding )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_ADD, this, relation, related );

      relateds.put( relatedKey, related );

      related.$on( NeuroModel.Events.Removed, relation.onRemoved );
      related.$on( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );

      if ( !remoteData )
      {
        this.checkSave( relation );
      }
    }

    return adding;
  },

  removeModel: function(relation, related, remoteData)
  {
    var relatedKey = related.$key();
    var relateds = relation.related;
    var actualRelated = relateds.get( relatedKey );

    if ( actualRelated )
    {
      if ( this.removeThrough( relation, related, remoteData ) )
      {
        this.finishRemoveRelated( relation, relatedKey, remoteData );
      }
    }
  },

  removeThrough: function(relation, related, remoteData)
  {
    var throughDatabase = this.through.Database;
    var keyObject = this.createThroughKey( relation, related );
    var key = throughDatabase.getKey( keyObject );
    var throughs = relation.throughs;
    var through = throughs.get( key );

    return this.finishRemoveThrough( relation, through, related, true, remoteData );
  },

  removeModelFromThrough: function(relation, through)
  {
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.buildKey( through, this.foreign );
    
    if ( this.finishRemoveThrough( relation, through ) )
    {
      this.finishRemoveRelated( relation, relatedKey );
    }
  },

  finishRemoveThrough: function(relation, through, related, callRemove, remoteData)
  {
    var model = relation.parent;
    var removing = !!through;

    if ( removing )
    {
      if ( !this.canRemoveRelated( through, remoteData ) )
      {
        return false;
      }

      Neuro.debug( Neuro.Debugs.HASMANYTHRU_THRU_REMOVE, this, relation, through, related );

      var throughs = relation.throughs;
      var throughKey = through.$key();

      through.$off( NeuroModel.Events.Removed, relation.onThroughRemoved );

      delete through.$dependents[ model.$uid() ];

      if ( callRemove )
      {
        through.$remove();
      }

      throughs.remove( throughKey );
    }

    return removing;
  },

  finishRemoveRelated: function(relation, relatedKey)
  {
    var pending = relation.pending;
    var relateds = relation.related;
    var related = relateds.get( relatedKey );

    if ( related )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_REMOVE, this, relation, related );

      relateds.remove( relatedKey );

      related.$off( NeuroModel.Events.Removed, relation.onRemoved );
      related.$off( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ relatedKey ];

    return related;
  },

  isRelatedFactory: function(model)
  {
    var foreign = model.$db.key;
    var local = this.local;

    return function(through)
    {
      return propsMatch( through, local, model, foreign );
    };
  },

  createThroughKey: function(relation, related)
  {
    var model = relation.parent;
    var modelDatabase = model.$db;
    var relatedDatabase = this.model.Database;
    var throughDatabase = this.through.Database;
    var throughKey = throughDatabase.key;
    var key = {};

    for (var i = 0; i < throughKey.length; i++)
    {
      var prop = throughKey[ i ];

      if ( prop === this.foreign )
      {
        key[ prop ] = related.$key();
      }
      else if ( prop === this.local )
      {
        key[ prop ] = model.$key();
      }
      else if ( isArray( this.foreign ) )
      {
        var keyIndex = indexOf( this.foreign, prop );
        var keyProp = relatedDatabase.key[ keyIndex ];

        key[ prop ] = related[ keyProp ];
      }
      else if ( isArray( this.local ) )
      {
        var keyIndex = indexOf( this.local, prop );
        var keyProp = modelDatabase.key[ keyIndex ];

        key[ prop ] = model[ keyProp ];
      }
    }

    return key;
  }

});

function NeuroHasRemote()
{
}

Neuro.Relations.hasRemote = NeuroHasRemote;

NeuroHasRemote.Defaults = 
{
  model:                undefined,
  lazy:                 false,
  query:                false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 false,
  property:             true,
  dynamic:              false,
  comparator:           null,
  comparatorNullsFirst: false,
  autoRefresh:          false // NeuroModel.Events.RemoteGets
};

extend( NeuroRelationMultiple, NeuroHasRemote, 
{

  type: 'hasRemote',

  debugSort:            Neuro.Debugs.HASREMOTE_SORT,
  debugQuery:           Neuro.Debugs.HASREMOTE_QUERY,
  debugQueryResults:    Neuro.Debugs.HASREMOTE_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return NeuroHasRemote.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );
   
    Neuro.debug( Neuro.Debugs.HASREMOTE_INIT, this );

    this.finishInitialization();
  },

  handleLoad: function(model, remoteData)
  {
    var relator = this;
    var initial = model[ this.name ];
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      pending: {},
      related: this.createRelationCollection( model ),
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Neuro.debug( Neuro.Debugs.HASREMOVE_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        Neuro.debug( Neuro.Debugs.HASREMOVE_NINJA_SAVE, relator, model, this, relation );

        relator.sort( relation );
        relator.checkSave( relation );
      }

    };

    // Populate the model's key if it's missing
    model.$key();

    // If auto refersh was specified, execute the query on refresh
    if ( this.autoRefresh )
    {
      model.$on( this.autoRefresh, this.onRefresh( relation ), this );
    }

    // Execute query!
    relation.query = this.executeQuery( model );

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  },

  onRefresh: function(relation)
  {
    return function handleRefresh()
    {
      relation.query = this.executeQuery( relation.parent );
    };
  },

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    { 
      Neuro.debug( Neuro.Debugs.HASMANY_ADD, this, relation, related );

      target.put( key, related );

      related.$on( NeuroModel.Events.Removed, relation.onRemoved );
      related.$on( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );

      if ( !remoteData )
      {
        this.checkSave( relation );
      }
    }

    return adding;
  },

  removeModel: function(relation, related, remoteData)
  {
    if ( !this.canRemoveRelated( related, remoteData ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var pending = relation.pending;
    var key = related.$key();

    if ( target.has( key ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( NeuroModel.Events.Removed, relation.onRemoved );
      related.$off( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ key ];
  }

});

var NeuroPolymorphic = 
{

  setReferences: function(database, field, options)
  {
    this.isRelatedFactory = this.isRelatedDiscriminatedFactory( this.isRelatedFactory );

    this.loadDiscriminators(function()
    {
      this.onInitialized( database, field, options );
    });
  },

  isRelatedDiscriminatedFactory: function(isRelatedFactory)
  {
    return function (model)
    {
      var isRelated = isRelatedFactory.call( this, model );
      var discriminator = this.getDiscriminatorForModel( model );
      var discriminatorField = this.discriminator;

      return function (related)
      {
        if ( !isRelated( related ) )
        {
          return false;
        }

        return equals( discriminator, related[ discriminatorField ] );
      };
    };
  },

  loadDiscriminators: function(onLoad)
  {
    var discriminators = this.discriminators;
    var total = sizeof( discriminators );
    var loaded = 0;

    function handleLoaded()
    {
      if ( ++loaded === total )
      {
        onLoad.apply( this );
      }
    }

    for (var name in discriminators)
    {
      var discriminator = discriminators[ name ];

      Neuro.get( name, this.setDiscriminated( discriminator, handleLoaded ), this );
    }
  },

  setDiscriminated: function(discriminator, onLoad)
  {
    return function(neuro)
    {
      this.discriminators[ neuro.Database.name ] = discriminator;
      this.discriminators[ neuro.Database.className ] = discriminator;
      this.discriminatorToModel[ discriminator ] = neuro;

      onLoad.apply( this );
    };
  },

  createRelationCollection: function(model)
  {
    return NeuroDiscriminateCollection( new NeuroRelationCollection( undefined, model, this ), this.discriminator, this.discriminatorToModel );
  },

  createCollection: function()
  {
    return NeuroDiscriminateCollection( new NeuroModelCollection(), this.discriminator, this.discriminatorToModel );
  },

  ready: function(callback)
  {
    var models = this.discriminatorToModel;

    for ( var prop in models )
    {
      var model = models[ prop ];

      model.Database.ready( callback, this );  
    }
  },

  listenToModelAdded: function(callback)
  {
    var models = this.discriminatorToModel;

    for ( var prop in models )
    {
      var model = models[ prop ];

      model.Database.on( NeuroDatabase.Events.ModelAdded, callback, this );  
    }
  },

  executeQuery: function(model)
  {
    var queryOption = this.query;
    var query = isString( queryOption ) ? format( queryOption, model ) : queryOption;
    var remoteQuery = new NeuroRemoteQuery( model.$db, query );

    NeuroDiscriminateCollection( remoteQuery, this.discriminator, this.discriminatorToModel );

    remoteQuery.sync();
    remoteQuery.ready( this.handleExecuteQuery( model ), this );

    return remoteQuery;
  },

  parseModel: function(input, remoteData)
  {
    if ( input instanceof NeuroModel )
    {
      return input;
    }
    else if ( isObject( input ) )
    {
      var db = this.getDiscriminatorDatabase( input );

      if ( db )
      {
        return db.parseModel( input, remoteData );
      }
    }

    return false;
  },

  clearFields: function(target, targetFields, remoteData)
  {
    var changes = this.clearFieldsReturnChanges( target, targetFields );

    if ( target[ this.discriminator ] )
    {
      target[ this.discriminator ] = null;
      changes = true;
    }

    if ( changes && !remoteData && this.auto && !target.$isNew() )
    {
      target.$save();
    }
    
    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields, remoteData)
  {
    var changes = this.updateFieldsReturnChanges( target, targetFields, source, sourceFields );

    var targetField = this.discriminator;
    var targetValue = target[ targetField ];
    var sourceValue = this.getDiscriminatorForModel( source ); 

    if ( !equals( targetValue, sourceValue ) )
    {
      target[ targetField ] = sourceValue;
      changes = true;
    }

    if ( changes )
    {
      if ( this.auto && !target.$isNew() && !remoteData )
      {
        target.$save();
      }

      target.$trigger( NeuroModel.Events.KeyUpdate, [target, source, targetFields, sourceFields] );      
    }

    return changes;
  },

  grabInitial: function( model, fields )
  {
    var discriminator = this.discriminator;
    var discriminatorValue = model[ discriminator ];

    if ( hasFields( model, fields, isValue ) && isValue( discriminatorValue ) )
    {
      var related = this.discriminatorToModel[ discriminatorValue ];

      if ( related.Database )
      {
        var initial = {};

        initial[ discriminator ] = discriminatorValue;

        if ( isString( fields ) ) // && isString( model.Database.key )
        {
          initial[ related.Database.key ] = model[ fields ];
        }
        else // if ( isArray( fields ) && isArray( model.Database.key ) )
        {
          for (var i = 0; i < fields.length; i++)
          {
            initial[ related.Database.key[ i ] ] = model[ fields[ i ] ];   
          }
        }

        return initial;
      }
    }
  },

  grabModel: function(input, callback, remoteData)
  {
    if ( isObject( input ) )
    {
      var db = this.getDiscriminatorDatabase( input );

      if ( db !== false )
      {
        db.grabModel( input, callback, this, remoteData );
      }
    }
  },

  grabModels: function(initial, callback, remoteData)
  {
    for (var i = 0; i < initial.length; i++)
    {
      var input = initial[ i ];

      if ( input instanceof NeuroModel )
      {
        callback.call( this, input );
      }
      else if ( isObject( input ) )
      {
        var db = this.getDiscriminatorDatabase( input );

        if ( db )
        {
          var key = db.buildKeyFromInput( input );

          relation.pending[ key ] = true;

          db.grabModel( input, callback, this, remoteData );    
        }
      }
    }
  },

  ownsForeignKey: function()
  {
    return true;
  },

  isModelArray: function(input)
  {
    return isArray( input );
  },

  getDiscriminator: function(model)
  {
    return model[ this.discriminator ];
  },

  getDiscriminatorDatabase: function(model)
  {
    var discriminator = this.getDiscriminator( model );
    var model = this.discriminatorToModel[ discriminator ];

    return model ? model.Database : false;
  },

  getDiscriminatorForModel: function(model)
  {
    return this.discriminators[ model.$db.name ];
  }

};

  /* Top-Level Function */
  global.Neuro = Neuro;

  /* Classes */
  global.Neuro.Model = NeuroModel;
  global.Neuro.Database = NeuroDatabase;
  global.Neuro.Relation = NeuroRelation;
  global.Neuro.Operation = NeuroOperation;

  /* Collections */
  global.Neuro.Map = NeuroMap;
  global.Neuro.Collection = NeuroCollection;
  global.Neuro.ModelCollection = NeuroModelCollection;
  global.Neuro.Query = NeuroQuery;
  global.Neuro.RemoteQuery = NeuroRemoteQuery;
  global.Neuro.Page = NeuroPage;

  /* Relationships */
  global.Neuro.HasOne = NeuroHasOne;
  global.Neuro.BelongsTo = NeuroBelongsTo;
  global.Neuro.HasMany = NeuroHasMany;
  global.Neuro.HasManyThrough = NeuroHasManyThrough;
  global.Neuro.HasRemote = NeuroHasRemote;

  /* Utility Functions */
  global.Neuro.isNeuro = isNeuro;
  global.Neuro.isDefined = isDefined;
  global.Neuro.isFunction = isFunction;
  global.Neuro.isString = isString;
  global.Neuro.isNumber = isNumber;
  global.Neuro.isBoolean = isBoolean;
  global.Neuro.isDate = isDate;
  global.Neuro.isRegExp = isRegExp;
  global.Neuro.isArray = isArray;
  global.Neuro.isObject = isObject;
  global.Neuro.isValue = isValue;

  global.Neuro.uuid = uuid;
  global.Neuro.indexOf = indexOf;
  global.Neuro.propsMatch = propsMatch;
  global.Neuro.hasFields = hasFields;

  global.Neuro.eventize = eventize;

  global.Neuro.extend = extend;
  global.Neuro.extendArray = extendArray;

  global.Neuro.transfer = transfer;
  global.Neuro.swap = swap;
  global.Neuro.grab = grab;
  global.Neuro.pull = pull;
  global.Neuro.copy = copy;
  global.Neuro.noop = noop;
  global.Neuro.bind = bind;
  global.Neuro.diff = diff;
  global.Neuro.sizeof = sizeof;
  global.Neuro.isEmpty = isEmpty;
  global.Neuro.collect = collect;

  global.Neuro.compare = compare;
  global.Neuro.equals = equals;
  global.Neuro.equalsStrict = equalsStrict;
  global.Neuro.equalsCompare = equalsCompare;

  global.Neuro.isSorted = isSorted;
  global.Neuro.saveComparator = saveComparator;
  global.Neuro.createComparator = createComparator;
  global.Neuro.addComparator = addComparator;

  global.Neuro.saveWhere = saveWhere;
  global.Neuro.createWhere = createWhere;

  global.Neuro.savePropertyResolver = savePropertyResolver;
  global.Neuro.createPropertyResolver = createPropertyResolver;

  global.Neuro.saveNumberResolver = saveNumberResolver;
  global.Neuro.createNumberResolver = createNumberResolver;

  global.Neuro.saveHaving = saveHaving;
  global.Neuro.createHaving = createHaving;

  global.Neuro.parse = parse;
  global.Neuro.format = format;
  global.Neuro.createFormatter = createFormatter;

})(this);

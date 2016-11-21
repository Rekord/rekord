/* rekord 1.5.0 - A javascript REST ORM that is offline and real-time capable http://rekord.github.io/rekord/ by Philip Diffenderfer */
// UMD (Universal Module Definition)
(function (root, factory)
{
  if (typeof define === 'function' && define.amd) // jshint ignore:line
  {
    // AMD. Register as an anonymous module.
    define('rekord', [], function() { // jshint ignore:line
      return factory(root);
    });
  }
  else if (typeof module === 'object' && module.exports)  // jshint ignore:line
  {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(global);  // jshint ignore:line
  }
  else
  {
    // Browser globals (root is window)
    root.Rekord = factory(root);
  }
}(this, function(global, undefined)
{

  var win = typeof window !== 'undefined' ? window : global;   // jshint ignore:line


var AP = Array.prototype;

/**
 * Converts the given variable to an array of strings. If the variable is a
 * string it is split based on the delimiter given. If the variable is an
 * array then it is returned. If the variable is any other type it may result
 * in an error.
 *
 * ```javascript
 * Rekord.toArray([1, 2, 3]); // [1, 2, 3]
 * Rekord.toArray('1,2,3', ','); // ['1', '2', '3']
 * Rekord.toArray(1); // [1]
 * Rekord.toArray(null); // []
 * ```
 *
 * @memberof Rekord
 * @param {String|String[]} x
 *    The variable to convert to an Array.
 * @param {String} [delimiter]
 *    The delimiter to split if the given variable is a string.
 * @return {String[]} -
 *    The array of strings created.
 */
function toArray(x, delimiter)
{
  if ( x instanceof Array )
  {
    return x;
  }
  if ( isString( x ) )
  {
    return x.split( delimiter );
  }
  if ( isValue( x ) )
  {
    return [ x ];
  }

  return [];
}

/**
 * Finds the index of a variable in an array optionally using a custom
 * comparison function. If the variable is not found in the array then `false`
 * is returned.
 *
 * ```javascript
 * Rekord.indexOf([1, 2, 3], 1); // 0
 * Rekord.indexOf([1, 2, 3], 4); // false
 * Rekord.indexOf([1, 2, 2], 2); // 1
 * ```
 *
 *
 * @memberof Rekord
 * @param {Array} arr
 *    The array to search through.
 * @param {Any} x
 *    The variable to search for.
 * @param {Function} [comparator]
 *    The function to use which compares two values and returns a truthy
 *    value if they are considered equivalent. If a comparator is not given
 *    then strict comparison is used to determine equivalence.
 * @return {Number|Boolean} -
 *    The index in the array the variable exists at, otherwise false if
 *    the variable wasn't found in the array.
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
 * Returns an instance of {@link Rekord.Collection} with the initial values
 * passed as arguments to this function.
 *
 * ```javascript
 * Rekord.collect(1, 2, 3, 4);
 * Rekord.collect([1, 2, 3, 4]); // same as above
 * Rekord.collect();
 * Rekord.collect([]); // same as above
 * ```
 *
 * @memberof Rekord
 * @param {Any[]|...Any} a
 *    The initial values in the collection. You can pass an array of values
 *    or any number of arguments.
 * @return {Rekord.Collection} -
 *    A newly created instance containing the given values.
 */
function collect(a)
{
  var values = arguments.length > 1 || !isArray(a) ? Array.prototype.slice.call( arguments ) : a;

  return Collection.create( values );
}

/**
 * Returns an instance of {@link Rekord.Collection} with the initial values
 * passed as arguments to this function.
 *
 * ```javascript
 * Rekord.collectArray(1, 2, 3, 4);
 * Rekord.collectArray([1, 2, 3, 4]); // same as above
 * Rekord.collectArray();
 * Rekord.collectArray([]); // same as above
 * ```
 *
 * @memberof Rekord
 * @param {Any[]|...Any} a
 *    The initial values in the collection. You can pass an array of values
 *    or any number of arguments.
 * @return {Rekord.Collection} -
 *    A newly created instance containing the given values.
 */
function collectArray(a)
{
  var values = arguments.length > 1 || !isArray(a) ? Array.prototype.slice.call( arguments ) : a;

  return Collection.native( values );
}

function swap(a, i, k)
{
  var t = a[ i ];
  a[ i ] = a[ k ];
  a[ k ] = t;
}

function reverse(arr)
{
  var n = arr.length;
  var half = Math.floor( n / 2 );

  for (var i = 0; i < half; i++)
  {
    swap( arr, n - i - 1, i );
  }

  return arr;
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

function isPrimitiveArray(array)
{
  for (var i = 0; i < array.length; i++)
  {
    var item = array[i];

    if ( isValue( item ) )
    {
      return !isObject( item );
    }
  }

  return true;
}


// Class.create( construct, methods )
// Class.extend( parent, construct, override )
// Class.prop( target, name, value )
// Class.props( target, properties )
// Class.method( construct, methodName, method )
// Class.method( construct, methods )
// Class.replace( construct, methodName, methodFactory(super) )

// constructor.create( ... )
// constructor.native( ... ) // for arrays
// constructor.$constuctor
// constructor.prototype.$super
// constructor.$methods
// constructor.$prop( name, value ) // add to prototype
// constructor.$method( methodName, method ) // add to prototype
// constructor.$replace( methodName, methodFactory(super) )

var Class =
{

  create: function( construct, methods )
  {
    Class.prop( construct, 'create', Class.factory( construct ) );
    Class.build( construct, methods, noop );
  },

  extend: function( parent, construct, override )
  {
    var methods = collapse( override, parent.$methods );
    var parentCopy = Class.copyConstructor( parent );

    construct.prototype = new parentCopy();

    var instanceFactory = Class.factory( construct );

    if ( Class.isArray( parent ) )
    {
      var nativeArray = function()
      {
        var arr = [];
        Class.props( arr, methods );
        construct.apply( arr, arguments );
        return arr;
      };

      Class.prop( construct, 'native', nativeArray );
      Class.prop( construct, 'create', Settings.nativeArray ? nativeArray : instanceFactory );
    }
    else
    {
      Class.prop( construct, 'create', instanceFactory );
    }

    Class.build( construct, methods, parent );
  },

  dynamic: function(parent, parentInstance, className, code)
  {
    var DynamicClass = new Function('return function ' + className + code)(); // jshint ignore:line

    DynamicClass.prototype = parentInstance;

    Class.build( DynamicClass, {}, parent );

    return DynamicClass;
  },

  build: function(construct, methods, parent)
  {
    Class.prop( construct, '$methods', methods );
    Class.prop( construct, '$prop', Class.propThis );
    Class.prop( construct, '$method', Class.methodThis );
    Class.prop( construct, '$replace', Class.replaceThis );
    Class.prop( construct.prototype, '$super', parent );
    Class.prop( construct.prototype, 'constructor', construct );
    Class.props( construct.prototype, methods );
  },

  isArray: function( construct )
  {
    return Array === construct || construct.prototype instanceof Array;
  },

  method: function( construct, methodName, method )
  {
    if (construct.$methods)
    {
      construct.$methods[ methodName ] = method;
    }

    Class.prop( construct.prototype, methodName, method );
  },

  methodThis: function( methodName, method )
  {
    Class.method( this, methodName, method );
  },

  methods: function( construct, methods )
  {
    for (var methodName in methods)
    {
      Class.method( construct, methodName, methods[ methodName ] );
    }
  },

  prop: (function()
  {
    if (Object.defineProperty)
    {
      return function( target, property, value )
      {
        Object.defineProperty( target, property, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: value
        });
      };
    }
    else
    {
      return function( target, property, value )
      {
        target[ property ] = value;
      };
    }
  })(),

  propThis: function( property, value )
  {
    Class.prop( this.prototype, property, value );
  },

  props: function( target, properties )
  {
    for (var propertyName in properties)
    {
      Class.prop( target, propertyName, properties[ propertyName ] );
    }
  },

  replace: function( target, methodName, methodFactory )
  {
    var existingMethod = target.prototype[ methodName ] || target[ methodName ] || noop;

    Class.method( target, methodName, methodFactory( existingMethod ) );
  },

  replaceThis: function( methodName, methodFactory )
  {
    Class.replace( this, methodName, methodFactory );
  },

  copyConstructor: function(construct)
  {
    function F()
    {

    }

    F.prototype = construct.prototype;

    return F;
  },

  factory: function(construct)
  {
    function F(args)
    {
      construct.apply( this, args );
    }

    F.prototype = construct.prototype;

    return function()
    {
      return new F( arguments );
    };
  }

};


/**
 * Determines whether the given variable is defined.
 *
 * ```javascript
 * Rekord.isDefined(); // false
 * Rekord.isDefined(0); // true
 * Rekord.isDefined(true); // true
 * Rekord.isDefined(void 0); // false
 * Rekord.isDefined(undefined); // false
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is defined, otherwise false.
 */
function isDefined(x)
{
  return x !== undefined;
}

/**
 * Determines whether the given variable is a function.
 *
 * ```javascript
 * Rekord.isFunction(); // false
 * Rekord.isFunction(parseInt); // true
 * Rekord.isFunction(2); // false
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is a function, otherwise false.
 */
function isFunction(x)
{
  return !!(x && x.constructor && x.call && x.apply);
}

/**
 * Determines whether the given variable is a Rekord object. A Rekord object is a
 * constructor for a model and also has a Database variable. A Rekord object is
 * strictly created by the Rekord function.
 *
 * ```javascript
 * var Task = Rekord({
 *   name: 'task',
 *   fields: ['name', 'done', 'finished_at', 'created_at', 'assigned_to']
 * });
 * Rekord.isRekord( Task ); // true
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is a Rekord object, otherwise false.
 */
function isRekord(x)
{
  return !!(x && x.Database && isFunction( x ) && x.prototype instanceof Model);
}

/**
 * Determines whether the given variable is a string.
 *
 * ```javascript
 * Rekord.isString(); // false
 * Rekord.isString('x'): // true
 * Rekord.isString(1); // false
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is a string, otherwise false.
 */
function isString(x)
{
  return typeof x === 'string';
}

/**
 * Determines whether the given variable is a valid number. NaN and Infinity are
 * not valid numbers.
 *
 * ```javascript
 * Rekord.isNumber(); // false
 * Rekord.isNumber('x'): // false
 * Rekord.isNumber(1); // true
 * Rekord.isNumber(NaN); // false
 * Rekord.isNumber(Infinity); // true
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is a valid number, otherwise false.
 */
function isNumber(x)
{
  return typeof x === 'number' && !isNaN(x);
}

/**
 * Determines whether the given variable is a boolean value.
 *
 * ```javascript
 * Rekord.isBoolean(); // false
 * Rekord.isBoolean('x'): // false
 * Rekord.isBoolean(1); // false
 * Rekord.isBoolean(true); // true
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is a boolean value, otherwise false.
 */
function isBoolean(x)
{
  return typeof x === 'boolean';
}

/**
 * Determines whether the given variable is an instance of Date.
 *
 * ```javascript
 * Rekord.isDate(); // false
 * Rekord.isDate('x'): // false
 * Rekord.isDate(1); // false
 * Rekord.isDate(true); // false
 * Rekord.isDate(new Date()); // true
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is an instance of Date, otherwise false.
 */
function isDate(x)
{
  return x instanceof Date;
}

/**
 * Determines whether the given variable is an instance of RegExp.
 *
 * ```javascript
 * Rekord.isRegExp(); // false
 * Rekord.isRegExp('x'): // false
 * Rekord.isRegExp(1); // false
 * Rekord.isRegExp(true); // false
 * Rekord.isRegExp(/[xyz]/); // true
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is an instance of RegExp, otherwise false.
 */
function isRegExp(x)
{
  return x instanceof RegExp;
}

/**
 * Determines whether the given variable is an instance of Array.
 *
 * ```javascript
 * Rekord.isArray(); // false
 * Rekord.isArray('x'): // false
 * Rekord.isArray(1); // false
 * Rekord.isArray([]); // true
 * Rekord.isArray(Rekord.collect(1, 2, 3)); // true
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is an instance of Array, otherwise false.
 */
function isArray(x)
{
  return x instanceof Array;
}

/**
 * Determines whether the given variable is a non-null object. As a note,
 * Arrays are considered objects.
 *
 * ```javascript
 * Rekord.isObject(); // false
 * Rekord.isObject('x'): // false
 * Rekord.isObject(1); // false
 * Rekord.isObject([]); // true
 * Rekord.isObject({}); // true
 * Rekord.isObject(null); // false
 * ```
 *
 * @memberof Rekord
 * @param {Any} x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is a non-null object, otherwise false.
 */
function isObject(x)
{
  return x !== null && typeof x === 'object';
}

/**
 * Determines whether the given variable is not null and is not undefined.
 *
 * ```javascript
 * Rekord.isValue(); // false
 * Rekord.isValue('x'): // true
 * Rekord.isValue(1); // true
 * Rekord.isValue([]); // true
 * Rekord.isValue({}); // true
 * Rekord.isValue(null); // false
 * Rekord.isValue(void 0); // false
 * Rekord.isValue(undefined); // false
 * ```
 *
 * @memberof Rekord
 * @param {Any}  x
 *    The variable to test.
 * @return {Boolean} -
 *    True if the variable is non-null and not undefined.
 */
function isValue(x)
{
  return !!(x !== undefined && x !== null);
}

/**
 * A function that doesn't perform any operations.
 *
 * @memberof Rekord
 */
function noop()
{

}

/**
 * Returns the given function with the given context (`this`). This also has the
 * benefits of returning a "copy" of the function which makes it ideal for use
 * in listening on/once events and off events.
 *
 * ```javascript
 * var context = {};
 * var func = Rekord.bind( context, function(x) {
 *   this.y = x * 2;
 * });
 * func( 4 );
 * context.y; // 8
 * ```
 *
 * @memberof Rekord
 * @param {Object} context
 *    The value of `this` for the given function.
 * @param {Function}
 *    The function to invoke with the given context.
 * @return {Function} -
 *    A new function which is a copy of the given function with a new context.
 */
function bind(context, func)
{
  return function bindedFunction()
  {
    return func.apply( context, arguments );
  };
}

/**
 * Generates a UUID using the random number method.
 *
 * @memberof Rekord
 * @return {String} -
 *    The generated UUID.
 */
function uuid()
{
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function S4()
{
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

var now = Date.now || function()
{
  return new Date().getTime();
};

function sizeof(x)
{
  if ( isArray(x) || isString(x) )
  {
    return x.length;
  }
  else if ( isObject(x) )
  {
    var properties = 0;

    for (var prop in x) // jshint ignore:line
    {
      properties++;
    }

    return properties;
  }
  else if ( isNumber( x ) )
  {
    return x;
  }

  return 0;
}

function isEmpty(x)
{
  if (x === null || x === undefined || x === 0)
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
    for (var prop in x) // jshint ignore:line
    {
      return false;
    }

    return true;
  }

  return false;
}

function evaluate(x, avoidCopy, context)
{
  if ( !isValue( x ) )
  {
    return x;
  }

  if ( isRekord( x ) )
  {
    return new x();
  }
  if ( isFunction( x ) )
  {
    return context ? x.apply( context ) : x();
  }

  return avoidCopy ? x : copy( x );
}

function addPlugin( callback, beforeCreation )
{
  if ( beforeCreation )
  {
    return Rekord.on( Rekord.Events.Options, callback ); // (options)
  }
  else
  {
    return Rekord.on( Rekord.Events.Plugins, callback ); // (model, db, options)
  }
}


 /**
  * A string, a function, or an array of mixed values.
  *
  * ```javascript
  * 'age'                   // age property of an object
  * '-age'                  // age property of an object, ordering reversed
  * function(a, b) {}       // a function which compares two values
  * ['age', 'done']         // age property of an object, and when equal, the done value
  * 'creator.name'          // name sub-property of creator property
  * '{creator.name}, {age}' // formatted string
  * ```
  *
  * @typedef {String|comparisonCallback|Array} comparatorInput
  */


var Comparators = {};

function saveComparator(name, comparatorInput, nullsFirst)
{
  var comparator = createComparator( comparatorInput, nullsFirst );

  Comparators[ name ] = comparator;

  return comparator;
}

function addComparator(second, comparatorInput, nullsFirst)
{
  var first = createComparator( comparatorInput, nullsFirst );

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

/**
 * Creates a function which compares two values.
 *
 * @memberof Rekord
 * @param {comparatorInput} comparator
 *    The input which creates a comparison function.
 * @param {Boolean} [nullsFirst=false] -
 *    True if null values should be sorted first.
 * @return {comparisonCallback}
 */
function createComparator(comparator, nullsFirst)
{
  if ( isFunction( comparator ) )
  {
    return comparator;
  }
  else if ( isString( comparator ) )
  {
    if ( comparator in Comparators )
    {
      return Comparators[ comparator ];
    }

    if ( comparator.charAt(0) === '-' )
    {
      var parsed = createComparator( comparator.substring( 1 ), !nullsFirst );

      return function compareObjectsReversed(a, b)
      {
        return -parsed( a, b );
      };
    }
    else if ( isFormatInput( comparator ) )
    {
      var formatter = createFormatter( comparator );

      return function compareFormatted(a, b)
      {
        var af = formatter( a );
        var bf = formatter( b );

        return af.localeCompare( bf );
      };
    }
    else if ( isParseInput( comparator ) )
    {
      var parser = createParser( comparator );

      return function compareExpression(a, b)
      {
        var ap = parser( a );
        var bp = parser( b );

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
    var parsedChain = [];

    for (var i = 0; i < comparator.length; i++)
    {
      parsedChain[ i ] = createComparator( comparator[ i ], nullsFirst );
    }

    return function compareObjectsCascade(a, b)
    {
      var d = 0;

      for (var i = 0; i < parsedChain.length && d === 0; i++)
      {
        d = parsedChain[ i ]( a, b );
      }

      return d;
    };
  }

  return null;
}


/**
 * A function for comparing two values and determine whether they're considered
 * equal.
 *
 * @callback equalityCallback
 * @param {Any} a -
 *    The first value to test.
 * @param {Any} b -
 *    The second value to test.
 * @return {Boolean} -
 *    Whether or not the two values are considered equivalent.
 * @see Rekord.equals
 * @see Rekord.equalsStrict
 * @see Rekord.equalsCompare
 */

 /**
  * A function for comparing two values to determine if one is greater or lesser
  * than the other or if they're equal.
  *
  * ```javascript
  * comparisonCallback( a, b ) < 0 // a < b
  * comparisonCallback( a, b ) > 0 // a > b
  * comparisonCallback( a, b ) == 0 // a == b
  * ```
  *
  * @callback comparisonCallback
  * @param {Any} a -
  *    The first value to test.
  * @param {Any} b -
  *    The second value to test.
  * @return {Number} -
  *    0 if the two values are considered equal, a negative value if `a` is
  *    considered less than `b`, and a positive value if `a` is considered
  *    greater than `b`.
  * @see Rekord.compare
  * @see Rekord.compareNumbers
  */

function equalsStrict(a, b)
{
  return a === b;
}

function equalsWeak(a, b)
{
  return a == b; // jshint ignore:line
}

function equalsCompare(a, b)
{
  return compare( a, b ) === 0;
}

function equals(a, b)
{
  if (a === b)
  {
    return true;
  }
  if (a === null || b === null)
  {
    return false;
  }
  if (a !== a && b !== b)
  {
    return true; // NaN === NaN
  }

  var at = typeof a;
  var bt = typeof b;
  var ar = isRegExp(a);
  var br = isRegExp(b);

  if (at === 'string' && br)
  {
    return b.test(a);
  }
  if (bt === 'string' && ar)
  {
    return a.test(b);
  }

  if (at !== bt)
  {
    return false;
  }

  var aa = isArray(a);
  var ba = isArray(b);
  if (aa !== ba)
  {
    return false;
  }

  if (aa)
  {
    if (a.length !== b.length)
    {
      return false;
    }

    for (var i = 0; i < a.length; i++)
    {
      if (!equals(a[i], b[i]))
      {
        return false;
      }
    }

    return true;
  }

  if (isDate(a))
  {
    return isDate(b) && equals( a.getTime(), b.getTime() );
  }
  if (ar)
  {
    return br && a.toString() === b.toString();
  }

  if (at === 'object')
  {
    for (var ap in a)
    {
      if (ap.charAt(0) !== '$' && !isFunction(a[ap]))
      {
        if (!(ap in b) || !equals(a[ap], b[ap]))
        {
          return false;
        }
      }
    }

    for (var bp in b)
    {
      if (bp.charAt(0) !== '$' && !isFunction(b[bp]))
      {
        if (!(bp in a))
        {
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
  if (a == b) // jshint ignore:line
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
    return (a ? -1 : 1);
  }

  return (a + '').localeCompare(b + '');
}


function addEventFunction(target, functionName, events, secret)
{
  var on = secret ? '$on' : 'on';
  var off = secret ? '$off' : 'off';

  var eventFunction = function(callback, context)
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
    }

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

  if (target.$methods)
  {
    Class.method( target, functionName, eventFunction );
  }
  else
  {
    Class.prop( target, functionName, eventFunction );
  }
}

/**
 * Adds functions to the given object (or prototype) so you can listen for any
 * number of events on the given object, optionally once. Listeners can be
 * removed later.
 *
 * The following methods will be added to the given target:
 *
 * ```
 * target.on( events, callback, [context] )
 * target.once( events, callback, [context] )
 * target.after( events, callback, [context] )
 * target.off( events, callback )
 * target.trigger( events, [a, b, c...] )
 * ```
 *
 * Where...
 * - `events` is a string of space delimited events.
 * - `callback` is a function to invoke when the event is triggered.
 * - `context` is an object that should be the `this` when the callback is
 *   invoked. If no context is given the default value is the object which has
 *   the trigger function that was invoked.
 *
 * @memberof Rekord
 * @param {Object} [target] -
 *    The object to add `on`, `once`, `off`, and `trigger` functions to.
 * @param {Boolean} [secret=false] -
 *    If true - the functions will be prefixed with `$`.
 */
function addEventful(target, secret)
{

  var CALLBACK_FUNCTION = 0;
  var CALLBACK_CONTEXT = 1;
  var CALLBACK_GROUP = 2;

  var triggerId = 0;

  /**
   * A mixin which adds `on`, `once`, `after`, and `trigger` functions to
   * another object.
   *
   * @class Eventful
   * @memberof Rekord
   * @see Rekord.addEventful
   */

   /**
    * A mixin which adds `$on`, `$once`, `$after`, and `$trigger` functions to
    * another object.
    *
    * @class Eventful$
    * @memberof Rekord
    * @see Rekord.addEventful
    */

  // Adds a listener to $this
  function onListeners($this, property, eventsInput, callback, context)
  {
    if ( !isFunction( callback ) )
    {
      return noop;
    }

    var events = toArray( eventsInput, ' ' );
    var listeners = $this[ property ];

    if ( !listeners )
    {
      Class.prop( $this, property, listeners = {} );
    }

    for (var i = 0; i < events.length; i++)
    {
      var eventName = events[ i ];
      var eventListeners = listeners[ eventName ];

      if ( !eventListeners )
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
  }

  /**
   * Listens for every occurrence of the given events and invokes the callback
   * each time any of them are triggered.
   *
   * @method on
   * @memberof Rekord.Eventful#
   * @param {String|Array} events -
   *    The event or events to listen to.
   * @param {Function} callback -
   *    The function to invoke when any of the events are invoked.
   * @param {Object} [context] -
   *    The value of `this` when the callback is invoked. If not specified, the
   *    reference of the object this function exists on will be `this`.
   * @return {Function} -
   *    A function to invoke to stop listening to all of the events given.
   */

  /**
   * Listens for every occurrence of the given events and invokes the callback
   * each time any of them are triggered.
   *
   * @method $on
   * @memberof Rekord.Eventful$#
   * @param {String|Array} events -
   *    The event or events to listen to.
   * @param {Function} callback -
   *    The function to invoke when any of the events are invoked.
   * @param {Object} [context] -
   *    The value of `this` when the callback is invoked. If not specified, the
   *    reference of the object this function exists on will be `this`.
   * @return {Function} -
   *    A function to invoke to stop listening to all of the events given.
   */

  function on(events, callback, context)
  {
    return onListeners( this, '$$on', events, callback, context );
  }

  /**
   * Listens for the first of the given events to be triggered and invokes the
   * callback once.
   *
   * @method once
   * @memberof Rekord.Eventful#
   * @param {String|Array} events -
   *    The event or events to listen to.
   * @param {Function} callback -
   *    The function to invoke when any of the events are invoked.
   * @param {Object} [context] -
   *    The value of `this` when the callback is invoked. If not specified, the
   *    reference of the object this function exists on will be `this`.
   * @return {Function} -
   *    A function to invoke to stop listening to all of the events given.
   */

  /**
   * Listens for the first of the given events to be triggered and invokes the
   * callback once.
   *
   * @method $once
   * @memberof Rekord.Eventful$#
   * @param {String|Array} events -
   *    The event or events to listen to.
   * @param {Function} callback -
   *    The function to invoke when any of the events are invoked.
   * @param {Object} [context] -
   *    The value of `this` when the callback is invoked. If not specified, the
   *    reference of the object this function exists on will be `this`.
   * @return {Function} -
   *    A function to invoke to stop listening to all of the events given.
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
   * @for addEventful
   * @param {String|Array|Object} [eventsInput]
   * @param {Function} [callback]
   * @chainable
   */
  function off(eventsInput, callback)
  {
    // Remove ALL listeners
    if ( !isDefined( eventsInput ) )
    {
      deleteProperty( this, '$$on' );
      deleteProperty( this, '$$once' );
      deleteProperty( this, '$$after' );
    }
    else
    {
      var events = toArray( eventsInput, ' ' );

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
   * @for addEventful
   * @param {String} eventsInput
   * @param {Array} args
   * @chainable
   */
  function trigger(eventsInput, args)
  {
    try
    {
      var events = toArray( eventsInput, ' ' );

      for (var i = 0; i < events.length; i++)
      {
        var e = events[ i ];

        triggerListeners( this.$$on, e, args, false );
        triggerListeners( this.$$once, e, args, true );
        triggerListeners( this.$$after, e, args, false );
      }
    }
    catch (ex)
    {
      Rekord.trigger( Rekord.Events.Error, [ex] );
    }

    return this;
  }

  var methods = null;

  if ( secret )
  {
    methods = {
      $on: on,
      $once: once,
      $after: after,
      $off: off,
      $trigger: trigger
    };
  }
  else
  {
    methods = {
      on: on,
      once: once,
      after: after,
      off: off,
      trigger: trigger
    };
  }

  if ( target.$methods )
  {
    Class.methods( target, methods );
  }
  else
  {
    Class.props( target, methods );
  }
}



function applyOptions( target, options, defaults, secret )
{
  options = options || {};

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
      target[ defaultProperty ] = option;
    }
    else
    {
      target[ defaultProperty ] = copy( defaultValue );
    }
  }

  for (var optionProperty in options)
  {
    if ( !(optionProperty in defaults) )
    {
      target[ optionProperty ] = options[ optionProperty ];
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

function clearFieldsReturnChanges(target, targetFields)
{
  var changes = false;

  if ( isArray( targetFields ) )
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
  else
  {
    if ( target[ targetFields ] )
    {
      target[ targetFields ] = null;
      changes = true;
    }
  }

  return changes;
}

function updateFieldsReturnChanges(target, targetFields, source, sourceFields)
{
  var changes = false;

  if ( isArray( targetFields ) ) // && isArray( sourceFields )
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
  else
  {
    var targetValue = target[ targetFields ];
    var sourceValue = source[ sourceFields ];

    if ( !equals( targetValue, sourceValue ) )
    {
      target[ targetFields ] = copy( sourceValue );
      changes = true;
    }
  }

  return changes;
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


function isParseInput(x)
{
  return x.indexOf('.') !== -1 || x.indexOf('[') !== -1 || x.indexOf('(') !== -1;
}

function parse(expr, base)
{
  return createParser( expr )( base );
}

parse.REGEX = /([\w$]+)/g;

function createParser(expr)
{
  var regex = parse.REGEX;
  var nodes = [];
  var match = null;

  while ((match = regex.exec( expr )) !== null)
  {
    nodes.push( match[ 1 ] );
  }

  return function(base)
  {
    for (var i = 0; i < nodes.length && base !== undefined; i++)
    {
      var n = nodes[ i ];

      if ( isObject( base ) )
      {
        base = evaluate( base[ n ], true, base );
      }
    }

    return base;
  };
}

function isFormatInput(x)
{
  return x.indexOf('{') !== -1;
}

function format(template, base)
{
  return createFormatter( template )( base );
}

format.REGEX = /[\{\}]/;

function createFormatter(template)
{
  // Every odd element in parts is a parse expression
  var parts = template.split( format.REGEX );

  for (var i = 1; i < parts.length; i += 2 )
  {
    parts[ i ] = createParser( parts[ i ] );
  }

  return function formatter(base)
  {
    var formatted = '';

    for (var i = 0; i < parts.length; i++)
    {
      if ( (i & 1) === 0 )
      {
        formatted += parts[ i ];
      }
      else
      {
        var parsed = parts[ i ]( base );

        formatted += isValue( parsed ) ? parsed : '';
      }
    }

    return formatted;
  };
}

function parseDate(x, utc)
{
  if ( isString( x ) )
  {
    if ( Date.parse )
    {
      x = Date.parse( x );
    }

    if ( !isNumber( x ) )
    {
      x = new Date( x );
    }
  }
  if ( isNumber( x ) )
  {
    x = new Date( x );
  }
  if ( isDate( x ) && isNumber( x.getTime() ) )
  {
    if ( utc )
    {
      x = new Date( x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate(), x.getUTCHours(), x.getUTCMinutes(), x.getUTCSeconds() );
    }

    return x;
  }

  return false;
}



/**
 * A function for resolving a value from a given value. Typically used to
 * transform an object into one of it's properties.
 *
 * @callback propertyResolverCallback
 * @param {Any} model -
 *    The model to use to resolve a value.
 * @return {Any} -
 *    The resolved value.
 * @see Rekord.createPropertyResolver
 */


/**
 * An expression which resolves a value from another value.
 *
 * ```javascript
 * // {age: 6, name: 'x', user: {first: 'tom'}}
 * 'age'                    // age property of an object
 * 'user.first'             // sub property
 * '{age}, {user.first}'    // a formatted string built from object values
 * function(a) {}           // a function which returns a value itself
 * ['age', 'name']          // multiple properties resolves to an array of values
 * {age:null, user:'first'} // multiple properties including a sub property returns an object of values
 * ```
 *
 * @typedef {String|Function|Array|Object} propertyResolverInput
 */

var NumberResolvers = {};

function saveNumberResolver(name, numbers, invalidValue)
{
  var resolver = createNumberResolver( numbers, invalidValue );

  NumberResolvers[ name ] = resolver;

  return resolver;
}

function createNumberResolver(numbers, invalidValue)
{
  var resolver = createPropertyResolver( numbers );

  if ( isString( numbers ) && numbers in NumberResolvers )
  {
    return NumberResolvers[ numbers ];
  }

  return function resolveNumber(model)
  {
    var parsed = parseFloat( resolver( model ) );

    return isNaN( parsed ) ? invalidValue : parsed;
  };
}

var PropertyResolvers = {};

function savePropertyResolver(name, properties)
{
  var resolver = createPropertyResolver( properties );

  PropertyResolvers[ name ] = resolver;

  return resolver;
}

/**
 * Creates a function which resolves a value from another value given an
 * expression. This is often used to get a property value of an object.
 *
 * ```javascript
 * // x = {age: 6, name: 'tom', user: {first: 'jack'}}
 * createPropertyResolver()( x )                          // x
 * createPropertyResolver( 'age' )( x )                   // 6
 * createPropertyResolver( 'user.first' )( x )            // 'jack'
 * createPropertyResolver( '{name} & {user.first}')( x )  // 'tom & jack'
 * createPropertyResolver( ['name', 'age'] )( x )         // ['tom', 6]
 * createPropertyResolver( {age:null, user:'first'})( x ) // {age: 6, user:'jack'}
 * ```
 *
 * @memberof Rekord
 * @param {propertyResolverInput} [properties] -
 *    The expression which converts one value into another.
 * @return {propertyResolverCallback} -
 *    A function to take values and resolve new ones.
 */
function createPropertyResolver(properties)
{
  if ( isFunction( properties ) )
  {
    return properties;
  }
  else if ( isString( properties ) )
  {
    if ( properties in PropertyResolvers )
    {
      return PropertyResolvers[ properties ];
    }

    if ( isFormatInput( properties ) )
    {
      return createFormatter( properties );
    }
    else if ( isParseInput( properties ) )
    {
      return createParser( properties );
    }
    else
    {
      return function resolveProperty(model)
      {
        return model ? model[ properties ] : undefined;
      };
    }
  }
  else if ( isArray( properties ) )
  {
    return function resolveProperties(model)
    {
      return pull( model, properties );
    };
  }
  else if ( isObject( properties ) )
  {
    var propsArray = [];
    var propsResolver = [];

    for (var prop in properties)
    {
      propsArray.push( prop );
      propsResolver.push( createPropertyResolver( properties[ prop ] ) );
    }

    return function resolvePropertyObject(model)
    {
      var resolved = {};

      for (var i = 0; i < propsArray.length; i++)
      {
        var prop = propsArray[ i ];

        resolved[ prop ] = propsResolver[ i ]( model[ prop ] );
      }

      return resolved;
    };
  }
  else
  {
    return function resolveNone(model)
    {
      return model;
    };
  }
}


var Settings = global.RekordSettings || win.RekordSettings || {};

if ( win.document && win.document.currentScript )
{
  var script = win.document.currentScript;

  if (script.getAttribute('native-array') !== null)
  {
    Settings.nativeArray = true;
  }
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

function split(x, delimiter, escape)
{
  var regexDelimiter = isRegExp( delimiter ) ? delimiter : new RegExp( '(' + delimiter + ')' );
  var splits = x.split( regexDelimiter );
  var i = 0;
  var n = splits.length - 2;

  while (i < n)
  {
    var a = splits[ i ];
    var ae = a.length - escape.length;

    if ( a.substring( ae ) === escape )
    {
      var b = splits[ i + 1 ];
      var c = splits[ i + 2 ];
      var joined = a.substring( 0, ae ) + b + c;

      splits.splice( i, 3, joined );
      n -= 2;
    }
    else
    {
      i += 1;
      splits.splice( i, 1 );
      n -= 1;
    }
  }

  return splits;
}


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


/**
 * Creates a Rekord object given a set of options. A Rekord object is also the
 * constructor for creating instances of the Rekord object defined.
 *
 * @namespace
 * @param {Object} options
 *        The options of
 */
function Rekord(options)
{
  var promise = Rekord.get( options.name );

  if ( promise.isComplete() )
  {
    return promise.results[0];
  }

  Rekord.trigger( Rekord.Events.Options, [options] );

  var database = new Database( options );

  var model = Class.dynamic(
    Model,
    new Model( database ),
    database.className,
    '(props, remoteData) { this.$init( props, remoteData ) }'
  );

  database.Model = model;
  model.Database = database;

  Rekord.classes[ database.name ] = model;

  Rekord.trigger( Rekord.Events.Plugins, [model, database, options] );

  if ( Rekord.autoload )
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
    Rekord.unloaded.push( database );
  }

  Rekord.get( database.name ).resolve( model );
  Rekord.get( database.className ).resolve( model );

  Rekord.debug( Rekord.Debugs.CREATION, database, options );

  return model;
}

Rekord.classes = {};

Rekord.autoload = false;

Rekord.unloaded = [];

Rekord.loadPromise = null;

Rekord.load = function(callback, context)
{
  var promise = Rekord.loadPromise = Rekord.loadPromise || new Promise( null, false );
  var loading = Rekord.unloaded.slice();
  var loaded = [];
  var loadedSuccess = [];

  promise.success( callback, context || this );

  Rekord.unloaded.length = 0;

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

      promise.reset().resolve();
    }
  }

  for (var i = 0; i < loading.length; i++)
  {
    loading[ i ].loadBegin( onLoadFinish );
  }

  return promise;
};

Rekord.promises = {};

Rekord.get = function(name)
{
  var existing = Rekord.promises[ name ];

  if ( !existing )
  {
    existing = Rekord.promises[ name ] = new Promise( null, false );
  }

  return existing;
};

Rekord.export = function()
{
  var classes = Rekord.classes;

  for (var className in classes)
  {
    win[ className ] = classes[ className ];
  }
};

Rekord.clear = function(removeListeners)
{
  var classes = Rekord.classes;

  for (var className in classes)
  {
    classes[ className ].clear( removeListeners );
  }
};

Rekord.reset = function(failOnPendingChanges, removeListeners)
{
  var classes = Rekord.classes;

  if ( failOnPendingChanges )
  {
    for (var className in classes)
    {
      var db = classes[ className ].Database;

      if ( db.hasPending() )
      {
        return Promise.reject( db );
      }
    }
  }

  return Promise.singularity(this, function()
  {
    for (var className in classes)
    {
      var db = classes[ className ].Database;

      db.reset( false, removeListeners );
    }
  });
};

/**
 * A value which identifies a model instance. This can be the key of the model,
 * an array of values (if the model has composite keys), an object which at
 * least contains fields which identify the model, an instance of a model, the
 * reference to a Rekord instance, or a function.
 *
 * If a plain object is given and it shares the same key as an existing model -
 * the other fields on the object will be applied to the existing instance. If
 * a plain object is given and it's key doesn't map to an existing model - a new
 * one is created.
 *
 * If a reference to a Rekord instance is given - a new model instance is created
 * with default values.
 *
 * If a function is given - it's invoked and the returning value is used as the
 * value to identify the model instance.
 *
 * @typedef {String|Number|String[]|Number[]|Object|Rekord|Rekord.Model|Function} modelInput
 */

 /**
  * A key to a model instance.
  *
  * @typedef {String|Number} modelKey
  */

addEventful( Rekord );

Rekord.Events =
{
  Initialized:  'initialized',
  Plugins:      'plugins',
  Options:      'options',
  Online:       'online',
  Offline:      'offline',
  Error:        'error'
};


var Cache =
{
  None:       'none',
  Pending:    'pending',
  All:        'all'
};


var Cascade =
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

function canCascade(cascade, type)
{
  return !isNumber( cascade ) || (cascade & type) === type;
}

var Load =
{
  None:   0,
  All:    1,
  Lazy:   2,
  Both:   3
};



var RestStatus =
{
  Conflict:   {409: true},
  NotFound:   {404: true, 410: true},
  Offline:    {0: true}
};

var Save =
{
  None:   0,
  Model:  4,
  Key:    5,
  Keys:   6
};

var Store =
{
  None:   0,
  Model:  1,
  Key:    2,
  Keys:   3
};


var batchDepth = 0;
var batches = [];
var batchHandlers = [];
var batchOverwrites = [];

function batch(namesInput, operationsInput, handler)
{
  var names = toArray( namesInput, /\s*,\s/ );
  var operations = toArray( operationsInput, /\s*,\s/ );
  var batchID = batchHandlers.push( handler ) - 1;
  var batch = batches[ batchID ] = new Collection();

  for (var i = 0; i < names.length; i++)
  {
    var modelName = names[ i ];
    var modelHandler = createModelHandler( operations, batch );

    if ( isString( modelName ) )
    {
      if ( modelName in Rekord.classes )
      {
        modelHandler( Rekord.classes[ modelName ] );
      }
      else
      {
        earlyModelHandler( modelName, modelHandler );
      }
    }
    else if ( isRekord( modelName ) )
    {
      modelHandler( modelName );
    }
    else if ( modelName === true )
    {
      for (var databaseName in Rekord.classes)
      {
        modelHandler( Rekord.classes[ databaseName ] );
      }

      Rekord.on( Rekord.Events.Plugins, modelHandler );
    }
    else
    {
      throw modelName + ' is not a valid input for batching';
    }
  }
}

function earlyModelHandler(name, modelHandler)
{
  var off = Rekord.on( Rekord.Events.Plugins, function(model, database)
  {
    if ( database.name === name )
    {
      modelHandler( model );

      off();
    }
  });
}

function createModelHandler(operations, batch)
{
  return function(modelClass)
  {
    var db = modelClass.Database;
    var rest = db.rest;

    for (var i = 0; i < operations.length; i++)
    {
      var op = operations[ i ];

      batchOverwrites.push( rest, op, rest[ op ] );

      switch (op)
      {
        case 'all':
          rest.all = function(options, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'all',
              options: options,
              success: success,
              failure: failure
            });
          };
          break;
        case 'get':
          rest.get = function(model, options, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'get',
              options: options,
              success: success,
              failure: failure,
              model: model
            });
          };
          break;
        case 'create':
          rest.create = function(model, encoded, options, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'create',
              options: options,
              success: success,
              failure: failure,
              model: model,
              encoded: encoded
            });
          };
          break;
        case 'update':
          rest.update = function(model, encoded, options, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'update',
              options: options,
              success: success,
              failure: failure,
              model: model,
              encoded: encoded
            });
          };
          break;
        case 'remove':
          rest.remove = function(model, options, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'remove',
              options: options,
              success: success,
              failure: failure,
              model: model
            });
          };
          break;
        case 'query':
          rest.query = function(url, query, options, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'query',
              options: options,
              success: success,
              failure: failure,
              url: url,
              encoded: query
            });
          };
          break;
        default:
          throw op + ' is not a valid operation you can batch';
      }
    }
  };
}

function batchRun()
{
  for (var i = 0; i < batches.length; i++)
  {
    var batch = batches[ i ];
    var handler = batchHandlers[ i ];

    if ( batch.length )
    {
      handler( batch );

      batch.clear();
    }
  }
}

function batchStart()
{
  batchDepth++;
}

function batchEnd()
{
  batchDepth--;

  if ( batchDepth === 0 )
  {
    batchRun();
  }
}

function batchClear()
{
  for (var i = 0; i < batchOverwrites.length; i += 3)
  {
    var rest = batchOverwrites[ i + 0 ];
    var prop = batchOverwrites[ i + 1 ];
    var func = batchOverwrites[ i + 2 ];

    rest[ prop ] = func;
  }

  batches.length = 0;
  batchHandlers.length = 0;
  batchOverwrites.length = 0;
}

function batchExecute(func, context)
{
  try
  {
    batchStart();

    func.apply( context );
  }
  catch (ex)
  {
    Rekord.trigger( Rekord.Events.Error, [ex] );

    throw ex;
  }
  finally
  {
    batchEnd();
  }
}

Rekord.batch = batch;
Rekord.batchRun = batchRun;
Rekord.batchStart = batchStart;
Rekord.batchEnd = batchEnd;
Rekord.batchClear = batchClear;
Rekord.batchExecute = batchExecute;
Rekord.batchDepth = function() { return batchDepth; };


Rekord.debug = function(event, source)  /*, data.. */
{
  // up to the user
};

/**
 * Sets the debug implementation provided the factory function. This function
 * can only be called once - all subsequent calls will be ignored unless
 * `overwrite` is given as a truthy value.
 *
 * @memberof Rekord
 * @param {Function} factory -
 *    The factory which provides debug implementations.
 * @param {Boolean} [overwrite=false] -
 *    True if existing implementations are to be ignored and the given factory
 *    should be the implementation.
 */
Rekord.setDebug = function(factory, overwrite)
{
  if ( !Rekord.debugSet || overwrite )
  {
    Rekord.debug = factory;
    Rekord.debugSet = true;
  }
};

Rekord.Debugs = {

  CREATION: 0,                // options

  REST: 1,                    // options
  AUTO_REFRESH: 73,           //

  MISSING_KEY: 33,            // encoded

  REMOTE_UPDATE: 2,           // encoded, Model
  REMOTE_CREATE: 3,           // encoded, Model
  REMOTE_REMOVE: 4,           // Model
  REMOTE_LOAD: 5,             // encoded[]
  REMOTE_LOAD_OFFLINE: 6,     //
  REMOTE_LOAD_ERROR: 7,       // status
  REMOTE_LOAD_REMOVE: 8,      // key
  REMOTE_LOAD_RESUME: 22,     //

  LOCAL_LOAD: 9,              // encoded[]
  LOCAL_RESUME_DELETE: 10,    // Model
  LOCAL_RESUME_SAVE: 11,      // Model
  LOCAL_LOAD_SAVED: 12,       // Model

  REALTIME_SAVE: 13,          // encoded, key
  REALTIME_REMOVE: 14,        // key

  SAVE_VALUES: 15,            // encoded, Model
  SAVE_PUBLISH: 16,           // encoded, Model
  SAVE_CONFLICT: 17,          // encoded, Model
  SAVE_UPDATE_FAIL: 18,       // Model
  SAVE_ERROR: 19,             // Model, status
  SAVE_OFFLINE: 20,           // Model
  SAVE_RESUME: 21,            // Model
  SAVE_REMOTE: 25,            // Model
  SAVE_DELETED: 40,           // Model

  SAVE_OLD_REVISION: 48,      // Model, encoded

  SAVE_LOCAL: 23,             // Model
  SAVE_LOCAL_ERROR: 24,       // Model, error
  SAVE_LOCAL_DELETED: 38,     // Model
  SAVE_LOCAL_BLOCKED: 39,     // Model

  SAVE_REMOTE_DELETED: 41,    // Model, [encoded]
  SAVE_REMOTE_BLOCKED: 42,    // Model

  REMOVE_PUBLISH: 26,         // key, Model
  REMOVE_LOCAL: 27,           // key, Model
  REMOVE_MISSING: 28,         // key, Model
  REMOVE_ERROR: 29,           // status, key, Model
  REMOVE_OFFLINE: 30,         // Model
  REMOVE_RESUME: 31,          // Model
  REMOVE_REMOTE: 32,          // Model
  REMOVE_CANCEL_SAVE: 47,     // Model

  REMOVE_LOCAL_ERROR: 34,     // Model, error
  REMOVE_LOCAL_BLOCKED: 44,   // Model
  REMOVE_LOCAL_NONE: 45,      // Model
  REMOVE_LOCAL_UNSAVED: 46,   // Model

  REMOVE_REMOTE_BLOCKED: 43,  // Model

  GET_LOCAL_SKIPPED: 104,     // Model
  GET_LOCAL: 105,             // Model, encoded
  GET_LOCAL_ERROR: 106,       // Model, e
  GET_REMOTE: 107,            // Model, data
  GET_REMOTE_ERROR: 108,      // Model, data, status

  ONLINE: 35,                 //
  OFFLINE: 36,                //

  PUBSUB_CREATED: 37,         // PubSub

  HASONE_INIT: 53,            // HasOne
  HASONE_NINJA_REMOVE: 49,    // Model, relation
  HASONE_INITIAL_PULLED: 51,  // Model, initial
  HASONE_INITIAL: 52,         // Model, initial
  HASONE_CLEAR_MODEL: 54,     // relation
  HASONE_SET_MODEL: 55,       // relation
  HASONE_PRESAVE: 56,         // Model, relation
  HASONE_POSTREMOVE: 57,      // Model, relation
  HASONE_CLEAR_KEY: 58,       // Model, local
  HASONE_UPDATE_KEY: 59,      // Model, targetFields, Model, sourceFields
  HASONE_LOADED: 60,          // Model, relation, [Model]
  HASONE_QUERY: 111,          // Model, RemoteQuery, queryOption, query
  HASONE_QUERY_RESULTS: 112,  // Model, RemoteQuery

  BELONGSTO_INIT: 61,          // HasOne
  BELONGSTO_NINJA_REMOVE: 62,  // Model, relation
  BELONGSTO_NINJA_SAVE: 63,    // Model, relation
  BELONGSTO_INITIAL_PULLED: 64,// Model, initial
  BELONGSTO_INITIAL: 65,       // Model, initial
  BELONGSTO_CLEAR_MODEL: 66,   // relation
  BELONGSTO_SET_MODEL: 67,     // relation
  BELONGSTO_POSTREMOVE: 69,    // Model, relation
  BELONGSTO_CLEAR_KEY: 70,     // Model, local
  BELONGSTO_UPDATE_KEY: 71,    // Model, targetFields, Model, sourceFields
  BELONGSTO_LOADED: 72,        // Model, relation, [Model]
  BELONGSTO_QUERY: 113,        // Model, RemoteQuery, queryOption, query
  BELONGSTO_QUERY_RESULTS: 114,// Model, RemoteQuery

  HASREFERENCE_INIT: 131,      // HasOne
  HASREFERENCE_NINJA_REMOVE: 132, // Model, relation
  HASREFERENCE_INITIAL_PULLED: 133, // Model, initial
  HASREFERENCE_INITIAL: 134,    // Model, initial
  HASREFERENCE_CLEAR_MODEL: 135, // relation
  HASREFERENCE_SET_MODEL: 136,  // relation
  HASREFERENCE_CLEAR_KEY: 137,  // Model, local
  HASREFERENCE_UPDATE_KEY: 138, // Model, targetFields, Model, sourceFields
  HASREFERENCE_LOADED: 139,     // Model, relation, [Model]
  HASREFERENCE_QUERY: 140,      // Model, RemoteQuery, queryOption, query
  HASREFERENCE_QUERY_RESULTS: 141, // Model, RemoteQuery

  HASMANY_INIT: 74,             // HasMany
  HASMANY_NINJA_REMOVE: 75,     // Model, Model, relation
  HASMANY_NINJA_SAVE: 76,       // Model, Model, relation
  HASMANY_INITIAL: 77,          // Model, relation, initial
  HASMANY_INITIAL_PULLED: 78,   // Model, relation
  HASMANY_REMOVE: 79,           // relation, Model
  HASMANY_SORT: 80,             // relation
  HASMANY_ADD: 81,              // relation, Model
  HASMANY_LAZY_LOAD: 82,        // relation, Model[]
  HASMANY_INITIAL_GRABBED: 83,  // relation, Model
  HASMANY_NINJA_ADD: 84,        // relation, Model
  HASMANY_AUTO_SAVE: 85,        // relation
  HASMANY_PREREMOVE: 86,        // Model, relation
  HASMANY_POSTSAVE: 87,         // Model, relation
  HASMANY_QUERY: 115,           // Model, RemoteQuery, queryOption, query
  HASMANY_QUERY_RESULTS: 116,   // Model, RemoteQuery
  HASMANY_UPDATE_KEY: 129,      // Model, targetFields, Model, sourceFields

  HASMANYTHRU_INIT: 88,             // HasMany
  HASMANYTHRU_NINJA_REMOVE: 89,     // Model, Model, relation
  HASMANYTHRU_NINJA_SAVE: 90,       // Model, Model, relation
  HASMANYTHRU_NINJA_THRU_REMOVE: 91,// Model, Model, relation
  HASMANYTHRU_INITIAL: 92,          // Model, relation, initial
  HASMANYTHRU_INITIAL_PULLED: 93,   // Model, relation
  HASMANYTHRU_REMOVE: 94,           // relation, Model
  HASMANYTHRU_SORT: 95,             // relation
  HASMANYTHRU_ADD: 96,              // relation, Model
  HASMANYTHRU_LAZY_LOAD: 97,        // relation, Model[]
  HASMANYTHRU_INITIAL_GRABBED: 98,  // relation, Model
  HASMANYTHRU_NINJA_ADD: 99,        // relation, Model
  HASMANYTHRU_AUTO_SAVE: 100,       // relation
  HASMANYTHRU_PREREMOVE: 101,       // Model, relation
  HASMANYTHRU_POSTSAVE: 102,        // Model, relation
  HASMANYTHRU_THRU_ADD: 103,        // relation, Model
  HASMANYTHRU_THRU_REMOVE: 68,      // relation, Model, Model
  HASMANYTHRU_QUERY: 117,           // Model, RemoteQuery, queryOption, query
  HASMANYTHRU_QUERY_RESULTS: 118,   // Model, RemoteQuery
  HASMANYTHRU_UPDATE_KEY: 130,      // Model, targetFields, Model, sourceFields

  HASREMOTE_INIT: 50,               // HasRemote
  HASREMOTE_SORT: 121,              // relation
  HASREMOTE_NINJA_REMOVE: 109,      // Model, Model, relation
  HASREMOTE_NINJA_SAVE: 110,        // Model, Model, relation
  HASREMOTE_QUERY: 119,             // Model, RemoteQuery, queryOption, query
  HASREMOTE_QUERY_RESULTS: 120,     // Model, RemoteQuery

  HASLIST_INIT: 122,                // HasList
  HASLIST_SORT: 123,                // relation
  HASLIST_NINJA_REMOVE: 124,        // Model, Model, relation
  HASLIST_NINJA_SAVE: 125,          // Model, Model, relation
  HASLIST_REMOVE: 126,              // HasList, relation, Model
  HASLIST_ADD: 127,                 // HasList, relation, Model
  HASLIST_INITIAL: 128              // HasList, Model, relation, initial
};


/**
 * The factory responsible for creating a service which publishes operations
 * and receives operations that have occurred. The first argument is a reference
 * to the Database and the second argument is a function to invoke when a
 * live operation occurs. This function must return a function that can be passed
 * an operation to be delegated to other clients.
 *
 * @param  {Database} database
 *         The database this live function is for.
 * @return {function} -
 *         The function which sends operations.
 */
Rekord.defaultLive = Rekord.live = function(database)
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

/**
 * Sets the live implementation provided the factory function. This function
 * can only be called once - all subsequent calls will be ignored unless
 * `overwrite` is given as a truthy value.
 *
 * @memberof Rekord
 * @param {Function} factory -
 *    The factory which provides live implementations.
 * @param {Boolean} [overwrite=false] -
 *    True if existing implementations are to be ignored and the given factory
 *    should be the implementation.
 */
Rekord.setLive = function(factory, overwrite)
{
  if ( !Rekord.liveSet || overwrite )
  {
    Rekord.live = factory;
    Rekord.liveSet = true;
  }
};


// Initial online

Rekord.isOnline = function()
{
  return !win.navigator || win.navigator.onLine !== false;
};

Rekord.online = Rekord.isOnline();

Rekord.forceOffline = false;

// Set network status to online and notify all listeners
Rekord.setOnline = function()
{
  Rekord.online = true;
  Rekord.debug( Rekord.Debugs.ONLINE );

  batchExecute(function()
  {
    Rekord.trigger( Rekord.Events.Online );
  });
};

// Set network status to offline and notify all listeners
Rekord.setOffline = function()
{
  Rekord.online = false;
  Rekord.debug( Rekord.Debugs.OFFLINE );
  Rekord.trigger( Rekord.Events.Offline );
};

// This must be called manually - this will try to use built in support for
// online/offline detection instead of solely using status codes of 0.
Rekord.listenToNetworkStatus = function()
{
  if (win.addEventListener)
  {
    win.addEventListener( Rekord.Events.Online, Rekord.setOnline, false );
    win.addEventListener( Rekord.Events.Offline, Rekord.setOffline, false );
  }
  else
  {
    win.document.body.ononline = Rekord.setOnline;
    win.document.body.onoffline = Rekord.setOffline;
  }
};

// Check to see if the network status has changed.
Rekord.checkNetworkStatus = function()
{
  var online = Rekord.isOnline();

  if ( Rekord.forceOffline )
  {
    online = false;
  }

  if (online === true && Rekord.online === false)
  {
    Rekord.setOnline();
  }

  else if (online === false && Rekord.online === true)
  {
    Rekord.setOffline();
  }
};


// Rekord.rest = function(options, success(data), failure(data, status))

Rekord.defaultRest = Rekord.rest = function(database)
{

  return {

    // success ( data[] )
    // failure ( data[], status )
    all: function( options, success, failure )
    {
      success( [] );
    },

    // success( data )
    // failure( data, status )
    get: function( model, options, success, failure )
    {
      failure( null, -1 );
    },

    // success ( data )
    // failure ( data, status )
    create: function( model, encoded, options, success, failure )
    {
      success( {} );
    },

    // success ( data )
    // failure ( data, status )
    update: function( model, encoded, options, success, failure )
    {
      success( {} );
    },

    // success ( data )
    // failure ( data, status )
    remove: function( model,options,  success, failure )
    {
      success( {} );
    },

    // success ( data[] )
    // failure ( data[], status )
    query: function( url, query, options, success, failure )
    {
      success( [] );
    }

  };

};

/**
 * Sets the rest implementation provided the factory function. This function
 * can only be called once - all subsequent calls will be ignored unless
 * `overwrite` is given as a truthy value.
 *
 * @memberof Rekord
 * @param {Function} factory -
 *    The factory which provides rest implementations.
 * @param {Boolean} [overwrite=false] -
 *    True if existing implementations are to be ignored and the given factory
 *    should be the implementation.
 */
Rekord.setRest = function(factory, overwrite)
{
  if ( !Rekord.restSet || overwrite )
  {
    Rekord.rest = factory;
    Rekord.restSet = true;
  }
};

/**
 * A factory function for returning an object capable of storing objects for
 * retrieval later by the application.
 *
 * @param  {Database} database
 *         The database this store is for.
 * @return {Object} -
 *         An object with put, remove, and all functions.
 */
Rekord.defaultStore = Rekord.store = function(database)
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
      failure( key, undefined );
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
    },


    /**
     * Resets the store so it contains ONLY the given keys & record pairs.
     *
     * @param {String[]} keys -
     *    The array of keys.
     * @param {Object[]} records -
     *    The array of records to save.
     * @param  {function} success
     *         The function to invoke with the array of records and an array
     *         of keys.
     * @param  {function} failure
     *         The function to invoke with the error that occurred if available.
     */
    reset: function(keys, records, success, failure)
    {
      success( keys, records );
    }

  };

};

/**
 * Sets the store implementation provided the factory function. This function
 * can only be called once - all subsequent calls will be ignored unless
 * `overwrite` is given as a truthy value.
 *
 * @memberof Rekord
 * @param {Function} factory -
 *    The factory which provides store implementations.
 * @param {Boolean} [overwrite=false] -
 *    True if existing implementations are to be ignored and the given factory
 *    should be the implementation.
 */
Rekord.setStore = function(factory, overwrite)
{
  if ( !Rekord.storeSet || overwrite )
  {
    Rekord.store = factory;
    Rekord.storeSet = true;
  }
};


function Gate(callback)
{
  var opened = false;
  var blocked = [];

  var gate = function()
  {
    if ( opened )
    {
      callback.apply( this, arguments );
    }
    else
    {
      blocked.push( this, AP.slice.apply( arguments ) );
    }
  };

  gate.open = function()
  {
    if ( !opened )
    {
      for (var i = 0; i < blocked.length; i += 2)
      {
        var context = blocked[ i ];
        var args = blocked[ i + 1 ];

        callback.apply( context, args );
      }

      blocked.length = 0;
      opened = true;
    }
  };

  return gate;
}



/**
 *
 * @constructor
 * @memberof Rekord
 * @augments Rekord.Eventful
 */
function Database(options)
{
  // Apply the options to this database!
  applyOptions( this, options, Defaults );

  // Create the key handler based on the given key
  this.keyHandler = isArray( this.key ) ?
    new KeyComposite( this ) : new KeySimple( this );

  // If key fields aren't in fields array, add them in
  this.keyHandler.addToFields( this.fields );

  // Properties
  this.modelsCached = this.models = ModelCollection.create( this );
  this.allCached = this.all = {};
  this.loaded = {};
  this.className = this.className || toCamelCase( this.name );
  this.initialized = false;
  this.pendingRefresh = false;
  this.localLoaded = false;
  this.remoteLoaded = false;
  this.firstRefresh = false;
  this.pendingOperations = 0;
  this.afterOnline = false;
  this.saveFields = copy( this.fields );
  this.readyPromise = new Promise( null, false );
  this.context = null;
  this.contextIndex = -1;

  // Prepare
  this.prepare( this, options );

  // Services
  this.rest   = this.createRest( this );
  this.store  = this.createStore( this );
  this.live   = this.createLive( this );

  // Functions
  this.setComparator( this.comparator, this.comparatorNullsFirst );
  this.setRevision( this.revision );
  this.setSummarize( this.summarize );

  // Relations
  this.relations = {};
  this.relationNames = [];

  for (var relationType in options)
  {
    if ( !(relationType in Rekord.Relations) )
    {
      continue;
    }

    var RelationClass = Rekord.Relations[ relationType ];

    if ( !(RelationClass.prototype instanceof Relation ) )
    {
      continue;
    }

    var relationMap = options[ relationType ];

    for ( var name in relationMap )
    {
      var relationOptions = relationMap[ name ];
      var relation = new RelationClass();

      if ( isString( relationOptions ) )
      {
        relationOptions = {
          model: relationOptions
        };
      }
      else if ( !isObject( relationOptions ) )
      {
        relationOptions = {};
      }

      if ( !relationOptions.model && !relationOptions.discriminator )
      {
        relationOptions.model = name;
      }

      relation.init( this, name, relationOptions );

      if ( relation.save )
      {
        this.saveFields.push( name );
      }

      this.relations[ name ] = relation;
      this.relationNames.push( name );
    }
  }

  // Projections
  for (var projectionName in this.projections)
  {
    this.projections[ projectionName ] = Projection.parse( this, projectionName );
  }
}

function defaultEncode(model, data, forSaving)
{
  var encodings = this.encodings;

  for (var prop in data)
  {
    if ( prop in encodings )
    {
      data[ prop ] = encodings[ prop ]( data[ prop ], model, prop, forSaving );
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
      rawData[ prop ] = decodings[ prop ]( rawData[ prop ], rawData, prop );
    }
  }

  return rawData;
}

function defaultSummarize(model)
{
  return model.$key();
}

function defaultCreateRest(database)
{
  return database.rest === false ? Rekord.defaultRest( database ) : Rekord.rest( database );
}

function defaultCreateStore(database)
{
  return database.store === false ? Rekord.defaultStore( database ) : Rekord.store( database );
}

function defaultCreateLive( database )
{
  return database.live === false ? Rekord.defaultLive( database ) : Rekord.live( database );
}

function defaultResolveModel( response )
{
  return response;
}

function defaultResolveModels( response )
{
  return response;
}

Database.Events =
{
  NoLoad:             'no-load',
  RemoteLoad:         'remote-load',
  LocalLoad:          'local-load',
  Updated:            'updated',
  ModelAdded:         'model-added',
  ModelUpdated:       'model-updated',
  ModelRemoved:       'model-removed',
  OperationsStarted:  'operations-started',
  OperationsFinished: 'operations-finished',
  Loads:              'no-load remote-load local-load',
  Changes:            'updated'
};

var Defaults = Database.Defaults =
{
  name:                 undefined,  // required
  className:            null,       // defaults to toCamelCase( name )
  key:                  'id',
  keySeparator:         '/',
  fields:               [],
  ignoredFields:        {},
  defaults:             {},
  publishAlways:        [],
  saveAlways:           [],
  comparator:           null,
  comparatorNullsFirst: null,
  revision:             null,
  cascade:              Cascade.All,
  load:                 Load.None,
  allComplete:          false,
  loadRelations:        true,
  autoRefresh:          true,
  cache:                Cache.All,
  fullSave:             false,
  fullPublish:          false,
  noReferences:         false,
  encodings:            {},
  decodings:            {},
  projections:          {},
  allOptions:           null,
  fetchOptions:         null,
  getOptions:           null,
  updateOptions:        null,
  createOptions:        null,
  saveOptions:          null,
  removeOptions:        null,
  queryOptions:         null,
  prune:                {active: false, max: 0, keepAlive: 0, removeLocal: false},
  prepare:              noop,
  encode:               defaultEncode,
  decode:               defaultDecode,
  resolveModel:         defaultResolveModel,
  resolveModels:        defaultResolveModels,
  summarize:            defaultSummarize,
  createRest:           defaultCreateRest,
  createStore:          defaultCreateStore,
  createLive:           defaultCreateLive
};

Class.create( Database,
{

  setStoreEnabled: function(enabled)
  {
    if ( enabled )
    {
      if ( this.storeDisabled )
      {
        this.store = this.storeDisabled;
        this.storeDisabled = false;
      }
    }
    else if ( !this.storeDisabled )
    {
      this.storeDisabled = this.store;
      this.store = Rekord.defaultStore( this );
    }
  },

  setRestEnabled: function(enabled)
  {
    if ( enabled )
    {
      if ( this.restDisabled )
      {
        this.rest = this.restDisabled;
        this.restDisabled = false;
      }
    }
    else if ( !this.restDisabled )
    {
      this.restDisabled = this.rest;
      this.rest = Rekord.defaultRest( this );
    }
  },

  setLiveEnabled: function(enabled)
  {
    if ( enabled )
    {
      if ( this.liveDisabled )
      {
        this.live = this.liveDisabled;
        this.liveDisabled = false;
      }
    }
    else if ( !this.liveDisabled )
    {
      this.liveDisabled = this.live;
      this.live = Rekord.defaultLive( this );
    }
  },

  // Notifies a callback when the database has loaded (either locally or remotely).
  ready: function(callback, context, persistent)
  {
    return this.readyPromise.success( callback, context, persistent );
  },

  clearAll: function()
  {
    var db = this;

    if (db.context)
    {
      db.context.clear( this );
    }
    else
    {
      db.allCached = db.all = {};
    }
  },

  clear: function(removeListeners)
  {
    var db = this;

    db.clearAll();
    db.models.clear();

    if ( removeListeners )
    {
      db.off();
    }

    return db;
  },

  hasPending: function()
  {
    return this.models.contains(function(model)
    {
      return model.$isPending();
    });
  },

  reset: function(failOnPendingChanges, removeListeners)
  {
    var db = this;
    var promise = new Rekord.Promise();

    if ( failOnPendingChanges && db.hasPending() )
    {
      promise.reject( db );
    }
    else
    {
      db.clear( removeListeners );

      db.store.reset( [], [],
        function()
        {
          promise.resolve( db );
        },
        function()
        {
          promise.reject( db );
        }
      );
    }

    return promise;
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
    var promise = new Promise();

    promise.success( callback, context || db );

    function checkModel()
    {
      var result = db.parseModel( input, remoteData );

      if ( result !== false && !promise.isComplete() && db.initialized )
      {
        var remoteLoaded = db.remoteLoaded || !db.hasLoad( Load.All );
        var missingModel = (result === null || !result.$isSaved());
        var lazyLoad = db.hasLoad( Load.Lazy );

        if ( lazyLoad && remoteLoaded && missingModel )
        {
          if ( !result )
          {
            result = db.keyHandler.buildObjectFromKey( db.keyHandler.buildKeyFromInput( input ) );
          }

          result.$once( Model.Events.RemoteGets, function()
          {
            if ( !promise.isComplete() )
            {
              if ( isObject( input ) )
              {
                result.$set( input );
              }

              promise.resolve( result.$isSaved() ? result : null );
            }
          });

          result.$refresh( Cascade.All, db.fetchOptions );
        }
        else
        {
          promise.resolve( result );
        }
      }

      return promise.isComplete() ? false : true;
    }

    if ( checkModel() )
    {
      db.ready( checkModel, db, true );
    }

    return promise;
  },

  // Parses the model from the given input
  //
  // Returns false if the input doesn't resolve to a model at the moment
  // Returns null if the input doesn't resolve to a model and all models have been remotely loaded
  //
  // parseModel( Rekord )
  // parseModel( Rekord.Model )
  // parseModel( 'uuid' )
  // parseModel( ['uuid'] )
  // parseModel( modelInstance )
  // parseModel( {name:'new model'} )
  // parseModel( {id:4, name:'new or existing model'} )
  //
  parseModel: function(input, remoteData)
  {
    var db = this;
    var keyHandler = db.keyHandler;
    var hasRemote = db.remoteLoaded || !db.hasLoad( Load.All );

    if ( !isValue( input ) )
    {
      return hasRemote ? null : false;
    }

    if ( isRekord( input ) )
    {
      input = new input();
    }
    if ( isFunction( input ) )
    {
      input = input();
    }

    var key = keyHandler.buildKeyFromInput( input );

    if ( input instanceof db.Model )
    {
      return input;
    }
    else if ( key in db.all )
    {
      var model = db.all[ key ];

      if ( isObject( input ) )
      {
        keyHandler.buildKeyFromRelations( input );

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
      keyHandler.buildKeyFromRelations( input );

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

  // Sorts the models & notifies listeners that the database has been updated.
  updated: function()
  {
    this.sort(); // TODO remove
    this.trigger( Database.Events.Updated );
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
    this.models.sort();
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

    db.clearAll();

    for (var i = 0; i < keys.length; i++)
    {
      db.addReference( models[ i ], keys[ i ] );
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
    var key = key || db.keyHandler.getKey( encoded, true );

    // The remote source might be crazy, if the key isn't there then log it and ignore it
    if ( !isValue( key ) )
    {
      Rekord.debug( Rekord.Debugs.MISSING_KEY, db, encoded );

      return;
    }

    var model = model || db.all[ key ];
    var decoded = db.decode( copy( encoded ) );

    // Reject the data if it's a lower revision
    if ( model )
    {
      var revisionRejected = this.revisionFunction( model, encoded );

      if ( revisionRejected )
      {
        Rekord.debug( Rekord.Debugs.SAVE_OLD_REVISION, db, model, encoded );

        return model;
      }
    }

    // If the model already exists, update it.
    if ( model )
    {
      if ( db.keyHandler.hasKeyChange( model, decoded ) )
      {
        key = model.$setKey( db.keyHandler.getKey( decoded, true ) );
      }

      db.addReference( model, key );

      if ( !model.$saved )
      {
        model.$saved = {};
      }

      var current = model.$toJSON( true );
      var conflicts = {};
      var conflicted = false;
      var updated = {};
      var previous = {};
      var saved = {};
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

        previous[ prop ] = model[ prop ];
        saved[ prop ] = savedValue;

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
        model.$trigger( Model.Events.PartialUpdate, [encoded, updated, previous, saved, conflicts] );
      }
      else
      {
        model.$trigger( Model.Events.FullUpdate, [encoded, updated, previous, saved, conflicts] );
      }

      model.$trigger( Model.Events.RemoteUpdate, [encoded, updated, previous, saved, conflicts] );

      model.$addOperation( SaveNow );

      if ( !db.models.has( key ) )
      {
        db.saveReference( model, key );
        db.trigger( Database.Events.ModelAdded, [model, true] );
      }
    }
    // The model doesn't exist, create it.
    else
    {
      model = db.createModel( decoded, true );

      if ( model )
      {
        if ( db.cache === Cache.All )
        {
          model.$local = model.$toJSON( false );
          model.$local.$status = model.$status;
          model.$saved = model.$local.$saved = model.$toJSON( true );

          model.$addOperation( SaveNow );
        }
        else
        {
          model.$saved = model.$toJSON( true );
        }
      }
    }

    return model;
  },

  createModel: function(decoded, remoteData)
  {
    var db = this;
    var model = db.instantiate( decoded, remoteData );

    if ( model.$invalid === true )
    {
      Rekord.debug( Rekord.Debugs.MISSING_KEY, db, decoded );

      return;
    }

    var key = model.$key();

    if ( !db.models.has( key ) )
    {
      db.saveReference( model, key );
      db.trigger( Database.Events.ModelAdded, [model, remoteData] );
    }

    return model;
  },

  destroyModel: function(model, modelKey)
  {
    this.pruneModel( model, modelKey );

    model.$trigger( Model.Events.RemoteAndRemove );

    Rekord.debug( Rekord.Debugs.REMOTE_REMOVE, this, model );
  },

  pruneModel: function(model, modelKey)
  {
    var db = this;
    var key = modelKey || model.$key();

    db.removeReference( key );
    db.models.remove( key );
    db.trigger( Database.Events.ModelRemoved, [model] );
  },

  removeReference: function(key)
  {
    delete this.all[ key ];
  },

  hasPruning: function()
  {
    return this.prune.max || this.prune.keepAlive;
  },

  pruneModels: function()
  {
    var db = this;
    var prune = db.prune;
    var models = db.models;

    if (prune.max || prune.keepAlive)
    {
      if (prune.active)
      {
        var youngestAllowed = now() - prune.keepAlive;

        var pruneModel = function(model)
        {
          if (prune.removeLocal)
          {
            model.$remove( Cascade.Local );
          }
          else
          {
            db.pruneModel( model );
          }
        };

        var isTooYoung = function(model)
        {
          return model.$touched <= youngestAllowed;
        };

        while ( prune.max && models.length > prune.max )
        {
          var youngest = models.minModel('$touched');

          if (youngest)
          {
            pruneModel( youngest );
          }
        }

        if ( prune.keepAlive )
        {
          models.eachWhere( pruneModel, isTooYoung );
        }
      }
    }
  },

  destroyLocalUncachedModel: function(model, key)
  {
    var db = this;

    if ( model )
    {
      if ( model.$hasChanges() )
      {
        delete model.$saved;

        db.keyHandler.removeKey( model );

        model.$trigger( Model.Events.Detach );

        return false;
      }

      db.destroyModel( model, key );

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

        db.keyHandler.removeKey( model );

        if ( model.$local )
        {
          delete model.$local.$saved;

          db.keyHandler.removeKey( model.$local );
        }

        model.$trigger( Model.Events.Detach );

        model.$addOperation( SaveNow );

        return false;
      }

      model.$addOperation( RemoveNow );

      db.destroyModel( model, key );
    }
    else
    {
      db.store.remove( key, function(removedValue)
      {
        if (removedValue)
        {
          Rekord.debug( Rekord.Debugs.REMOTE_REMOVE, db, removedValue );
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

    if ( db.cache === Cache.All )
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

    batchExecute(function()
    {
      for (var key in db.loaded)
      {
        var model = db.loaded[ key ];

        if ( model.$status === Model.Status.RemovePending )
        {
          Rekord.debug( Rekord.Debugs.LOCAL_RESUME_DELETE, db, model );

          model.$addOperation( RemoveRemote );
        }
        else
        {
          if ( model.$status === Model.Status.SavePending )
          {
            Rekord.debug( Rekord.Debugs.LOCAL_RESUME_SAVE, db, model );

            model.$addOperation( SaveRemote );
          }
          else
          {
            Rekord.debug( Rekord.Debugs.LOCAL_LOAD_SAVED, db, model );
          }

          db.saveReference( model, key, true );
        }
      }
    });

    db.loaded = {};
    db.updated();

    if ( db.hasLoad( Load.All ) )
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

  hasLoad: function(load)
  {
    return (this.load & load) !== 0;
  },

  loadBegin: function(onLoaded)
  {
    var db = this;

    function onLocalLoad(records, keys)
    {
      Rekord.debug( Rekord.Debugs.LOCAL_LOAD, db, records );

      for (var i = 0; i < records.length; i++)
      {
        var encoded = records[ i ];
        var key = keys[ i ];
        var decoded = db.decode( copy( encoded, true ) );
        var model = db.instantiate( decoded, true );

        if ( model.$invalid === true )
        {
          Rekord.debug( Rekord.Debugs.MISSING_KEY, db, encoded );

          break;
        }

        model.$local = encoded;
        model.$saved = encoded.$saved;

        if ( model.$status !== Model.Status.Removed )
        {
          db.loaded[ key ] = model;
          db.addReference( model, key );
        }
      }

      db.localLoaded = true;
      db.triggerLoad( Database.Events.LocalLoad );

      onLoaded( true, db );
    }

    function onLocalError()
    {
      db.loadNone();

      onLoaded( false, db );
    }

    if ( db.hasLoad( Load.All ) && db.autoRefresh )
    {
      Rekord.after( Rekord.Events.Online, db.onOnline, db );
    }

    if ( db.cache === Cache.None )
    {
      db.loadNone();

      onLoaded( false, db );
    }
    else
    {
      db.store.all( onLocalLoad, onLocalError );
    }
  },

  triggerLoad: function(loadEvent, additionalParameters)
  {
    var db = this;

    db.initialized = true;
    db.trigger( loadEvent, [ db ].concat( additionalParameters || [] ) );
    db.readyPromise.reset().resolve( db );
  },

  loadNone: function()
  {
    var db = this;

    if ( db.hasLoad( Load.All ) )
    {
      db.refresh();
    }
    else
    {
      db.triggerLoad( Database.Events.NoLoad );
    }
  },

  onOnline: function()
  {
    var db = this;

    db.afterOnline = true;

    if ( db.pendingOperations === 0 )
    {
      db.onOperationRest();
    }
  },

  onOperationRest: function()
  {
    var db = this;

    if ( ( db.autoRefresh && db.remoteLoaded && db.afterOnline ) || db.firstRefresh )
    {
      db.afterOnline = false;
      db.firstRefresh = false;

      Rekord.debug( Rekord.Debugs.AUTO_REFRESH, db );

      db.refresh();
    }
  },

  handleRefreshSuccess: function(promise)
  {
    var db = this;

    return function onRefreshSuccess(response)
    {
      var models = db.resolveModels( response );
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

      if ( db.allComplete )
      {
        var keys = db.models.keys().slice();

        for (var i = 0; i < keys.length; i++)
        {
          var k = keys[ i ];

          if ( !(k in mapped) )
          {
            var old = db.models.get( k );

            if ( old.$saved )
            {
              Rekord.debug( Rekord.Debugs.REMOTE_LOAD_REMOVE, db, k );

              db.destroyLocalModel( k );
            }
          }
        }
      }

      db.remoteLoaded = true;
      db.triggerLoad( Database.Events.RemoteLoad );

      db.updated();

      Rekord.debug( Rekord.Debugs.REMOTE_LOAD, db, models );

      promise.resolve( db.models );
    };
  },

  handleRefreshFailure: function(promise)
  {
    var db = this;

    return function onRefreshFailure(response, status)
    {
      if ( status === 0 )
      {
        Rekord.checkNetworkStatus();

        if ( !Rekord.online )
        {
          db.pendingRefresh = true;

          Rekord.once( Rekord.Events.Online, db.onRefreshOnline, db );
        }

        Rekord.debug( Rekord.Debugs.REMOTE_LOAD_OFFLINE, db );
      }
      else
      {
        Rekord.debug( Rekord.Debugs.REMOTE_LOAD_ERROR, db, status );

        db.triggerLoad( Database.Events.NoLoad, [response] );
      }

      promise.reject( db.models );
    };
  },

  executeRefresh: function(success, failure)
  {
    this.rest.all( this.allOptions, success, failure );
  },

  // Loads all data remotely
  refresh: function(callback, context)
  {
    var db = this;
    var promise = new Promise();
    var success = this.handleRefreshSuccess( promise );
    var failure = this.handleRefreshFailure( promise );

    promise.complete( callback, context || db );

    batchExecute(function()
    {
      db.executeRefresh( success, failure );
    });

    return promise;
  },

  onRefreshOnline: function()
  {
    var db = this;

    Rekord.debug( Rekord.Debugs.REMOTE_LOAD_RESUME, db );

    if ( db.pendingRefresh )
    {
      db.pendingRefresh = false;

      db.refresh();
    }
  },

  // Returns a model
  get: function(key)
  {
    return this.all[ this.keyHandler.buildKeyFromInput( key ) ];
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

    Rekord.debug( Rekord.Debugs.REALTIME_SAVE, this, encoded, key );
  },

  liveRemove: function(key)
  {
    if ( this.destroyLocalModel( key ) )
    {
      this.updated();
    }

    Rekord.debug( Rekord.Debugs.REALTIME_REMOVE, this, key );
  },

  // Return an instance of the model with the data as initial values
  instantiate: function(data, remoteData)
  {
    return new this.Model( data, remoteData );
  },

  addReference: function(model, key)
  {
    if (!this.noReferences)
    {
      this.all[ key || model.$key() ] = model;
    }
  },

  saveReference: function(model, key, delaySort)
  {
    if ( !this.noReferences )
    {
      this.models.put( key || model.$key(), model, delaySort );
    }
  },

  // Save the model
  save: function(model, cascade, options)
  {
    var db = this;

    if ( model.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_DELETED, db, model );

      return;
    }

    var key = model.$key();
    var existing = db.models.has( key );

    if ( existing )
    {
      db.trigger( Database.Events.ModelUpdated, [model] );

      model.$trigger( Model.Events.UpdateAndSave );
    }
    else
    {
      db.saveReference( model, key );
      db.trigger( Database.Events.ModelAdded, [model] );
      db.updated();

      model.$trigger( Model.Events.CreateAndSave );
    }

    model.$addOperation( SaveLocal, cascade, options );
  },

  // Remove the model
  remove: function(model, cascade, options)
  {
    var db = this;

    // If we have it in the models, remove it!
    this.removeFromModels( model );

    // If we're offline and we have a pending save - cancel the pending save.
    if ( model.$status === Model.Status.SavePending )
    {
      Rekord.debug( Rekord.Debugs.REMOVE_CANCEL_SAVE, db, model );
    }

    model.$status = Model.Status.RemovePending;

    model.$addOperation( RemoveLocal, cascade, options );
  },

  removeFromModels: function(model)
  {
    var db = this;
    var key = model.$key();

    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( Database.Events.ModelRemoved, [model] );
      db.updated();

      model.$trigger( Model.Events.Removed );
    }
  }

});

addEventful( Database );

addEventFunction( Database, 'change', Database.Events.Changes );


/**
 * An instance
 *
 * @constructor
 * @memberof Rekord
 * @augments Rekord.Eventful$
 * @param {Rekord.Database} db
 *        The database instance used in model instances.
 */
function Model(db)
{
  Class.prop( this, '$db', db );

  /**
   * @property {Database} $db
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

Model.Events =
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
  OperationsStarted:    'operations-started',
  OperationsFinished:   'operations-finished',
  KeyChange:            'key-change',
  Changes:              'saved remote-update key-update relation-update removed key-change change'
};

Model.Status =
{
  Synced:         0,
  SavePending:    1,
  RemovePending:  2,
  Removed:        3
};

Model.Blocked =
{
  toString: true,
  valueOf: true
};

Class.create( Model,
{

  $init: function(props, remoteData)
  {
    this.$status = Model.Status.Synced;

    Class.props(this, {
      $operation: null,
      $relations: {},
      $dependents: new Dependents( this ),
      $savedState: false,
      $saved: false,
      $local: false,
      $touched: now()
    });

    if ( remoteData )
    {
      var key = this.$db.keyHandler.getKey( props, true );

      if ( !isValue( key ) )
      {
        Class.prop( this, '$invalid', true );

        return;
      }

      this.$db.addReference( this, key );
      this.$set( props, undefined, remoteData );
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
          this.$getRelation( name, undefined, remoteData );
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
    var keyHandler = this.$db.keyHandler;
    var keyFields = this.$db.key;

    if ( !isEmpty( def ) )
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];
        var defaultValue = def[ prop ];
        var evaluatedValue = evaluate( defaultValue );

        this[ prop ] = evaluatedValue;
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

    var key = null;

    // First try pulling key from properties (only if it hasn't been
    // initialized through defaults)
    if ( props )
    {
      key = keyHandler.getKey( props, true );
    }

    // If the key wasn't specified, try generating it on this model
    if ( !isValue( key ) )
    {
      key = keyHandler.getKey( this );
    }
    // The key was specified in the properties, apply it to this model
    else
    {
      updateFieldsReturnChanges( this, keyFields, props, keyFields );
    }

    // The key exists on this model - place the reference of this model
    // in the all map and set the cached key.
    if ( isValue( key ) )
    {
      this.$db.addReference( this, key );
      this.$$key = key;
    }

    // Apply the default relation values now that this key is most likely populated
    if ( !isEmpty( def ) )
    {
      for (var prop in relations)
      {
        if ( prop in def )
        {
          var defaultValue = def[ prop ];
          var evaluatedValue = evaluate( defaultValue );
          var hasRelation = !!this.$relations[ prop ];
          var relation = this.$getRelation( prop, evaluatedValue );

          if ( hasRelation )
          {
            relation.set( this, evaluatedValue );
          }
        }
      }
    }

    // Set the remaing properties
    this.$set( props );
  },

  $set: function(props, value, remoteData, avoidChange)
  {
    if ( isObject( props ) )
    {
      for (var prop in props)
      {
        this.$set( prop, props[ prop ], remoteData, true );
      }
    }
    else if ( isString( props ) )
    {
      if ( Model.Blocked[ props ] )
      {
        return;
      }

      var exists = this.$hasRelation( props );
      var relation = this.$getRelation( props, value, remoteData );

      if ( relation )
      {
        if ( exists )
        {
          relation.set( this, value, remoteData );
        }
      }
      else
      {
        this[ props ] = value;
      }
    }

    if ( !avoidChange && isValue( props ) )
    {
      this.$trigger( Model.Events.Change, [props, value] );
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
      if ( Model.Blocked[ props ] )
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

  $sync: function(prop, removeUnrelated)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.sync( this, removeUnrelated );
    }
  },

  $relate: function(prop, relate, remoteData)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.relate( this, relate, remoteData );
    }
  },

  $unrelate: function(prop, unrelated, remoteData)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.unrelate( this, unrelated, remoteData );
    }
  },

  $isRelated: function(prop, related)
  {
    var relation = this.$getRelation( prop );

    return relation && relation.isRelated( this, related );
  },

  $hasRelation: function(prop)
  {
    return prop in this.$relations;
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

  $save: function(setProperties, setValue, cascade, options)
  {
    if ( isObject( setProperties ) )
    {
      options = cascade;
      cascade = setValue;
      setValue = undefined;
    }
    else if ( isNumber( setProperties ) )
    {
      options = setValue;
      cascade = setProperties;
      setValue = undefined;
      setProperties = undefined;
    }

    if ( !isNumber( cascade ) )
    {
      cascade = this.$db.cascade;
    }

    if ( this.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_DELETED, this.$db, this );

      return Promise.resolve( this );
    }

    if ( !this.$hasKey() )
    {
      throw 'Key missing from model';
    }

    var promise = createModelPromise( this, cascade,
      Model.Events.RemoteSave,
      Model.Events.RemoteSaveFailure,
      Model.Events.RemoteSaveOffline,
      Model.Events.LocalSave,
      Model.Events.LocalSaveFailure
    );

    return Promise.singularity( promise, this, function(singularity)
    {
      batchExecute(function()
      {
        this.$touch();

        this.$db.addReference( this );

        if ( setProperties !== undefined )
        {
          this.$set( setProperties, setValue );
        }

        this.$trigger( Model.Events.PreSave, [this] );

        this.$db.save( this, cascade, options );

        this.$db.pruneModels();

        this.$trigger( Model.Events.PostSave, [this] );

      }, this );
    });
  },

  $remove: function(cascade, options)
  {
    var cascade = isNumber( cascade ) ? cascade : this.$db.cascade;

    if ( !this.$exists() )
    {
      return Promise.resolve( this );
    }

    var promise = createModelPromise( this, cascade,
      Model.Events.RemoteRemove,
      Model.Events.RemoteRemoveFailure,
      Model.Events.RemoteRemoveOffline,
      Model.Events.LocalRemove,
      Model.Events.LocalRemoveFailure
    );

    return Promise.singularity( promise, this, function(singularity)
    {
      batchExecute(function()
      {
        this.$trigger( Model.Events.PreRemove, [this] );

        this.$db.remove( this, cascade, options );

        this.$trigger( Model.Events.PostRemove, [this] );

      }, this );
    });
  },

  $refresh: function(cascade, options)
  {
    var promise = createModelPromise( this, cascade,
      Model.Events.RemoteGet,
      Model.Events.RemoteGetFailure,
      Model.Events.RemoteGetOffline,
      Model.Events.LocalGet,
      Model.Events.LocalGetFailure
    );

    if ( canCascade( cascade, Cascade.Rest ) )
    {
      this.$addOperation( GetRemote, cascade, options );
    }
    else if ( canCascade( cascade, Cascade.Local ) )
    {
      this.$addOperation( GetLocal, cascade, options );
    }
    else
    {
      promise.resolve( this );
    }

    return promise;
  },

  $autoRefresh: function(cascade, options)
  {
    var callRefresh = function()
    {
      this.$refresh( cascade, options );
    };

    Rekord.on( Rekord.Events.Online, callRefresh, this );

    return this;
  },

  $cancel: function(reset, options)
  {
    if ( this.$saved )
    {
      this.$save( this.$saved, this.$db.cascade, options );
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

    var cloneKey = db.keyHandler.getKey( values );
    var modelKey = this.$key();

    if ( cloneKey === modelKey )
    {
      throw 'A clone cannot have the same key as the original model.';
    }

    for (var relationName in relations)
    {
      if ( properties && relationName in properties )
      {
        relations[ relationName ].preClone( this, values, properties[ relationName ] );
      }
    }

    var clone = db.instantiate( values );
    var relationValues = {};

    for (var relationName in relations)
    {
      if ( properties && relationName in properties )
      {
        relations[ relationName ].postClone( this, relationValues, properties[ relationName ] );
      }
    }

    clone.$set( relationValues );

    return clone;
  },

  $push: function(fields)
  {
    this.$savedState = this.$db.encode( this, grab( this, fields || this.$db.fields, true ), false );
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
    this.$savedState = false;
  },

  $exists: function()
  {
    return !this.$isDeleted() && this.$db.models.has( this.$key() );
  },

  $addOperation: function(OperationType, cascade, options)
  {
    var operation = new OperationType( this, cascade, options );

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
    var encoded = this.$db.encode( this, grab( this, this.$db.fields, true ), forSaving );

    var databaseRelations = this.$db.relations;
    var relations = this.$relations;

    for (var name in relations)
    {
      databaseRelations[ name ].encode( this, encoded, forSaving );
    }

    return encoded;
  },

  $changed: function()
  {
    this.$trigger( Model.Events.Change );
  },

  $updated: function()
  {
    this.$changed();
    this.$db.trigger( Database.Events.ModelUpdated, [this] );
  },

  $key: function(quietly)
  {
    if ( !this.$$key )
    {
      this.$$key = this.$db.keyHandler.getKey( this, quietly );
    }

    return this.$$key;
  },

  $keys: function()
  {
    return this.$db.keyHandler.getKeys( this );
  },

  $uid: function()
  {
    return this.$db.name + '$' + this.$key();
  },

  $hasKey: function()
  {
    return hasFields( this, this.$db.key, isValue );
  },

  $setKey: function(key, skipApplication)
  {
    var db = this.$db;
    var newKey = db.keyHandler.buildKeyFromInput(key);
    var oldKey = this.$$key;

    if (newKey !== oldKey)
    {
      if (!db.keyChanges)
      {
        throw 'Key changes are not supported, see the documentation on how to enable key changes.';
      }

      db.removeReference( oldKey );
      db.addReference( this, newKey );

      this.$$key = newKey;

      if ( !skipApplication )
      {
        db.keyHandler.applyKey( newKey, this );
      }

      this.$trigger( Model.Events.KeyChange, [this, oldKey, newKey] );
    }

    return newKey;
  },

  $isSynced: function()
  {
    return this.$status === Model.Status.Synced;
  },

  $isSaving: function()
  {
    return this.$status === Model.Status.SavePending;
  },

  $isPending: function()
  {
    return this.$status === Model.Status.SavePending || this.$status === Model.Status.RemovePending;
  },

  $isDeleted: function()
  {
    return this.$status >= Model.Status.RemovePending;
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

  $touch: function()
  {
    if ( this.$db.hasPruning() )
    {
      this.$touched = now();
    }
  },

  $project: function(projectionInput)
  {
    var projection = Projection.parse( this.$db, projectionInput );

    return projection.project( this );
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

  $listenForOnline: function(cascade, options)
  {
    if (!this.$offline)
    {
      this.$offline = true;

      Rekord.once( Rekord.Events.Online, this.$resume, this );
    }

    Class.props(this,
    {
      $resumeCascade: cascade,
      $resumeOptions: options
    });
  },

  $resume: function()
  {
    if (this.$status === Model.Status.RemovePending)
    {
      Rekord.debug( Rekord.Debugs.REMOVE_RESUME, this );

      this.$addOperation( RemoveRemote, this.$resumeCascade, this.$resumeOptions );
    }
    else if (this.$status === Model.Status.SavePending)
    {
      Rekord.debug( Rekord.Debugs.SAVE_RESUME, this );

      this.$addOperation( SaveRemote, this.$resumeCascade, this.$resumeOptions );
    }

    this.$offline = false;
  },

  toString: function()
  {
    return this.$db.className + ' ' + JSON.stringify( this.$toJSON() );
  }

});

addEventful( Model, true );

addEventFunction( Model, '$change', Model.Events.Changes, true );

function createModelPromise(model, cascade, restSuccess, restFailure, restOffline, localSuccess, localFailure)
{
  var promise = new Promise( null, false );

  if ( canCascade( cascade, Cascade.Rest ) )
  {
    var off1 = model.$once( restSuccess, function(data) {
      off2();
      off3();
      promise.resolve( model, data );
    });
    var off2 = model.$once( restFailure, function(data, status) {
      off1();
      off3();
      promise.reject( model, status, data );
    });
    var off3 = model.$once( restOffline, function() {
      off1();
      off2();
      promise.noline( model );
    });
  }
  else if ( canCascade( cascade, Cascade.Local ) )
  {
    var off1 = model.$once( localSuccess, function(data)
    {
      off2();
      promise.resolve( model, data );
    });
    var off2 = model.$once( localFailure, function(data, status)
    {
      off1();
      promise.reject( model, data );
    });
  }
  else
  {
    promise.resolve( model );
  }

  return promise;
}


/**
 * A Map has the key-to-value benefits of a map and iteration benefits of an
 * array. This is especially beneficial when most of the time the contents of
 * the structure need to be iterated and order doesn't matter (since removal
 * performs a swap which breaks insertion order).
 *
 * @constructor
 * @memberof Rekord
 */
function Map()
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

Class.create( Map,
{

  /**
   * Resets the map by initializing the values, keys, and indexes.
   *
   * @return {Rekord.Map} -
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
   * @return {Rekord.Map} -
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
      AP.push.call( this.values, value );
      AP.push.call( this.keys, key );
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
   * @return {Rekord.Map} -
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
   * @return {Rekord.Map} -
   *         The reference to this map.
   */
  removeAt: function(index)
  {
    var key = this.keys[ index ];
    var lastValue = AP.pop.apply( this.values );
    var lastKey = AP.pop.apply( this.keys );

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
    var out = dest || new Map();
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
   * @param  {Rekord.Map} [dest]     [description]
   * @return {Rekord.Map}            [description]
   */
  filter: function(callback, dest)
  {
    var out = dest || new Map();
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
   * @return {Rekord.Map} -
   *         The referense to this map.
   */
  reverse: function()
  {
    reverse( this.values );
    reverse( this.keys );

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
   * @return {Map} -
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
        while (comparator( map.values[i], pivot ) < 0)
        {
          i++;
        }
        while (comparator( map.values[j], pivot ) > 0)
        {
          j--;
        }

        if (i <= j)
        {
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
   * @return {Rekord.Map} -
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
  },

  /**
   * Builds an object contain the keys and values in this map.
   *
   * @return {Object} -
   *         The built object.
   */
  toObject: function(out)
  {
    var target = out || {};
    var keys = this.keys;
    var values = this.values;

    for (var i = 0; i < keys.length; i++)
    {
      target[ keys[ i ] ] = values[ i ];
    }

    return target;
  }

});


function Dependents(subject)
{
  this.map = {};
  this.listeners = {};

  this.subject = subject;
}

Class.create( Dependents,
{

  add: function(model, relator)
  {
    var key = model.$uid();

    this.map[ key ] = model;

    if ( model.$db.keyChanges && !this.listeners[ key ] )
    {
      var listener = this.handleKeyChange( relator );

      this.listeners[ key ] = model.$on( Model.Events.KeyChange, listener, this );
    }
  },

  remove: function(model)
  {
    var key = model.$uid();

    evaluate( this.listeners[ key ] );

    delete this.listeners[ key ];
    delete this.map[ key ];
  },

  handleKeyChange: function(relator)
  {
    return function(model, oldKey, newKey)
    {
      var prefix = model.$db.name + '$';

      oldKey = prefix + oldKey;
      newKey = prefix + newKey;

      this.listeners[ newKey ] = this.listeners[ oldKey ];
      this.map[ newKey ] = this.map[ oldKey ];

      delete this.listeners[ oldKey ];
      delete this.map[ oldKey ];

      relator.updateForeignKey( this.subject, model, true );
    };
  },

  isSaved: function(callbackOnSaved, contextOnSaved)
  {
    var dependents = this.map;
    var off = noop;

    var onDependentSave = function()
    {
      callbackOnSaved.apply( contextOnSaved || this, arguments );

      off();
    };

    for (var uid in dependents)
    {
      var dependent = dependents[ uid ];

      if ( !dependent.$isSaved() )
      {
        off = dependent.$once( Model.Events.RemoteSaves, onDependentSave );

        return false;
      }
    }

    return true;
  }

});


// field
// relation.field
// relations[pluckValue]
// relations?savedWhere[pluckValue]
// relations{pluckKey: pluckValue}
// relation(subprojection)
// relations(subprojection)
// relations?savedWhere(subprojection)
// expression|filter
// expression?savedWhere
// alias:expression
// expression#resolve
// relations@sum=field

function Projection(database, input)
{
  this.database = database;
  this.input = input;
  this.projections = {};

  for (var i = 0; i < input.length; i++)
  {
    this.addProjection( input[ i ] );
  }
}

Class.create( Projection,
{

  addProjection: function(input)
  {
    var projection = this;
    var alias = input;
    var aliasIndex = input.indexOf( Projection.ALIAS_DELIMITER );

    if (aliasIndex > 0)
    {
      alias = input.substring( 0, aliasIndex );
      input = input.substring( aliasIndex + 1 );
    }

    var word = '';
    var words = [];
    var tokens = ['property'];
    var types = [this.database];
    var i = 0;
    var resolvers = [];

    var processWord = function(word)
    {
      if (!word)
      {
        return;
      }

      var token = tokens[0];
      var handler = Projection.TOKEN_HANDLER[ token ];

      words.unshift( word );

      if (handler && handler.post)
      {
        resolvers.push( handler.post( words, tokens, types, projection ) );
      }
    };

    var processToken = function(token)
    {
      var handler = Projection.TOKEN_HANDLER[ token ];

      tokens.unshift( token );

      if (handler && handler.pre)
      {
        resolvers.push( handler.pre( words, tokens, types, projection ) );
      }
    };

    for (var i = 0; i < input.length; i++)
    {
      var c = input.charAt( i );
      var token = Projection.TOKENS[ c ];

      if (token)
      {
        processWord( word );
        processToken( token );

        word = '';
      }
      else
      {
        word += c;
      }
    }

    processWord( word );

    var resolver = function(value) {
      return value;
    };

    for (var i = resolvers.length - 1; i >= 0; i--) {
      resolver = resolvers[ i ]( resolver );
    }

    this.projections[ alias ] = resolver;
  },

  project: function(model)
  {
    var out = {};

    for (var alias in this.projections)
    {
      out[ alias ] = this.projections[ alias ]( model );
    }

    return out;
  }

});

Projection.TOKENS =
{
  '.': 'property',
  '?': 'where',
  '|': 'filter',
  '#': 'resolve',
  '(': 'subStart',
  ')': 'subEnd',
  '[': 'pluckValueStart',
  ']': 'pluckValueEnd',
  '{': 'pluckObjectStart',
  ':': 'pluckObjectDelimiter',
  '}': 'pluckObjectEnd',
  '@': 'aggregateStart',
  '=': 'aggregateProperty'
};

Projection.TOKEN_HANDLER =
{

  property:
  {
    post: function(words, tokens, types, projection)
    {
      var propertyName = words[0];
      var sourceType = types[0];

      if (!(sourceType instanceof Database))
      {
        throw ('The property ' + propertyName + ' can only be taken from a Model');
      }

      var relation = sourceType.relations[ propertyName ];

      if (relation)
      {
        if (relation instanceof RelationSingle)
        {
          types.unshift( relation.model.Database );
        }
        else
        {
          types.unshift( relation );
        }
      }

      var fieldIndex = indexOf( sourceType.fields, propertyName );

      if (fieldIndex === false && !relation)
      {
        throw ('The property ' + propertyName + ' does not exist as a field or relation on the Model ' + sourceType.name );
      }

      return function(resolver)
      {
        return function(model)
        {
          if ( !isValue( model ) )
          {
            return null;
          }

          return resolver( model.$get( propertyName ) );
        };
      };
    }
  },

  filter:
  {
    post: function(words, tokens, types, projection)
    {
      var filterName = words[0];
      var filter = Rekord.Filters[ filterName ];

      if (!filter)
      {
        throw (filterName + ' is not a valid filter function');
      }

      return function(resolver)
      {
        return function(value)
        {
          if ( !isValue( value ) )
          {
            return null;
          }

          return resolver( filter( value ) );
        };
      };
    }
  },

  resolve:
  {
    post: function(words, tokens, types, projection)
    {
      var resolveName = words[0];

      return function(resolver)
      {
        return function(source)
        {
          if ( !isValue( source ) )
          {
            return null;
          }

          var value = source[ resolveName ];

          if ( isFunction( value ) )
          {
            value = value.apply( source );
          }

          return resolver( value );
        };
      };
    }
  },

  where:
  {
    post: function(words, tokens, types, projection)
    {
      var whereName = words[0];
      var whereFrom = types[0];
      var where = Rekord.Wheres[ whereName ];

      if (!where)
      {
        throw (whereName + ' is not a valid where expression');
      }

      if (!(whereFrom instanceof RelationMultiple))
      {
        throw (whereName + ' where expressions can only be used on relations');
      }

      return function(resolver)
      {
        return function(relation)
        {
          if ( !isValue( relation ) )
          {
            return null;
          }

          return resolver( relation.where( where ) );
        };
      };
    }
  },

  aggregateProperty:
  {
    post: function(words, tokens, types, projection)
    {
      var property = words[0];
      var aggregateFunction = words[1];
      var aggregateFrom = types[0];

      if (tokens[1] !== 'aggregateStart')
      {
        throw ('Aggregate function syntax error, a = must follow a @');
      }

      if (!(aggregateFrom instanceof Relation))
      {
        throw ('Aggregate functions like ' + aggregateFunction + ' from ' + aggregateFrom + ' can only be used on relations');
      }

      return function (resolver)
      {
        return function (relation)
        {
          if ( !isValue( relation ) )
          {
            return null;
          }

          return resolver( relation[ aggregateFunction ]( property ) );
        };
      };
    }
  },

  subEnd:
  {
    pre: function(words, tokens, types, projection)
    {
      var projectionName = words[0];
      var whereFrom = types[0];

      if (tokens[1] !== 'subStart')
      {
        throw ('Sub projection syntax error, an ending ) requires a starting (');
      }

      if (!(whereFrom instanceof Relation))
      {
        throw ('Sub projections like ' + projectionName + ' from ' + words[1] + ' can only be used on relations');
      }

      if (!whereFrom.model.Database.projections[ projectionName ])
      {
        throw ('The projection ' + projectionName + ' does not exist on ' + whereFrom.model.Database.name);
      }

      if (whereFrom instanceof RelationSingle)
      {
        return function(resolver)
        {
          return function (relation)
          {
            if ( !isValue( relation ) )
            {
              return null;
            }

            return resolver( relation.$project( projectionName ) );
          };
        };
      }
      else
      {
        return function(resolver)
        {
          return function(relations)
          {
            if ( !isValue( relations ) )
            {
              return null;
            }

            return resolver( relations.project( projectionName ) );
          };
        };
      }
    }
  },

  pluckValueEnd:
  {
    pre: function(words, tokens, types, projection)
    {
      var properties = words[0];
      var whereFrom = types[0];

      if (tokens[1] !== 'pluckValueStart')
      {
        throw ('Pluck value syntax error, an ending ] requires a starting [');
      }

      if (!(whereFrom instanceof RelationMultiple))
      {
        throw ('Pluck values like ' + properties + ' from ' + words[1] + ' can only be used on relations');
      }

      return function (resolver)
      {
        return function (relations)
        {
          if ( !isValue( relations ) )
          {
            return null;
          }

          return resolver( relations.pluck( properties ) );
        };
      };
    }
  },

  pluckObjectEnd:
  {
    pre: function(words, tokens, types, projection)
    {
      var properties = words[0];
      var keys = words[1];
      var whereFrom = types[0];

      if (tokens[1] !== 'pluckObjectDelimiter' || tokens[2] !== 'pluckObjectStart')
      {
        throw ('Pluck object syntax error, must be {key: value}');
      }

      if (!(whereFrom instanceof RelationMultiple))
      {
        throw ('Pluck values like ' + properties + ' from ' + words[1] + ' can only be used on relations');
      }

      return function (resolver)
      {
        return function (relations)
        {
          if ( !isValue( relations ) )
          {
            return null;
          }

          return resolver( relations.pluck( properties, keys ) );
        };
      };
    }
  }
};

Projection.ALIAS_DELIMITER = ':';

Projection.parse = function(database, input)
{
  var originalInput = input;

  if ( isString( input ) )
  {
    input = database.projections[ input ];
  }

  if ( isArray( input ) )
  {
    input = new Projection( database, input );
  }

  if (!(input instanceof Projection))
  {
    throw (originalInput + ' is not a valid projection');
  }

  return input;
};


function Context(models)
{
  this.databases = [];
  this.alls = [];
  this.models = [];

  if ( isEmpty( models ) )
  {
    for (var name in Rekord.classes)
    {
      this.add( name );
    }
  }
  else if ( isArray( models ) )
  {
    for (var i = 0; i < models.length; i++)
    {
      this.add( models[ i ] );
    }
  }
}

Context.start = function(models)
{
  var context = new Context( models );

  context.apply();

  return context;
};

Class.create( Context,
{

  add: function(type)
  {
    if ( isString( type ) )
    {
      type = Rekord.classes[ type ];
    }

    if ( isRekord( type ) )
    {
      type = type.Database;
    }

    if ( type instanceof Database )
    {
      this.databases.push( type );
      this.alls.push( {} );
      this.models.push( new ModelCollection( type ) );
    }
  },

  getApplied: function()
  {
    var applied = 0;

    this.each(function(db)
    {
      if (db.context === this)
      {
        applied++;
      }
    });

    return applied / this.databases.length;
  },

  apply: function()
  {
    this.each( this.applyDatabase );
  },

  applyDatabase: function(db, all, models, i)
  {
    db.all = all;
    db.models = models;
    db.context = this;
    db.contextIndex = i;
  },

  discard: function()
  {
    this.each( this.discardDatabase );
  },

  discardDatabase: function(db)
  {
    if (db.context === this)
    {
      db.all = db.allCached;
      db.models = db.modelsCached;
      db.context = null;
      db.contextIndex = -1;
    }
  },

  destroy: function()
  {
    this.each( this.destroyDatabase );

    this.databases.length = 0;
    this.alls.length = 0;
    this.models.length = 0;
  },

  destroyDatabase: function(db, alls, models, i)
  {
    this.discardDatabase( db );

    this.databases[ i ] = null;
    this.alls[ i ] = null;
    this.models[ i ].clear();
    this.models[ i ] = null;
  },

  clear: function(db)
  {
    this.alls[ db.contextIndex ] = {};
  },

  each: function(iterator)
  {
    var dbs = this.databases;
    var alls = this.alls;
    var models = this.models;

    for (var i = 0; i < dbs.length; i++)
    {
      iterator.call( this, dbs[ i ], alls[ i ], models[ i ], i );
    }
  }

});


function KeyHandler()
{

}

Class.create( KeyHandler,
{

  init: function(database)
  {
    this.key = database.key;
    this.keySeparator = database.keySeparator;
    this.database = database;
  },

  getKey: function(model, quietly)
  {
    var field = this.key;
    var modelKey = this.buildKey( model, field );

    if ( hasFields( model, field, isValue ) )
    {
      return modelKey;
    }
    else if ( !quietly )
    {
      throw 'Composite key not supplied.';
    }

    return null;
  },

  buildKeyFromRelations: function(input)
  {
    if ( isObject( input ) )
    {
      var relations = this.database.relations;

      for (var relationName in relations)
      {
        if ( relationName in input )
        {
          relations[ relationName ].buildKey( input );
        }
      }
    }
  },

  buildKeyFromInput: function(input)
  {
    if ( input instanceof this.database.Model )
    {
      return input.$key();
    }
    else if ( isArray( input ) ) // && isArray( this.key )
    {
      return input.join( this.keySeparator );
    }
    else if ( isObject( input ) )
    {
      return this.buildKey( input );
    }

    return input;
  }

});


function KeySimple(database)
{
  this.init( database );
}

Class.extend( KeyHandler, KeySimple,
{
  getKeys: function(model)
  {
    return this.buildKey( model );
  },

  removeKey: function(model)
  {
    var field = this.key;

    delete model[ field ];
  },

  buildKey: function(input, otherFields)
  {
    this.buildKeyFromRelations( input );

    var field = otherFields || this.key;
    var key = input[ field ];

    if ( !isValue( key ) )
    {
      key = input[ field ] = uuid();
    }

    return key;
  },

  buildObjectFromKey: function(key)
  {
    var field = this.key;
    var props = {};

    props[ field ] = key;

    return this.database.instantiate( props );
  },

  hasKeyChange: function(a, b)
  {
    var field = this.key;
    var akey = a[ field ];
    var bkey = b[ field ];

    return isValue( akey ) && isValue( bkey ) && akey !== bkey;
  },

  addToFields: function(out)
  {
    var field = this.key;

    if ( indexOf( out, field ) === false )
    {
      out.unshift( field );
    }
  },

  isValid: function(key)
  {
    return isValue( key );
  },

  copyFields: function(target, targetFields, source, sourceFields)
  {
    var targetValue = target[ targetFields ];
    var sourceValue = source[ sourceFields ];

    if ( !isValue( targetValue ) && isValue( sourceValue ) )
    {
      target[ targetFields ] = copy( sourceValue );
    }
  },

  inKey: function(field)
  {
    if ( isArray( field ) )
    {
      for (var i = 0; i < field.length; i++)
      {
        if ( field[ i ] === this.key )
        {
          return true;
        }
      }

      return false;
    }

    return field === this.key;
  },

  setKeyField: function(key, field, source, target)
  {
    if ( field === target )
    {
      key[ field ] = source[ this.key ];
    }
  },

  applyKey: function(input, target)
  {
    target[ this.key ] = input;
  }

});


function KeyComposite(database)
{
  this.init( database );
}

Class.extend( KeyHandler, KeyComposite,
{
  getKeys: function(input, otherFields)
  {
    this.buildKeyFromRelations( input );

    return pull( input, otherFields || this.key );
  },

  removeKey: function(model)
  {
    var fields = this.key;

    for (var i = 0; i < fields.length; i++)
    {
      delete model[ fields[ i ] ];
    }
  },

  buildKey: function(input, otherFields)
  {
    return this.getKeys( input, otherFields ).join( this.keySeparator );
  },

  buildObjectFromKey: function(key)
  {
    var fields = this.key;
    var props = {};

    if ( isString( key ) )
    {
      key = key.split( this.keySeparator );
    }

    for (var i = 0; i < fields.length; i++)
    {
      props[ fields[ i ] ] = key[ i ];
    }

    return this.database.instantiate( props );
  },

  hasKeyChange: function(a, b)
  {
    var fields = this.key;

    for (var i = 0; i < fields.length; i++)
    {
      var akey = a[ fields[ i ] ];
      var bkey = b[ fields[ i ] ];

      if ( isValue( akey ) && isValue( bkey ) && akey !== bkey )
      {
        return true;
      }
    }

    return false;
  },

  addToFields: function(out)
  {
    var fields = this.key;

    for (var i = fields.length - 1; i >= 0; i--)
    {
      if ( indexOf( out, fields[ i ] ) === false )
      {
        out.unshift( fields[ i ] );
      }
    }
  },

  isValid: function(key)
  {
    return isValue( key );
  },

  copyFields: function(target, targetFields, source, sourceFields)
  {
    for (var i = 0; i < targetFields.length; i++)
    {
      var targetValue = target[ targetFields[ i ] ];
      var sourceValue = source[ sourceFields[ i ] ];

      if ( !isValue( targetValue ) && isValue( sourceValue ) )
      {
        target[ targetFields[ i ] ] = copy( sourceValue );
      }
    }
  },

  inKey: function(field)
  {
    if ( isArray( field ) )
    {
      for (var i = 0; i < field.length; i++)
      {
        if ( indexOf( this.key, field[ i ] ) !== false )
        {
          return true;
        }
      }

      return false;
    }

    return indexOf( this.key, field ) !== false;
  },

  setKeyField: function(key, field, source, target)
  {
    var index = indexOf( target );

    if ( index !== false )
    {
      key[ field ] = source[ this.key[ index ] ];
    }
  },

  applyKey: function(input, target)
  {
    var fields = this.key;

    if ( isString( input ) )
    {
      input = input.split( this.keySeparator );
    }

    for (var i = 0; i < fields.length; i++)
    {
      target[ fields[ i ] ] = input[ i ];
    }
  }

});


/**
 * An extension of the Array class adding many useful functions and events. This
 * is the base collection class in Rekord.
 *
 * A collection of any type can be created via {@link Rekord.collect}.
 *
 * ```
 * var nc = new Rekord.Collection([1, 2, 3, 4]);
 * ```
 *
 * @constructor
 * @memberof Rekord
 * @augments Rekord.Eventful
 * @extends Array
 * @param {Array} [values] 0
 *    The initial set of values in this collection.
 * @see Rekord.collect
 */
function Collection(values)
{
  this.addAll( values, true );
}

/**
* A comparator to keep the collection sorted with.
*
* @memberof Rekord.Collection#
* @member {comparisonCallback} [comparator]
*/

/**
 * The events a collection can emit.
 *
 * {@link Rekord.Collection#event:add Add}
 * {@link Rekord.Collection#event:adds Adds}
 * {@link Rekord.Collection#event:sort Sort}
 * {@link Rekord.Collection#event:remove Remove}
 * {@link Rekord.Collection#event:removes Removes}
 * {@link Rekord.Collection#event:updates Updates}
 * {@link Rekord.Collection#event:reset Reset}
 * {@link Rekord.Collection#event:cleared Cleared}
 * {@link Rekord.Collection#event:changes Changes}
 *
 * @static
 */
Collection.Events =
{
  /**
   * An event triggered when a single value is added to a collection.
   *
   * @event Rekord.Collection#add
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   * @argument {T} value -
   *    The value added.
   * @see Rekord.Collection#add
   * @see Rekord.Collection#insertAt
   * @see Rekord.ModelCollection#add
   * @see Rekord.ModelCollection#push
   */
  Add:            'add',

  /**
   * An event triggered when multiple values are added to a collection.
   *
   * @event Rekord.Collection#adds
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   * @argument {T[]} value -
   *    The values added.
   * @see Rekord.Collection#addAll
   * @see Rekord.ModelCollection#addAll
   */
  Adds:           'adds',

  /**
   * An event triggered when a collection is sorted. This may automatically
   * be triggered by any method that modifies the collection.
   *
   * @event Rekord.Collection#sort
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   * @see Rekord.Collection#sort
   * @see Rekord.ModelCollection#sort
   */
  Sort:           'sort',

  /**
   * An event triggered when a collection has an element removed at a given index.
   *
   * @event Rekord.Collection#remove
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   * @argument {Any} removing -
   *    The element that was removed.
   * @argument {Number} index -
   *    The index where the element was removed at.
   * @see Rekord.Collection#remove
   * @see Rekord.Collection#removeAt
   * @see Rekord.ModelCollection#remove
   */
  Remove:         'remove',

  /**
   * An event triggered when a collection has multiple elements removed.
   *
   * @event Rekord.Collection#removes
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   * @argument {Any[]} removed -
   *    The array of elements removed from the collection.
   * @see Rekord.Collection#removeAll
   * @see Rekord.Collection#removeWhere
   */
  Removes:        'removes',

  /**
   * An event triggered when a collection has elements modified.
   *
   * @event Rekord.Collection#updates
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   * @argument {Array} updated -
   *    The array of elements modified.
   * @see Rekord.ModelCollection#update
   * @see Rekord.ModelCollection#updateWhere
   */
  Updates:        'updates',

  /**
   * An event triggered when a collection's elements are entirely replaced by
   * a new set of elements.
   *
   * @event Rekord.Collection#reset
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   * @argument {Array} updated -
   *    The array of elements modified.
   * @see Rekord.FilteredCollection#sync
   * @see Rekord.ModelCollection#reset
   */
  Reset:          'reset',

  /**
   * An event triggered when a collection is cleared of all elements.
   *
   * @event Rekord.Collection#cleared
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   * @see Rekord.Collection#clear
   */
  Cleared:        'cleared',

  /**
   * All events triggered by a collection when the contents of the collection changes.
   *
   * @event Rekord.Collection#changes
   * @argument {Rekord.Collection} collection -
   *    The collection that triggered the event.
   */
  Changes:        'add adds sort remove removes updates reset cleared'

};

Class.extend( Array, Collection,
{

  /**
   * Sets the comparator for this collection and performs a sort.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {ComparatorInput} comparator -
   *    The comparator input to convert to a comparison function.
   * @param {Boolean} [nullsFirst=false] -
   *    When a comparison is done involving a null/undefined value this can
   *    determine which is ordered before the other.
   * @emits Rekord.Collection#sort
   * @see Rekord.createComparator
   * @return {Rekord.Collection}
   */
  setComparator: function(comparator, nullsFirst)
  {
    this.comparator = createComparator( comparator, nullsFirst );
    this.sort();

    return this;
  },

  /**
   * Adds a comparator to the existing comparator. This added comparator is ran
   * after the current comparator when it finds two elements equal. If no
   * comparator exists on this collection then it's set to the given comparator.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {ComparatorInput} comparator -
   *    The comparator input to convert to a comparison function.
   * @param {Boolean} [nullsFirst=false] -
   *    When a comparison is done involving a null/undefined value this can
   *    determine which is ordered before the other.
   * @emits Rekord.Collection#sort
   * @see Rekord.createComparator
   * @return {Rekord.Collection}
   */
  addComparator: function(comparator, nullsFirst)
  {
    this.comparator = addComparator( this.comparator, comparator, nullsFirst );
    this.sort();

    return this;
  },

  /**
   * Determines if the collection is currently sorted based on the current
   * comparator of the collection unless a comparator is given
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {ComparatorInput} [comparator] -
   *    The comparator input to convert to a comparison function.
   * @param {Boolean} [nullsFirst=false] -
   *    When a comparison is done involving a null/undefined value this can
   *    determine which is ordered before the other.
   * @see Rekord.createComparator
   * @return {Boolean}
   */
  isSorted: function(comparator, nullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, nullsFirst ) : this.comparator;

    return isSorted( cmp, this );
  },

  /**
   * Sorts the elements in this collection based on the current comparator
   * unless a comparator is given. If a comparator is given it will not override
   * the current comparator, subsequent operations to the collection may trigger
   * a sort if the collection has a comparator.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {ComparatorInput} [comparator] -
   *    The comparator input to convert to a comparison function.
   * @param {Boolean} [nullsFirst=false] -
   *    When a comparison is done involving a null/undefined value this can
   *    determine which is ordered before the other.
   * @param {Boolean} [ignorePrimitive=false] -
   *    Sorting is automatically done for non-primitive collections if a
   *    comparator exists. This flag ensures primitive collections aren't sorted
   *    after every operation.
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#sort
   * @see Rekord.createComparator
   */
  sort: function(comparator, nullsFirst, ignorePrimitive)
  {
    var cmp = comparator ? createComparator( comparator, nullsFirst ) : this.comparator;

    if ( !isSorted( cmp, this ) || ( !ignorePrimitive && !cmp && isPrimitiveArray( this ) ) )
    {
      AP.sort.call( this, cmp );

      this.trigger( Collection.Events.Sort, [this] );
    }

    return this;
  },

  /**
   * Resets the values in this collection with a new collection of values.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Any[]} [values] -
   *    The new array of values in this collection.
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  reset: function(values)
  {
    this.length = 0;

    if ( isArray( values ) )
    {
      AP.push.apply( this, values );
    }
    else if ( isValue( values ) )
    {
      AP.push.call( this, values );
    }

    this.trigger( Collection.Events.Reset, [this] );
    this.sort( undefined, undefined, true );

    return this;
  },

  /**
   * Creates a limited view of this collection known as a page. The resulting
   * page object changes when this collection changes. At the very least the
   * page size is required, and a starting page index can be specified.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Number} pageSize -
   *    The maximum number of elements allowed in the page at once.
   * @param {Number} [pageIndex=0]
   *    The starting page offset. This isn't an element offset, but the element
   *    offset can be calculated by multiplying the page index by the page size.
   * @return {Rekord.Page} -
   *    The newly created Page.
   */
  page: function(pageSize, pageIndex)
  {
    return new Page( this, pageSize, pageIndex );
  },

  /**
   * Creates a sub view of this collection known as a filtered collection. The
   * resulting collection changes when this collection changes. Any time an
   * element is added or removed to this collection it may be added or removed
   * from the filtered collection if it fits the filter function. The filter
   * function is created by passing the arguments of this function to
   * {@link Rekord.createWhere}.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.FilteredCollection} -
   *    The newly created live filtered view of this collection.
   * @see Rekord.createWhere
   */
  filtered: function(whereProperties, whereValue, whereEquals)
  {
    var filter = createWhere( whereProperties, whereValue, whereEquals );

    return FilteredCollection.create( this, filter );
  },

  /**
   * Creates a copy of this collection with elements that match the supplied
   * parameters. The parameters are passed to the {@link Rekord.createWhere}
   * to generate a function which tests each element of this collection for
   * inclusion in the newly created collection.
   *
   * ```javascript
   * var isEven = function() { return x % 2 == 0; };
   * var c = Rekord.collect(1, 2, 3, 4, 5);
   * var w = c.where(isEven); // [2, 4]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @param {Array} [out=this.cloneEmpty()] -
   *    The array to place the elements that match.
   * @return {Rekord.Collection} -
   *    The copy of this collection ran through a filtering function.
   * @see Rekord.createWhere
   */
  where: function(whereProperties, whereValue, whereEquals, out)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var target = out || this.cloneEmpty();

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];

      if ( where( a ) )
      {
        target.push( a );
      }
    }

    return target;
  },

  /**
   * Returns a collection with elements that exist in this collection but does
   * not exist in the given collection.
   *
   * ```javascript
   * var a = Rekord.collect(1, 2, 3, 4);
   * var b = Rekord.collect(1, 3, 5);
   * var c = a.subtract( b ); // [2, 4]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Array} collection -
   *    The array of elements that shouldn't exist in the resulting collection.
   * @param {Array} [out=this.cloneEmpty()] -
   *    The array to place the elements that exist in this collection but not in
   *    the given collection. If this is not given - a collection of this type
   *    will be created.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to an element that exists in the given
   *    collection.
   * @return {Array} -
   *    The collection of elements that exist in this collection and not the
   *    given collection.
   */
  subtract: function(collection, out, equals)
  {
    var target = out || this.cloneEmpty();
    var equality = equals || equalsStrict;

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];
      var exists = false;

      for (var j = 0; j < collection.length && !exists; j++)
      {
        exists = equality( a, collection[ j ] );
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  /**
   * Returns a collection of elements that are shared between this collection
   * and the given collection.
   *
   * ```javascript
   * var a = Rekord.collect(1, 2, 3, 4);
   * var b = Rekord.collect(1, 3, 5);
   * var c = a.intersect( b ); // [1, 3]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Array} collection -
   *    The collection of elements to intersect with this collection.
   * @param {Array} [out=this.cloneEmpty()] -
   *    The array to place the elements that exist in both this collection and
   *    the given collection. If this is not given - a collection of this type
   *    will be created.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to an element that exists in the given
   *    collection.
   * @return {Array} -
   *    The collection of elements that exist in both collections.
   */
  intersect: function(collection, out, equals)
  {
    var target = out || this.cloneEmpty();
    var equality = equals || equalsStrict;

    for (var i = 0; i < collection.length; i++)
    {
      var a = collection[ i ];
      var exists = false;

      for (var j = 0; j < this.length && !exists; j++)
      {
        exists = equality( a, this[ j ] );
      }

      if (exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  /**
   * Returns a collection of elements that exist in the given collection but
   * not in this collection.
   *
   * ```javascript
   * var a = Rekord.collect(1, 2, 3, 4);
   * var b = Rekord.collect(1, 3, 5);
   * var c = a.complement( b ); // [5]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Array} collection -
   *    The array of elements that could exist in the resulting collection.
   * @param {Array} [out=this.cloneEmpty()] -
   *    The array to place the elements that exist in given collection but not
   *    in this collection. If this is not given - a collection of this type
   *    will be created.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to an element that exists in the given
   *    collection.
   * @return {Array} -
   *    The collection of elements that exist in the given collection and not
   *    this collection.
   */
  complement: function(collection, out, equals)
  {
    var target = out || this.cloneEmpty();
    var equality = equals || equalsStrict;

    for (var i = 0; i < collection.length; i++)
    {
      var a = collection[ i ];
      var exists = false;

      for (var j = 0; j < this.length && !exists; j++)
      {
        exists = equality( a, this[ j ] );
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  /**
   * Clears all elements from this collection.
   *
   * ```javascript
   * var a = Rekord.collect(1, 2, 3, 4);
   * a.clear(); // []
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#sort
   */
  clear: function()
  {
    this.length = 0;
    this.trigger( Collection.Events.Cleared, [this] );

    return this;
  },


  /**
   * Adds an element to this collection - sorting the collection if a
   * comparator is set on this collection and `delaySort` is not a specified or
   * a true value.
   *
   * ```javascript
   * var a = Rekord.collect(1, 2, 3, 4);
   * a.add( 5 ); // [1, 2, 3, 4, 5]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Any} value -
   *    The value to add to this collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#add
   * @emits Rekord.Collection#sort
   */
  add: function(value, delaySort)
  {
    AP.push.call( this, value );

    this.trigger( Collection.Events.Add, [this, value] );

    if ( !delaySort )
    {
      this.sort( undefined, undefined, true );
    }

    return this;
  },

  /**
   * Adds one or more elements to the end of this collection - sorting the
   * collection if a comparator is set on this collection.
   *
   * ```javascript
   * var a = Rekord.collect(1, 2, 3, 4);
   * a.push( 5, 6, 7 ); // 7
   * a // [1, 2, 3, 4, 5, 6, 7]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {...Any} value -
   *    The values to add to this collection.
   * @return {Number} -
   *    The new length of this collection.
   * @emits Rekord.Collection#add
   * @emits Rekord.Collection#sort
   */
  push: function()
  {
    var values = arguments;

    AP.push.apply( this, values );

    this.trigger( Collection.Events.Adds, [this, AP.slice.apply(values)] );

    this.sort( undefined, undefined, true );

    return this.length;
  },

  /**
   * Adds one or more elements to the beginning of this collection - sorting the
   * collection if a comparator is set on this collection.
   *
   * ```javascript
   * var a = Rekord.collect(1, 2, 3, 4);
   * a.unshift( 5, 6, 7 ); // 7
   * a // [5, 6, 7, 1, 2, 3, 4]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {...Any} value -
   *    The values to add to this collection.
   * @return {Number} -
   *    The new length of this collection.
   * @emits Rekord.Collection#adds
   * @emits Rekord.Collection#sort
   */
  unshift: function()
  {
    var values = arguments;

    AP.unshift.apply( this, values );

    this.trigger( Collection.Events.Adds, [this, AP.slice.apply(values)] );

    this.sort( undefined, undefined, true );

    return this.length;
  },

  /**
   * Adds all elements in the given array to this collection - sorting the
   * collection if a comparator is set on this collection and `delaySort` is
   * not specified or a true value.
   *
   * ```javascript
   * var a = Rekord.collect(1, 2, 3, 4);
   * a.addAll( [5, 6] ); // [1, 2, 3, 4, 5, 6]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Any[]} values -
   *    The values to add to this collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#adds
   * @emits Rekord.Collection#sort
   */
  addAll: function(values, delaySort)
  {
    if ( isArray( values ) && values.length )
    {
      AP.push.apply( this, values );

      this.trigger( Collection.Events.Adds, [this, values] );

      if ( !delaySort )
      {
        this.sort( undefined, undefined, true );
      }
    }

    return this;
  },

  /**
   * Inserts an element into this collection at the given index - sorting the
   * collection if a comparator is set on this collection and `delaySort` is not
   * specified or a true value.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.insertAt( 0, 0 ); // [0, 1, 2, 3, 4]
   * c.insertAt( 2, 1.5 ); // [0, 1, 1.5, 2, 3, 4]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Number} i -
   *    The index to insert the element at.
   * @param {Any} value -
   *    The value to insert into the collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#add
   * @emits Rekord.Collection#sort
   */
  insertAt: function(i, value, delaySort)
  {
    AP.splice.call( this, i, 0, value );
    this.trigger( Collection.Events.Add, [this, value] );

    if ( !delaySort )
    {
      this.sort( undefined, undefined, true );
    }

    return this;
  },

  /**
   * Removes the last element in this collection and returns it - sorting the
   * collection if a comparator is set on this collection and `delaySort` is
   * no specified or a true value.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.pop(); // 4
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @return {Any} -
   *    The element removed from the end of the collection.
   * @emits Rekord.Collection#remove
   * @emits Rekord.Collection#sort
   */
  pop: function(delaySort)
  {
    var removed = AP.pop.apply( this );
    var i = this.length;

    this.trigger( Collection.Events.Remove, [this, removed, i] );

    if ( !delaySort )
    {
      this.sort( undefined, undefined, true );
    }

    return removed;
  },

  /**
   * Removes the first element in this collection and returns it - sorting the
   * collection if a comparator is set on this collection and `delaySort` is
   * no specified or a true value.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.shift(); // 1
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @return {Any} -
   *    The element removed from the beginning of the collection.
   * @emits Rekord.Collection#remove
   * @emits Rekord.Collection#sort
   */
  shift: function(delaySort)
  {
    var removed = AP.shift.apply( this );

    this.trigger( Collection.Events.Remove, [this, removed, 0] );

    if ( !delaySort )
    {
      this.sort( undefined, undefined, true );
    }

    return removed;
  },

  /**
   * Removes the element in this collection at the given index `i` - sorting
   * the collection if a comparator is set on this collection and `delaySort` is
   * not specified or a true value.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.removeAt( 1 ); // 2
   * c.removeAt( 5 ); // undefined
   * c // [1, 3, 4]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Number} i -
   *    The index of the element to remove.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @return {Any} -
   *    The element removed, or undefined if the index was invalid.
   * @emits Rekord.Collection#remove
   * @emits Rekord.Collection#sort
   */
  removeAt: function(i, delaySort)
  {
    var removing;

    if (i >= 0 && i < this.length)
    {
      removing = this[ i ];

      AP.splice.call( this, i, 1 );
      this.trigger( Collection.Events.Remove, [this, removing, i] );

      if ( !delaySort )
      {
        this.sort( undefined, undefined, true );
      }
    }

    return removing;
  },

  /**
   * Removes the given value from this collection if it exists - sorting the
   * collection if a comparator is set on this collection and `delaySort` is not
   * specified or a true value.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.remove( 1 ); // 1
   * c.remove( 5 ); // undefined
   * c // [2, 3, 4]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Any} value -
   *    The value to remove from this collection if it exists.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to the given value.
   * @return {Any} -
   *    The element removed from this collection.
   * @emits Rekord.Collection#remove
   * @emits Rekord.Collection#sort
   */
  remove: function(value, delaySort, equals)
  {
    var i = this.indexOf( value, equals );
    var element = this[ i ];

    if ( i !== -1 )
    {
      this.removeAt( i, delaySort );
    }

    return element;
  },

  /**
   * Removes the given values from this collection - sorting the collection if
   * a comparator is set on this collection and `delaySort` is not specified or
   * a true value.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.removeAll( [1, 5] ); // [1]
   * c // [2, 3, 4]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Any[]} values -
   *    The values to remove from this collection if they exist.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to any of the given values.
   * @return {Any[]} -
   *    The elements removed from this collection.
   * @emits Rekord.Collection#removes
   * @emits Rekord.Collection#sort
   */
  removeAll: function(values, delaySort, equals)
  {
    var removed = [];

    if ( isArray( values ) && values.length )
    {
      for (var i = 0; i < values.length; i++)
      {
        var value = values[ i ];
        var k = this.indexOf( value, equals );

        if ( k !== -1 )
        {
          AP.splice.call( this, k, 1 );
          removed.push( value );
        }
      }

      this.trigger( Collection.Events.Removes, [this, removed] );

      if ( !delaySort )
      {
        this.sort( undefined, undefined, true );
      }
    }

    return removed;
  },

  /**
   * Removes elements from this collection that meet the specified criteria. The
   * given criteria are passed to {@link Rekord.createWhere} to create a filter
   * function. All elements removed are returned
   *
   * ```javascript
   * var isEven = function(x) { return x % 2 === 0; };
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.removeWhere( isEven ); // [2, 4];
   * c // [1, 3]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @param {Array} [out=this.cloneEmpty()] -
   *    The array to place the elements that match.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#removes
   * @emits Rekord.Collection#sort
   * @see Rekord.createWhere
   */
  removeWhere: function(whereProperties, whereValue, whereEquals, out, delaySort)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var removed = out || this.cloneEmpty();

    for (var i = this.length - 1; i >= 0; i--)
    {
      var value = this[ i ];

      if ( where( value ) )
      {
        AP.splice.call( this, i, 1 );
        removed.push( value );
      }
    }

    this.trigger( Collection.Events.Removes, [this, removed] );

    if ( !delaySort )
    {
      this.sort( undefined, undefined, true );
    }

    return removed;
  },

  /**
   * Splices elements out of and into this collection - sorting the collection
   * if a comparator is set on this collection.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Number} start -
   *    Index at which to start changing the array (with origin 0). If greater
   *    than the length of the array, actual starting index will be set to the
   *    length of the array. If negative, will begin that many elements from the end.
   * @param {Number} deleteCount -
   *    An integer indicating the number of old array elements to remove. If
   *    deleteCount is 0, no elements are removed. In this case, you should
   *    specify at least one new element. If deleteCount is greater than the
   *    number of elements left in the array starting at start, then all of the
   *    elements through the end of the array will be deleted.
   *    If deleteCount is omitted, deleteCount will be equal to (arr.length - start).
   * @param {...Any} values -
   *    The elements to add to the array, beginning at the start index. If you
   *    don't specify any elements, splice() will only remove elements from the array.
   * @return {Any[]} -
   *    The array of deleted elements.
   * @emits Rekord.Collection#removes
   * @emits Rekord.Collection#adds
   * @emits Rekord.Collection#sort
   */
  splice: function(start, deleteCount)
  {
    var adding = AP.slice.call( arguments, 2 );
    var removed = AP.splice.apply( this, arguments );

    if ( deleteCount )
    {
      this.trigger( Collection.Events.Removes, [this, removed] );
    }

    if ( adding.length )
    {
      this.trigger( Collection.Events.Adds, [this, adding] );
    }

    this.sort( undefined, undefined, true );

    return removed;
  },

  /**
   * Reverses the order of elements in this collection.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.reverse(); // [4, 3, 2, 1]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#updates
   */
  reverse: function()
  {
    if ( AP.reverse )
    {
      AP.reverse.apply( this );
    }
    else
    {
      reverse( this );
    }

    this.trigger( Collection.Events.Updates, [this] );

    return this;
  },

  /**
   * Returns the index of the given element in this collection or returns -1
   * if the element doesn't exist in this collection.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.indexOf( 1 ); // 0
   * c.indexOf( 2 ); // 1
   * c.indexOf( 5 ); // -1
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Any} value -
   *    The value to search for.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to the given value.
   * @return {Number} -
   *    The index of the element in this collection or -1 if it was not found.
   * @see Rekord.equals
   * @see Rekord.equalsStrict
   */
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

  /**
   * Returns the element with the minimum value given a comparator.
   *
   * ```javascript
   * var c = Rekord.collect({age: 4}, {age: 5}, {age: 6}, {age: 3});
   * c.minModel('age'); // {age: 3}
   * c.minModel('-age'); // {age: 6}
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {comparatorInput} comparator -
   *    The comparator which calculates the minimum model.
   * @param {Any} [startingValue]
   *    The initial minimum value. If a value is specified, it's compared
   *    against all elements in this collection until the comparator function
   *    finds a more minimal value. If it doesn't - this is the value returned.
   * @return {Any} -
   *    The minimum element in the collection given the comparator function.
   * @see Rekord.createComparator
   */
  minModel: function(comparator, startingValue)
  {
    var cmp = createComparator( comparator || this.comparator, false );
    var min = startingValue;

    for (var i = 0; i < this.length; i++)
    {
      if ( cmp( min, this[i] ) > 0 )
      {
        min = this[i];
      }
    }

    return min;
  },

  /**
   * Returns the element with the maximum value given a comparator.
   *
   * ```javascript
   * var c = Rekord.collect({age: 4}, {age: 5}, {age: 6}, {age: 3});
   * c.maxModel('age'); // {age: 6}
   * c.maxModel('-age'); // {age: 3}
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {comparatorInput} comparator -
   *    The comparator which calculates the maximum model.
   * @param {Any} [startingValue] -
   *    The initial maximum value. If a value is specified, it's compared
   *    against all elements in this collection until the comparator function
   *    finds a more maximal value. If it doesn't - this is the value returned.
   * @return {Any} -
   *    The maximum element in the collection given the comparator function.
   * @see Rekord.createComparator
   */
  maxModel: function(comparator, startingValue)
  {
    var cmp = createComparator( comparator || this.comparator, true );
    var max = startingValue;

    for (var i = 0; i < this.length; i++)
    {
      if ( cmp( max, this[i] ) < 0 )
      {
        max = this[i];
      }
    }

    return max;
  },

  /**
   * Returns the minimum value for the given property expression out of all the
   * elements this collection.
   *
   * ```javascript
   * var c = Rekord.collect({age: 6}, {age: 5}, {notage: 5});
   * c.min('age');  // 5
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {propertyResolverInput} [properties] -
   *    The expression which takes an element in this container and resolves a
   *    value that can be compared to the current minimum.
   * @param {Any} [startingValue] -
   *    The initial minimum value. If a value is specified, it's compared
   *    against all elements in this collection until the comparator function
   *    finds a more minimal value. If it doesn't - this is the value returned.
   * @param {compareCallback} [compareFunction=Rekord.compare] -
   *    A comparison function to use.
   * @return {Any} -
   *    The minimum value found.
   * @see Rekord.createPropertyResolver
   * @see Rekord.compare
   */
  min: function(properties, startingValue, compareFunction)
  {
    var comparator = compareFunction || compare;
    var resolver = createPropertyResolver( properties );
    var min = startingValue;

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( comparator( min, resolved, false ) > 0 )
      {
        min = resolved;
      }
    }

    return min;
  },

  /**
   * Returns the maximum value for the given property expression out of all the
   * elements this collection.
   *
   * ```javascript
   * var c = Rekord.collect({age: 6}, {age: 5}, {notage: 5});
   * c.max('age');  // 6
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {propertyResolverInput} [properties] -
   *    The expression which takes an element in this container and resolves a
   *    value that can be compared to the current maximum.
   * @param {Any} [startingValue] -
   *    The initial maximum value. If a value is specified, it's compared
   *    against all elements in this collection until the comparator function
   *    finds a more maximal value. If it doesn't - this is the value returned.
   * @param {compareCallback} [compareFunction=Rekord.compare] -
   *    A comparison function to use.
   * @return {Any} -
   *    The maximum value found.
   * @see Rekord.createPropertyResolver
   * @see Rekord.compare
   */
  max: function(properties, startingValue, compareFunction)
  {
    var comparator = compareFunction || compare;
    var resolver = createPropertyResolver( properties );
    var max = startingValue;

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( comparator( max, resolved, true ) < 0 )
      {
        max = resolved;
      }
    }

    return max;
  },

  /**
   * Returns the first element where the given expression is true.
   *
   * ```javascript
   * var c = Rekord.collect([{x: 5}, {y: 6}, {y: 6, age: 8}, {z: 7}]);
   * c.firstWhere('y', 6); // {x: 6}
   * c.firstWhere(); // {x: 5}
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {whereInput} [whereProperties] -
   *    The expression used to create a function to test the elements in this
   *    collection.
   * @param {Any} [whereValue] -
   *    When the first argument is a string this argument will be treated as a
   *    value to compare to the value of the named property on the object passed
   *    through the filter function.
   * @param {equalityCallback} [whereEquals=Rekord.equalsStrict] -
   *    An alternative function can be used to compare to values.
   * @return {Any} -
   *    The first element in this collection that matches the given expression.
   * @see Rekord.createWhere
   */
  firstWhere: function(whereProperties, whereValue, whereEquals)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );

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

  /**
   * Returns the first non-null value in this collection given a property
   * expression. If no non-null values exist for the given property expression,
   * then undefined will be returned.
   *
   * ```javascript
   * var c = Rekord.collect([{x: 5}, {y: 6}, {y: 4}, {z: 7}]);
   * c.first('y'); // 6
   * c.first(); // {x: 5}
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {propertyResolverInput} [properties] -
   *    The expression which converts one value into another.
   * @return {Any} -
   * @see Rekord.createPropertyResolver
   * @see Rekord.isValue
   */
  first: function(properties)
  {
    var resolver = createPropertyResolver( properties );

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( isValue( resolved ) )
      {
        return resolved;
      }
    }
  },

  /**
   * Returns the last element where the given expression is true.
   *
   * ```javascript
   * var c = Rekord.collect([{x: 5}, {y: 6}, {y: 6, age: 8}, {z: 7}]);
   * c.lastWhere('y', 6); // {x: 6, age: 8}
   * c.lastWhere(); // {z: 7}
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {whereInput} [properties] -
   *    The expression used to create a function to test the elements in this
   *    collection.
   * @param {Any} [value] -
   *    When the first argument is a string this argument will be treated as a
   *    value to compare to the value of the named property on the object passed
   *    through the filter function.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    An alternative function can be used to compare to values.
   * @return {Any} -
   *    The last element in this collection that matches the given expression.
   * @see Rekord.createWhere
   */
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

   /**
    * Returns the last non-null value in this collection given a property
    * expression. If no non-null values exist for the given property expression,
    * then undefined will be returned.
    *
    * ```javascript
    * var c = Rekord.collect([{x: 5}, {y: 6}, {y: 4}, {z: 7}]);
    * c.last('y'); // 4
    * c.last(); // {z: 7}
    * ```
    *
    * @method
    * @memberof Rekord.Collection#
    * @param {propertyResolverInput} [properties] -
    *    The expression which converts one value into another.
    * @return {Any} -
    * @see Rekord.createPropertyResolver
    * @see Rekord.isValue
    */
  last: function(properties)
  {
    var resolver = createPropertyResolver( properties );

    for (var i = this.length - 1; i >= 0; i--)
    {
      var resolved = resolver( this[ i ] );

      if ( isValue( resolved ) )
      {
        return resolved;
      }
    }
  },

  /**
   * Iterates over all elements in this collection and passes them through the
   * `resolver` function. The returned value is passed through the `validator`
   * function and if that returns true the resolved value is passed through the
   * `process` function. After iteration, the `getResult` function is executed
   * and the returned value is returned by this function.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Function} resolver -
   *    The function which takes an element in this collection and returns a
   *    value based on that element.
   * @param {Function} validator -
   *    The function which takes the resolved value and determines whether it
   *    passes some test.
   * @param {Function} process -
   *    The function which is given the resolved value if it passes the test.
   * @param {Function} getResult -
   *    The function which is executed at the end of iteration and the result is
   *    is returned by this function.
   * @return {Any} -
   *    The value returned by `getResult`.
   */
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

  /**
   * Sums all numbers resolved from the given property expression and returns
   * the result.
   *
   * ```javascript
   * var c = Rekord.collect([2, 3, 4]);
   * c.sum(); // 9
   * var d = Rekord.collect([{age: 5}, {age: 4}, {age: 2}]);
   * d.sum('age'); // 11
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {propertyResolverInput} [numbers]
   *    The expression which converts an element in this collection to a number.
   * @return {Number} -
   *    The sum of all valid numbers found in this collection.
   * @see Rekord.createNumberResolver
   */
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

  /**
   * Averages all numbers resolved from the given property expression and
   * returns the result.
   *
   * ```javascript
   * var c = Rekord.collect([2, 3, 4]);
   * c.avg(); // 3
   * var d = Rekord.collect([{age: 5}, {age: 4}, {age: 2}]);
   * d.avg('age'); // 3.66666
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {propertyResolverInput} [numbers]
   *    The expression which converts an element in this collection to a number.
   * @return {Number} -
   *    The average of all valid numbers found in this collection.
   * @see Rekord.createNumberResolver
   */
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

  /**
   * Counts the number of elements in this collection that past the test
   * function generated by {@link Rekord.createWhere}.
   *
   * ```javascript
   * var c = Rekord.collect([{name: 't1', done: 1}, {name: 't2', done: 0}, {name: 't3', done: 1}, {name: 't4'}]);
   * c.countWhere('done'); // 3
   * c.countWhere('done', 0); // 1
   * c.countWhere('done', 1); // 2
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {whereInput} [properties] -
   *    The expression used to create a function to test the elements in this
   *    collection.
   * @param {Any} [value] -
   *    When the first argument is a string this argument will be treated as a
   *    value to compare to the value of the named property on the object passed
   *    through the filter function.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    An alternative function can be used to compare to values.
   * @return {Number} -
   *    The number of elements in the collection that passed the test.
   * @see Rekord.createWhere
   */
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

  /**
   * Counts the number of elements in this collection that has a value for the
   * given property expression.
   *
   * ```javascript
   * var c = Rekord.collect([{age: 2}, {age: 3}, {taco: 4}]);
   * c.count('age'); // 2
   * c.count('taco'); // 1
   * c.count(); // 3
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {propertyResolverInput} [properties] -
   *    The expression which converts one value into another.
   * @return {Number} -
   *    The number of elements that had values for the property expression.
   * @see Rekord.createPropertyResolver
   * @see Rekord.isValue
   */
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

  /**
   * Plucks values from elements in the collection. If only a `values` property
   * expression is given the result will be an array of resolved values. If the
   * `keys` property expression is given, the result will be an object where the
   * property of the object is determined by the key expression.
   *
   * ```javascript
   * var c = Rekord.collect([{age: 2, nm: 'T'}, {age: 4, nm: 'R'}, {age: 5, nm: 'G'}]);
   * c.pluck(); // c
   * c.pluck('age'); // [2, 4, 5]
   * c.pluck('age', 'nm'); // {T: e, R: 4, G: 5}
   * c.pluck(null, 'nm'); // {T: {age: 2, nm: 'T'}, R: {age: 4, nm: 'R'}, G: {age: 5, nm: 'G'}}
   * c.pluck('{age}-{nm}'); // ['2-T', '4-R', '5-G']
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {propertyResolverInput} [values] -
   *    The expression which converts an element into a value to pluck.
   * @param {propertyResolverInput} [keys] -
   *    The expression which converts an element into an object property (key).
   * @return {Array|Object} -
   *    The plucked values.
   * @see Rekord.createPropertyResolver
   */
  pluck: function(values, keys)
  {
    var valuesResolver = createPropertyResolver( values );

    if ( keys )
    {
      var keysResolver = createPropertyResolver( keys );
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

  /**
   * Iterates over each element in this collection and passes the element and
   * it's index to the given function. An optional function context can be given.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Function} callback -
   *    The function to invoke for each element of this collection passing the
   *    element and the index where it exists.
   * @param {Object} [context] -
   *    The context to the callback function.
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   */
  each: function(callback, context)
  {
    var callbackContext = context || this;

    for (var i = 0; i < this.length; i++)
    {
      var item = this[ i ];

      callback.call( callbackContext, item, i );

      if ( this[ i ] !== item )
      {
        i--;
      }
    }

    return this;
  },

  /**
   * Iterates over each element in this collection that matches the where
   * expression and passes the element and it's index to the given function.
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Function} callback -
   *    The function to invoke for each element of this collection passing the
   *    element and the index where it exists.
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.Collection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   */
  eachWhere: function(callback, properties, values, equals)
  {
    var where = createWhere( properties, values, equals );

    for (var i = 0; i < this.length; i++)
    {
      var item = this[ i ];

      if ( where( item ) )
      {
        callback.call( this, item, i );

        if ( this[ i ] !== item )
        {
          i--;
        }
      }
    }

    return this;
  },

  /**
   * Reduces all the elements of this collection to a single value. All elements
   * are passed to a function which accepts the currently reduced value and the
   * current element and returns the new reduced value.
   *
   * ```javascript
   * var reduceIt = function(curr, elem) {
   *  return curr + ( elem[0] * elem[1] );
   * };
   * var c = Rekord.collect([[2, 1], [3, 2], [5, 6]]);
   * c.reduce( reduceIt, 0 ); // 38
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Function} reducer -
   *    A function which accepts the current reduced value and an element and
   *    returns the new reduced value.
   * @param {Any} [initialValue] -
   *    The first value to pass to the reducer function.
   * @return {Any} -
   *    The reduced value.
   */
  reduce: function(reducer, initialValue)
  {
    for (var i = 0; i < this.length; i++)
    {
      initialValue = reducer( initialValue, this[ i ] );
    }

    return initialValue;
  },

  /**
   * Returns a random element in this collection.
   *
   * @method
   * @memberof Rekord.Collection#
   * @return {Any} -
   *    The randomly chosen element from this collection.
   */
  random: function()
  {
    var i = Math.floor( Math.random() * this.length );

    return this[ i ];
  },

  /**
   * Breaks up the collection into an array of arrays of a maximum size (chunks).
   * A destination array can be used to avoid re-allocating arrays.
   *
   * ```javascript
   * var c = Rekord.collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);
   * c.chunk(4); // [[1, 2, 3, 4], [5, 6, 7, 8], [9]]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Number} chunkSize -
   *    The maximum number of elements that can exist in a chunk.
   * @param {Array} [out] -
   *    The destination array to place the chunks.
   * @return {Array} -
   *    The array of chunks of elements taken from this collection.
   */
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

  /**
   * Determines whether at least one element in this collection matches the
   * given criteria.
   *
   * ```javascript
   * var c = Rekord.collect([{age: 2}, {age: 6}]);
   * c.contains('age', 2); // true
   * c.contains('age', 3); // false
   * c.contains('age'); // true
   * c.contains('name'); // false
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {whereInput} [properties] -
   *    The expression used to create a function to test the elements in this
   *    collection.
   * @param {Any} [value] -
   *    When the first argument is a string this argument will be treated as a
   *    value to compare to the value of the named property on the object passed
   *    through the filter function.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    An alternative function can be used to compare to values.
   * @return {Boolean} -
   *    True if any of the elements passed the test function, otherwise false.
   * @see Rekord.createWhere
   */
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

  /**
   * Groups the elements into sub collections given some property expression to
   * use as the value to group by.
   *
   * ```javascript
   * var c = Rekord.collect([
   *  { name: 'Tom', age: 6, group: 'X' },
   *  { name: 'Jon', age: 7, group: 'X' },
   *  { name: 'Rob', age: 8, group: 'X' },
   *  { name: 'Bon', age: 9, group: 'Y' },
   *  { name: 'Ran', age: 10, group: 'Y' },
   *  { name: 'Man', age: 11, group: 'Y' },
   *  { name: 'Tac', age: 12, group: 'Z' }
   * ]);
   *
   * c.group({by: 'group'});
   * // [{group: 'X', $count: 3, $group: [...]},
   * //  {group: 'Y', $count: 3, $group: [...]},
   * //  {group: 'Z', $count: 1, $group: [.]}]
   *
   * c.group({by: 'group', select: {age: 'avg', name: 'first'}});
   * // [{group: 'X', age: 7, name: 'Tom', $count: 3, $group: [...]},
   * //  {group: 'Y', age: 9, name: 'Bon', $count: 3, $group: [...]},
   * //  {group: 'Z', age: 12, name: 'Tac', $count: 1, $group: [.]}]
   *
   * c.group({by: 'group', track: false, count: false});
   * // [{group: 'X'}, {group: 'Y'}, {group: 'Z'}]
   *
   * var havingMoreThanOne = function(grouping, groupElements) {
   *  return groupElements.length > 0;
   * };
   * c.group({by: 'group', select: {age: 'avg'}, comparator: '-age', having: havingMoreThanOne, track: false, count: false});
   * // [{group: 'Y', age: 9},
   * //  {group: 'X', age: 7}]
   * ```
   *
   * @method
   * @memberof Rekord.Collection#
   * @param {Object} grouping -
   *    An object specifying how elements in this collection are to be grouped
   *    and what properties from the elements should be aggregated in the
   *    resulting groupings.
   *      - `by`: A property expression that resolves how elements will be grouped.
   *      - `select`: An object which contains properties that should be aggregated where the value is the aggregate collection function to call (sum, avg, count, first, last, etc).
   *      - `having`: A having expression which takes a grouping and the grouped elements and determines whether the grouping should be in the final result.
   *      - `comparator`: A comparator for sorting the resulting collection of groupings.
   *      - `comparatorNullsFirst`: Whether nulls should be sorted to the top.
   *      - `track`: Whether all elements in the group should exist in a collection in the `$group` property of each grouping.
   *      - `count`: Whether the number of elements in the group should be placed in the `$count` property of each grouping.
   * @return {Rekord.Collection} -
   *    A collection of groupings.
   */
  group: function(grouping)
  {
    var by = createPropertyResolver( grouping.by );
    var having = createWhere( grouping.having, grouping.havingValue, grouping.havingEquals );
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
        group = map[ key ] = this.cloneEmpty();
      }

      group.add( model, true );
    }

    var groupings = this.cloneEmpty();

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

      if ( having( grouped, groupArray ) )
      {
        groupings.push( grouped );
      }
    }

    groupings.sort();

    return groupings;
  },

  /**
   * Returns a copy of this collection as a plain Array.
   *
   * @method
   * @memberof Rekord.Collection#
   * @return {Array} -
   *    The copy of this collection as a plain array.
   */
  toArray: function()
  {
    return this.slice();
  },

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Rekord.Collection#
   * @return {Rekord.Collection} -
   *    The reference to a clone collection.
   */
  clone: function()
  {
    return this.constructor.create( this );
  },

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Rekord.Collection#
   * @return {Rekord.Collection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: function()
  {
    return this.constructor.create();
  }

});

addEventful( Collection );

/**
 * Adds a listener for change events on this collection.
 *
 * @method change
 * @memberof Rekord.Collection#
 * @param {Function} callback -
 *    A function to call every time a change occurs in this collection.
 * @param {Object} [context] -
 *    The desired context (this) for the given callback function.
 * @return {Function} -
 *    A function to call to stop listening for change events.
 * @see Rekord.Collection#event:changes
 */
addEventFunction( Collection, 'change', Collection.Events.Changes );


// The methods necessary for a filtered collection.
var Filtering = {

  bind: function()
  {
    Class.props(this, {
      onAdd:      bind( this, Filtering.handleAdd ),
      onAdds:     bind( this, Filtering.handleAdds ),
      onRemove:   bind( this, Filtering.handleRemove ),
      onRemoves:  bind( this, Filtering.handleRemoves ),
      onReset:    bind( this, Filtering.handleReset ),
      onUpdates:  bind( this, Filtering.handleUpdates ),
      onCleared:  bind( this, Filtering.handleCleared )
    });
  },

  init: function(base, filter)
  {
    if ( this.base !== base )
    {
      if ( this.base )
      {
        this.disconnect();
      }

      Class.prop( this, 'base', base );

      this.connect();
    }

    Class.prop( this, 'filter', filter );

    this.sync();

    return this;
  },

  setFilter: function(whereProperties, whereValue, whereEquals)
  {
    this.filter = createWhere( whereProperties, whereValue, whereEquals );
    this.sync();

    return this;
  },

  connect: function()
  {
    this.base.on( Collection.Events.Add, this.onAdd );
    this.base.on( Collection.Events.Adds, this.onAdds );
    this.base.on( Collection.Events.Remove, this.onRemove );
    this.base.on( Collection.Events.Removes, this.onRemoves );
    this.base.on( Collection.Events.Reset, this.onReset );
    this.base.on( Collection.Events.Updates, this.onUpdates );
    this.base.on( Collection.Events.Cleared, this.onCleared );

    return this;
  },

  disconnect: function()
  {
    this.base.off( Collection.Events.Add, this.onAdd );
    this.base.off( Collection.Events.Adds, this.onAdds );
    this.base.off( Collection.Events.Remove, this.onRemove );
    this.base.off( Collection.Events.Removes, this.onRemoves );
    this.base.off( Collection.Events.Reset, this.onReset );
    this.base.off( Collection.Events.Updates, this.onUpdates );
    this.base.off( Collection.Events.Cleared, this.onCleared );

    return this;
  },

  sync: function()
  {
    var base = this.base;
    var filter = this.filter;
    var matches = [];

    for (var i = 0; i < base.length; i++)
    {
      var value = base[ i ];

      if ( filter( value ) )
      {
        matches.push( value );
      }
    }

    return this.reset( matches );
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

    this.sort();
  },

  handleCleared: function(collection)
  {
    this.clear();
  },

  clone: function()
  {
    return this.constructor.create( this.base, this.filter );
  },

  cloneEmpty: function()
  {
    return this.constructor.create( this.base, this.filter );
  }

};


/**
 *
 * @constructor
 * @memberof Rekord
 * @augments Rekord.Eventful
 */
function Page(collection, pageSize, pageIndex)
{
  this.onChanges = bind( this, this.handleChanges );
  this.pageSize = pageSize;
  this.pageIndex = pageIndex || 0;
  this.pageCount = 0;
  this.setCollection( collection );
}

Page.Events =
{
  Change:       'change',
  Changes:      'change'
};

Class.extend( Array, Page,
{

  setPageSize: function(pageSize)
  {
    this.pageSize = pageSize;
    this.handleChanges();
  },

  setPageIndex: function(pageIndex)
  {
    this.goto( pageIndex );
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
    this.collection.on( Collection.Events.Changes, this.onChanges );
  },

  disconnect: function()
  {
    this.collection.off( Collection.Events.Changes, this.onChanges );
  },

  goto: function(pageIndex)
  {
    var actualIndex = this.page( pageIndex );

    if ( actualIndex !== this.pageIndex )
    {
      this.pageIndex = actualIndex;
      this.update();
      this.trigger( Page.Events.Change, [ this ] );
    }
  },

  next: function()
  {
    this.goto( this.pageIndex + 1 );
  },

  prev: function()
  {
    this.goto( this.pageIndex - 1 );
  },

  jump: function(to)
  {
    this.goto( to );
  },

  first: function()
  {
    this.goto( 0 );
  },

  last: function()
  {
    this.goto( this.pageCount - 1 );
  },

  total: function()
  {
    return this.collection.length;
  },

  pages: function()
  {
    return Math.ceil( this.total() / this.pageSize );
  },

  page: function(index)
  {
    return Math.max( 0, Math.min( index, this.pages() - 1 ) );
  },

  can: function(index)
  {
    return this.total() && index >= 0 && index < this.pageCount;
  },

  canFirst: function()
  {
    return this.canPrev();
  },

  canLast: function()
  {
    return this.canNext();
  },

  canPrev: function()
  {
    return this.total() && this.pageIndex > 0;
  },

  canNext: function()
  {
    return this.total() && this.pageIndex < this.pageCount - 1;
  },

  handleChanges: function(forceApply)
  {
    var pageCount = this.pages();
    var pageIndex = this.page( this.pageIndex );
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
      this.trigger( Page.Events.Change, [ this ] );
    }
  },

  update: function()
  {
    var source = this.collection;
    var n = source.length;
    var start = this.pageIndex * this.pageSize;
    var end = Math.min( start + this.pageSize, n );
    var length = end - start;

    this.length = 0;

    for (var i = 0; i < length; i++)
    {
      this.push( source[ start++ ] );
    }
  },

  more: function(pages)
  {
    var source = this.collection;
    var limit = source.length;
    var pageCount = pages || 1;
    var offset = this.pageIndex * this.pageSize;
    var start = offset + this.length;
    var adding = this.pageSize * pageCount;
    var desiredEnd = start + adding;
    var actualEnd = Math.min( limit, desiredEnd );

    while (start < actualEnd)
    {
      this.push( source[ start++ ] );
    }
  },

  toArray: function()
  {
    return this.slice();
  }

});

addEventful( Page );

addEventFunction( Page, 'change', Page.Events.Changes );


/**
 * An extension of the {@link Rekord.Collection} class which is a filtered view
 * of another collection.
 *
 * ```javascript
 * var isEven = function(x) { return x % 2 === 0; };
 * var c = Rekord.collect([1, 2, 3, 4, 5, 6, 7]);
 * var f = c.filtered( isEven );
 * f; // [2, 4, 6]
 * c.add( 8 );
 * c.remove( 2 );
 * f; // [4, 6, 8]
 * ```
 *
 * @constructor
 * @memberof Rekord
 * @extends Rekord.Collection
 * @param {Rekord.Collection} base -
 *    The collection to listen to for changes to update this collection.
 * @param {whereCallback} filter -
 *    The function which determines whether an element in the base collection
 *    should exist in this collection.
 * @see Rekord.Collection#filtered
 */
function FilteredCollection(base, filter)
{
  this.bind();
  this.init( base, filter );
}

/**
 * The collection to listen to for changes to update this collection.
 *
 * @memberof Rekord.FilteredCollection#
 * @member {Rekord.Collection} base
 */

 /**
  * The function which determines whether an element in the base collection
  * should exist in this collection.
  *
  * @memberof Rekord.FilteredCollection#
  * @member {whereCallback} filter
  */

Class.extend( Collection, FilteredCollection,
{

  /**
   * Generates the handlers which are passed to the base collection when this
   * filtered collection is connected or disconnected - which happens on
   * initialization and subsequent calls to {@link FilteredCollection#init}.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   */
  bind: Filtering.bind,

  /**
   * Initializes the filtered collection by setting the base collection and the
   * filtering function.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @param {Rekord.Collection} base -
   *    The collection to listen to for changes to update this collection.
   * @param {whereCallback} filter -
   *    The function which determines whether an element in the base collection
   *    should exist in this collection.
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  init: Filtering.init,

  /**
   * Sets the filter function of this collection and re-sychronizes it with the
   * base collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @emits Rekord.Collection#reset
   */
  setFilter: Filtering.setFilter,

  /**
   * Registers callbacks with events of the base collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   */
  connect: Filtering.connect,

  /**
   * Unregisters callbacks with events from the base collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   */
  disconnect: Filtering.disconnect,

  /**
   * Synchronizes this collection with the base collection. Synchronizing
   * involves iterating over the base collection and passing each element into
   * the filter function and if it returns a truthy value it's added to this
   * collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  sync: Filtering.sync,

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to a clone collection.
   */
  clone: Filtering.clone,

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: Filtering.cloneEmpty

});


/**
 * An extension of the {@link Rekord.Collection} class for {@link Rekord.Model}
 * instances.
 *
 * @constructor
 * @memberof Rekord
 * @extends Rekord.Collection
 * @param {Rekord.Database} database -
 *    The database for the models in this collection.
 * @param {modelInput[]} [models] -
 *    The initial array of models in this collection.
 * @param {Boolean} [remoteData=false] -
 *    If the models array is from a remote source. Remote sources place the
 *    model directly into the database while local sources aren't stored in the
 *    database until they're saved.
 * @see Rekord.Models.boot
 * @see Rekord.Models.collect
 */
function ModelCollection(database, models, remoteData)
{
  this.init( database, models, remoteData );
}

/**
 * The map of models which keeps an index (by model key) of the models.
 *
 * @memberof Rekord.ModelCollection#
 * @member {Rekord.Map} map
 */

/**
 * The database for the models in this collection.
 *
 * @memberof Rekord.ModelCollection#
 * @member {Rekord.Database} database
 */

Class.extend( Collection, ModelCollection,
{

  /**
   * Initializes the model collection by setting the database, the initial set
   * of models, and whether the initial set of models is from a remote source.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Rekord.Database} database -
   *    The database for the models in this collection.
   * @param {modelInput[]} [models] -
   *    The initial array of models in this collection.
   * @param {Boolean} [remoteData=false] -
   *    If the models array is from a remote source. Remote sources place the
   *    model directly into the database while local sources aren't stored in the
   *    database until they're saved.
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.ModelCollection#reset
   */
  init: function(database, models, remoteData)
  {
    Class.props(this, {
      database: database,
      map: new Map()
    });

    this.map.values = this;
    this.reset( models, remoteData );

    return this;
  },

  /**
   * Documented in Collection.js
   */
  sort: function(comparator, comparatorNullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, comparatorNullsFirst ) : this.comparator;

    if ( !isSorted( cmp, this ) )
    {
      this.map.sort( cmp );

      this.trigger( Collection.Events.Sort, [this] );
    }

    return this;
  },

  /**
   * Takes input provided to the collection for adding, removing, or querying
   * and generates the key which uniquely identifies a model.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelInput} input -
   *    The input to convert to a key.
   * @return {modelKey} -
   *    The key built from the input.
   */
  buildKeyFromInput: function(input)
  {
    return this.database.keyHandler.buildKeyFromInput( input );
  },

  /**
   * Takes input provided to this collection for adding, removing, or querying
   * and returns a model instance. An existing model can be referenced or a new
   * model can be created on the spot.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelInput} input -
   *    The input to convert to a model instance.
   * @param {Boolean} [remoteData=false] -
   *    If the model is from a remote source. Remote sources place the model
   *    directly into the database while local sources aren't stored in the
   *    database until they're saved.
   * @return {Rekord.Model} -
   *    A model instance parsed from the input.
   */
  parseModel: function(input, remoteData)
  {
    return this.database.parseModel( input, remoteData );
  },

  /**
   * Creates a sub view of this collection known as a filtered collection. The
   * resulting collection changes when this collection changes. Any time an
   * element is added or removed to this collection it may be added or removed
   * from the filtered collection if it fits the filter function. The filter
   * function is created by passing the arguments of this function to
   * {@link Rekord.createWhere}.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.FilteredModelCollection} -
   *    The newly created live filtered view of this collection.
   * @see Rekord.createWhere
   */
  filtered: function(whereProperties, whereValue, whereEquals)
  {
    var filter = createWhere( whereProperties, whereValue, whereEquals );

    return FilteredModelCollection.create( this, filter );
  },

  /**
   * Documented in Collection.js
   *
   * @see Rekord.ModelCollection#buildKeyFromInput
   */
  subtract: function(models, out)
  {
    var target = out || this.cloneEmpty();

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];
      var key = a.$key();
      var exists = false;

      if ( models instanceof ModelCollection )
      {
        exists = models.has( key );
      }
      else
      {
        for (var k = 0; k < models.length && !exists; k++)
        {
          var modelKey = this.buildKeyFromInput( models[ k ] );

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

  /**
   * Documented in Collection.js
   */
  intersect: function(models, out)
  {
    var target = out || this.cloneEmpty();

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

  /**
   * Documented in Collection.js
   */
  complement: function(models, out)
  {
    var target = out || this.cloneEmpty();

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

  /**
   * Documented in Collection.js
   */
  clear: function()
  {
    return this.map.reset();
  },

  /**
   * Resets the models in this collection with a new collection of models.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelInput[]} [models] -
   *    The initial array of models in this collection.
   * @param {Boolean} [remoteData=false] -
   *    If the models array is from a remote source. Remote sources place the
   *    model directly into the database while local sources aren't stored in the
   *    database until they're saved.
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @see Rekord.ModelCollection#parseModel
   * @emits Rekord.ModelCollection#reset
   */
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

    this.trigger( Collection.Events.Reset, [this] );
    this.sort();

    return this;
  },

  /**
   * Returns whether this collection contains a model with the given key.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelKey} key -
   *    The key of the model to check for existence.
   * @return {Boolean} -
   *    True if a model with the given key exists in this collection, otherwise
   *    false.
   */
  has: function(key)
  {
    return this.map.has( key );
  },

  /**
   * Returns the model in this collection with the given key.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelKey} key -
   *    The key of the model to return.
   * @return {Rekord.Model} -
   *    The model instance for the given key, or undefined if a model wasn't
   *    found.
   */
  get: function(key)
  {
    return this.map.get( key );
  },

  /**
   * Places a model in this collection providing a key to use.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelKey} key -
   *    The key of the model.
   * @param {Rekord.Model} model -
   *    The model instance to place in the collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.ModelCollection#sort sort}.
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.ModelCollection#add
   * @emits Rekord.ModelCollection#sort
   */
  put: function(key, model, delaySort)
  {
    this.map.put( key, model );
    this.trigger( Collection.Events.Add, [this, model] );

    if ( !delaySort )
    {
      this.sort();
    }
  },

  /**
   * Adds a model to this collection - sorting the collection if a comparator
   * is set on this collection and `delaySort` is not a specified or a true
   * value.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelInput} input -
   *    The model to add to this collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.ModelCollection#sort sort}.
   * @param {Boolean} [remoteData=false] -
   *    If the model is from a remote source. Remote sources place the model
   *    directly into the database while local sources aren't stored in the
   *    database until they're saved.
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.ModelCollection#add
   * @emits Rekord.ModelCollection#sort
   */
  add: function(input, delaySort, remoteData)
  {
    var model = this.parseModel( input, remoteData );

    this.map.put( model.$key(), model );
    this.trigger( Collection.Events.Add, [this, model] );

    if ( !delaySort )
    {
      this.sort();
    }

    return this;
  },

  /**
   * Adds one or more models to the end of this collection - sorting the
   * collection if a comparator is set on this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {...modelInput} value -
   *    The models to add to this collection.
   * @return {Number} -
   *    The new length of this collection.
   * @emits Rekord.ModelCollection#add
   * @emits Rekord.ModelCollection#sort
   */
  push: function()
  {
    var values = arguments;

    for (var i = 0; i < values.length; i++)
    {
      var model = this.parseModel( values[ i ] );

      this.map.put( model.$key(), model );
    }

    this.trigger( Collection.Events.Adds, [this, AP.slice.apply(values)] );
    this.sort();

    return this.length;
  },

  /**
   * @method
   * @memberof Rekord.ModelCollection#
   * @see Rekord.ModelCollection#push
   * @param {...modelInput} value -
   *    The values to add to this collection.
   * @return {Number} -
   *    The new length of this collection.
   * @emits Rekord.ModelCollection#adds
   * @emits Rekord.ModelCollection#sort
   */
  unshift: function()
  {
    return this.push.apply( this, arguments );
  },

  /**
   * Adds all models in the given array to this collection - sorting the
   * collection if a comparator is set on this collection and `delaySort` is
   * not specified or a true value.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelInput[]} models -
   *    The models to add to this collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.ModelCollection#sort sort}.
   * @param {Boolean} [remoteData=false] -
   *    If the model is from a remote source. Remote sources place the model
   *    directly into the database while local sources aren't stored in the
   *    database until they're saved.
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.ModelCollection#adds
   * @emits Rekord.ModelCollection#sort
   */
  addAll: function(models, delaySort, remoteData)
  {
    if ( isArray( models ) )
    {
      for (var i = 0; i < models.length; i++)
      {
        var model = this.parseModel( models[ i ], remoteData );

        this.map.put( model.$key(), model );
      }

      this.trigger( Collection.Events.Adds, [this, models] );

      if ( !delaySort )
      {
        this.sort();
      }
    }
  },

  /**
   * @method
   * @memberof Rekord.ModelCollection#
   * @see Rekord.ModelCollection#add
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.ModelCollection#add
   * @emits Rekord.ModelCollection#sort
   */
  insertAt: function(i, value, delaySort)
  {
    return this.add( value, delaySort );
  },

  /**
   * Removes the last model in this collection and returns it - sorting the
   * collection if a comparator is set on this collection and `delaySort` is
   * no specified or a true value.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.ModelCollection#sort sort}.
   * @return {Rekord.Model} -
   *    The model removed from the end of the collection.
   * @emits Rekord.ModelCollection#remove
   * @emits Rekord.ModelCollection#sort
   */
  pop: function(delaySort)
  {
    var i = this.length - 1;
    var removed = this[ i ];

    this.map.removeAt( i );
    this.trigger( Collection.Events.Remove, [this, removed, i] );

    if ( !delaySort )
    {
      this.sort();
    }

    return removed;
  },

  /**
   * Removes the first model in this collection and returns it - sorting the
   * collection if a comparator is set on this collection and `delaySort` is
   * no specified or a true value.
   *
   * ```javascript
   * var c = Rekord.collect(1, 2, 3, 4);
   * c.shift(); // 1
   * ```
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.ModelCollection#sort sort}.
   * @return {Rekord.Model} -
   *    The model removed from the beginning of the collection.
   * @emits Rekord.ModelCollection#remove
   * @emits Rekord.ModelCollection#sort
   */
  shift: function(delaySort)
  {
    var removed = this[ 0 ];

    this.map.removeAt( 0 );
    this.trigger( Collection.Events.Remove, [this, removed, 0] );

    if ( !delaySort )
    {
      this.sort();
    }

    return removed;
  },

  /**
   * Removes the model in this collection at the given index `i` - sorting
   * the collection if a comparator is set on this collection and `delaySort` is
   * not specified or a true value.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Number} i -
   *    The index of the model to remove.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.ModelCollection#sort sort}.
   * @return {Rekord.Model} -
   *    The model removed, or undefined if the index was invalid.
   * @emits Rekord.ModelCollection#remove
   * @emits Rekord.ModelCollection#sort
   */
  removeAt: function(i, delaySort)
  {
    var removing;

    if (i >= 0 && i < this.length)
    {
      removing = this[ i ];

      this.map.removeAt( i );
      this.trigger( Collection.Events.Remove, [this, removing, i] );

      if ( !delaySort )
      {
        this.sort();
      }
    }

    return removing;
  },

  /**
   * Removes the given model from this collection if it exists - sorting the
   * collection if a comparator is set on this collection and `delaySort` is not
   * specified or a true value.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelInput} input -
   *    The model to remove from this collection if it exists.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.ModelCollection#sort sort}.
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to the given value.
   * @return {Rekord.Model} -
   *    The element removed from this collection.
   * @emits Rekord.ModelCollection#remove
   * @emits Rekord.ModelCollection#sort
   */
  remove: function(input, delaySort)
  {
    var key = this.buildKeyFromInput( input );
    var removing = this.map.get( key );

    if ( removing )
    {
      this.map.remove( key );
      this.trigger( Collection.Events.Remove, [this, removing, input] );

      if ( !delaySort )
      {
        this.sort();
      }
    }

    return removing;
  },

  /**
   * Removes the given models from this collection - sorting the collection if
   * a comparator is set on this collection and `delaySort` is not specified or
   * a true value.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelInput[]} inputs -
   *    The models to remove from this collection if they exist.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.ModelCollection#sort sort}.
   * @return {Rekord.Model[]} -
   *    The models removed from this collection.
   * @emits Rekord.ModelCollection#removes
   * @emits Rekord.ModelCollection#sort
   */
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

    this.trigger( Collection.Events.Removes, [this, removed] );

    if ( !delaySort )
    {
      this.sort();
    }

    return removed;
  },

  /**
   * Returns the index of the given model in this collection or returns -1
   * if the model doesn't exist in this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {modelInput} input -
   *    The model to search for.
   * @return {Number} -
   *    The index of the model in this collection or -1 if it was not found.
   */
  indexOf: function(input)
  {
    var key = this.buildKeyFromInput( input );
    var index = this.map.indices[ key ];

    return index === undefined ? -1 : index;
  },

  /**
   * Rebuilds the internal index which maps keys to the index of the model in
   * this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   */
  rebuild: function()
  {
    this.map.rebuildIndex();
  },

  /**
   * Returns the array of keys that correspond to the models in this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @return {modelKey[]} -
   *    The array of model keys.
   */
  keys: function()
  {
    return this.map.keys;
  },

  /**
   * Reverses the order of models in this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.ModelCollection#updates
   */
  reverse: function()
  {
    this.map.reverse();

    this.trigger( Collection.Events.Updates, [this] );

    return this;
  },

  /**
   * Splices elements out of and into this collection - sorting the collection
   * if a comparator is set on this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Number} start -
   *    Index at which to start changing the array (with origin 0). If greater
   *    than the length of the array, actual starting index will be set to the
   *    length of the array. If negative, will begin that many elements from the end.
   * @param {Number} deleteCount -
   *    An integer indicating the number of old array elements to remove. If
   *    deleteCount is 0, no elements are removed. In this case, you should
   *    specify at least one new element. If deleteCount is greater than the
   *    number of elements left in the array starting at start, then all of the
   *    elements through the end of the array will be deleted.
   *    If deleteCount is omitted, deleteCount will be equal to (arr.length - start).
   * @param {...Any} values -
   *    The elements to add to the array, beginning at the start index. If you
   *    don't specify any elements, splice() will only remove elements from the array.
   * @return {Any[]} -
   *    The array of deleted elements.
   * @emits Rekord.ModelCollection#removes
   * @emits Rekord.ModelCollection#adds
   * @emits Rekord.ModelCollection#sort
   */
  splice: function(start, deleteCount)
  {
    var adding = AP.slice.call( arguments, 2 );
    var addingKeys = [start, deleteCount];
    for (var i = 0; i < adding.length; i++)
    {
      addingKeys.push( this.buildKeyFromInput( adding[ i ] ) );
    }

    var removed = AP.splice.apply( this, arguments );

    AP.splice.apply( this.map.keys, addingKeys );

    if ( deleteCount )
    {
      this.trigger( Collection.Events.Removes, [this, removed] );
    }

    if ( adding.length )
    {
      this.trigger( Collection.Events.Adds, [this, adding] );
    }

    this.sort();

    return removed;
  },

  /**
   * Removes the models from this collection where the given expression is true.
   * The first argument, if `true`, can call {@link Rekord.Model#$remove} on each
   * model removed from this colleciton.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Boolean} [callRemove=false] -
   *    Whether {@link Rekord.Model#$remove} should be called on each removed model.
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @param {Array} [out=this.cloneEmpty()] -
   *    The array to place the elements that match.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Rekord.Collection#sort sort}.
   * @return {Rekord.Model[]} -
   *    An array of models removed from this collection.
   * @emits Rekord.ModelCollection#removes
   * @emits Rekord.ModelCollection#sort
   */
  removeWhere: function(callRemove, whereProperties, whereValue, whereEquals, out, delaySort, cascade, options)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var removed = out || this.cloneEmpty();

    batchExecute(function()
    {
      for (var i = 0; i < this.length; i++)
      {
        var model = this[ i ];
        var key = model.$key();

        if ( where( model ) )
        {
          this.map.remove( key );
          removed.push( model );
          i--;

          if ( callRemove )
          {
            model.$remove( cascade, options );
          }
        }
      }

    }, this );

    this.trigger( Collection.Events.Removes, [this, removed] );

    if ( !delaySort )
    {
      this.sort();
    }

    return removed;
  },

  /**
   * Updates the given property(s) in all models in this collection with the
   * given value. If `avoidSave` is not a truthy value then
   * {@link Rekord.Model#$save} is called on every model in this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {String|Object} props -
   *    The property or properties to update.
   * @param {Any} [value] -
   *    The value to set if a String `props` is given.
   * @param {Boolean} [remoteData=false] -
   *    If the properties are from a remote source. Remote sources place the
   *    model directly into the database while local sources aren't stored in the
   *    database until they're saved.
   * @param {Boolean} [avoidSave=false] -
   *    True for NOT calling {@link Rekord.Model#$save}, otherwise false.
   * @param {Number} [cascade] -
   *    Which operations should be performed out of: store, rest, & live.
   * @param {Any} [options] -
   *    The options to pass to the REST service.
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.ModelCollection#updates
   * @emits Rekord.ModelCollection#sort
   */
  update: function(props, value, remoteData, avoidSave, cascade, options)
  {
    batchExecute(function()
    {
      for (var i = 0; i < this.length; i++)
      {
        var model = this[ i ];

        model.$set( props, value, remoteData );

        if ( !avoidSave )
        {
          model.$save( cascade, options );
        }
      }

    }, this );

    this.trigger( Collection.Events.Updates, [this, this] );
    this.sort();

    return this;
  },

  /**
   * Updates the given property(s) in models in this collection which pass the
   * `where` function with the given value. If `avoidSave` is not a truthy value
   * then {@link Rekord.Model#$save} is called on every model in this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {whereCallback} where -
   *    The function which determines whether a model should be updated.
   * @param {String|Object} props -
   *    The property or properties to update.
   * @param {*} [value] -
   *    The value to set if a String `props` is given.
   * @param {Boolean} [remoteData=false] -
   *    If the properties are from a remote source. Remote sources place the
   *    model directly into the database while local sources aren't stored in the
   *    database until they're saved.
   * @param {Boolean} [avoidSave=false] -
   *    True for NOT calling {@link Rekord.Model#$save}, otherwise false.
   * @param {Number} [cascade] -
   *    Which operations should be performed out of: store, rest, & live.
   * @param {Any} [options] -
   *    The options to pass to the REST service.
   * @return {Rekord.Model[]} -
   *    An array of models updated.
   * @emits Rekord.ModelCollection#updates
   * @emits Rekord.ModelCollection#sort
   */
  updateWhere: function(where, props, value, remoteData, avoidSave, cascade, options)
  {
    var updated = [];

    batchExecute(function()
    {
      for (var i = 0; i < this.length; i++)
      {
        var model = this[ i ];

        if ( where( model ) )
        {
          model.$set( props, value, remoteData );

          if ( !avoidSave )
          {
            model.$save( cascade, options );
          }

          updated.push( model );
        }
      }

    }, this );

    this.trigger( Collection.Events.Updates, [this, updated] );
    this.sort();

    return updated;
  },

  /**
   * Calls {@link Rekord.Model#$push} on models in this collection that meet
   * the given where expression.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {String[]} [fields] -
   *    The set of fields to save for later popping or discarding. If not
   *    specified, all model fields will be saved.
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @see Rekord.Model#$push
   */
  pushWhere: function(fields, properties, value, equals)
  {
    function pushIt(model)
    {
      model.$push( fields );
    }

    return this.eachWhere( pushIt, properties, value, equals );
  },

  /**
   * Calls {@link Rekord.Model#$pop} on models in this collection that meet
   * the given where expression.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Boolean} [dontDiscard=false] -
   *    Whether to remove the saved state after the saved state has been applied
   *    back to the model. A falsy value will result in
   *    {@link Rekord.Model#$discard} being called.
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @see Rekord.Model#$pop
   */
  popWhere: function(dontDiscard, properties, value, equals)
  {
    function popIt(model)
    {
      model.$pop( dontDiscard );
    }

    return this.eachWhere( popIt, properties, value, equals );
  },

  /**
   * Calls {@link Rekord.Model#$discard} on models in this collection that meet
   * the given where expression.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @see Rekord.Model#$discard
   */
  discardWhere: function(properties, value, equals)
  {
    function discardIt(model)
    {
      model.$discard();
    }

    return this.eachWhere( discardIt, properties, value, equals );
  },

  /**
   * Calls {@link Rekord.Model#$cancel} on models in this collection that meet
   * the given where expression.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Boolean} [reset=false] -
   *    If reset is true and the model doesn't have a saved state -
   *    {@link Rekord.Model#$reset} will be called.
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @see Rekord.Model#$cancel
   */
  cancelWhere: function(reset, properties, value, equals)
  {
    function cancelIt(model)
    {
      model.$cancel( reset );
    }

    batchExecute(function()
    {
      this.eachWhere( cancelIt, properties, value, equals );

    }, this );

    return this;
  },

  /**
   * Calls {@link Rekord.Model#$refresh} on models in this collection that meet
   * the given where expression.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @param {Number} [cascade] -
   *    Which operations should be performed out of: store, rest, & live.
   * @param {Any} [options] -
   *    The options to pass to the REST service.
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @see Rekord.Model#$refresh
   */
  refreshWhere: function(properties, value, equals, cascade, options)
  {
    function refreshIt(model)
    {
      model.$refresh( cascade, options );
    }

    batchExecute(function()
    {
      this.eachWhere( refreshIt, properties, value, equals );

    }, this );

    return this;
  },

  /**
   * Calls {@link Rekord.Model#$save} on models in this collection that meet
   * the given where expression.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @param {Object} [props={}] -
   *    Properties to apply to each model in the collection that pass the where
   *    expression.
   * @param {Number} [cascade] -
   *    Which operations should be performed out of: store, rest, & live.
   * @param {Any} [options] -
   *    The options to pass to the REST service.
   * @return {Rekord.ModelCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @see Rekord.Model#$refresh
   */
  saveWhere: function(properties, value, equals, props, cascade, options)
  {
    function saveIt(model)
    {
      model.$save( props, cascade, options );
    }

    batchExecute(function()
    {
      this.eachWhere( saveIt, properties, value, equals );

    }, this );

    return this;
  },

  /**
   * Returns whether this collection has at least one model with changes. An
   * additional where expression can be given to only check certain models.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @return {Boolean} -
   *    True if at least one model has changes, otherwise false.
   * @see Rekord.createWhere
   * @see Rekord.Model#$hasChanges
   */
  hasChanges: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );

    var hasChanges = function( model )
    {
      return where( model ) && model.$hasChanges();
    };

    return this.contains( hasChanges );
  },

  /**
   * Returns a collection of all changes for each model. The changes are keyed
   * into the collection by the models key. An additional where expression can
   * be given to only check certain models.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals=Rekord.equalsStrict] -
   *    See {@link Rekord.createWhere}
   * @param {Rekord.ModelCollection} [out] -
   *    The collection to add the changes to.
   * @return {Rekord.ModelCollection} -
   *    The collection with all changes to models in this collection.
   * @see Rekord.createWhere
   * @see Rekord.Model#$hasChanges
   * @see Rekord.Model#$getChanges
   */
  getChanges: function(properties, value, equals, out)
  {
    var where = createWhere( properties, value, equals );
    var changes = out && out instanceof ModelCollection ? out : this.cloneEmpty();

    this.each(function(model)
    {
      if ( where( model ) && model.$hasChanges() )
      {
        changes.put( model.$key(), model.$getChanges() );
      }
    });

    return changes;
  },

  // TODO
  project: function(projectionInput, out)
  {
    var target = out || [];
    var projection = Projection.parse( this.database, projectionInput );

    for (var i = 0; i < this.length; i++)
    {
      target.push( projection.project( this[ i ] ) );
    }

    return target;
  },

  /**
   * Converts this collection into an object where the keys of the models are
   * the object properties and the models are the values.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Object} [out] -
   *    The object to place the models in.
   * @return {Object} -
   *    The object containing the models in this collection.
   */
  toObject: function(out)
  {
    return this.map.toObject( out );
  },

  /**
   * Returns a clone of this collection. Optionally the models in this
   * collection can also be cloned.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @param {Boolean} [cloneModels=false] -
   *    Whether or not the models should be cloned as well.
   * @param {Boolean} [cloneProperties] -
   *    The properties object which defines what fields should be given a
   *    different (non-cloned) value and which relations need to be cloned.
   * @return {Rekord.ModelCollection} -
   *    The reference to a clone collection.
   * @see Rekord.Model#$clone
   */
  clone: function(cloneModels, cloneProperties)
  {
    var source = this;

    if ( cloneModels )
    {
      source = [];

      for (var i = 0; i < this.length; i++)
      {
        source[ i ] = this[ i ].$clone( cloneProperties );
      }
    }

    return ModelCollection.create( this.database, source, true );
  },

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Rekord.ModelCollection#
   * @return {Rekord.ModelCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: function()
  {
    return ModelCollection.create( this.database );
  }

});


/**
 * An extension of the {@link Rekord.ModelCollection} class which is a filtered
 * view of another model collection. Changes made to the base collection are
 * reflected in the filtered collection - possibly resulting in additions and
 * removals from the filtered collection.
 *
 * ```javascript
 * var Task = Rekord({
 *   fields: ['name', 'done']
 * });
 * var finished = Task.filtered('done', true);
 * finished; // will always contain tasks that are done
 * ```
 *
 * @constructor
 * @memberof Rekord
 * @extends Rekord.ModelCollection
 * @param {Rekord.ModelCollection} base -
 *    The model collection to listen to for changes to update this collection.
 * @param {whereCallback} filter -
 *    The function which determines whether a model in the base collection
 *    should exist in this collection.
 * @see Rekord.Collection#filtered
 */
function FilteredModelCollection(base, filter)
{
  this.bind();
  this.init( base, filter );
}

/**
 * The collection to listen to for changes to update this collection.
 *
 * @memberof Rekord.FilteredModelCollection#
 * @member {Rekord.ModelCollection} base
 */

 /**
  * The function which determines whether an element in the base collection
  * should exist in this collection.
  *
  * @memberof Rekord.FilteredModelCollection#
  * @member {whereCallback} filter
  */

Class.extend( ModelCollection, FilteredModelCollection,
{

  /**
   * Generates the handlers which are passed to the base collection when this
   * filtered collection is connected or disconnected - which happens on
   * initialization and subsequent calls to {@link FilteredModelCollection#init}.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   */
  bind: function()
  {
    Filtering.bind.apply( this );

    Class.props(this, {
      onModelUpdated: bind( this, this.handleModelUpdate )
    });
  },

  /**
   * Initializes the filtered collection by setting the base collection and the
   * filtering function.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @param {Rekord.ModelCollection} base -
   *    The model collection to listen to for changes to update this collection.
   * @param {whereCallback} filter -
   *    The function which determines whether a model in the base collection
   *    should exist in this collection.
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  init: function(base, filter)
  {
    if ( this.base )
    {
      this.base.database.off( Database.Events.ModelUpdated, this.onModelUpdated );
    }

    ModelCollection.prototype.init.call( this, base.database );

    Filtering.init.call( this, base, filter );

    base.database.on( Database.Events.ModelUpdated, this.onModelUpdated );

    return this;
  },

  /**
   * Sets the filter function of this collection and re-sychronizes it with the
   * base collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @emits Rekord.Collection#reset
   */
  setFilter: Filtering.setFilter,

  /**
   * Registers callbacks with events of the base collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   */
  connect: Filtering.connect,

  /**
   * Unregisters callbacks with events from the base collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   */
  disconnect: Filtering.disconnect,

  /**
   * Synchronizes this collection with the base collection. Synchronizing
   * involves iterating over the base collection and passing each element into
   * the filter function and if it returns a truthy value it's added to this
   * collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  sync: Filtering.sync,

  /**
   * Handles the ModelUpdated event from the database.
   */
  handleModelUpdate: function(model)
  {
    var exists = this.has( model.$key() );
    var matches = this.filter( model );

    if ( exists && !matches )
    {
      this.remove( model );
    }
    if ( !exists && matches )
    {
      this.add( model );
    }
  },

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to a clone collection.
   */
  clone: Filtering.clone,

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: Filtering.cloneEmpty

});


/**
 * An extension of the {@link Rekord.ModelCollection} class for relationships.
 *
 * @constructor
 * @memberof Rekord
 * @extends Rekord.ModelCollection
 * @param {Rekord.Database} database -
 *    The database for the models in this collection.
 * @param {Rekord.Model} model -
 *    The model instance all models in this collection are related to.
 * @param {Rekord.Relation} relator -
 *    The relation instance responsible for relating/unrelating models.
 * @param {modelInput[]} [models] -
 *    The initial array of models in this collection.
 * @param {Boolean} [remoteData=false] -
 *    If the models array is from a remote source. Remote sources place the
 *    model directly into the database while local sources aren't stored in the
 *    database until they're saved.
 */
function RelationCollection(database, model, relator, models, remoteData)
{
  Class.props(this, {
    model:    model,
    relator:  relator
  });

  this.init( database, models, remoteData );
}

/**
 * The model instance all models in this collection are related to.
 *
 * @memberof Rekord.RelationCollection#
 * @member {Rekord.Model} model
 */

 /**
  * The relation instance responsible for relating/unrelating models.
  *
  * @memberof Rekord.RelationCollection#
  * @member {Rekord.Relation} relator
  */

Class.extend( ModelCollection, RelationCollection,
{

  /**
   * Sets the entire set of models which are related. If a model is specified
   * that doesn't exist in this collection a relationship is added. If a model
   * in this collection is not specified in the `input` the relationship is
   * removed. Depending on the relationship, adding and removing relationships
   * may result in the saving or deleting of models.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {modelInput|modelInput[]} [input] -
   *    The model or array of models to relate. If input isn't specified, all
   *    models currently related are unrelated.
   * @param {boolean} [remoteData=false] -
   *    Whether this change is due to remote changes or changes that should not
   *    trigger removes or saves.
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   */
  set: function(input, remoteData)
  {
    this.relator.set( this.model, input, remoteData );

    return this;
  },

  /**
   * Relates one or more models to this collection's model. If a model is
   * specified that is already related then it has no effect.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {modelInput|modelInput[]} input -
   *    The model or array of models to relate.
   * @param {boolean} [remoteData=false] -
   *    Whether this change is due to remote changes or changes that should not
   *    trigger removes or saves.
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   */
  relate: function(input, remoteData)
  {
    this.relator.relate( this.model, input, remoteData );

    return this;
  },

  /**
   * Unrelates one or more models from this collection's model. If a model is
   * specified that is not related then it has no effect. If no models are
   * specified then all models in this collection are unrelated.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {modelInput|modelInput[]} input -
   *    The model or array of models to relate.
   * @param {boolean} [remoteData=false] -
   *    Whether this change is due to remote changes or changes that should not
   *    trigger removes or saves.
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   */
  unrelate: function(input, remoteData)
  {
    this.relator.unrelate( this.model, input, remoteData );

    return this;
  },

  /**
   * Syncrhonizes the related models in this collection by re-evaluating all
   * models for a relationship.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {boolean} [removeUnrelated=false] -
   *    Whether to remove models that are no longer related. The $remove
   *    function is not called on these models.
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   */
  sync: function(removeUnrelated)
  {
    this.relator.sync( this.model, removeUnrelated );

    return this;
  },

  /**
   * Unrelates any models in this collection which meet the where expression.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @see Rekord.RelationCollection.unrelate
   * @see Rekord.RelationCollection.where
   */
  unrelateWhere: function(properties, value, equals)
  {
    return this.unrelate( this.where( properties, value, equals, [] ) );
  },

  /**
   * Determines whether one or more models all exist in this collection.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {modelInput|modelInput[]} input -
   *    The model or array of models to check for existence.
   * @return {Boolean} -
   *    True if all models are related - otherwise false.
   */
  isRelated: function(input)
  {
    return this.relator.isRelated( this.model, input );
  },

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @return {Rekord.RelationCollection} -
   *    The reference to a clone collection.
   */
  clone: function()
  {
    return RelationCollection.create( this.database, this.model, this.relator, this, true );
  },

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @return {Rekord.RelationCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: function()
  {
    return RelationCollection.create( this.database, this.model, this.relator );
  }

});


/**
 * Overrides functions in the given model collection to turn it into a collection
 * which contains models with a discriminator field.
 *
 * @param {Rekord.ModelCollection} collection -
 *    The collection instance with discriminated models.
 * @param {String} discriminator -
 *    The name of the field which contains the discriminator.
 * @param {Object} discriminatorsToModel -
 *    A map of discriminators to the Rekord instances.
 * @return {Rekord.ModelCollection} -
 *    The reference to the given collection.
 */
function DiscriminateCollection(collection, discriminator, discriminatorsToModel)
{
  Class.props( collection,
  {
    discriminator: discriminator,
    discriminatorsToModel: discriminatorsToModel
  });

  // Original Functions
  var buildKeyFromInput = collection.buildKeyFromInput;
  var parseModel = collection.parseModel;
  var clone = collection.clone;
  var cloneEmpty = collection.cloneEmpty;

  Class.props( collection,
  {

    /**
     * Builds a key from input. Discriminated collections only accept objects as
     * input - otherwise there's no way to determine the discriminator. If the
     * discriminator on the input doesn't map to a Rekord instance OR the input
     * is not an object the input will be returned instead of a model instance.
     *
     * @param {modelInput} input -
     *    The input to create a key for.
     * @return {Any} -
     *    The built key or the given input if a key could not be built.
     */
    buildKeyFromInput: function(input)
    {
      if ( isObject( input ) )
      {
        var discriminatedValue = input[ this.discriminator ];
        var model = this.discriminatorsToModel[ discriminatedValue ];

        if ( model )
        {
          return model.Database.keyHandler.buildKeyFromInput( input );
        }
      }

      return input;
    },

    /**
     * Takes input and returns a model instance. The input is expected to be an
     * object, any other type will return null.
     *
     * @param {modelInput} input -
     *    The input to parse to a model instance.
     * @param {Boolean} [remoteData=false] -
     *    Whether or not the input is coming from a remote source.
     * @return {Rekord.Model} -
     *    The model instance parsed or null if none was found.
     */
    parseModel: function(input, remoteData)
    {
      if ( input instanceof Model )
      {
        return input;
      }

      var discriminatedValue = isValue( input ) ? input[ this.discriminator ] : null;
      var model = this.discriminatorsToModel[ discriminatedValue ];

      return model ? model.Database.parseModel( input, remoteData ) : null;
    },

    /**
     * Returns a clone of this collection.
     *
     * @method
     * @memberof Rekord.Collection#
     * @return {Rekord.Collection} -
     *    The reference to a clone collection.
     */
    clone: function()
    {
      return DiscriminateCollection( clone.apply( this ), discriminator, discriminatorsToModel );
    },

    /**
     * Returns an empty clone of this collection.
     *
     * @method
     * @memberof Rekord.Collection#
     * @return {Rekord.Collection} -
     *    The reference to a clone collection.
     */
    cloneEmpty: function()
    {
      return DiscriminateCollection( cloneEmpty.apply( this ), discriminator, discriminatorsToModel );
    }

  });

  return collection;
}


/**
 * Options you can pass to {@link Rekord.Search} or {@link Rekord.Model.search}.
 *
 * @typedef {Object} searchOptions
 * @property {Function} [$encode] -
 *    A function which converts the search into an object to pass to the
 *    specified methods.
 * @property {Function} [$decode] -
 *    A function which takes the data returned from the server and returns
 *    The array of models which are to be placed in the
 *    {@link Rekord.Search#$results} property.
 */

/**
 *
 * @constructor
 * @memberof Rekord
 */
function Search(database, url, options, props, run)
{
  this.$init( database, url, options, props, run );
}

Search.Defaults =
{
};

Class.create( Search,
{

  $getDefaults: function()
  {
    return Search.Defaults;
  },

  $init: function(database, url, options, props, run)
  {
    applyOptions( this, options, this.$getDefaults(), true );

    Class.prop( this, '$db', database );

    this.$append = false;
    this.$url = url;
    this.$set( props );
    this.$results = ModelCollection.create( database );
    this.$promise = Promise.resolve( this );

    if ( run )
    {
      this.$run();
    }
  },

  $set: function(props)
  {
    if ( isObject( props ) )
    {
      transfer( props, this );
    }

    return this;
  },

  $unset: function()
  {
    for (var prop in this)
    {
      if ( prop.charAt(0) !== '$' )
      {
        delete this[ prop ];
      }
    }

    return this;
  },

  $run: function(url, props)
  {
    this.$url = url || this.$url;
    this.$set( props );

    var encoded = this.$encode();
    var success = bind( this, this.$handleSuccess );
    var failure = bind( this, this.$handleFailure );
    var options = this.$options || this.$db.queryOptions;

    batchExecute(function()
    {
      this.$cancel();
      this.$promise = new Promise();
      this.$db.rest.query( this.$url, encoded, options, success, failure );

    }, this );

    return this.$promise;
  },

  $handleSuccess: function(response)
  {
    if ( !this.$promise.isPending() )
    {
      return;
    }

    var models = this.$decode.apply( this, arguments );

    if ( this.$append )
    {
      this.$results.addAll( models, false, true );
    }
    else
    {
      this.$results.reset( models, true );
    }

    this.$promise.resolve( this, response, this.$results );
  },

  $handleFailure: function(response, status)
  {
    if ( !this.$promise.isPending() )
    {
      return;
    }

    var offline = RestStatus.Offline[ status ];

    if ( offline )
    {
      Rekord.checkNetworkStatus();

      offline = !Rekord.online;
    }

    if ( offline )
    {
      this.$promise.noline( this, response, status );
    }
    else
    {
      this.$promise.reject( this, response, status );
    }
  },

  $cancel: function()
  {
    this.$promise.cancel();
  },

  $clear: function()
  {
    this.$results.clear();
  },

  $encode: function()
  {
    return cleanFunctions( copy( this ) );
  },

  $decode: function(models)
  {
    return models;
  },

  $key: function()
  {
    return '';
  },

  $change: function(callback, context)
  {
    return this.$results.change( callback, context );
  }

});


/**
 * Options you can pass to {@link Rekord.SearchPaged} or
 * {@link Rekord.Model.searchPaged}.
 *
 * @typedef {Object} searchPageOptions
 * @property {Number} [page_size=10] -
 *    The size of the pages.
 * @property {Number} [page_index=0] -
 *    The index of the search page.
 * @property {Number} [total=0] -
 *    The total number of models that exist in the search without pagination
 *    - this is expected to be provided by the remote search response.
 * @property {Function} [$encode] -
 *    A function which converts the search into an object to pass to the
 *    specified methods.
 * @property {Function} [$decode] -
 *    A function which takes the data returned from the server and updates
 *    this search with the results and paging information.
 * @property {Function} [$decodeResults] -
 *    A function which takes the data returned from the server and returns the
 *    array of models which are to be placed in the
 *    {@link Rekord.Search#$results} property.
 * @property {Function} [$updatePageSize] -
 *    A function which takes the data returned from the server and sets an
 *    updated page size of the search.
 * @property {Function} [$updatePageIndex] -
 *    A function which takes the data returned from the server and sets an
 *    updated page index of the search.
 * @property {Function} [$updateTotal] -
 *    A function which takes the data returned from the server and sets an
 *    updated total of the search.
 */

function SearchPaged(database, url, options, props, run)
{
  this.$init( database, url, options, props, run );
}

SearchPaged.Defaults =
{
  page_size:   10,
  page_index:  0,
  total:       0
};

Class.extend( Search, SearchPaged,
{

  $getDefaults: function()
  {
    return SearchPaged.Defaults;
  },

  $goto: function(index, dontRun)
  {
    var pageIndex = this.$getPageIndex();
    var pageCount = this.$getPageCount();
    var desired = Math.max( 0, Math.min( index, pageCount - 1 ) );

    if ( pageIndex !== desired )
    {
      this.$setPageIndex( desired );

      if ( !dontRun )
      {
        this.$append = false;
        this.$run();
      }
    }

    return this.$promise;
  },

  $more: function()
  {
    var next = this.$getPageIndex() + 1;

    if ( next < this.$getPageCount() )
    {
      this.$setPageIndex( next );
      this.$append = true;
      this.$run();
      this.$promise.complete( this.$onMoreEnd, this );
    }

    return this.$promise;
  },

  $onMoreEnd: function()
  {
    this.$append = false;
  },

  $first: function(dontRun)
  {
    return this.$goto( 0, dontRun );
  },

  $last: function(dontRun)
  {
    return this.$goto( this.$getPageCount() - 1, dontRun );
  },

  $prev: function(dontRun)
  {
    return this.$goto( this.$getPageIndex() - 1, dontRun );
  },

  $next: function(dontRun)
  {
    return this.$goto( this.$getPageIndex() + 1, dontRun );
  },

  $total: function()
  {
    return this.$getTotal();
  },

  $pages: function()
  {
    return this.$getPageCount();
  },

  $page: function(index)
  {
    return Math.max( 0, Math.min( index, this.$pages() - 1 ) );
  },

  $can: function(index)
  {
    return this.$getTotal() && index >= 0 && index < this.$getPageCount();
  },

  $canFirst: function()
  {
    return this.$canPrev();
  },

  $canLast: function()
  {
    return this.$canNext();
  },

  $canPrev: function()
  {
    return this.$getTotal() && this.$getPageIndex() > 0;
  },

  $canNext: function()
  {
    return this.$getTotal() && this.$getPageIndex() < this.$getPageCount() - 1;
  },

  $decode: function(response)
  {
    this.$updatePageSize( response );
    this.$updatePageIndex( response );
    this.$updateTotal( response );

    return this.$decodeResults( response );
  },

  $decodeResults: function(response)
  {
    return response.results;
  },

  $updatePageSize: function(response)
  {
    if ( isNumber( response.page_size ) )
    {
      this.page_size = response.page_size;
    }
  },

  $setPageSize: function(page_size)
  {
    this.page_size = page_size;
  },

  $getPageSize: function()
  {
    return this.page_size;
  },

  $updatePageIndex: function(response)
  {
    if ( isNumber( response.page_index ) )
    {
      this.page_index = response.page_index;
    }
  },

  $setPageIndex: function(page_index)
  {
    this.page_index = page_index || 0;
  },

  $getPageIndex: function()
  {
    return this.page_index;
  },

  $getPageOffset: function()
  {
    return this.page_index * this.page_size;
  },

  $updateTotal: function(response)
  {
    if ( isNumber( response.total ) )
    {
      this.total = response.total;
    }
  },

  $setTotal: function(total)
  {
    this.total = total || 0;
  },

  $getTotal: function()
  {
    return this.total;
  },

  $getPageCount: function()
  {
    return Math.ceil( this.$getTotal() / this.$getPageSize() );
  }

});


function Promise(executor, cancelable)
{
  this.status = Promise.Status.Pending;
  this.cancelable = cancelable !== false;

  Class.prop( this, 'results', null );

  if ( isFunction( executor ) )
  {
    executor(
      bind(this, this.resolve),
      bind(this, this.reject),
      bind(this, this.noline),
      bind(this, this.cancel)
    );
  }
}

Promise.Status =
{
  Pending:    'pending',
  Success:    'success',
  Failure:    'failure',
  Offline:    'offline',
  Canceled:   'canceled'
};

Promise.Events =
{
  Success:      'success',
  Failure:      'failure',
  Offline:      'offline',
  Canceled:     'canceled',
  Unsuccessful: 'failure offline canceled',
  Complete:     'success failure offline canceled'
};

Promise.all = function(iterable)
{
  var all = new Promise();
  var successes = 0;
  var goal = iterable.length;
  var results = [];

  function handleSuccess()
  {
    results.push( AP.slice.apply( arguments ) );

    if ( ++successes === goal )
    {
      all.resolve( results );
    }
  }

  for (var i = 0; i < iterable.length; i++)
  {
    var p = iterable[ i ];

    if ( p instanceof Promise )
    {
      p.then( handleSuccess, all.reject, all.noline, all.cancel, all );
    }
    else
    {
      goal--;
    }
  }

  return all;
};

Promise.race = function(iterable)
{
  var race = new Promise();

  for (var i = 0; i < iterable.length; i++)
  {
    var p = iterable[ i ];

    if ( p instanceof Promise )
    {
      p.then( race.resolve, race.reject, race.noline, race.cancel, race );
    }
  }

  return race;
};

Promise.reject = function(reason)
{
  var p = new Promise();
  p.reject.apply( p, arguments );
  return p;
};

Promise.resolve = function()
{
  var p = new Promise();
  p.resolve.apply( p, arguments );
  return p;
};

Promise.noline = function(reason)
{
  var p = new Promise();
  p.noline.apply( p, arguments );
  return p;
};

Promise.cancel = function()
{
  var p = new Promise();
  p.cancel.apply( p, arguments );
  return p;
};

Promise.singularity = (function()
{
  var singularity = null;
  var singularityResult = null;
  var consuming = false;
  var promiseCount = 0;
  var promiseComplete = 0;

  function handleSuccess()
  {
    if ( ++promiseComplete === promiseCount )
    {
      singularity.resolve( singularityResult );
    }
  }

  function bindPromise(promise)
  {
    promiseCount++;
    promise.then( handleSuccess, singularity.reject, singularity.noline, null, singularity );
  }

  return function(promiseOrContext, contextOrCallback, callbackOrNull)
  {
    var promise = promiseOrContext;
    var context = contextOrCallback;
    var callback = callbackOrNull;

    if (!(promise instanceof Promise))
    {
      promise = false;
      context = promiseOrContext;
      callback = contextOrCallback;
    }

    if ( !consuming )
    {
      consuming = true;
      singularity = new Promise( null, false );
      singularityResult = context;
      promiseCount = 0;
      promiseComplete = 0;

      if (promise)
      {
        bindPromise( promise );
      }

      try
      {
        callback.call( context, singularity );
      }
      catch (ex)
      {
        Rekord.trigger( Rekord.Events.Error, [ex] );

        throw ex;
      }
      finally
      {
        consuming = false;
      }
    }
    else
    {
      if (promise)
      {
        bindPromise( promise );
      }

      callback.call( context, singularity );
    }

    if (promiseCount === 0)
    {
      singularity.resolve();
    }

    return singularity;
  };

})();

Class.create( Promise,
{
  resolve: function()
  {
    this.finish( Promise.Status.Success, Promise.Events.Success, arguments );
  },

  reject: function()
  {
    this.finish( Promise.Status.Failure, Promise.Events.Failure, arguments );
  },

  noline: function()
  {
    this.finish( Promise.Status.Offline, Promise.Events.Offline, arguments );
  },

  cancel: function()
  {
    if ( this.cancelable )
    {
      this.finish( Promise.Status.Canceled, Promise.Events.Canceled, arguments );
    }
  },

  then: function(success, failure, offline, canceled, context, persistent )
  {
    this.success( success, context, persistent );
    this.failure( failure, context, persistent );
    this.offline( offline, context, persistent );
    this.canceled( canceled, context, persistent );

    return this;
  },

  reset: function(clearListeners)
  {
    this.status = Promise.Status.Pending;

    if ( clearListeners )
    {
      this.off();
    }

    return this;
  },

  finish: function(status, events, results)
  {
    if ( this.status === Promise.Status.Pending )
    {
      this.results = AP.slice.apply( results );
      this.status = status;
      this.trigger( events, results );
    }
  },

  listenFor: function(immediate, events, callback, context, persistent)
  {
    if ( isFunction( callback ) )
    {
      if ( this.status === Promise.Status.Pending )
      {
        if ( persistent )
        {
          this.on( events, callback, context );
        }
        else
        {
          this.once( events, callback, context );
        }
      }
      else if ( immediate )
      {
        callback.apply( context || this, this.results );
      }
    }

    return this;
  },

  success: function(callback, context, persistent)
  {
    return this.listenFor( this.isSuccess(), Promise.Events.Success, callback, context, persistent );
  },

  unsuccessful: function(callback, context, persistent)
  {
    return this.listenFor( this.isUnsuccessful(), Promise.Events.Unsuccessful, callback, context, persistent );
  },

  failure: function(callback, context, persistent)
  {
    return this.listenFor( this.isFailure(), Promise.Events.Failure, callback, context, persistent );
  },

  catch: function(callback, context, persistent)
  {
    return this.listenFor( this.isFailure(), Promise.Events.Failure, callback, context, persistent );
  },

  offline: function(callback, context, persistent)
  {
    return this.listenFor( this.isOffline(), Promise.Events.Offline, callback, context, persistent );
  },

  canceled: function(callback, context, persistent)
  {
    return this.listenFor( this.isCanceled(), Promise.Events.Canceled, callback, context, persistent );
  },

  complete: function(callback, context, persistent)
  {
    return this.listenFor( true, Promise.Events.Complete, callback, context, persistent );
  },

  isSuccess: function()
  {
    return this.status === Promise.Status.Success;
  },

  isUnsuccessful: function()
  {
    return this.status !== Promise.Status.Success && this.status !== Promise.Status.Pending;
  },

  isFailure: function()
  {
    return this.status === Promise.Status.Failure;
  },

  isOffline: function()
  {
    return this.status === Promise.Status.Offline;
  },

  isCanceled: function()
  {
    return this.status === Promise.Status.Canceled;
  },

  isPending: function()
  {
    return this.status === Promise.Status.Pending;
  },

  isComplete: function()
  {
    return this.status !== Promise.Status.Pending;
  }

});

addEventful( Promise );


function Operation()
{
}

Class.create( Operation,
{

  reset: function(model, cascade, options)
  {
    this.model = model;
    this.cascade = isNumber( cascade ) ? cascade : Cascade.All;
    this.options = options;
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
      this.model.$trigger( Model.Events.OperationsStarted );
    }
  },

  tryNext: function(OperationType)
  {
    var setNext = !this.next;

    if ( setNext )
    {
      this.next = new OperationType( this.model, this.cascade, this.options );
    }

    return setNext;
  },

  insertNext: function(OperationType)
  {
    var op = new OperationType( this.model, this.cascade, this.options );

    op.next = this.next;
    this.next = op;
  },

  execute: function()
  {
    if ( this.db.pendingOperations === 0 )
    {
      this.db.trigger( Database.Events.OperationsStarted );
    }

    this.db.pendingOperations++;

    try
    {
      this.run( this.db, this.model );
    }
    catch (ex)
    {
      this.finish();

      Rekord.trigger( Rekord.Events.Error, [ex] );

      throw ex;
    }
  },

  run: function(db, model)
  {
    throw 'Operation.run Not implemented';
  },

  finish: function()
  {
    if ( !this.finished )
    {
      this.finished = true;
      this.model.$operation = this.next;

      if ( this.next )
      {
        this.next.execute();
      }

      this.db.pendingOperations--;

      if ( !this.next )
      {
        this.model.$trigger( Model.Events.OperationsFinished );
      }

      if ( this.db.pendingOperations === 0 )
      {
        this.db.onOperationRest();
        this.db.trigger( Database.Events.OperationsFinished );
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
    try
    {
      this.onSuccess.apply( this, arguments );
    }
    catch (ex)
    {
      Rekord.trigger( Rekord.Events.Error, [ex] );

      throw ex;
    }
    finally
    {
      this.finish();
    }
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
    try
    {
      this.onFailure.apply( this, arguments );
    }
    catch (ex)
    {
      Rekord.trigger( Rekord.Events.Error, [ex] );

      throw ex;
    }
    finally
    {
      this.finish();
    }
  },

  onFailure: function()
  {

  }

});

function GetLocal(model, cascade, options)
{
  this.reset( model, cascade, options );
}

Class.extend( Operation, GetLocal,
{

  cascading: Cascade.Local,

  interrupts: false,

  type: 'GetLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( Model.Events.LocalGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() && db.cache === Cache.All )
    {
      db.store.get( model.$key(), this.success(), this.failure() );
    }
    else
    {
      Rekord.debug( Rekord.Debugs.GET_LOCAL_SKIPPED, model );

      model.$trigger( Model.Events.LocalGet, [model] );

      this.insertNext( GetRemote );
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

    Rekord.debug( Rekord.Debugs.GET_LOCAL, model, encoded );

    model.$trigger( Model.Events.LocalGet, [model] );

    if ( this.canCascade( Cascade.Rest ) && !model.$isDeleted() )
    {
      this.insertNext( GetRemote );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.GET_LOCAL, model, e );

    model.$trigger( Model.Events.LocalGetFailure, [model] );

    if ( this.canCascade( Cascade.Rest ) && !model.$isDeleted()  )
    {
      this.insertNext( GetRemote );
    }
  }

});

function GetRemote(model, cascade, options)
{
  this.reset( model, cascade, options );
}

Class.extend( Operation, GetRemote,
{

  cascading: Cascade.Rest,

  interrupts: false,

  type: 'GetRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( Model.Events.RemoteGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() )
    {
      batchExecute(function()
      {
        db.rest.get( model, this.options || db.getOptions, this.success(), this.failure() );

      }, this );
    }
    else
    {
      model.$trigger( Model.Events.RemoteGet, [model] );

      this.finish();
    }
  },

  onSuccess: function(response)
  {
    var db = this.db;
    var data = db.resolveModel( response );
    var model = this.model;

    if ( isObject( data ) )
    {
      db.putRemoteData( data, model.$key(), model, true );
    }

    Rekord.debug( Rekord.Debugs.GET_REMOTE, model, data );

    model.$trigger( Model.Events.RemoteGet, [model] );
  },

  onFailure: function(response, status)
  {
    var db = this.db;
    var model = this.model;

    Rekord.debug( Rekord.Debugs.GET_REMOTE_ERROR, model, response, status );

    if ( RestStatus.NotFound[ status ] )
    {
      this.insertNext( RemoveNow );

      db.destroyModel( model );

      model.$trigger( Model.Events.RemoteGetFailure, [model, response] );
    }
    else if ( RestStatus.Offline[ status ] )
    {
      model.$trigger( Model.Events.RemoteGetOffline, [model, response] );
    }
    else
    {
      model.$trigger( Model.Events.RemoteGetFailure, [model, response] );
    }
  }

});

function RemoveCache(model, cascade)
{
  this.reset( model, cascade );
}

Class.extend( Operation, RemoveCache,
{

  cascading: Cascade.None,

  interrupts: true,

  type: 'RemoveCache',

  run: function(db, model)
  {
    if ( db.cache === Cache.None )
    {
      this.finish();
    }
    else
    {
      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  }

});

function RemoveLocal(model, cascade)
{
  this.reset( model, cascade );
}

Class.extend( Operation, RemoveLocal,
{

  cascading: Cascade.Local,

  interrupts: true,

  type: 'RemoveLocal',

  run: function(db, model)
  {
    model.$status = Model.Status.RemovePending;

    if ( db.cache === Cache.None || !model.$local || !this.canCascade() )
    {
      Rekord.debug( Rekord.Debugs.REMOVE_LOCAL_NONE, model );

      model.$trigger( Model.Events.LocalRemove, [model] );

      this.insertNext( RemoveRemote );
      this.finish();
    }
    else if ( model.$saved && this.canCascade( Cascade.Rest ) )
    {
      model.$local.$status = model.$status;

      db.store.put( model.$key(), model.$local, this.success(), this.failure() );
    }
    else
    {
      Rekord.debug( Rekord.Debugs.REMOVE_LOCAL_UNSAVED, model );

      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.REMOVE_LOCAL, model );

    model.$trigger( Model.Events.LocalRemove, [model] );

    if ( model.$saved && this.canCascade( Cascade.Remote ) )
    {
      model.$addOperation( RemoveRemote, this.cascade, this.options );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.REMOVE_LOCAL_ERROR, model, e );

    model.$trigger( Model.Events.LocalRemoveFailure, [model] );

    if ( model.$saved && this.canCascade( Cascade.Remote ) )
    {
      model.$addOperation( RemoveRemote, this.cascade, this.options );
    }
  }

});

function RemoveNow(model, cascade)
{
  this.reset( model, cascade );
}

Class.extend( Operation, RemoveNow,
{

  cascading: Cascade.Local,

  interrupts: true,

  type: 'RemoveNow',

  run: function(db, model)
  {
    var key = model.$key();

    model.$status = Model.Status.RemovePending;

    db.removeFromModels( model );

    if ( db.cache === Cache.None || !this.canCascade() )
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

    model.$status = Model.Status.Removed;

    delete model.$local;
    delete model.$saving;
    delete model.$publish;
    delete model.$saved;
  }

});

function RemoveRemote(model, cascade, options)
{
  this.reset( model, cascade, options );
}

Class.extend( Operation, RemoveRemote,
{

  cascading: Cascade.Remote,

  interrupts: true,

  type: 'RemoveRemote',

  run: function(db, model)
  {
    if ( this.notCascade( Cascade.Rest ) )
    {
      this.liveRemove();

      model.$trigger( Model.Events.RemoteRemove, [model] );

      this.finish();
    }
    else
    {
      model.$status = Model.Status.RemovePending;

      batchExecute(function()
      {
        db.rest.remove( model, this.options || this.removeOptions, this.success(), this.failure() );

      }, this );
    }
  },

  onSuccess: function(data)
  {
    this.finishRemove();
  },

  onFailure: function(response, status)
  {
    var model = this.model;
    var key = model.$key();

    if ( RestStatus.NotFound[ status ] )
    {
      Rekord.debug( Rekord.Debugs.REMOVE_MISSING, model, key );

      this.finishRemove( true );
    }
    else if ( RestStatus.Offline[ status ] )
    {
      // Looks like we're offline!
      Rekord.checkNetworkStatus();

      // If we are offline, wait until we're online again to resume the delete
      if (!Rekord.online)
      {
        model.$listenForOnline( this.cascade );

        model.$trigger( Model.Events.RemoteRemoveOffline, [model, response] );
      }
      else
      {
        model.$trigger( Model.Events.RemoteRemoveFailure, [model, response] );
      }

      Rekord.debug( Rekord.Debugs.REMOVE_OFFLINE, model, response );
    }
    else
    {
      Rekord.debug( Rekord.Debugs.REMOVE_ERROR, model, status, key, response );

      model.$trigger( Model.Events.RemoteRemoveFailure, [model, response] );
    }
  },

  finishRemove: function(notLive)
  {
    var db = this.db;
    var model = this.model;
    var key = model.$key();

    Rekord.debug( Rekord.Debugs.REMOVE_REMOTE, model, key );

    // Successfully removed!
    model.$status = Model.Status.Removed;

    // Successfully Removed!
    model.$trigger( Model.Events.RemoteRemove, [model] );

    // Remove from local storage now
    this.insertNext( RemoveNow );

    // Remove it live!
    if ( !notLive )
    {
      this.liveRemove();
    }

    // Remove the model reference for good!
    db.removeReference( key );
  },

  liveRemove: function()
  {
    if ( this.canCascade( Cascade.Live ) )
    {
      var db = this.db;
      var model = this.model;
      var key = model.$key();

      // Publish REMOVE
      Rekord.debug( Rekord.Debugs.REMOVE_PUBLISH, model, key );

      db.live.remove( model );
    }
  }

});

function SaveLocal(model, cascade, options)
{
  this.reset( model, cascade, options );
}

Class.extend( Operation, SaveLocal,
{

  cascading: Cascade.Local,

  interrupts: false,

  type: 'SaveLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_LOCAL_DELETED, model );

      model.$trigger( Model.Events.LocalSaveFailure, [model] );

      this.finish();
    }
    else if ( db.cache === Cache.None || !this.canCascade() )
    {
      if ( this.canCascade( Cascade.Remote ) )
      {
        if ( this.tryNext( SaveRemote ) )
        {
          this.markSaving( db, model );
        }
      }

      model.$trigger( Model.Events.LocalSave, [model] );

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

    var saving = db.fullSave ? remote : this.grabAlways( db.saveAlways, changes, remote );
    var publish = db.fullPublish ? remote : this.grabAlways( db.publishAlways, changes, remote );

    model.$status = Model.Status.SavePending;
    model.$saving = saving;
    model.$publish = publish;
  },

  grabAlways: function(always, changes, encoded)
  {
    var changesCopy = null;

    if ( always.length )
    {
      for (var i = 0; i < always.length; i++)
      {
        var prop = always[ i ];

        if ( !(prop in changes) )
        {
          if ( !changesCopy )
          {
            changesCopy = copy( changes );
          }

          changesCopy[ prop ] = encoded[ prop ];
        }
      }
    }

    return changesCopy || changes;
  },

  clearLocal: function(model)
  {
    model.$status = Model.Status.Synced;

    model.$local.$status = model.$status;

    delete model.$local.$saving;
    delete model.$local.$publish;

    this.insertNext( SaveNow );
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.SAVE_LOCAL, model );

    if ( this.cascade )
    {
      this.tryNext( SaveRemote );
    }
    else
    {
      this.clearLocal( model );
    }

    model.$trigger( Model.Events.LocalSave, [model] );
  },

  onFailure: function(e)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.SAVE_LOCAL_ERROR, model, e );

    if ( this.cascade )
    {
      this.tryNext( SaveRemote );
    }
    else
    {
      this.clearLocal( model );
    }

    model.$trigger( Model.Events.LocalSaveFailure, [model] );
  }

});

function SaveNow(model, cascade)
{
  this.reset( model, cascade );
}

Class.extend( Operation, SaveNow,
{

  cascading: Cascade.Local,

  interrupts: false,

  type: 'SaveNow',

  run: function(db, model)
  {
    var key = model.$key();
    var local = model.$local;

    if ( db.cache === Cache.All && key && local && this.canCascade() )
    {
      db.store.put( key, local, this.success(), this.failure() );
    }
    else
    {
      this.finish();
    }
  }

});

function SaveRemote(model, cascade, options)
{
  this.reset( model, cascade, options );
}

Class.extend( Operation, SaveRemote,
{

  cascading: Cascade.Remote,

  interrupts: false,

  type: 'SaveRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_REMOTE_DELETED, model );

      this.markSynced( model, true, Model.Events.RemoteSaveFailure, null );
      this.finish();
    }
    else if ( !model.$dependents.isSaved( this.tryAgain, this ) )
    {
      this.finish();
    }
    else if ( !db.hasData( model.$saving ) || this.notCascade( Cascade.Rest ) )
    {
      this.liveSave();
      this.markSynced( model, true, Model.Events.RemoteSave, null );
      this.finish();
    }
    else
    {
      model.$status = Model.Status.SavePending;

      batchExecute(function()
      {
        if ( model.$saved )
        {
          db.rest.update( model, model.$saving, this.options || db.updateOptions || db.saveOptions, this.success(), this.failure() );
        }
        else
        {
          db.rest.create( model, model.$saving, this.options || db.createOptions || db.saveOptions, this.success(), this.failure() );
        }

      }, this );
    }
  },

  onSuccess: function(response)
  {
    var db = this.db;
    var data = db.resolveModel( response );
    var model = this.model;

    Rekord.debug( Rekord.Debugs.SAVE_REMOTE, model );

    this.handleData( data );
  },

  onFailure: function(response, status)
  {
    var operation = this;
    var db = this.db;
    var data = db.resolveModel( response );
    var model = this.model;

    // A non-zero status means a real problem occurred
    if ( RestStatus.Conflict[ status ] ) // 409 Conflict
    {
      Rekord.debug( Rekord.Debugs.SAVE_CONFLICT, model, data );

      this.handleData( data );
    }
    else if ( RestStatus.NotFound[ status ] )
    {
      Rekord.debug( Rekord.Debugs.SAVE_UPDATE_FAIL, model );

      this.insertNext( RemoveNow );

      db.destroyModel( model );

      model.$trigger( Model.Events.RemoteSaveFailure, [model, response] );
    }
    else if ( RestStatus.Offline[ status ] )
    {
      // Check the network status right now
      Rekord.checkNetworkStatus();

      // If not online for sure, try saving once online again
      if (!Rekord.online)
      {
        model.$listenForOnline( this.cascade );

        model.$trigger( Model.Events.RemoteSaveOffline, [model, response] );
      }
      else
      {
        this.markSynced( model, true, Model.Events.RemoteSaveFailure, response );
      }

      Rekord.debug( Rekord.Debugs.SAVE_OFFLINE, model, response );
    }
    else
    {
      Rekord.debug( Rekord.Debugs.SAVE_ERROR, model, status );

      this.markSynced( model, true, Model.Events.RemoteSaveFailure, response );
    }
  },

  markSynced: function(model, saveNow, eventType, response)
  {
    model.$status = Model.Status.Synced;

    this.clearPending( model );

    if ( saveNow )
    {
      this.insertNext( SaveNow );
    }

    if ( eventType )
    {
      model.$trigger( eventType, [model, response] );
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
      Rekord.debug( Rekord.Debugs.SAVE_REMOTE_DELETED, model, data );

      return this.clearPending( model );
    }

    Rekord.debug( Rekord.Debugs.SAVE_VALUES, model, saving );

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

    this.liveSave( data );
    this.markSynced( model, false, Model.Events.RemoteSave, null );

    if ( db.cache === Cache.Pending )
    {
      this.insertNext( RemoveCache );
    }
    else
    {
      this.insertNext( SaveNow );
    }
  },

  liveSave: function(data)
  {
    var db = this.db;
    var model = this.model;

    if ( isObject(data) )
    {
      transfer( data, model.$publish );
    }

    if ( this.canCascade( Cascade.Live ) && db.hasData( model.$publish ) )
    {
      // Publish saved data to everyone else
      Rekord.debug( Rekord.Debugs.SAVE_PUBLISH, model, model.$publish );

      db.live.save( model, model.$publish );
    }
  },

  tryAgain: function()
  {
    var model = this.model;

    model.$addOperation( SaveLocal, this.cascade, this.options );
  }

});


function Relation()
{

}

Rekord.Relations = {};

Relation.Defaults =
{
  model:                null,
  lazy:                 false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 true,
  autoCascade:          Cascade.All,
  autoOptions:          null,
  property:             true,
  preserve:             true,
  clearKey:             true,
  dynamic:              false,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.create( Relation,
{

  debugQuery: null,
  debugQueryResults: null,

  getDefaults: function(database, field, options)
  {
    return Relation.Defaults;
  },

  /**
   * Initializes this relation with the given database, field, and options.
   *
   * @param  {Rekord.Database} database [description]
   * @param  {String} field    [description]
   * @param  {Object} options  [description]
   */
  init: function(database, field, options)
  {
    applyOptions( this, options, this.getDefaults( database, field, options ) );

    this.database = database;
    this.name = field;
    this.options = options;
    this.initialized = false;
    this.property = this.property || (indexOf( database.fields, this.name ) !== false);
    this.discriminated = !isEmpty( this.discriminators );

    if ( this.discriminated )
    {
      if ( !Polymorphic )
      {
        throw 'Polymorphic feature is required to use the discriminated option.';
      }

      Class.props( this, Polymorphic );
    }

    this.setReferences( database, field, options );
  },

  setReferences: function(database, field, options)
  {
    if ( !isRekord( this.model ) )
    {
      Rekord.get( this.model ).complete( this.setModelReference( database, field, options ), this );
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
    return function(rekord)
    {
      this.model = rekord;

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
    this.load.open();
  },

  /**
   * Loads the model.$relation variable with what is necessary to get, set,
   * relate, and unrelate models. If property is true, look at model[ name ]
   * to load models/keys. If it contains values that don't exist or aren't
   * actually related
   *
   * @param  {Rekord.Model} model [description]
   */

  load: Gate(function(model, initialValue, remoteData)
  {

  }),

  set: function(model, input, remoteData)
  {

  },

  relate: function(model, input, remoteData)
  {

  },

  unrelate: function(model, input, remoteData)
  {

  },

  sync: function(model, removeUnrelated)
  {

  },

  isRelated: function(model, input)
  {

  },

  preClone: function(model, clone, properties)
  {

  },

  postClone: function(model, clone, properties)
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
    this.model.Database.on( Database.Events.ModelAdded, callback, this );
  },

  executeQuery: function(model)
  {
    if ( !Search )
    {
      throw 'Search feature is required to use the query option.';
    }

    var queryOption = this.query;
    var queryOptions = this.queryOptions;
    var queryData = this.queryData;
    var query = isString( queryOption ) ? format( queryOption, model ) : queryOption;
    var search = this.model.search( query, queryOptions, queryData );

    Rekord.debug( this.debugQuery, this, model, search, queryOption, query, queryData );

    var promise = search.$run();

    promise.complete( this.handleExecuteQuery( model ), this );

    return search;
  },

  handleExecuteQuery: function(model)
  {
    return function onExecuteQuery(search)
    {
      var results = search.$results;

      Rekord.debug( this.debugQueryResults, this, model, search );

      for (var i = 0; i < results.length; i++)
      {
        this.relate( model, results[ i ], true );
      }
    };
  },

  createRelationCollection: function(model)
  {
    return RelationCollection.create( this.model.Database, model, this );
  },

  createCollection: function(initial)
  {
    return ModelCollection.create( this.model.Database, initial );
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
      var key = db.keyHandler.buildKeyFromInput( input );

      relation.pending[ key ] = true;

      if ( input instanceof Model )
      {
        callback.call( this, input );
      }
      else
      {
        db.grabModel( input, callback, this, remoteData );
      }
    }
  },

  buildKey: function(input)
  {

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
        model.$trigger( Model.Events.RelationUpdate, [this, relation] );

        relation.lastRelated = relation.related;
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
    var changes = clearFieldsReturnChanges( target, targetFields );

    if ( changes && !remoteData && this.auto && !target.$isNew() )
    {
      target.$save( cascade || this.autoCascade, this.autoOptions );
    }

    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields, remoteData)
  {
    var changes = updateFieldsReturnChanges( target, targetFields, source, sourceFields );

    if ( changes )
    {
      if ( this.auto && !target.$isNew() && !remoteData )
      {
        target.$save( this.autoCascade, this.autoOptions );
      }

      target.$trigger( Model.Events.KeyUpdate, [target, source, targetFields, sourceFields] );
    }

    return changes;
  },

  updateForeignKey: function(target, source, remoteData)
  {
    var targetFields = this.getTargetFields( target );
    var sourceFields = this.getSourceFields( source );
    var targetKey = target.$key();
    var targetKeyHandler = target.$db.keyHandler;
    var keyChanges = target.$db.keyChanges;

    Rekord.debug( this.debugUpdateKey, this, target, targetFields, source, sourceFields );

    this.updateFields( target, targetFields, source, sourceFields, remoteData );

    if ( keyChanges && remoteData )
    {
      var targetNewKey = targetKeyHandler.getKey( target, true );

      if ( targetKeyHandler.inKey( targetFields ) && targetNewKey !== targetKey )
      {
        target.$setKey( targetNewKey, true );
      }
    }
  },

  clearForeignKey: function(related, remoteData)
  {
    var key = this.getTargetFields( related );

    Rekord.debug( this.debugClearKey, this, related, key );

    this.clearFields( related, key, remoteData );
  },

  getTargetFields: function(target)
  {
    return target.$db.key;
  },

  getSourceFields: function(source)
  {
    return source.$db.key;
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
      case Save.Model:
        return related.$toJSON( true );

      case Store.Model:
        if ( related.$local )
        {
          return related.$local;
        }

        var local = related.$toJSON( false );

        if ( related.$saved )
        {
          local.$saved = related.$saved;
        }

        return local;

      case Save.Key:
      case Store.Key:
        return related.$key();

      case Save.Keys:
      case Store.Keys:
        return related.$keys();

      }
    }

    return null;
  }

});

function RelationSingle()
{
}

Class.extend( Relation, RelationSingle,
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

    Rekord.debug( this.debugInit, this );

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

      if ( related && relation.related !== related )
      {
        this.clearModel( relation, remoteData );
        this.setRelated( relation, related, remoteData );
      }
    }
  },

  relate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input, remoteData );

    if ( related && relation.related !== related )
    {
      this.clearModel( relation, remoteData );
      this.setRelated( relation, related, remoteData );
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

  clearRelated: function(relation, remoteData, dontClear)
  {
    if ( remoteData )
    {
      var related = relation.related;

      if ( related && related.$isSaving() )
      {
        return;
      }
    }

    this.clearModel( relation, remoteData, dontClear );
    this.setProperty( relation );
  },

  clearModel: function(relation, remoteData, dontClear)
  {
    var related = relation.related;

    if ( related )
    {
      Rekord.debug( this.debugClearModel, this, relation );

      if (relation.onSaved)
      {
        related.$off( Model.Events.Saved, relation.onSaved );
      }
      if (relation.onRemoved)
      {
        related.$off( Model.Events.Removed, relation.onRemoved );
      }

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;

      relation.parent.$dependents.remove( related );

      if ( !dontClear && !remoteData )
      {
        if ( this.clearKey )
        {
          this.clearForeignKey( relation.parent, remoteData );
        }
      }
    }
  },

  setModel: function(relation, related)
  {
    if (relation.onSaved)
    {
      related.$on( Model.Events.Saved, relation.onSaved, this );
    }

    if (relation.onRemoved)
    {
      related.$on( Model.Events.Removed, relation.onRemoved, this );
    }

    relation.related = related;
    relation.dirty = true;
    relation.loaded = true;

    if ( this.isDependent( relation, related ) )
    {
      relation.parent.$dependents.add( related, this );
    }

    Rekord.debug( this.debugSetModel, this, relation );
  },

  isDependent: function(relation, related)
  {
    return true;
  },

  handleModel: function(relation, remoteData, ignoreLoaded)
  {
    return function(related)
    {
      var model = relation.parent;

      Rekord.debug( this.debugLoaded, this, model, relation, related );

      if ( relation.loaded === false || ignoreLoaded )
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
          else if ( !this.preserve )
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

  getTargetFields: function(target)
  {
    return this.local;
  },

  buildKey: function(input)
  {
    var related = input[ this.name ];
    var key = this.local;

    if ( isObject( related ) && this.model )
    {
      var modelDatabase = this.model.Database;
      var foreign = modelDatabase.key;

      modelDatabase.keyHandler.copyFields( input, key, related, foreign );
    }
  }

});

function RelationMultiple()
{
}

Class.extend( Relation, RelationMultiple,
{

  debugAutoSave: null,
  debugInitialGrabbed: null,
  debugSort: null,

  handleExecuteQuery: function(model)
  {
    return function onExecuteQuery(search)
    {
      var relation = model.$relations[ this.name ];
      var results = search.$results;

      Rekord.debug( this.debugQueryResults, this, model, search );

      this.bulk( relation, function()
      {
        for (var i = 0; i < results.length; i++)
        {
          this.addModel( relation, results[ i ], true );
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
    return !remoteData || !related.$isSaving();
  },

  checkSave: function(relation, remoteData)
  {
    if ( !relation.delaySaving && !remoteData && relation.parent.$exists() )
    {
      if ( this.store === Store.Model || this.save === Save.Model )
      {
        Rekord.debug( this.debugAutoSave, this, relation );

        relation.parent.$save( this.saveParentCascade, this.saveParentOptions );
      }
    }
  },

  handleModel: function(relation, remoteData, ignoreLoaded)
  {
    return function (related)
    {
      var pending = relation.pending;
      var key = related.$key();

      if ( key in pending || ignoreLoaded )
      {
        Rekord.debug( this.debugInitialGrabbed, this, relation, related );

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
      Rekord.debug( this.debugSort, this, relation );

      related.sort( this.comparator );

      relation.parent.$trigger( Model.Events.RelationUpdate, [this, relation] );
    }
  }

});

function BelongsTo()
{
}

Rekord.Relations.belongsTo = BelongsTo;

BelongsTo.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 true,
  autoCascade:          Cascade.All,
  autoOptions:          null,
  property:             true,
  preserve:             true,
  clearKey:             true,
  dynamic:              false,
  local:                null,
  cascade:              Cascade.Local,
  cascadeRemoveOptions: null,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.extend( RelationSingle, BelongsTo,
{

  type: 'belongsTo',

  debugInit:          Rekord.Debugs.BELONGSTO_INIT,
  debugClearModel:    Rekord.Debugs.BELONGSTO_CLEAR_MODEL,
  debugSetModel:      Rekord.Debugs.BELONGSTO_SET_MODEL,
  debugLoaded:        Rekord.Debugs.BELONGSTO_LOADED,
  debugClearKey:      Rekord.Debugs.BELONGSTO_CLEAR_KEY,
  debugUpdateKey:     Rekord.Debugs.BELONGSTO_UPDATE_KEY,
  debugQuery:         Rekord.Debugs.BELONGSTO_QUERY,
  debugQueryResults:  Rekord.Debugs.BELONGSTO_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return BelongsTo.Defaults;
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      related: null,
      loaded: false,

      onRemoved: function()
      {
        Rekord.debug( Rekord.Debugs.BELONGSTO_NINJA_REMOVE, this, model, relation );

        model.$remove( this.cascade, this.cascadeRemoveOptions );
        this.clearRelated( relation, false, true );
      },

      onSaved: function()
      {
        Rekord.debug( Rekord.Debugs.BELONGSTO_NINJA_SAVE, this, model, relation );

        if ( !relation.isRelated( relation.related ) )
        {
          this.clearRelated( relation, false, true );
        }
      }
    };

    model.$on( Model.Events.PostRemove, this.postRemove, this );
    model.$on( Model.Events.KeyUpdate, this.onKeyUpdate, this );

    if ( isEmpty( initialValue ) )
    {
      initialValue = this.grabInitial( model, this.local );

      if ( initialValue )
      {
        Rekord.debug( Rekord.Debugs.BELONGSTO_INITIAL_PULLED, this, model, initialValue );
      }
    }

    if ( !isEmpty( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.BELONGSTO_INITIAL, this, model, initialValue );

      this.grabModel( initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  }),

  sync: function(model, removeUnrelated)
  {
    var relation = model.$relations[ this.name ];
    var relatedValue = this.grabInitial( model, this.local );
    var remoteData = true;
    var ignoreLoaded = true;
    var dontClear = true;

    if ( relation )
    {
      if ( !isEmpty( relatedValue ) )
      {
        this.grabModel( relatedValue, this.handleModel( relation, remoteData, ignoreLoaded ), remoteData );
      }
      else if ( removeUnrelated )
      {
        this.clearRelated( relation, remoteData, dontClear );
      }
    }
  },

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      Rekord.debug( Rekord.Debugs.BELONGSTO_POSTREMOVE, this, model, relation );

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
        this.clearModel( relation, false, true );
        this.setModel( relation, related );
        this.setProperty( relation );
      }
    }
  }

});

function HasOne()
{
}

Rekord.Relations.hasOne = HasOne;

HasOne.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  saveCascade:          Cascade.All,
  saveOptions:          null,
  auto:                 true,
  autoCascade:          Cascade.All,
  autoOptions:          null,
  property:             true,
  preserve:             true,
  clearKey:             true,
  dynamic:              false,
  local:                null,
  cascade:              Cascade.All,
  cascadeRemoveOptions: null,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.extend( RelationSingle, HasOne,
{

  type: 'hasOne',

  debugInit:          Rekord.Debugs.HASONE_INIT,
  debugClearModel:    Rekord.Debugs.HASONE_CLEAR_MODEL,
  debugSetModel:      Rekord.Debugs.HASONE_SET_MODEL,
  debugLoaded:        Rekord.Debugs.HASONE_LOADED,
  debugClearKey:      Rekord.Debugs.HASONE_CLEAR_KEY,
  debugUpdateKey:     Rekord.Debugs.HASONE_UPDATE_KEY,
  debugQuery:         Rekord.Debugs.HASONE_QUERY,
  debugQueryResults:  Rekord.Debugs.HASONE_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return HasOne.Defaults;
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      related: null,
      loaded: false,
      dirty: false,
      saving: false,
      child: equals( this.local, model.$db.key ),

      onRemoved: function()
      {
        Rekord.debug( Rekord.Debugs.HASONE_NINJA_REMOVE, this, model, relation );

        this.clearRelated( relation, false, true );
      }
    };

    model.$on( Model.Events.PreSave, this.preSave, this );
    model.$on( Model.Events.PostRemove, this.postRemove, this );

    if ( isEmpty( initialValue ) )
    {
      initialValue = this.grabInitial( model, this.local );

      if ( initialValue )
      {
        Rekord.debug( Rekord.Debugs.HASONE_INITIAL_PULLED, this, model, initialValue );
      }
    }

    if ( !isEmpty( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASONE_INITIAL, this, model, initialValue );

      this.populateInitial( initialValue, relation, model );
      this.grabModel( initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  }),

  populateInitial: function(initialValue, relation, model)
  {
    if ( isObject( initialValue ) && relation.child )
    {
      var src = toArray( this.local );
      var dst = toArray( this.model.Database.key );

      for (var k = 0; k < src.length; k++)
      {
        initialValue[ dst[ k ] ] = model[ src[ k ] ];
      }
    }
  },

  sync: function(model, removeUnrelated)
  {
    var relation = model.$relations[ this.name ];
    var relatedValue = this.grabInitial( model, this.local );
    var remoteData = true;
    var ignoreLoaded = true;
    var dontClear = true;

    if ( relation )
    {
      if ( !isEmpty( relatedValue ) )
      {
        this.populateInitial( relatedValue, relation, model );
        this.grabModel( relatedValue, this.handleModel( relation, remoteData, ignoreLoaded ), remoteData );
      }
      else if ( removeUnrelated )
      {
        this.clearRelated( relation, remoteData, dontClear );
      }
    }
  },

  isDependent: function(relation, related)
  {
    return !relation.child;
  },

  preClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      var relatedClone = related.$clone( properties );

      updateFieldsReturnChanges( clone, this.local, relatedClone, relatedClone.$db.key );

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
        Rekord.debug( Rekord.Debugs.HASONE_PRESAVE, this, model, relation );

        relation.saving = true;

        related.$save( this.saveCascade, this.saveOptions );

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
        Rekord.debug( Rekord.Debugs.HASONE_POSTREMOVE, this, model, relation );

        this.clearModel( relation );
      }
    }
  },

  clearModel: function(relation, remoteData)
  {
    var related = relation.related;

    if ( related )
    {
      Rekord.debug( this.debugClearModel, this, relation );

      related.$off( Model.Events.Removed, relation.onRemoved );

      if ( this.cascade && !related.$isDeleted() )
      {
        related.$remove( this.cascade, this.cascadeRemoveOptions );
      }

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;

      relation.parent.$dependents.remove( related );

      if ( this.clearKey )
      {
        this.clearForeignKey( relation.parent, remoteData );
      }
    }
  }

});

function HasMany()
{
}

Rekord.Relations.hasMany = HasMany;

HasMany.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 true,
  autoCascade:          Cascade.All,
  autoOptions:          null,
  property:             true,
  preserve:             true,
  clearKey:             true,
  dynamic:              false,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  listenForRelated:     true,
  loadRelated:          true,
  where:                false,
  saveParentCascade:    Cascade.All,
  saveParentOptions:    null,
  cascadeRemove:        Cascade.Local,
  cascadeRemoveOptions: null,
  cascadeSave:          Cascade.None,
  cascadeSaveOptions:   null,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.extend( RelationMultiple, HasMany,
{

  type: 'hasMany',

  debugAutoSave:        Rekord.Debugs.HASMANY_AUTO_SAVE,
  debugInitialGrabbed:  Rekord.Debugs.HASMANY_INITIAL_GRABBED,
  debugSort:            Rekord.Debugs.HASMANY_SORT,
  debugQuery:           Rekord.Debugs.HASMANY_QUERY,
  debugQueryResults:    Rekord.Debugs.HASMANY_QUERY_RESULTS,
  debugUpdateKey:       Rekord.Debugs.HASMANY_UPDATE_KEY,

  getDefaults: function(database, field, options)
  {
    return HasMany.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.foreign = this.foreign || ( database.name + '_' + database.key );
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    Rekord.debug( Rekord.Debugs.HASMANY_INIT, this );

    this.finishInitialization();
  },

  load: Gate(function(model, initialValue, remoteData)
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
        Rekord.debug( Rekord.Debugs.HASMANY_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true, true );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Rekord.debug( Rekord.Debugs.HASMANY_NINJA_SAVE, relator, model, this, relation );

        if ( !relation.isRelated( this ) )
        {
          relator.removeModel( relation, this, false, true );
        }
        else
        {
          relator.sort( relation );
          relator.checkSave( relation );
        }
      },

      onChange: function()
      {
        if ( relation.saving )
        {
          return;
        }

        if ( relator.where && !relator.where( this ) )
        {
          relator.removeModel( relation, this, false, true );
        }
      }

    };

    model.$on( Model.Events.PostSave, this.postSave, this );
    model.$on( Model.Events.PreRemove, this.preRemove, this );

    // When models are added to the related database, check if it's related to this model
    if ( this.listenForRelated )
    {
      this.listenToModelAdded( this.handleModelAdded( relation ) );
    }

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_INITIAL, this, model, relation, initialValue );

      this.grabModels( relation, initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
    else if ( this.loadRelated )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_INITIAL_PULLED, this, model, relation );

      this.ready( this.handleLazyLoad( relation ) );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  }),

  sync: function(model, removeUnrelated)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      var existing = relation.related;
      var remoteData = true;
      var dontClear = true;
      var relator = this;

      var onRelated = function(related)
      {
        if ( removeUnrelated )
        {
          var given = this.createCollection();
          given.reset( related );

          existing.each(function(existingModel)
          {
            if ( !given.has( existingModel.$key() ) )
            {
              relator.removeModel( relation, existingModel, remoteData, dontClear );
            }
          });
        }
      };

      this.ready( this.handleLazyLoad( relation, onRelated ) );
    }
  },

  postClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      var relatedClones = [];

      updateFieldsReturnChanges( properties, this.foreign, clone, model.$db.key );

      properties[ this.foreign ] = clone[ model.$db.key ];

      for (var i = 0; i < related.length; i++)
      {
        relatedClones.push( related[ i ].$clone( properties ) );
      }

      clone[ this.name ] = relatedClones;
    }
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeSave )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_POSTSAVE, this, model, relation );

      batchExecute(function()
      {
        relation.saving = true;
        relation.delaySaving = true;

        var models = relation.related;

        for (var i = 0; i < models.length; i++)
        {
          var related = models[ i ];

          if ( !related.$isDeleted() && related.$hasChanges() )
          {
            related.$save( this.cascadeSave, this.cascadeSaveOptions );
          }
        }

        relation.saving = false;
        relation.delaySaving = false;

      }, this );
    }
  },

  preRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeRemove )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_PREREMOVE, this, model, relation );

      batchExecute(function()
      {
        this.bulk( relation, function()
        {
          var models = relation.related;

          for (var i = models.length - 1; i >= 0; i--)
          {
            var related = models[ i ];

            related.$remove( this.cascadeRemove, this.cascadeRemoveOptions );
          }
        });

      }, this );
    }
  },

  handleModelAdded: function(relation)
  {
    return function (related, remoteData)
    {
      if ( relation.isRelated( related ) )
      {
        Rekord.debug( Rekord.Debugs.HASMANY_NINJA_ADD, this, relation, related );

        this.addModel( relation, related, remoteData );
      }
    };
  },

  handleLazyLoad: function(relation, onRelated)
  {
    return function (relatedDatabase)
    {
      var related = relatedDatabase.filter( relation.isRelated );

      Rekord.debug( Rekord.Debugs.HASMANY_LAZY_LOAD, this, relation, related );

      if ( onRelated )
      {
        onRelated.call( this, related );
      }

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
    if ( related.$isDeleted() || (this.where && !this.where( related ) ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_ADD, this, relation, related );

      target.put( key, related );

      related.$on( Model.Events.Removed, relation.onRemoved );
      related.$on( Model.Events.SavedRemoteUpdate, relation.onSaved );

      if ( this.where )
      {
        related.$on( Model.Events.Change, relation.onChange );
      }

      related.$dependents.add( model, this );

      this.updateForeignKey( related, model, remoteData );

      this.sort( relation );
      this.checkSave( relation, remoteData );
    }

    return adding;
  },

  removeModel: function(relation, related, remoteData, dontClear)
  {
    if ( !this.canRemoveRelated( related, remoteData ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var pending = relation.pending;
    var key = related.$key();
    var removing = target.has( key );

    if ( removing )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( Model.Events.Removed, relation.onRemoved );
      related.$off( Model.Events.SavedRemoteUpdate, relation.onSaved );
      related.$off( Model.Events.Change, relation.onChange );

      related.$dependents.remove( model );

      if ( !dontClear )
      {
        if ( this.clearKey )
        {
          this.clearForeignKey( related, remoteData );
        }

        if ( this.cascadeRemove )
        {
          if ( remoteData )
          {
            if ( canCascade( this.cascadeRemove, Cascade.Local ) )
            {
              related.$remove( Cascade.Local );
            }
          }
          else
          {
            related.$remove( this.cascadeRemove, this.cascadeRemoveOptions );
          }
        }
      }

      this.sort( relation );
      this.checkSave( relation, remoteData );
    }

    delete pending[ key ];

    return removing;
  },

  isRelatedFactory: function(model)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    return function(related)
    {
      return propsMatch( related, foreign, model, local );
    };
  },

  getTargetFields: function(target)
  {
    return this.foreign;
  }

});

function HasManyThrough()
{
}

Rekord.Relations.hasManyThrough = HasManyThrough;

HasManyThrough.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 true,
  autoCascade:          Cascade.All,
  autoOptions:          null,
  property:             true,
  dynamic:              false,
  through:              undefined,
  local:                null,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  listenForRelated:     true,
  loadRelated:          true,
  where:                false,
  cascadeRemove:        Cascade.NoRest,
  cascadeSave:          Cascade.All,
  cascadeSaveOptions:   null,
  cascadeSaveRelated:   Cascade.None,
  cascadeSaveRelatedOptions: null,
  saveParentCascade:    Cascade.All,
  saveParentOptions:    null,
  cascadeRemoveThroughOptions: null,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.extend( RelationMultiple, HasManyThrough,
{

  type: 'hasManyThrough',

  debugAutoSave:        Rekord.Debugs.HASMANYTHRU_AUTO_SAVE,
  debugInitialGrabbed:  Rekord.Debugs.HASMANYTHRU_INITIAL_GRABBED,
  debugSort:            Rekord.Debugs.HASMANYTHRU_SORT,
  debugQuery:           Rekord.Debugs.HASMANYTHRU_QUERY,
  debugQueryResults:    Rekord.Debugs.HASMANYTHRU_QUERY_RESULTS,
  debugUpdateKey:       Rekord.Debugs.HASMANYTHRU_UPDATE_KEY,

  getDefaults: function(database, field, options)
  {
    return HasManyThrough.Defaults;
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

    if ( !isRekord( options.through ) )
    {
      Rekord.get( options.through ).complete( this.setThrough, this );
    }
    else
    {
      this.setThrough( options.through );
    }

    Rekord.debug( Rekord.Debugs.HASMANYTHRU_INIT, this );
  },

  setThrough: function(through)
  {
    this.through = through;

    this.finishInitialization();
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relator = this;
    var throughDatabase = this.through.Database;

    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      pending: {},
      related: this.createRelationCollection( model ),
      throughs: new Map(),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Rekord.debug( Rekord.Debugs.HASMANYTHRU_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Rekord.debug( Rekord.Debugs.HASMANYTHRU_NINJA_SAVE, relator, model, this, relation );

        relator.sort( relation );
        relator.checkSave( relation );
      },

      onChange: function()
      {
        if ( relation.saving )
        {
          return;
        }

        if ( relator.where && !relator.where( this ) )
        {
          relator.removeModel( relation, this );
        }
      },

      onThroughRemoved: function() // this = through removed
      {
        Rekord.debug( Rekord.Debugs.HASMANYTHRU_NINJA_THRU_REMOVE, relator, model, this, relation );

        relator.removeModelFromThrough( relation, this );
      }

    };

    // Populate the model's key if it's missing
    model.$on( Model.Events.PostSave, this.postSave, this );
    model.$on( Model.Events.PreRemove, this.preRemove, this );

    // When models are added to the related database, check if it's related to this model
    if ( this.listenForRelated )
    {
      throughDatabase.on( Database.Events.ModelAdded, this.handleModelAdded( relation ), this );
    }

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_INITIAL, this, model, relation, initialValue );

      this.grabModels( relation, initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
    else if ( this.loadRelated )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_INITIAL_PULLED, this, model, relation );

      throughDatabase.ready( this.handleLazyLoad( relation ), this );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  }),

  sync: function(model, removeUnrelated)
  {
    var throughDatabase = this.through.Database;
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      var existing = relation.throughs.values;
      var remoteData = true;
      var relator = this;

      var onRelated = function(throughs)
      {
        if ( removeUnrelated )
        {
          var given = this.createCollection();
          given.reset( throughs );

          for (var i = 0; i < existing.length; i++)
          {
            var existingThrough = existing[ i ];

            if ( !given.has( existingThrough.$key() ) )
            {
              relator.removeModelFromThrough( relation, existingThrough, remoteData );
            }
          }
        }
      };

      throughDatabase.ready( this.handleLazyLoad( relation, onRelated ), this );
    }
  },

  preClone: function(model, clone, properties)
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

    batchExecute(function()
    {
      if ( relation && this.cascadeSave )
      {
        var throughs = relation.throughs.values;

        for (var i = 0; i < throughs.length; i++)
        {
          var through = throughs[ i ];

          if ( !through.$isDeleted() && through.$hasChanges() )
          {
            through.$save( this.cascadeSave, this.cascadeSaveOptions );
          }
        }
      }

      if ( relation && this.cascadeSaveRelated )
      {
        Rekord.debug( Rekord.Debugs.HASMANYTHRU_PRESAVE, this, model, relation );

        relation.saving = true;
        relation.delaySaving = true;

        var models = relation.related;

        for (var i = 0; i < models.length; i++)
        {
          var related = models[ i ];

          if ( !related.$isDeleted() && related.$hasChanges() )
          {
            related.$save( this.cascadeSaveRelated, this.cascadeSaveRelatedOptions );
          }
        }

        relation.saving = false;
        relation.delaySaving = false;
      }

    }, this );
  },

  preRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeRemove )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_PREREMOVE, this, model, relation );

      batchExecute(function()
      {
        this.bulk( relation, function()
        {
          var throughs = relation.throughs.values;

          for (var i = 0; i < throughs.length; i++)
          {
            var through = throughs[ i ];

            through.$remove( this.cascadeRemove, this.cascadeRemoveThroughOptions );
          }
        });

      }, this );
    }
  },

  handleModelAdded: function(relation)
  {
    return function (through, remoteData)
    {
      if ( relation.isRelated( through ) && !relation.throughs.has( through.$key() ) )
      {
        Rekord.debug( Rekord.Debugs.HASMANYTHRU_NINJA_ADD, this, relation, through );

        this.addModelFromThrough( relation, through, remoteData );
      }
    };
  },

  handleLazyLoad: function(relation, onRelated)
  {
    return function (throughDatabase)
    {
      var throughs = throughDatabase.filter( relation.isRelated );

      Rekord.debug( Rekord.Debugs.HASMANYTHRU_LAZY_LOAD, this, relation, throughs );

      if ( onRelated )
      {
        onRelated.call( this, throughs );
      }

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
    if ( related.$isDeleted() || (this.where && !this.where( related ) ) )
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
    var relatedKey = relatedDatabase.keyHandler.buildKey( through, this.foreign );

    relatedDatabase.grabModel( relatedKey, this.onAddModelFromThrough( relation, through, remoteData ), this, remoteData );
  },

  onAddModelFromThrough: function(relation, through, remoteData)
  {
    return function onAddModelFromThrough(related)
    {
      if ( related && ( !this.where || this.where( related ) ) )
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
    var added = !throughs.has( throughKey );

    if ( added )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_THRU_ADD, this, relation, through );

      throughs.put( throughKey, through );

      through.$on( Model.Events.Removed, relation.onThroughRemoved );

      through.$dependents.add( model, this );

      if ( !remoteData && this.cascadeSave )
      {
        if ( model.$isSaved() )
        {
          through.$save( this.cascadeSave, this.cascadeSaveOptions );
        }
        else
        {
          through.$save( Cascade.None );
        }
      }
    }

    return added;
  },

  finishAddModel: function(relation, related, remoteData)
  {
    var relateds = relation.related;
    var relatedKey = related.$key();
    var adding = !relateds.has( relatedKey );

    if ( adding )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_ADD, this, relation, related );

      relateds.put( relatedKey, related );

      related.$on( Model.Events.Removed, relation.onRemoved );
      related.$on( Model.Events.SavedRemoteUpdate, relation.onSaved );

      if ( this.where )
      {
        related.$on( Model.Events.Change, relation.onChange );
      }

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
    var key = throughDatabase.keyHandler.getKey( keyObject );
    var throughs = relation.throughs;
    var through = throughs.get( key );

    return this.finishRemoveThrough( relation, through, related, true, remoteData );
  },

  removeModelFromThrough: function(relation, through, remoteData)
  {
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.keyHandler.buildKey( through, this.foreign );

    if ( this.finishRemoveThrough( relation, through, undefined, undefined, remoteData ) )
    {
      this.finishRemoveRelated( relation, relatedKey, remoteData );
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

      Rekord.debug( Rekord.Debugs.HASMANYTHRU_THRU_REMOVE, this, relation, through, related );

      var throughs = relation.throughs;
      var throughKey = through.$key();

      through.$off( Model.Events.Removed, relation.onThroughRemoved );

      through.$dependents.remove( model );

      if ( callRemove )
      {
        through.$remove( remoteData ? Cascade.Local : Cascade.All, this.cascadeRemoveThroughOptions );
      }

      throughs.remove( throughKey );
    }

    return removing;
  },

  finishRemoveRelated: function(relation, relatedKey, remoteData)
  {
    var pending = relation.pending;
    var relateds = relation.related;
    var related = relateds.get( relatedKey );

    if ( related )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_REMOVE, this, relation, related );

      relateds.remove( relatedKey );

      related.$off( Model.Events.Removed, relation.onRemoved );
      related.$off( Model.Events.SavedRemoteUpdate, relation.onSaved );
      related.$off( Model.Events.Change, relation.onChange );

      this.sort( relation );
      this.checkSave( relation, remoteData );
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
    var modelKeys = model.$db.keyHandler;
    var relatedKeys = this.model.Database.keyHandler;
    var throughDatabase = this.through.Database;
    var throughKey = throughDatabase.key;
    var key = {};

    for (var i = 0; i < throughKey.length; i++)
    {
      var prop = throughKey[ i ];

      modelKeys.setKeyField( key, prop, related, this.foreign );
      relatedKeys.setKeyField( key, prop, model, this.local );
    }

    return key;
  },

  getTargetFields: function(target)
  {
    return this.local;
  }

});

function HasRemote()
{
}

Rekord.Relations.hasRemote = HasRemote;

HasRemote.Defaults =
{
  model:                undefined,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 false,
  property:             true,
  dynamic:              false,
  comparator:           null,
  comparatorNullsFirst: false,
  where:                false,
  autoRefresh:          false // Model.Events.RemoteGets
};

Class.extend( RelationMultiple, HasRemote,
{

  type: 'hasRemote',

  debugSort:            Rekord.Debugs.HASREMOTE_SORT,
  debugQuery:           Rekord.Debugs.HASREMOTE_QUERY,
  debugQueryResults:    Rekord.Debugs.HASREMOTE_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return HasRemote.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    Rekord.debug( Rekord.Debugs.HASREMOTE_INIT, this );

    this.finishInitialization();
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relator = this;
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      pending: {},
      related: this.createRelationCollection( model ),
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Rekord.debug( Rekord.Debugs.HASREMOTE_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        Rekord.debug( Rekord.Debugs.HASREMOTE_NINJA_SAVE, relator, model, this, relation );

        relator.sort( relation );
        relator.checkSave( relation );
      },

      onChange: function()
      {
        if ( relation.saving )
        {
          return;
        }

        if ( relator.where && !relator.where( this ) )
        {
          relator.removeModel( relation, this, true );
        }
      }

    };

    // Populate the model's key if it's missing
    model.$key();

    // If auto refresh was specified, execute the query on refresh
    if ( this.autoRefresh )
    {
      model.$on( this.autoRefresh, this.onRefresh( relation ), this );
    }

    // Execute query!
    relation.query = this.executeQuery( model );

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  }),

  onRefresh: function(relation)
  {
    return function handleRefresh()
    {
      relation.query = this.executeQuery( relation.parent );
    };
  },

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() || (this.where && !this.where( related ) ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_ADD, this, relation, related );

      target.put( key, related );

      related.$on( Model.Events.Removed, relation.onRemoved );
      related.$on( Model.Events.SavedRemoteUpdate, relation.onSaved );

      if ( this.where )
      {
        related.$on( Model.Events.Change, relation.onChange );
      }

      this.sort( relation );
      this.checkSave( relation, remoteData );
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
      Rekord.debug( Rekord.Debugs.HASMANY_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( Model.Events.Removed, relation.onRemoved );
      related.$off( Model.Events.SavedRemoteUpdate, relation.onSaved );
      related.$off( Model.Events.Change, relation.onChange );

      this.sort( relation );
      this.checkSave( relation, remoteData );
    }

    delete pending[ key ];
  }

});

function HasList()
{
}

Rekord.Relations.hasList = HasList;

HasList.Defaults =
{
  model:                undefined,
  lazy:                 false,
  store:                Store.Model,
  save:                 Save.Model,
  auto:                 false,
  property:             true,
  dynamic:              false,
  comparator:           null,
  comparatorNullsFirst: false
};

Class.extend( RelationMultiple, HasList,
{

  type: 'hasList',

  debugSort:            Rekord.Debugs.HASLIST_SORT,

  getDefaults: function(database, field, options)
  {
    return HasList.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    Rekord.debug( Rekord.Debugs.HASLIST_INIT, this );

    this.finishInitialization();
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relator = this;
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      pending: {},
      related: this.createRelationCollection( model ),
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Rekord.debug( Rekord.Debugs.HASLIST_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        Rekord.debug( Rekord.Debugs.HASLIST_NINJA_SAVE, relator, model, this, relation );

        relator.sort( relation );
        relator.checkSave( relation );
      }

    };

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASLIST_INITIAL, this, model, relation, initialValue );

      this.grabModels( relation, initialValue, this.handleModel( relation, remoteData ), remoteData );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  }),

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
      Rekord.debug( Rekord.Debugs.HASLIST_ADD, this, relation, related );

      target.put( key, related );

      related.$on( Model.Events.Removed, relation.onRemoved );
      related.$on( Model.Events.SavedRemoteUpdate, relation.onSaved );

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
      Rekord.debug( Rekord.Debugs.HASLIST_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( Model.Events.Removed, relation.onRemoved );
      related.$off( Model.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ key ];
  },

  postClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      var relatedClones = [];

      for (var i = 0; i < related.length; i++)
      {
        relatedClones.push( related[ i ].$clone() );
      }

      clone[ this.name ] = relatedClones;
    }
  }

});

function HasReference()
{
}

Rekord.Relations.hasReference = HasReference;

HasReference.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  property:             true,
  dynamic:              false
};

Class.extend( RelationSingle, HasReference,
{

  type: 'hasReference',

  debugInit:          Rekord.Debugs.HASREFERENCE_INIT,
  debugClearModel:    Rekord.Debugs.HASREFERENCE_CLEAR_MODEL,
  debugSetModel:      Rekord.Debugs.HASREFERENCE_SET_MODEL,
  debugLoaded:        Rekord.Debugs.HASREFERENCE_LOADED,
  debugQuery:         Rekord.Debugs.HASREFERENCE_QUERY,
  debugQueryResults:  Rekord.Debugs.HASREFERENCE_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return HasReference.Defaults;
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      related: null,
      loaded: false,
      dirty: false,

      onRemoved: function()
      {
        Rekord.debug( Rekord.Debugs.HASREFERENCE_NINJA_REMOVE, this, model, relation );

        this.clearRelated( relation, false, true );
      }
    };

    if ( !isEmpty( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASREFERENCE_INITIAL, this, model, initialValue );

      this.grabModel( initialValue, this.handleModel( relation ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  }),

  preClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      clone[ this.name ] = related.$clone( properties );
    }
  },

  isDependent: function(relation, related)
  {
    return false;
  },

  updateForeignKey: function()
  {
    // nothing
  },

  clearForeignKey: function()
  {
    // nothing
  },

});


var Polymorphic =
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

      Rekord.get( name ).complete( this.setDiscriminated( discriminator, handleLoaded ), this );
    }
  },

  setDiscriminated: function(discriminator, onLoad)
  {
    return function(rekord)
    {
      this.discriminators[ rekord.Database.name ] = discriminator;
      this.discriminators[ rekord.Database.className ] = discriminator;
      this.discriminatorToModel[ discriminator ] = rekord;

      onLoad.apply( this );
    };
  },

  createRelationCollection: function(model)
  {
    return DiscriminateCollection( RelationCollection.create( undefined, model, this ), this.discriminator, this.discriminatorToModel );
  },

  createCollection: function()
  {
    return DiscriminateCollection( ModelCollection.create(), this.discriminator, this.discriminatorToModel );
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

      model.Database.on( Database.Events.ModelAdded, callback, this );
    }
  },

  executeQuery: function(model)
  {
    var queryOption = this.query;
    var queryOptions = this.queryOptions;
    var queryData = this.queryData;
    var query = isString( queryOption ) ? format( queryOption, model ) : queryOption;
    var search = model.search( query, queryOptions );

    if ( isObject( queryData ) )
    {
      search.$set( queryData );
    }

    DiscriminateCollection( search.$results, this.discriminator, this.discriminatorToModel );

    var promise = search.$run();
    promise.complete( this.handleExecuteQuery( model ), this );

    return search;
  },

  parseModel: function(input, remoteData)
  {
    if ( input instanceof Model )
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
    var changes = clearFieldsReturnChanges( target, targetFields );

    if ( target[ this.discriminator ] )
    {
      target[ this.discriminator ] = null;
      changes = true;
    }

    if ( changes && !remoteData && this.auto && !target.$isNew() )
    {
      target.$save( this.autoCascade, this.autoOptions );
    }

    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields, remoteData)
  {
    var changes = updateFieldsReturnChanges( target, targetFields, source, sourceFields );

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
        target.$save( this.autoCascade, this.autoOptions );
      }

      target.$trigger( Model.Events.KeyUpdate, [target, source, targetFields, sourceFields] );
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
        var db = related.Database;
        var initial = {};

        initial[ discriminator ] = discriminatorValue;

        updateFieldsReturnChanges( initial, db.key, model, fields );

        return initial;
      }
    }
  },

  grabModel: function(input, callback, remoteData)
  {
    if ( input instanceof Model )
    {
      callback.call( this, input );
    }
    // At the moment I don't think this will ever work - if we are given a plain
    // object we can't really determine the related database.
    else if ( isObject( input ) )
    {
      var db = this.getDiscriminatorDatabase( input );

      if ( db !== false )
      {
        db.grabModel( input, callback, this, remoteData );
      }
    }
  },

  grabModels: function(relation, initial, callback, remoteData)
  {
    for (var i = 0; i < initial.length; i++)
    {
      var input = initial[ i ];

      if ( input instanceof Model )
      {
        relation.pending[ input.$key() ] = true;

        callback.call( this, input );
      }
      // At the moment I don't think this will ever work - if we are given a plain
      // object we can't really determine the related database.
      else if ( isObject( input ) )
      {
        var db = this.getDiscriminatorDatabase( input );

        if ( db )
        {
          var key = db.keyHandler.buildKeyFromInput( input );

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


Rekord.shard = function(methods)
{
  return function createRestSharding(database)
  {
    var shard = new Shard( database );

    Class.props( shard, methods );

    shard.initialize( database );

    return shard;
  };
};

function Shard(database)
{
  this.database = database;
}

Class.create( Shard,
{

  STATUS_FAIL_ALL: 500,
  STATUS_FAIL_GET: 500,
  STATUS_FAIL_CREATE: 500,
  STATUS_FAIL_UPDATE: 500,
  STATUS_FAIL_REMOVE: 500,
  STATUS_FAIL_QUERY: 500,

  ATOMIC_ALL: false,
  ATOMIC_GET: false,
  ATOMIC_CREATE: true,
  ATOMIC_UPDATE: true,
  ATOMIC_REMOVE: false,
  ATOMIC_QUERY: true,

  getShards: function(forRead)
  {
    throw 'getShards not implemented';
  },

  getShardForModel: function(model, forRead)
  {
    throw 'getShardForModel not implemented';
  },

  getShardsForModel: function(model, forRead)
  {
    var single = this.getShardForModel( model, forRead );

    return single ? [ single ] : this.getShards( forRead );
  },

  getShardsForQuery: function(url, query)
  {
    return this.getShards();
  },

  initialize: function(database)
  {

  },

  all: function(options, success, failure)
  {
    var shards = this.getShards( true );
    var all = [];

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.all( options, onShardSuccess, onShardFailure );
    }
    function onSuccess(models)
    {
      if ( isArray( models ) )
      {
        all.push.apply( all, models );
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful || (all.length && !this.ATOMIC_ALL) )
      {
        success( all );
      }
      else if ( !alreadyFailed )
      {
        failure( all, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_ALL );
      }
    }

    this.multiplex( shards, this.ATOMIC_ALL, invoke, onSuccess, failure, onComplete );
  },

  get: function(model, options, success, failure)
  {
    var shards = this.getShardsForModel( model, true );
    var gotten = null;

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.get( model, options, onShardSuccess, onShardFailure );
    }
    function onSuccess(data)
    {
      if ( gotten === null && isObject( data ) )
      {
        gotten = data;
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( gotten !== null )
      {
        success( gotten );
      }
      else
      {
        failure( gotten, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_GET );
      }
    }

    this.multiplex( shards, this.ATOMIC_GET, invoke, onSuccess, noop, onComplete );
  },

  create: function( model, encoded, options, success, failure )
  {
    var shards = this.getShardsForModel( model, false );
    var returned = null;

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.create( model, encoded, options, onShardSuccess, onShardFailure );
    }
    function onSuccess(data)
    {
      if ( returned === null && isObject( returned ) )
      {
        returned = data;
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful )
      {
        success( returned );
      }
      else
      {
        failure( returned, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_CREATE );
      }
    }

    this.multiplex( shards, this.ATOMIC_CREATE, invoke, onSuccess, noop, onComplete );
  },

  update: function( model, encoded, options, success, failure )
  {
    var shards = this.getShardsForModel( model, false );
    var returned = null;

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.update( model, encoded, options, onShardSuccess, onShardFailure );
    }
    function onSuccess(data)
    {
      if ( returned === null && isObject( returned ) )
      {
        returned = data;
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful )
      {
        success( returned );
      }
      else
      {
        failure( returned, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_UPDATE );
      }
    }

    this.multiplex( shards, this.ATOMIC_UPDATE, invoke, onSuccess, noop, onComplete );
  },

  remove: function( model, options, success, failure )
  {
    var shards = this.getShardsForModel( model, false );
    var returned = null;

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.remove( model, options, onShardSuccess, onShardFailure );
    }
    function onSuccess(data)
    {
      if ( returned === null && isObject( returned ) )
      {
        returned = data;
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful )
      {
        success( returned );
      }
      else
      {
        failure( returned, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_REMOVE );
      }
    }

    this.multiplex( shards, this.ATOMIC_REMOVE, invoke, onSuccess, noop, onComplete );
  },

  query: function( url, query, options, success, failure )
  {
    var shards = this.getShardsForQuery( url, query );
    var results = [];

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.query( url, query, options, onShardSuccess, onShardFailure );
    }
    function onSuccess(models)
    {
      if ( isArray( models ) )
      {
        results.push.apply( results, models );
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful || (results.length && !this.ATOMIC_QUERY) )
      {
        success( results );
      }
      else if ( !alreadyFailed )
      {
        failure( results, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_QUERY );
      }
    }

    this.multiplex( shards, this.ATOMIC_QUERY, invoke, onSuccess, noop, onComplete );
  },

  multiplex: function(shards, atomic, invoke, onSuccess, onFailure, onComplete)
  {
    var successful = true;
    var failureCalled = false;
    var failedStatus;
    var total = 0;

    function onShardComplete()
    {
      if ( ++total === shards.length )
      {
        onComplete.call( this, successful, failureCalled, failedStatus );
      }
    }
    function onShardSuccess(data)
    {
      if ( successful || !atomic )
      {
        onSuccess.apply( this, arguments );
      }

      onShardComplete();
    }
    function onShardFailure(data, status)
    {
      if ( successful )
      {
        successful = false;

        if ( atomic )
        {
          failureCalled = true;
          onFailure.apply( this, arguments );
        }
      }

      if ( isNumber( status ) && (failedStatus === undefined || status < failedStatus) )
      {
        failedStatus = status;
      }

      onShardComplete();
    }

    if ( !isArray( shards ) || shards.length === 0 )
    {
      onComplete.call( this, false, false, failedStatus );
    }
    else
    {
      for (var i = 0; i < shards.length; i++)
      {
        invoke.call( this, shards[ i ], onShardSuccess, onShardFailure );
      }
    }
  }

});

addPlugin(function(model, db, options)
{

  /**
   * Returns the reference to the collection which contains all saved models.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name', 'done']
   * });
   * var t0 = Task.create({name: 't0', done: true}); // saves
   * var t1 = new Task({name: 't1'});
   * Task.all(); // [t0]
   * ```
   *
   * @method all
   * @memberof Rekord.Model
   * @return {Rekord.ModelCollection} -
   *    The reference to the collection of models.
   */
  model.all = function()
  {
    return db.models;
  };
  
});

addPlugin(function(model, db, options)
{

  /**
   * Creates a collection of models.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name']
   * });
   * var t0 = Task.create({id: 34, name: 't0'});
   * var t1 = new Task({name: 't1'});
   * var t2 = {name: 't2'};
   *
   * var c = Task.collect( 34, t1, t2 ); // or Task.collect( [34, t1, t2] )
   * c; // [t0, t1, t2]
   * ```
   *
   * @method collect
   * @memberof Rekord.Model
   * @param {modelInput[]|...modelInput} models -
   *    The array of models to to return as a collection.
   * @return {Rekord.ModelCollection} -
   *    The collection created.
   */
  model.array = function(a)
  {
    var models = arguments.length > 1 || !isArray(a) ?
      AP.slice.call( arguments ) : a;

    return ModelCollection.native( db, models );
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Returns the model at the given index.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name', 'done']
   * });
   * var t0 = Task.create({name: 't0', done: true}); // saves
   * var t1 = new Task({name: 't1'});
   * Task.at( 0 ); // t0
   * ```
   *
   * @method at
   * @memberof Rekord.Model
   * @param {Number} index -
   *    The index of the model to return.
   * @return {Rekord.Model} -
   *    The reference to the model at the given index.
   */
  model.at = function(index)
  {
    return db.models[ index ];
  };

});

addPlugin(function(model, db, options)
{

  /**
   * Returns an instance of a model or model collection with remote data (from
   * the server). If the model(s) exist locally then the values passed in will
   * overwrite the current values of the models. This is typically used to
   * bootstrap data from the server in your webpage.
   *
   * ```javascript
   * var User = Rekord({
   *   fields: ['name', 'email']
   * });
   * var currentUser = User.boot({
   *   id: 1234,
   *   name: 'Administrator',
   *   email: 'rekordjs@gmail.com'
   * });
   * var friends = User.boot([
   *   { id: 'c1', name: 'Cat 1', email: 'cat1@gmail.com' },
   *   { id: 'c2', name: 'Cat 2', email: 'cat2@gmail.com' }
   * ]);
   * ```
   *
   * @method boot
   * @memberof Rekord.Model
   * @param {modelInput[]|Object}
   * @return {Rekord.ModelCollection|Rekord.Model} -
   *    The collection or model bootstrapped.
   */
  model.boot = function( input )
  {
    if ( isArray( input ) )
    {
      return ModelCollection.create( db, input, true );
    }
    else if ( isObject( input ) )
    {
      return db.putRemoteData( input );
    }

    return input;
  };
});

addPlugin(function(model, db, options)
{
  
  model.clear = function(removeListeners)
  {
    return db.clear( removeListeners );
  };

});

addPlugin(function(model, db, options)
{

  /**
   * Creates a collection of models.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name']
   * });
   * var t0 = Task.create({id: 34, name: 't0'});
   * var t1 = new Task({name: 't1'});
   * var t2 = {name: 't2'};
   *
   * var c = Task.collect( 34, t1, t2 ); // or Task.collect( [34, t1, t2] )
   * c; // [t0, t1, t2]
   * ```
   *
   * @method collect
   * @memberof Rekord.Model
   * @param {modelInput[]|...modelInput} models -
   *    The array of models to to return as a collection.
   * @return {Rekord.ModelCollection} -
   *    The collection created.
   */
  model.collect = function(a)
  {
    var models = arguments.length > 1 || !isArray(a) ?
      AP.slice.call( arguments ) : a;

    return ModelCollection.create( db, models );
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Counts the number of models which pass the given where expression.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name', 'done']
   * });
   * var t0 = Task.create({name: 't0', done: true}); // saves
   * var t1 = Task.create({name: 't1', done: false});
   * Task.count('done', true); // 1
   * ```
   *
   * @method count
   * @memberof Rekord.Model
   * @return {Number} -
   *    The number of models which pass the given where expression.
   */
  model.count = function(properties, value, equals)
  {
    return db.models.countWhere( properties, value, equals );
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Creates a model instance, saves it, and returns it.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name'],
   *  defaults: {
   *    name: 'New Task'
   *  }
   * });
   * var t0 = Task.create({id: 34, name: 't0'});
   * var t1 = Task.create({name: 't1'}); // id generated with uuid
   * var t2 = Task.create(); // name populated with default 'New Task'
   * ```
   *
   * @method create
   * @memberof Rekord.Model
   * @param {Object} [props] -
   *    The initial values for the new model - if any.
   * @param {Number} [cascade] -
   *    Which operations should be performed out of: store, rest, & live.
   * @param {Any} [options] -
   *    The options to pass to the REST service.
   * @return {Rekord.Model} -
   *    The saved model instance.
   */
  model.create = function( props, cascade, options )
  {
    var instance = isObject( props ) ?
      db.createModel( props ) :
      db.instantiate();

    instance.$save( cascade, options );

    return instance;
  };
});

addPlugin(function(model, db, options)
{
  var dynamics = collapse( options.dynamic, Defaults.dynamic );

  if ( !isEmpty( dynamics ) )
  {
    for ( var property in dynamics )
    {
      addDynamicProperty( model.prototype, property, dynamics[ property ] );
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

      this.$after( Model.Events.Changes, handleChange, this );
    };
  }
}

addPlugin(function(model, db, options)
{
  var events = collapse( options.events, Defaults.events );

  if ( !isEmpty( events ) )
  {
    var modelEvents = [];
    var databaseEvents = [];

    for ( var eventType in events )
    {
      var callback = events[ eventType ];
      var eventName = toCamelCase( eventType );

      var databaseEventString = Database.Events[ eventName ];
      var modelEventString = Model.Events[ eventName ];

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
      Class.replace( model, '$init', function($init)
      {
        return function()
        {
          $init.apply( this, arguments );

          applyEventListeners( this, modelEvents );
        };
      });
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

addPlugin(function(model, db, options)
{
  var extend = options.extend || Defaults.extend;

  if ( !isRekord( extend ) )
  {
    return;
  }

  var defaults = Defaults;
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
  tryOverwrite( 'load' );
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

  db.rest   = Rekord.rest( db );
  db.store  = Rekord.store( db );
  db.live   = Rekord.live( db );

});

addPlugin(function(model, db, options)
{

  /**
   * Gets the local model matching the given input (or creates one) and loads
   * it from the remote source ({@link Rekord.rest}). If `callback` is specified
   * then it is invoked with the instance once it's loaded.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var t0 = Task.fetch( 34, function(task) {
   *   task; // {id: 34 name: 'Remotely Loaded'}
   * });
   * t0; // {id: 34} until remotely loaded
   * ```
   *
   * @method fetch
   * @memberof Rekord.Model
   * @param {modelInput} input -
   *    The model input used to determine the key and load the model.
   * @param {Any} [options] -
   *    The options to pass to the REST service.
   * @param {Function} [callback] -
   *    The function to invoke passing the reference of the model once it's
   *    successfully remotely loaded.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.Model} -
   *    The model instance.
   */
  model.fetch = function( input, options, callback, context )
  {
    var key = db.keyHandler.buildKeyFromInput( input );
    var instance = db.get( key );

    if ( !instance )
    {
      instance = db.keyHandler.buildObjectFromKey( key );

      if ( isObject( input ) )
      {
        instance.$set( input );
      }
    }

    if ( isFunction( callback ) )
    {
      var callbackContext = context || this;

      instance.$once( Model.Events.RemoteGets, function()
      {
        callback.call( callbackContext, instance );
      });
    }

    instance.$refresh( Cascade.Rest, options );

    return instance;
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Returns the collection of all local models and tries to reload them (and
   * any additional models returned) from a remote source ({@link Rekord.rest}).
   * If `callback` is specified then it is invoked with the collections all
   * models once it's loaded.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var tasks0 = Task.fetchAll( function(tasks1) {
   *   tasks0 // tasks1
   * });
   * ```
   *
   * @method fetchAll
   * @memberof Rekord.Model
   * @param {Function} [callback] -
   *    The function to invoke passing the reference of the model collection
   *    when it's successfully remotely loaded.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.ModelCollection} -
   *    The collection of all models of this type.
   */
  model.fetchAll = function(callback, context)
  {
    db.refresh( callback, context );

    return db.models;
  };
});

addPlugin(function(model, db, options)
{
  var files = options.files || Defaults.files;

  if ( !isObject( files ) )
  {
    return;
  }

  if ( !isFilesSupported() )
  {
    Rekord.trigger( Rekord.Events.FilesNotSupported );

    return;
  }

  for (var field in files)
  {
    var fieldOption = files[ field ];

    if ( isString( fieldOption ) )
    {
      fieldOption = {
        type: fieldOption
      };
    }

    db.decodings[ field ] = FileDecodings[ fieldOption.type ]( db, fieldOption );
    db.encodings[ field ] = FileEncoder;
  }
});

/**
files: {
  field: {
    type: 'text', // base64, dataURL, resource
    processor: 'processor_name',
    capacity: 1024 * 1024, // maximum bytes
    types: ['image/png', 'image/jpg', 'image/gif'], // acceptable MIME types
    autoSave: true,
    store: true,
    save: true
  }
}
**/

Rekord.fileProcessors = {};

Rekord.Events.FilesNotSupported = 'files-not-supported';
Rekord.Events.FileTooLarge = 'file-too-large';
Rekord.Events.FileWrongType = 'file-wrong-type';
Rekord.Events.FileOffline = 'file-offline';

// {
//  fileToValue(file, model, field, callback),
//  valueToUser(value, model, field, callback)
// }
Rekord.addFileProcessor = function(name, methods)
{
  Rekord.fileProcessors[ name ] = methods;
};

Rekord.fileProperties =
[
  'lastModifiedDate', 'name', 'size', 'type'
];

function isFilesSupported()
{
  return win.File && win.FileReader && win.FileList;
}

function toFile(input)
{
  if ( input instanceof win.File )
  {
    return input;
  }
  else if ( input instanceof win.Blob )
  {
    return input;
  }
  else if ( input instanceof win.FileList && input.length > 0 )
  {
    return input[0];
  }

  return false;
}

function convertNone(x)
{
  return x;
}

function convertBase64(x)
{
  var i = isString( x ) ? x.indexOf(';base64,') : -1;

  return i === -1 ? x : x.substring( i + 8 );
}

function trySave(model, options)
{
  if ( options.autoSave && model.$isSaved() )
  {
    model.$save();
  }
}

function putFileCache(model, property, value, file, options)
{
  model.$files = model.$files || {};
  model.$files[ property ] = {
    value: value,
    user: value,
    file: file,
    options: options
  };
}

function setFilesValue(processor, value, model, property, options)
{
  var result;
  var done = false;

  if ( processor && processor.valueToUser )
  {
    processor.valueToUser( value, model, property, function(user)
    {
      model.$files[ property ].user = user;

      if ( done )
      {
        model[ property ] = user;
        trySave( model, options );
      }
      else
      {
        result = user;
      }
    });
  }
  else
  {
    result = value;
  }

  done = true;

  return result;
}

function fileReader(method, converter, options)
{
  var processor = Rekord.fileProcessors[ options.processor ];

  if ( !(method in win.FileReader.prototype) )
  {
    Rekord.trigger( Rekord.Events.FilesNotSupported );
  }

  return function(input, model, property)
  {
    var file = toFile( input );

    if ( file !== false )
    {
      var reader = new win.FileReader();
      var result;
      var done = false;

      reader.onload = function(e)
      {
        var value = converter( e.target.result );

        putFileCache( model, property, value, file, options );

        result = setFilesValue( processor, value, model, property, options );

        if ( done )
        {
          model[ property ] = result;
          trySave( model, options );
        }
      };

      reader[ method ]( file );

      done = true;

      return result;
    }
    else if ( isObject( input ) && input.FILE )
    {
      var result;

      var setter = function(value)
      {
          result = value;
      };

      Rekord.trigger( Rekord.Events.FileOffline, [input, model, property, setter] );

      return result;
    }
    else
    {
      putFileCache( model, property, input, null, options );

      return setFilesValue( processor, input, model, property, options );
    }
  };
}

var FileDecodings =
{
  text: function(db, options)
  {
    return fileReader( 'readAsText', convertNone, options );
  },
  dataURL: function(db, options)
  {
    return fileReader( 'readAsDataURL', convertNone, options );
  },
  base64: function(db, options)
  {
    return fileReader( 'readAsDataURL', convertBase64, options );
  },
  resource: function(db, options)
  {
    return function(input, model, property)
    {
      var file = toFile( input );
      var processor = Rekord.fileProcessors[ options.processor ];

      if ( !processor )
      {
        throw 'Processor required for resource files.';
      }

      if ( file !== false )
      {
        if ( isNumber( options.capacity ) && isNumber( file.size ) && file.size > options.capacity )
        {
          Rekord.trigger( Rekord.Events.FileTooLarge, [file, model, property] );

          return;
        }

        if ( isArray( options.types ) && isString( file.type ) && indexOf( options.types, file.type ) === false )
        {
          Rekord.trigger( Rekord.Events.FileWrongType, [file, model, property] );

          return;
        }

        var result;
        var done = false;

        processor.fileToValue( file, model, property, function(value)
        {
          putFileCache( model, property, value, file, options );

          result = setFilesValue( processor, value, model, property, options );

          if ( done )
          {
            model[ property ] = result;
            trySave( model, options );
          }
        });

        done = true;

        return result;
      }
      else if ( isObject( input ) && input.FILE )
      {
        Rekord.trigger( Rekord.Events.FileOffline, [input, model, property] );
      }
      else
      {
        putFileCache( model, property, input, null, options );

        return setFilesValue( processor, input, model, property, options );
      }
    };
  }
};

function FileEncoder(input, model, field, forSaving)
{
  if ( model.$files && field in model.$files )
  {
    var cached = model.$files[ field ];

    if ( (forSaving && cached.save === false) || (!forSaving && cached.store === false) )
    {
      return;
    }

    if ( !forSaving && cached.file )
    {
      var props = grab( cached.file, Rekord.fileProperties, false );

      props.FILE = true;

      return props;
    }

    if ( input === cached.user )
    {
      if ( forSaving && cached.file )
      {
        model.$once( Model.Events.RemoteSave, function()
        {
          delete cached.file;

          model.$addOperation( SaveLocal, Cascade.Local );
        });
      }

      return cached.value;
    }
  }

  return input;
}

addPlugin(function(model, db, options)
{

  model.filtered = function(whereProperties, whereValue, whereEquals)
  {
    return db.models.filtered( whereProperties, whereValue, whereEquals );
  };
});

addPlugin(function(model, db, options)
{
  model.first = model.find = function(whereProperties, whereValue, whereEquals)
  {
    return db.models.firstWhere( whereProperties, whereValue, whereEquals );
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Finds or creates a model instance based on the given values. The key for
   * the model must be derivable from the given values - or this function will
   * always create a new model instance.
   *
   * ```javascript
   * var ListItem = Rekord({
   *  key: ['list_id', 'iten_id'],
   *  fields: ['quantity'],
   *  belongsTo: {
   *    list: { model: 'list' },
   *    item: { model: 'item' }
   *  }
   * });
   *
   * var listItem = ListItem.findOrCreate({
   *  list: someList,
   *  item: someItem,
   *  quantity: 23
   * });
   * // do stuff with listItem
   * ```
   *
   * @method persist
   * @memberof Rekord.Model
   * @param {Object} [input] -
   *    The values to set in the model instance found or created.
   * @param {Number} [cascade] -
   *    Which operations should be performed out of: store, rest, & live.
   * @param {Any} [options] -
   *    The options to pass to the REST service.
   * @return {Rekord.Model} -
   *    The saved model instance or undefined if the model database has not
   *    finished loading.
   */
  model.findOrCreate = function( input, cascade, options, callback, context )
  {
    var callbackContext = context || this;
    var instance = db.get( input );
    var created = false;

    if ( !instance )
    {
      db.grabModel( input, function(grabbed)
      {
        if ( !grabbed )
        {
          instance = model.create( input, cascade, options );
          created = true;
        }
        else
        {
          instance = grabbed;
          instance.$set( input );

          // grab model created an instance that needs to be "created"
          if ( !instance.$isSaved() )
          {
            instance.$save( cascade, options );
          }
        }

        if ( callback )
        {
          callback.call( callbackContext, instance, created );
        }
      });
    }
    else
    {
      instance.$set( input );

      if ( callback )
      {
        callback.call( callbackContext, instance, created );
      }
    }

    return instance;
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Returns the model instance identified with the given input. This includes
   * saved and unsaved models. If a `callback` is given the model will be passed
   * to the function. The `callback` method is useful for waiting for Rekord
   * to finish initializing (which includes loading models from local storage
   * followed by remote storage if configured) and returning a model instance.
   * If Rekord has finished initializing and the model doesn't exist locally
   * then it is fetched from the remoute source using {@link Rekord.rest}.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var t0 = Task.get( 34 ); // only looks at models currently loaded
   * var t1 = Task.get( 23, function(model) {
   *   model; // local or remotely loaded if it didn't exist locally - could be null if it doesn't exist at all
   * })
   * ```
   *
   * @method get
   * @memberof Rekord.Model
   * @param {modelInput} input -
   *    The model input used to determine the key and load the model.
   * @param {Function} [callback] -
   *    The function to invoke passing the reference of the model when it's
   *    successfully found.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.Model} -
   *    The model instance if `callback` is not given - or undefined if the
   *    input doesn't resolve to a model or `callback` is given.
   */
  model.get = function( input, callback, context )
  {
    if ( isFunction( callback ) )
    {
      db.grabModel( input, callback, context );
    }
    else
    {
      return db.get( input );
    }
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Gets the model instance identified with the given input and passes it to the
   * `callback` function. If Rekord is not finished initializing this function
   * will wait until it is and check for the model. If it still doesn't exist
   * locally it is loaded from a remote source using {@link Rekord.rest}. If the
   * model doesn't exist at all a null value will be returned to the function.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var t1 = Task.grab( 23, function(model) {
   *   model; // local or remotely loaded if it didn't exist locally - could be null if it doesn't exist at all
   * })
   * ```
   *
   * @method grab
   * @memberof Rekord.Model
   * @param {modelInput} input -
   *    The model input used to determine the key and load the model.
   * @param {Function} callback -
   *    The function to invoke passing the reference of the model when it's
   *    successfully found.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.Model} -
   *    The model instance of it exists locally at the moment, or undefined
   *    if the model hasn't been loaded yet.
   */
  model.grab = function( input, options, callback, context )
  {
    var callbackContext = context || this;
    var instance = db.get( input );

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
          callback.call( callbackContext, instance );
        }
        else
        {
          model.fetch( input, options, callback, context );
        }
      });
    }

    return instance;
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Gets all model instances currently loaded, locally loaded, or remotely
   * loaded and passes it to the `callback` function.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var tasks = Task.grabAll( function(models) {
   *   models; // local or remotely loaded if it didn't exist locally.
   * })
   * ```
   *
   * @method grabAll
   * @memberof Rekord.Model
   * @param {Function} callback -
   *    The function to invoke passing the reference of the model collection
   *    when it's loaded.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.Model} -
   *    The model collection of it exists locally at the moment, or undefined
   *    if models haven't been loaded yet.
   */
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


addPlugin( function(model, db, options)
{
  if ( options.keyChanges )
  {
    enableKeyChanges();
  }
});

var Map_put = Map.prototype.put;
var Map_remove = Map.prototype.remove;

function mapKeyChangeListener(map)
{
  return function onKeyChange(model, oldKey, newKey)
  {
    var index = map.indices[ oldKey ];

    if ( isNumber( index ) )
    {
      var listener = map.listeners[ oldKey ];

      delete map.indices[ oldKey ];
      delete map.listeners[ oldKey ];

      map.keys[ index ] = newKey;
      map.indices[ newKey ] = index;
      map.listeners[ newKey ] = listener;
    }
  };
}

function mapKeyChangePut(key, value)
{
  Map_put.apply( this, arguments );

  if ( value instanceof Model && value.$db.keyChanges )
  {
    this.listeners = this.listeners || {};

    this.listeners[ key ] = value.$on( Model.Events.KeyChange, mapKeyChangeListener( this ) );
  }

  return this;
}

function mapKeyChangeRemove(key)
{
  var index = this.indices[ key ];

  if ( isNumber( index ) )
  {
    if ( this.listeners )
    {
      evaluate( this.listeners[ key ] );

      delete this.listeners[ key ];
    }

    this.removeAt( index );
  }

  return this;
}

function enableKeyChanges()
{
  Class.method( Map, 'put', mapKeyChangePut );
  Class.method( Map, 'remove', mapKeyChangeRemove );
}

function disableKeyChanges()
{
  Class.method( Map, 'put', Map_put );
  Class.method( Map, 'remove', Map_remove );
}

addPlugin(function(model, db, options)
{
  var methods = collapse( options.methods, Defaults.methods );

  if ( !isEmpty( methods ) )
  {
    Class.methods( model, methods );
  }
});

addPlugin(function(model, db, options)
{

  /**
   * Persists model values, creating a model instance if none exists already
   * (determined by the key derived from the input).
   *
   * ```javascript
   * var ListItem = Rekord({
   *  key: ['list_id', 'iten_id'],
   *  fields: ['quantity'],
   *  belongsTo: {
   *    list: { model: 'list' },
   *    item: { model: 'item' }
   *  }
   * });
   *
   * var listItem = ListItem.persist({ // creates relationship if it doesn't exist already - updates existing
   *  list: someList,
   *  item: someItem,
   *  quantity: 23
   * });
   * ```
   *
   * @method persist
   * @memberof Rekord.Model
   * @param {Object} [input] -
   *    The values to persist in the model instance found or created.
   * @return {Rekord.Model} -
   *    The saved model instance or undefined if the model database has not
   *    finished loading.
   */
  model.persist = function( input, cascade, options, callback, context )
  {
    var callbackContext = context || this;

    return model.findOrCreate( input, cascade, options, function(instance, created)
    {
      if ( !created )
      {
        instance.$save( cascade, options );
      }

      if ( callback )
      {
        callback.call( callbackContext, instance );
      }
    });
  };
});

addPlugin(function(model, db, options)
{

  model.projection = function(projectionInput)
  {
    return Projection.parse( db, projectionInput );
  };

});

addPlugin(function(model, db, options)
{

  /**
   * Invokes a function when Rekord has loaded. It's considered loaded when
   * it's loaded locally, remotely, or neither (depending on the options
   * passed to the database). The `callback` can also be invoked `persistent`ly
   * on any load event - which includes {@link Rekord.Database#refresh}.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * Task.ready( function(db) {
   *  // Tasks have been loaded, lets do something about it!
   * });
   * ```
   *
   * @method ready
   * @memberof Rekord.Model
   * @param {Function} callback -
   *    The function to invoke passing the reference of the database when it's
   *    loaded.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @param {Boolean} [persistent=false] -
   *    Whether the `callback` function should be invoked multiple times.
   *    Depending on the state of initializing, the callback can be invoked when
   *    models are loaded locally (if the `cache` is not equal to `None`),
   *    models are loaded remotely (if `load` is Rekord.Load.All), and every time
   *    {@link Rekord.Database#refresh} is called manually OR if `autoRefresh`
   *    is specified as true and the application changes from offline to online.
   */
  model.ready = function( callback, context, persistent )
  {
    db.ready( callback, context, persistent );
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Refreshs the model database from the remote source by calling
   * {@link Rekord.Database#refresh}. A `callback` can be passed to be invoked
   * when the model database has refreshed (or failed to refresh) where all
   * models that have been loaded will be passed as the first argument.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * Task.refresh( function(models) {
   *  models; // The collection of models loaded remotely (or current models if it failed to load them remotely.
   * });
   * ```
   *
   * @method refresh
   * @memberof Rekord.Model
   * @param {Function} callback -
   *    The function to invoke passing the reference model collection.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   */
  model.refresh = function( callback, context )
  {
    return db.refresh( callback, context );
  };
});

addPlugin(function(model, db, options)
{

  model.reset = function(failOnPendingChanges, removeListeners)
  {
    return db.reset( failOnPendingChanges, removeListeners );
  };

});

addPlugin(function(model, db, options)
{

  /**
   * Creates a new search for model instances. A search is an object with
   * properties that are passed to a configurable {@link Rekord.rest} function
   * which expect an array of models to be returned from the remote call that
   * match the search parameters.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name', 'done']
   * });
   * var search = Task.search('/api/task/search');
   * search.name = 'like this';
   * search.done = true;
   * search.anyProperty = [1, 3, 4];
   * var promise = search.$run();
   * promise.success( function(search) {
   *   search.$results; // collection of returned results
   * });
   * ```
   *
   * @method search
   * @memberof Rekord.Model
   * @param {String} url -
   *    A URL to send the search data to.
   * @param {searchOptions} [options] -
   *    Options for the search.
   * @param {Object} [props] -
   *    Initial set of properties on the search.
   * @param {Boolean} [run=false] -
   *    Whether or not to run the search immediately.
   * @return {Rekord.Search} -
   *    A new search for models.
   */
  model.search = function(url, options, props, run)
  {
    return new Search( db, url, options, props, run );
  };
});

addPlugin(function(model, db, options)
{

  model.searchAt = function(index, url, paging, options, props, success, failure)
  {
    var page = {page_index: index, page_size: 1};

    var search = paging ?
      new SearchPaged( db, url, collapse( options, page ), props ) :
      new Search( db, url, options, props );

    var promise = new Rekord.Promise();

    promise.success( success );
    promise.failure( failure );

    search.$run().then(
      function onSuccess(search, response, results) {
        promise.resolve( results[ paging ? 0 : index ] );
      },
      function onFailure() {
        promise.reject();
      },
      function onOffline() {
        promise.noline();
      }
    );

    return promise;
  };

});

addPlugin(function(model, db, options)
{

  /**
   * Creates a new search with pagination for model instances. A paginated
   * search is an object with properties that are passed to a configurable
   * {@link Rekord.rest} function which expect an array of models to be returned
   * as well as paging information from the remote call. Special properties are
   * passed to the server (`page_index`, `page_size`) which dictate which
   * chunk of data should be returned. A special `total` property is expected to
   * be returned with `results` which tells the search how many records would've
   * been returned without the pagination.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name', 'done']
   * });
   * var search = Task.searchPaged('/api/task/searchPaged');
   * search.name = 'like this';
   * search.done = true;
   * search.anyProperty = [1, 3, 4];
   * var promise = search.$run();
   * promise.success( function(search) {
   *   search.$results; // collection of returned results
   *   search.total; // number of results that would've been returned without pagination
   *   search.page_index; // the zero-based page index
   *   search.page_size; // the number of results to be returned
   * });
   * search.$next(); // increase page_index, get the next page
   * ```
   *
   * @method searchPaged
   * @memberof Rekord.Model
   * @param {String} url -
   *    A URL to send the search data to.
   * @param {searchPageOptions} [options] -
   *    Options for the search.
   * @param {Object} [props] -
   *    Initial set of properties on the search.
   * @param {Boolean} [run=false] -
   *    Whether or not to run the search immediately.
   * @return {Rekord.SearchPaged} -
   *    A new paginated search for models.
   */
  model.searchPaged = function(url, options, props, run)
  {
    return new SearchPaged( db, url, options, props, run );
  };
});

addPlugin(function(options)
{
  var shard = options.shard || Defaults.shard;

  if ( !isObject( shard ) )
  {
    return;
  }

  options.createRest = Rekord.shard( shard );
  
}, true );

addPlugin(function(model, db, options)
{
  var time = options.timestamps || Defaults.timestamps;
  var timeFormat = collapseOption( options.timestampFormat, Defaults.timestampFormat );
  var timeType = collapseOption( options.timestampType, Defaults.timestampType );
  var timeUTC = collapseOption( options.timestampUTC, Defaults.timestampUTC );
  var timeCurrent = options.timestampCurrent || Defaults.timestampCurrent;

  if ( !time )
  {
    return;
  }

  function collapseOption(option, defaultValue)
  {
    if ( isObject( option ) && isObject( defaultValue ) )
    {
      return collapse( option, defaultValue );
    }

    return option || defaultValue;
  }

  function hasDefault(field)
  {
    return timeCurrent === true || indexOf( timeCurrent, field ) !== false;
  }

  function fieldSpecific(field, map)
  {
    return isObject( map ) ? map[ field ] : map;
  }

  function currentTimestamp(field)
  {
    var to = fieldSpecific( field, timeType );

    return function()
    {
      return convertDate( new Date(), to );
    };
  }

  function encode(x, model, field, forSaving)
  {
    var to = fieldSpecific( field, timeFormat );
    var encoded = convertDate( x, to );

    return encoded || x;
  }

  function decode(x, rawData, field)
  {
    var to = fieldSpecific( field, timeType );
    var utc = fieldSpecific( field, timeUTC );
    var decoded = convertDate( x, to, utc );

    return decoded || x;
  }

  function addTimestamp(field)
  {
    var i = indexOf( db.fields, field );

    if ( i === false )
    {
      db.fields.push( field );
      db.saveFields.push( field );
    }

    if ( hasDefault( field ) && !(field in db.defaults) )
    {
      db.defaults[ field ] = currentTimestamp( field );
    }

    if ( timeFormat && !(field in db.encodings) )
    {
      db.encodings[ field ] = encode;
    }

    if ( timeType && !(field in db.decodings ) )
    {
      db.decodings[ field ] = decode;
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

    Class.replace( model, '$save', function($save)
    {
      return function()
      {
        this[ field ] = evaluate( db.defaults[ field ] );

        return $save.apply( this, arguments );
      };
    });
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

var Timestamp = {
  Date: 'date',
  Millis: 'millis',
  Seconds: 'seconds'
};

Defaults.timestampFormat = Timestamp.Millis;
Defaults.timestampType = Timestamp.Date;
Defaults.timestampUTC = false;
Defaults.timestampCurrent = ['created_at', 'updated_at'];

function convertDate(x, to, utc)
{
  var date = parseDate( x, utc );

  if ( date === false )
  {
    return false;
  }

  if ( !to )
  {
    return date;
  }

  switch (to)
  {
    case Timestamp.Date:
      return date;
    case Timestamp.Millis:
      return date.getTime();
    case Timestamp.Seconds:
      return Math.floor( date.getTime() / 1000 );
    default:
      return Rekord.formatDate( date, to );
  }
}

Rekord.Timestamp = Timestamp;
Rekord.formatDate = noop;
Rekord.convertDate = convertDate;

addPlugin(function(model, db, options)
{

  model.where = function(whereProperties, whereValue, whereEquals, out)
  {
    return db.models.where(whereProperties, whereValue, whereEquals, out);
  };
});


  /* Classes */
  Rekord.Model = Model;
  Rekord.Database = Database;
  Rekord.Defaults = Defaults;
  Rekord.Relation = Relation;
  Rekord.Operation = Operation;
  Rekord.Search = Search;
  Rekord.SearchPaged = SearchPaged;
  Rekord.Promise = Promise;

  /* Keys */
  Rekord.KeyHandler = KeyHandler;
  Rekord.KeySimple = KeySimple;
  Rekord.KeyComposite = KeyComposite;
  Rekord.enableKeyChanges = enableKeyChanges;
  Rekord.disableKeyChanges = disableKeyChanges;

  /* Enums */
  Rekord.Cascade = Cascade;
  Rekord.Cache = Cache;
  Rekord.Store = Store;
  Rekord.Save = Save;
  Rekord.Load = Load;

  /* Collections */
  Rekord.Map = Map;
  Rekord.Collection = Collection;
  Rekord.FilteredCollection = FilteredCollection;
  Rekord.ModelCollection = ModelCollection;
  Rekord.FilteredModelCollection = FilteredModelCollection;
  Rekord.Page = Page;
  Rekord.Context = Context;

  /* Relationships */
  Rekord.HasOne = HasOne;
  Rekord.BelongsTo = BelongsTo;
  Rekord.HasMany = HasMany;
  Rekord.HasManyThrough = HasManyThrough;
  Rekord.HasRemote = HasRemote;
  Rekord.HasList = HasList;

  /* Projections */
  Rekord.Filters = {};
  Rekord.Projection = Projection;

  /* Common Functions */
  Rekord.isRekord = isRekord;
  Rekord.isDefined = isDefined;
  Rekord.isFunction = isFunction;
  Rekord.isString = isString;
  Rekord.isNumber = isNumber;
  Rekord.isBoolean = isBoolean;
  Rekord.isDate = isDate;
  Rekord.isRegExp = isRegExp;
  Rekord.isArray = isArray;
  Rekord.isObject = isObject;
  Rekord.isValue = isValue;
  Rekord.noop = noop;
  Rekord.bind = bind;
  Rekord.uuid = uuid;
  Rekord.sizeof = sizeof;
  Rekord.isEmpty = isEmpty;
  Rekord.evaluate = evaluate;
  Rekord.addPlugin = addPlugin;
  Rekord.now = now;

  /* Array Functions */
  Rekord.toArray = toArray;
  Rekord.indexOf = indexOf;
  Rekord.collect = collect;
  Rekord.array = collectArray;
  Rekord.swap = swap;
  Rekord.reverse = reverse;
  Rekord.isSorted = isSorted;
  Rekord.isPrimitiveArray = isPrimitiveArray;

  /* Class Functions */
  Rekord.Settings = Settings;
  Rekord.Class = Class;
  Rekord.extend = Class.extend;
  Rekord.extendArray = Class.extend;
  Rekord.addMethod = Rekord.setProperty = Class.prop;
  Rekord.addMethods = Rekord.setProperties = Class.props;
  Rekord.replaceMethod = Class.replace;
  Rekord.copyConstructor = Class.copyConstructor;
  Rekord.factory = Class.factory;

  /* Comparator Functions */
  Rekord.Comparators = Comparators;
  Rekord.saveComparator = saveComparator;
  Rekord.addComparator = addComparator;
  Rekord.createComparator = createComparator;

  /* Comparison Functions */
  Rekord.equalsStrict = equalsStrict;
  Rekord.equalsWeak = equalsWeak;
  Rekord.equalsCompare = equalsCompare;
  Rekord.equals = equals;
  Rekord.compareNumbers = compareNumbers;
  Rekord.compare = compare;

  /* Eventful Functions */
  Rekord.addEventFunction = addEventFunction;
  Rekord.addEventful = addEventful;

  /* Object Functions */
  Rekord.applyOptions = applyOptions;
  Rekord.propsMatch = propsMatch;
  Rekord.hasFields = hasFields;
  Rekord.updateFieldsReturnChanges = updateFieldsReturnChanges;
  Rekord.clearFieldsReturnChanges = clearFieldsReturnChanges;
  Rekord.grab = grab;
  Rekord.pull = pull;
  Rekord.transfer = transfer;
  Rekord.collapse = collapse;
  Rekord.clean = clean;
  Rekord.cleanFunctions = cleanFunctions;
  Rekord.copy = copy;
  Rekord.diff = diff;

  /* Parse Functions */
  Rekord.isParseInput = isParseInput;
  Rekord.parse = parse;
  Rekord.createParser = createParser;
  Rekord.isFormatInput = isFormatInput;
  Rekord.format = format;
  Rekord.createFormatter = createFormatter;
  Rekord.parseDate = parseDate;

  /* Resolver Functions */
  Rekord.NumberResolvers = NumberResolvers;
  Rekord.saveNumberResolver = saveNumberResolver;
  Rekord.createNumberResolver = createNumberResolver;
  Rekord.PropertyResolvers = PropertyResolvers;
  Rekord.savePropertyResolver = savePropertyResolver;
  Rekord.createPropertyResolver = createPropertyResolver;

  /* String Functions */
  Rekord.toCamelCase = toCamelCase;
  Rekord.split = split;

  /* Where Functions */
  Rekord.Wheres = Wheres;
  Rekord.saveWhere = saveWhere;
  Rekord.createWhere = createWhere;
  Rekord.expr = expr;
  Rekord.not = not;
  Rekord.oneOf = oneOf;
  Rekord.isExpr = isExpr;
  Rekord.exprEqualsTester = exprEqualsTester;
  Rekord.exprEquals = exprEquals;

  return Rekord;

}));

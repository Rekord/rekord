
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

/**
 * An expression which resolves a value from another value.
 *
 * ```javascript
 * // {age: 6, name: 'x', user: {first: 'tom'}}
 * 'age'                    // age property of an object
 * 'user.first'             // sub property
 * '{age}, {user.first}'    // a formatted string built from object values
 * function(a) {}           // a function which returns a value itself
 * ['age', 'name']          // multiple properties joined with a delimiter
 * {age:null, user:'first'} // multiple properties joined with a delimiter including a sub property
 * ```
 *
 * @typedef {String|Function|Array|Object} propertyResolverInput
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

 var AP = Array.prototype;

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
 * Converts the given variable to an array of strings. If the variable is a
 * string it is split based on the delimiter given. If the variable is an
 * array then it is returned. If the variable is any other type it may result
 * in an error.
 *
 * ```javascript
 * Rekord.toArray([1, 2, 3]); // [1, 2, 3]
 * Rekord.toArray('1,2,3', ','); // ['1', '2', '3']
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
  return x instanceof Array ? x : x.split( delimiter );
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
    func.apply( context, arguments );
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
  child.prototype = new parent();
  // Copy new methods into child prototype
  addMethods( child.prototype, override );
  // Set the correct constructor
  child.prototype.constructor = child;
}

var addMethod = (function()
{
  if ( Object.defineProperty )
  {
    return function(target, methodName, method)
    {
      Object.defineProperty( target, methodName, {
        configurable: true,
        enumerable: false,
        value: method
      });
    };
  }
  else
  {
    return function(target, methodName, method)
    {
      target[ methodName ] = method;
    };
  }

})();

function addMethods(target, methods)
{
  for (var methodName in methods)
  {
    addMethod( target, methodName, methods[ methodName ] );
  }
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

  for (var prop in defaults)
  {
    var defaultValue = defaults[ prop ];
    var option = options[ prop ];
    var valued = isValue( option );

    if ( !valued && defaultValue === undefined )
    {
      throw ( prop + ' is a required option' );
    }
    else if ( valued )
    {
      setProperty( prop, option );
    }
    else
    {
      setProperty( prop, copy( defaultValue ) );
    }
  }

  for (var prop in options)
  {
    if ( !(prop in defaults) )
    {
      setProperty( prop, options[ prop ] );
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

function camelCaseReplacer(match)
{
  return match.length === 1 ? match.toUpperCase() : match.charAt(1).toUpperCase();
}

function toCamelCase(name)
{
  return name.replace( toCamelCase.REGEX, camelCaseReplacer );
}

toCamelCase.REGEX = /(^.|_.)/g;

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

  return new Collection( values );
}

function evaluate(x)
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

Rekord.Comparators = {};

function saveComparator(name, comparator, nullsFirst)
{
  return Rekord.Comparators[ name ] = createComparator( comparator, nullsFirst );
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
    if ( comparator in Rekord.Comparators )
    {
      return Rekord.Comparators[ comparator ];
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

Rekord.NumberResolvers = {};

function saveNumberResolver(name, numbers)
{
  return Rekord.NumberResolvers[ name ] = createNumberResolver( numbers );
}

function createNumberResolver(numbers)
{
  var resolver = createPropertyResolver( numbers );

  if ( isString( numbers ) && numbers in Rekord.NumberResolvers )
  {
    return Rekord.NumberResolvers[ numbers ];
  }

  return function resolveNumber(model)
  {
    return parseFloat( resolver( model ) );
  };
}

Rekord.PropertyResolvers = {};

function savePropertyResolver(name, properties, delim)
{
  return Rekord.PropertyResolvers[ name ] = createPropertyResolver( properties, delim );
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
 * createPropertyResolver( ['name', 'age'] )( x )         // 'tom,6'
 * createPropertyResolver( ['name', 'age'], ' is ' )( x ) // 'tom is 6'
 * createPropertyResolver( {age:null, user:'first'})( x ) // '6,jack'
 * ```
 *
 * @memberof Rekord
 * @param {propertyResolverInput} [properties] -
 *    The expression which converts one value into another.
 * @param {String} [delim=','] -
 *    A delimiter to use to join multiple properties into a string.
 * @return {propertyResolverCallback} -
 *    A function to take values and resolve new ones.
 */
function createPropertyResolver(properties, delim)
{
  if ( isFunction( properties ) )
  {
    return properties;
  }
  else if ( isString( properties ) )
  {
    if ( properties in Rekord.PropertyResolvers )
    {
      return Rekord.PropertyResolvers[ properties ];
    }

    if ( properties.indexOf('{') !== -1 )
    {
      return function resolveFormatted(model)
      {
        return format( properties, model );
      };
    }
    else if ( properties.indexOf('.') !== -1 )
    {
      return function resolveExpression(model)
      {
        return parse( properties, model );
      };
    }
    else
    {
      return function resolveProperty(model)
      {
        return model[ properties ];
      };
    }
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

/**
 * A map of saved {@link whereCallback} functions.
 *
 * @type {Object}
 */
Rekord.Wheres = {};

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
  return Rekord.Wheres[ name ] = createWhere( properties, values, equals );
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
    if ( properties in Rekord.Wheres )
    {
      return Rekord.Wheres[ properties ];
    }

    var resolver = createPropertyResolver( properties );

    if ( isValue( value ) )
    {
      return function whereEqualsValue(model)
      {
        return equality( resolver( model ), value );
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

Rekord.Havings = {};

function saveHaving(name, having)
{
  return Rekord.Havings[ name ] = createHaving( having );
}

function createHaving(having)
{
  if ( isFunction( having ) )
  {
    return having;
  }
  else if ( isString( having ) )
  {
    if ( having in Rekord.Havings )
    {
      return Rekord.Havings[ having ];
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

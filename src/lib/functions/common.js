
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

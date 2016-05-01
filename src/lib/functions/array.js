
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

  return new Collection( values );
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

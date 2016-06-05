
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
  return a == b;
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

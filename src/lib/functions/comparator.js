
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

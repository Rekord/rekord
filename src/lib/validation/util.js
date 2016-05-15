function tryParseFloat(x)
{
  var parsed = parseFloat( x );

  if ( !isNaN( parsed ) )
  {
    x = parsed;
  }

  return x;
}

function tryParseInt(x)
{
  var parsed = parseInt( x );

  if ( !isNaN( parsed ) )
  {
    x = parsed;
  }

  return x;
}

function startOfDay(d)
{
  if ( isDate( d ) )
  {
    d.setHours( 0, 0, 0, 0 );
  }
  else if ( isNumber( d ) )
  {
    d = d - (d % 86400000);
  }

  return d;
}

function endOfDay(d)
{
  if ( isDate( d ) )
  {
    d.setHours( 23, 59, 59, 999 );
  }
  else if ( isNumber( d ) )
  {
    d = d - (d % 86400000) + 86400000 - 1;
  }

  return d;
}

function ruleGenerator(ruleName, defaultMessage, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    checkNoParams( ruleName, field, params );

    var messageTemplate = determineMessage( ruleName, message );

    return function(value, model, setMessage)
    {
      function setValue( newValue )
      {
        value = newValue;
      }

      if ( isInvalid( value, model, setValue ) )
      {
        setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate ) );
      }

      return value;
    };
  };

  Validation.Rules[ ruleName ].message = defaultMessage;
}

function determineMessage(ruleName, message)
{
  return message || Validation.Rules[ ruleName ].message;
}

function joinFriendly(arr, lastSeparator, itemSeparator, getAlias)
{
  var copy = arr.slice();

  if ( getAlias )
  {
    for (var i = 0; i < copy.length; i++)
    {
      copy[ i ] = getAlias( copy[ i ] );
    }
  }

  var last = copy.pop();
  var lastSeparator = lastSeparator || 'and';
  var itemSeparator = itemSeparator || ', ';

  switch (copy.length) {
    case 0:
      return last;
    case 1:
      return copy[ 0 ] + ' ' + lastSeparator + ' ' + last;
    default:
      return copy.join( itemSeparator ) + itemSeparator + lastSeparator + ' ' + last;
  }
}

function mapFromArray(arr, value)
{
  var map = {};

  for (var i = 0; i < arr.length; i++)
  {
    map[ arr[ i ] ] = value;
  }

  return map;
}

function checkNoParams(ruleName, field, params)
{
  if ( params )
  {
    throw 'the rule ' + ruleName + ' for field ' + field + ' has no arguments';
  }
}

function generateMessage(field, alias, value, model, message, extra)
{
  if ( isFunction( message ) )
  {
    message = message( field, alias, value, model, extra );
  }

  var base = {};
  base.$field = field;
  base.$alias = alias;
  base.$value = value;

  transfer( model, base );

  if ( isObject( extra ) )
  {
    transfer( extra, base );
  }

  return format( message, base );
}

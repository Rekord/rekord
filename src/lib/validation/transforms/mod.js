Validation.Rules.mod = function(field, params, database, alias, message)
{
  var number = tryParseFloat( params );

  if ( !isNumber( number ) )
  {
    throw '"' + number + '" is not a valid number for the mod rule.';
  }

  return function(value, model, setMessage)
  {
    value = tryParseFloat( value );

    if ( isNumber( value ) )
    {
      value = value % number;
    }

    return value;
  };
};

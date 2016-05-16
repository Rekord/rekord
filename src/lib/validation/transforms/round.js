Validation.Rules.round = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    value = tryParseFloat( value );

    if ( isNumber( value ) )
    {
      value = Math.round( value );
    }

    return value;
  };
};

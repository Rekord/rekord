Validation.Rules.abs = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    value = tryParseFloat( value );

    if ( isNumber( value ) )
    {
      value = Math.abs( value );
    }

    return value;
  };
};

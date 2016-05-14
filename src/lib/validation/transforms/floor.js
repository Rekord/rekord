Validation.Rules.floor = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    value = tryParseFloat( value );
    
    if ( isNumber( value ) )
    {
      value = Math.floor( value );
    }

    return value;
  };
};

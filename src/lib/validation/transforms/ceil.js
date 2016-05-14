Validation.Rules.ceil = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    value = tryParseFloat( value );
    
    if ( isNumber( value ) )
    {
      value = Math.ceil( value );
    }

    return value;
  };
};

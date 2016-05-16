Validation.Rules.base64 = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    if ( global.btoa )
    {
      value = global.btoa( value );
    }

    return value;
  };
};

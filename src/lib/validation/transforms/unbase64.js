Validation.Rules.unbase64 = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    if ( global.atob )
    {
      value = global.atob( value );
    }

    return value;
  };
};

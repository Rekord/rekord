Validation.Rules.startOfDay = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    return startOfDay( value );
  };
};

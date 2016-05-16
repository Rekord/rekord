Validation.Rules.endOfDay = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    return endOfDay( value );
  };
};

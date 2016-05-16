Validation.Rules.apply = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    model.$set( field, value );
    
    return value;
  };
};

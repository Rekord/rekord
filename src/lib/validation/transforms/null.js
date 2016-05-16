Validation.Rules.null = function(field, params, database, alias, message)
{
  return function(value, model, setMessage)
  {
    model.$set( field, null );

    return null;
  };
};

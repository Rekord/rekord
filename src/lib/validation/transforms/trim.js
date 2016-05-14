Validation.Rules.trim = function(field, params, database, alias, message)
{
  // String.trim polyfill
  if ( !String.prototype.trim )
  {
    var regex = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

    String.prototype.trim = function()
    {
      return this.replace( regex, '' );
    };
  }

  return function(value, model, setMessage)
  {
    if ( isString( value ) )
    {
      value = value.trim();
    }

    return value;
  };
};


ruleGenerator('array',
  '{$alias} must be an array.',
  function isInvalid(value) {
    return !isArray( value );
  }
);

ruleGenerator('object',
  '{$alias} must be an object.',
  function isInvalid(value) {
    return !isObject( value );
  }
);

ruleGenerator('string',
  '{$alias} must be a string.',
  function isInvalid(value) {
    return !isString( value );
  }
);

ruleGenerator('number',
  '{$alias} must be a number.',
  function isInvalid(value) {
    return !isNumber( value );
  }
);

ruleGenerator('boolean',
  '{$alias} must be a true or false.',
  function isInvalid(value) {
    return !isBoolean( value );
  }
);

ruleGenerator('model',
  '{$alias} must have a value.',
  function isInvalid(value) {
    return !(value instanceof Model);
  }
);

ruleGenerator('whole',
  '{$alias} must be a whole number.',
  function isInvalid(value, model, setValue) {
    var parsed = tryParseInt( value );
    var numeric = parseFloat( value );
    var invalid = !isNumber( parsed );
    if ( !invalid ) {
      invalid = Math.floor( parsed ) !== numeric;
      if ( !invalid ) {
        setValue( parsed );
      }
    }
    return invalid;
  }
);

ruleGenerator('numeric',
  '{$alias} must be numeric.',
  function isInvalid(value, model, setValue) {
    var parsed = tryParseFloat( value );
    var invalid = !isNumber( parsed );
    if ( !invalid ) {
      setValue( parsed );
    }
    return invalid;
  }
);

ruleGenerator('yesno',
  '{$alias} must be a yes or no.',
  function isInvalid(value, model, setValue) {
    var mapped = Validation.Rules.yesno.map[ value ];
    var invalid = !isBoolean( mapped );
    if ( !invalid ) {
      setValue( mapped );
    }
    return invalid;
  }
);

Validation.Rules.yesno.map =
{
  'true':   true,
  't':      true,
  'yes':    true,
  'y':      true,
  '1':      true,
  'false':  false,
  'f':      false,
  'no':     false,
  'n':      false,
  '0':      false
};

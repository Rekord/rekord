// confirmed:X
fieldsRuleGenerator('confirmed',
  '{$alias} must match {$fieldAliases}.',
  function isInvalid(value, model, fields, setValue) {
    var confirmed = true;

    for (var i = 0; i < fields.length; i++)
    {
      if ( !equals( value, model.$get( fields[ i ] ) ) )
      {
        confirmed = false;
      }
    }

    return !confirmed;
  }
);

// different:X
fieldsRuleGenerator('different',
  '{$alias} must not match {$fieldAliases}.',
  function isInvalid(value, model, fields, setValue) {
    var different = false;

    for (var i = 0; i < fields.length; i++)
    {
      if ( !equals( value, model.$get( fields[ i ] ) ) )
      {
        different = true;
      }
    }

    return !different;
  }
);

// if_valid:X
fieldsRuleGenerator('if_valid',
  '',
  function isInvalid(value, model, fields, setValue) {
    var valid = true;

    for (var i = 0; i < fields.length && valid; i++)
    {
      if ( model.$validations[ fields[ i ] ] )
      {
        valid = false;
      }
    }

    if ( !valid )
    {
      setValue( Validation.Stop );
    }

    return false;
  }
);

// The field under validation must be present only if any of the other specified fields are present.
// required_with:X,Y,...
fieldsRuleGenerator('required_with',
  '{$alias} is required.',
  function isInvalid(value, model, fields, setValue) {
    var required = false;

    for (var i = 0; i < fields.length && !required; i++)
    {
      if ( !isEmpty( model.$get( fields[ i ] ) ) )
      {
        required = true;
      }
    }

    return required && isEmpty( value );
  }
);

// The field under validation must be present only if all of the other specified fields are present.
// required_with_all:X,Y,...
fieldsRuleGenerator('required_with_all',
  '{$alias} is required.',
  function isInvalid(value, model, fields, setValue) {
    var required = true;

    for (var i = 0; i < fields.length && required; i++)
    {
      if ( isEmpty( model.$get( fields[ i ] ) ) )
      {
        required = false;
      }
    }

    return required && isEmpty( value );
  }
);

// The field under validation must be present only when any of the other specified fields are not present.
// required_without:X,Y,...
fieldsRuleGenerator('required_without',
  '{$alias} is required.',
  function isInvalid(value, model, fields, setValue) {
    var required = false;

    for (var i = 0; i < fields.length && !required; i++)
    {
      if ( isEmpty( model.$get( fields[ i ] ) ) )
      {
        required = true;
      }
    }

    return required && isEmpty( value );
  }
);

// The field under validation must be present only when all of the other specified fields are not present.
// required_without_all:X,Y,...
fieldsRuleGenerator('required_without_all',
  '{$alias} is required.',
  function isInvalid(value, model, fields, setValue) {
    var required = true;

    for (var i = 0; i < fields.length && required; i++)
    {
      if ( !isEmpty( model.$get( fields[ i ] ) ) )
      {
        required = false;
      }
    }

    return required && isEmpty( value );
  }
);

function fieldsRuleGenerator(ruleName, defaultMessage, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    if ( !params )
    {
      throw ruleName + ' validation rule requires an array of fields argument';
    }

    var fields = split( params, /(\s*,\s*)/, '\\' );

    for (var i = 0; i < fields.length; i++)
    {
      if ( indexOf( database.fields, fields[ i ] ) === -1 )
      {
        throw fields[ i ] + ' is not a valid field for the ' + ruleName + ' rule';
      }
    }

    var messageTemplate = determineMessage( ruleName, message );
    var fieldNames = joinFriendly( fields );
    var fieldAliases = joinFriendly( fields, false, false, getAlias );
    var extra = {
      $fields: fieldNames,
      $fieldAliases: fieldAliases
    };

    return function(value, model, setMessage)
    {
      function setValue( newValue )
      {
        value = newValue;
      }

      if ( isInvalid( value, model, fields, setValue ) )
      {
        setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate, extra ) );
      }

      return value;
    };
  };

  Validation.Rules[ ruleName ].message = defaultMessage;
};

// if:due_date:before:today|required

// if all rules pass for the given field, continue with remaining rules
subRuleGenerator('if',
  function isInvalid(invalidCount, totalCount) {
    return invalidCount > 0;
  }
);

// if any rules pass for the given field, continue with remaining rules
subRuleGenerator('if_any',
  function isInvalid(invalidCount, totalCount) {
    return invalidCount >= totalCount;
  }
);

// if no rules pass for the given field, continue with remaining rules
subRuleGenerator('if_not',
  function isInvalid(invalidCount, totalCount) {
    return invalidCount < totalCount;
  }
);



function subRuleGenerator(ruleName, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    if ( !params )
    {
      throw ruleName + ' validation rule requires a validation rule argument';
    }

    var otherField, otherRules;

    if ( isString( params ) )
    {
      var colon = params.indexOf( ':' );

      if ( colon === -1 )
      {
        throw params + ' is not a valid argument for the ' + ruleName + ' rule';
      }

      otherField = params.substring( 0, colon ) || field;
      otherRules = params.substring( colon + 1 );
    }
    else if ( isArray( params ) )
    {
      otherField = params.shift() || field;
      otherRules = params;
    }
    else if ( isObject( params ) )
    {
      otherField = params.field || field;
      otherRules = params.rules;
    }

    if ( indexOf( database.fields, otherField ) === -1 )
    {
      throw otherField + ' is not a valid field for the ' + ruleName + ' rule';
    }

    if ( !otherRules )
    {
      throw 'rules are required for the ' + ruleName + ' rule';
    }

    var validators = Validation.parseRules( otherRules, otherField, database, getAlias );

    return function(value, model, setMessage)
    {
      var invalids = 0;

      var setInvalid = function(message)
      {
        if ( message )
        {
          invalids++;
        }
      };

      for (var i = 0; i < validators.length; i++)
      {
        validators[ i ]( value, model, setInvalid );
      }

      return isInvalid( invalids, validators.length ) ? Validation.Stop : value;
    };
  };
}

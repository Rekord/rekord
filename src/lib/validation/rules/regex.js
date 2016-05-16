

regexRuleGenerator('alpha',
  '{$alias} should only contain alphabetic characters.',
    /^[a-zA-Z]*$/
);

regexRuleGenerator('alpha_dash',
  '{$alias} should only contain alpha-numeric characters, dashes, and underscores.',
  /^[a-zA-Z0-9_-]*$/
);

regexRuleGenerator('alpha_num',
  '{$alias} should only contain alpha-numeric characters.',
  /^[a-zA-Z0-9]*$/
);

regexRuleGenerator('email',
  '{$alias} is not a valid email.',
  /^.+@.+\..+$/
);

regexRuleGenerator('url',
  '{$alias} is not a valid URL.',
  /^(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/
);

regexRuleGenerator('uri',
  '{$alias} is not a valid URI.',
  /^(\w+:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/
);

regexRuleGenerator('phone',
  '{$alias} is not a valid phone number.',
  /^1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?(\d*))?$/
);

function regexRuleGenerator(ruleName, defaultMessage, regex)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    checkNoParams( ruleName, field, params );

    var messageTemplate = determineMessage( ruleName, message );

    return function(value, model, setMessage)
    {
      if ( !regex.test( value ) )
      {
        setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate ) );
      }

      return value;
    };
  };

  Validation.Rules[ ruleName ].message = defaultMessage;
}

Validation.Rules.regex = function(field, params, database, getAlias, message)
{
  var regex;

  if ( isString( params ) )
  {
    var parsed = /^\/(.*)\/([gmi]*)$/.exec( params );

    if ( parsed )
    {
      regex = new RegExp( parsed[1], parsed[2] );
    }
  }
  else if ( isRegExp( params ) )
  {
    regex = params;
  }

  if ( !regex )
  {
    throw params + ' is not a valid regular expression for the regex rule';
  }

  var messageTemplate = determineMessage( 'regex', message );

  return function(value, model, setMessage)
  {
    if ( !regex.test( value ) )
    {
      setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate ) );
    }

    return value;
  };
};

Validation.Rules.regex.message = '{$alias} is not a valid value.';

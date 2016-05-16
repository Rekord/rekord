module( 'Rekord Validation' );

test( 'rule accepted custom message', function(assert)
{
  var prefix = 'rule_accepted_custom_message_';

  var agreedMessage = 'You must agree to the terms and conditions!';

  var Agreement = Rekord({
    name: prefix + 'agreement',
    fields: ['agreed', 'name'],
    validation: {
      rules: {
        agreed: 'accepted'
      },
      messages: {
        agreed: agreedMessage
      }
    }
  });

  var a = Agreement.create({name: 'Terms & Conditions', agreed: false});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {agreed: agreedMessage} );
  deepEqual( a.$validationMessages, [agreedMessage] );

  a.agreed = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule accepted default message', function(assert)
{
  var prefix = 'rule_accepted_default_message_';

  var agreedMessage = 'agreed has not been accepted.';

  var Agreement = Rekord({
    name: prefix + 'agreement',
    fields: ['agreed', 'name'],
    validation: {
      rules: {
        agreed: 'accepted'
      }
    }
  });

  var a = Agreement.create({name: 'Terms & Conditions', agreed: false});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {agreed: agreedMessage} );
  deepEqual( a.$validationMessages, [agreedMessage] );

  a.agreed = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule accepted aliased message', function(assert)
{
  var prefix = 'rule_accepted_aliased_message_';

  var agreedMessage = 'The Terms & Conditions has not been accepted.';

  var Agreement = Rekord({
    name: prefix + 'agreement',
    fields: ['agreed', 'name'],
    validation: {
      rules: {
        agreed: 'accepted'
      },
      aliases: {
        agreed: 'The Terms & Conditions'
      }
    }
  });

  var a = Agreement.create({name: 'Terms & Conditions', agreed: false});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {agreed: agreedMessage} );
  deepEqual( a.$validationMessages, [agreedMessage] );

  a.agreed = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule accepted override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.accepted, {
    message: 'You must accept {$alias}.'
  });

  var prefix = 'rule_accepted_override_message_';

  var agreedMessage = 'You must accept the agreement.';

  var Agreement = Rekord({
    name: prefix + 'agreement',
    fields: ['agreed', 'name'],
    validation: {
      rules: {
        agreed: 'accepted'
      },
      aliases: {
        agreed: 'the agreement'
      }
    }
  });

  var a = Agreement.create({name: 'Terms & Conditions', agreed: false});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {agreed: agreedMessage} );
  deepEqual( a.$validationMessages, [agreedMessage] );

  a.agreed = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

test( 'rule accepted add acceptable', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.accepted.acceptable, {
    'yup': true,
    '1': false
  });

  var prefix = 'rule_accepted_add_acceptable_';

  var agreedMessage = 'The agreement has not been accepted.';

  var Agreement = Rekord({
    name: prefix + 'agreement',
    fields: ['agreed', 'name'],
    validation: {
      rules: {
        agreed: 'accepted'
      },
      aliases: {
        agreed: 'The agreement'
      }
    }
  });

  var a = Agreement.create({name: 'Terms & Conditions', agreed: 1});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {agreed: agreedMessage} );
  deepEqual( a.$validationMessages, [agreedMessage] );

  a.agreed = 'yup';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

// rule accepted invalid arguments

test( 'rule after custom message', function(assert)
{
  var prefix = 'rule_after_custom_message_';

  var expectedMessage = 'The due date must be after yesterday!';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'after:yesterday'
      },
      messages: {
        due_date: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule after default message', function(assert)
{
  var prefix = 'rule_after_default_message_';

  var expectedMessage = 'due_date must be after yesterday.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'after:yesterday'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule after aliased message', function(assert)
{
  var prefix = 'rule_after_alaised_message_';

  var expectedMessage = 'The due date must be after yesterday.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'after:yesterday'
      },
      aliases: {
        due_date: 'The due date'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule after override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.after, {
    message: 'The {$alias} when given must be after {$date}.'
  });

  var prefix = 'rule_after_override_message_';

  var expectedMessage = 'The due date when given must be after yesterday.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'after:yesterday'
      },
      aliases: {
        due_date: 'due date'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

test( 'rule after raw params', function(assert)
{
  var prefix = 'rule_after_raw_params_';

  var msInDay = 86400000;
  var now = Date.now();
  var yesterday = new Date( now - msInDay );
  var expectedMessage = 'due_date must be after yesterday.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: {
          after: yesterday
        }
      },
      messages: {
        due_date: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule after missing date', function(assert)
{
  var prefix = 'rule_after_missing_date_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'after'
        }
      }
    });
  }, 'after validation rule requires a date expression argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'after:'
        }
      }
    });
  }, 'after validation rule requires a date expression argument');
});

test( 'rule after invalid date', function(assert)
{
  var prefix = 'rule_after_invalid_date_';

  throws(function() {
    Rekord({
      name: prefix,
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'after:NOTDATE'
        }
      }
    });
  }, 'NOTDATE is not a valid date expression for the after rule');
});

test( 'rule after_on custom message', function(assert)
{
  var prefix = 'rule_after_on_custom_message_';

  var expectedMessage = 'The due date must be after or equal to today!';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'after_on:today'
      },
      messages: {
        due_date: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule after_on default message', function(assert)
{
  var prefix = 'rule_after_on_default_message_';

  var expectedMessage = 'due_date must be after or equal to today.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'after_on:today'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule after_on aliased message', function(assert)
{
  var prefix = 'rule_after_on_alaised_message_';

  var expectedMessage = 'The due date must be after or equal to today.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'after_on:today'
      },
      aliases: {
        due_date: 'The due date'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule after_on override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.after_on, {
    message: 'The {$alias} when given must be on or after {$date}.'
  });

  var prefix = 'rule_after_on_override_message_';

  var expectedMessage = 'The due date when given must be on or after today.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'after_on:today'
      },
      aliases: {
        due_date: 'due date'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

test( 'rule after_on raw params', function(assert)
{
  var prefix = 'rule_after_on_raw_params_';

  var msInDay = 86400000;
  var now = Date.now();
  var today = now;
  var expectedMessage = 'due_date must be after or equal to today.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: {
          after_on: today
        }
      },
      messages: {
        due_date: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now - msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule after_on missing date', function(assert)
{
  var prefix = 'rule_after_on_missing_date_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'after_on'
        }
      }
    });
  }, 'after_on validation rule requires a date expression argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'after_on:'
        }
      }
    });
  }, 'after_on validation rule requires a date expression argument');
});

test( 'rule after_on invalid date', function(assert)
{
  var prefix = 'rule_after_on_invalid_date_';

  throws(function() {
    Rekord({
      name: prefix,
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'after_on:NOTDATE'
        }
      }
    });
  }, 'NOTDATE is not a valid date expression for the after_on rule');
});

test( 'rule before custom message', function(assert)
{
  var prefix = 'rule_before_custom_message_';

  var expectedMessage = 'The due date must be before tomorrow!';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'before:tomorrow'
      },
      messages: {
        due_date: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule before default message', function(assert)
{
  var prefix = 'rule_before_default_message_';

  var expectedMessage = 'due_date must be before tomorrow.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'before:tomorrow'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule before aliased message', function(assert)
{
  var prefix = 'rule_before_alaised_message_';

  var expectedMessage = 'The due date must be before tomorrow.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'before:tomorrow'
      },
      aliases: {
        due_date: 'The due date'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule before override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.before, {
    message: 'The {$alias} when given must be before {$date}.'
  });

  var prefix = 'rule_before_override_message_';

  var expectedMessage = 'The due date when given must be before tomorrow.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'before:tomorrow'
      },
      aliases: {
        due_date: 'due date'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

test( 'rule before raw params', function(assert)
{
  var prefix = 'rule_before_raw_params_';

  var msInDay = 86400000;
  var now = Date.now();
  var tomorrow = now + msInDay - 1;
  var expectedMessage = 'due_date must be before tomorrow.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: {
          before: tomorrow
        }
      },
      messages: {
        due_date: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule before missing date', function(assert)
{
  var prefix = 'rule_before_missing_date_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'before'
        }
      }
    });
  }, 'before validation rule requires a date expression argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'before:'
        }
      }
    });
  }, 'before validation rule requires a date expression argument');
});

test( 'rule before invalid date', function(assert)
{
  var prefix = 'rule_before_invalid_date_';

  throws(function() {
    Rekord({
      name: prefix,
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'before:NOTDATE'
        }
      }
    });
  }, 'NOTDATE is not a valid date expression for the before rule');
});

test( 'rule before_on custom message', function(assert)
{
  var prefix = 'rule_before_on_custom_message_';

  var expectedMessage = 'The due date must be before or equal to tomorrow!';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'before_on:tomorrow'
      },
      messages: {
        due_date: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule before_on default message', function(assert)
{
  var prefix = 'rule_before_on_default_message_';

  var expectedMessage = 'due_date must be before or equal to tomorrow.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'before_on:tomorrow'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule before_on aliased message', function(assert)
{
  var prefix = 'rule_before_on_alaised_message_';

  var expectedMessage = 'The due date must be before or equal to tomorrow.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'before_on:tomorrow'
      },
      aliases: {
        due_date: 'The due date'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule before_on override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.before_on, {
    message: 'The {$alias} when given must be before or equal to {$date}.'
  });

  var prefix = 'rule_before_on_override_message_';

  var expectedMessage = 'The due date when given must be before or equal to tomorrow.';
  var msInDay = 86400000;
  var now = Date.now();

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: 'before_on:tomorrow'
      },
      aliases: {
        due_date: 'due date'
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

test( 'rule before_on raw params', function(assert)
{
  var prefix = 'rule_before_on_raw_params_';

  var msInDay = 86400000;
  var now = Date.now();
  var tomorrow = now + msInDay;
  var expectedMessage = 'due_date must be before or equal to tomorrow.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date'],
    validation: {
      rules: {
        due_date: {
          before_on: tomorrow
        }
      },
      messages: {
        due_date: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'a', due_date: now + msInDay * 2 });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = now;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule before_on missing date', function(assert)
{
  var prefix = 'rule_before_on_missing_date_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'before_on'
        }
      }
    });
  }, 'before_on validation rule requires a date expression argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'before_on:'
        }
      }
    });
  }, 'before_on validation rule requires a date expression argument');
});

test( 'rule before_on invalid date', function(assert)
{
  var prefix = 'rule_before_on_invalid_date_';

  throws(function() {
    Rekord({
      name: prefix,
      fields: ['due_date'],
      validation: {
        rules: {
          due_date: 'before_on:NOTDATE'
        }
      }
    });
  }, 'NOTDATE is not a valid date expression for the before_on rule');
});

test( 'rule required custom message', function(assert)
{
  var prefix = 'rule_required_custom_message_';

  var expectedMessage = 'Task name is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'required'
      },
      messages: {
        name: expectedMessage
      }
    }
  });

  var a = Task.create({name: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 'a';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule required default message', function(assert)
{
  var prefix = 'rule_required_default_message_';

  var expectedMessage = 'name is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'required'
      }
    }
  });

  var a = Task.create({name: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 'a';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule required aliased message', function(assert)
{
  var prefix = 'rule_required_aliased_message_';

  var expectedMessage = 'Task name is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'required'
      },
      aliases: {
        name: 'Task name'
      }
    }
  });

  var a = Task.create({name: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 'a';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule required override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.required, {
    message: '{$alias} is a required field.'
  });

  var prefix = 'rule_required_override_message_';

  var expectedMessage = 'name is a required field.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'required'
      }
    }
  });

  var a = Task.create({name: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 'a';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

// rule required invalid arguments

test( 'rule min string', function(assert)
{
  var prefix = 'rule_min_string_';

  var expectedMessage = 'name must have a minimum of 3 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'min:3'
      }
    }
  });

  var a = Task.create({name: '22'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '333';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule min number', function(assert)
{
  var prefix = 'rule_min_number_';

  var expectedMessage = 'count must be at least 3.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: 'min:3'
      }
    }
  });

  var a = Task.create({count: 2});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 3;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule min array', function(assert)
{
  var prefix = 'rule_min_array_';

  var expectedMessage = 'options must have at least 3 items.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['options'],
    validation: {
      rules: {
        options: 'min:3'
      }
    }
  });

  var a = Task.create({options: [1, 2]});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2, 3];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule min raw params', function(assert)
{
  var prefix = 'rule_min_raw_params_';

  var expectedMessage = 'name must have a minimum of 3 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: {min: 3}
      }
    }
  });

  var a = Task.create({name: '22'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '333';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule min invalid arguments', function(assert)
{
  var prefix = 'rule_min_invalid_arguments_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'min'
        }
      }
    });
  }, 'min validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'min:'
        }
      }
    });
  }, 'min validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'nan',
      fields: ['count'],
      validation: {
        rules: {
          count: 'min:X'
        }
      }
    });
  }, 'X is not a valid number for the min rule');
});

// rule min custom message
// rule min aliased message
// rule min override message

test( 'rule greater_than string', function(assert)
{
  var prefix = 'rule_greater_than_string_';

  var expectedMessage = 'name must have more than 3 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'greater_than:3'
      }
    }
  });

  var a = Task.create({name: '333'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '4444';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule greater_than number', function(assert)
{
  var prefix = 'rule_greater_than_number_';

  var expectedMessage = 'count must be greater than 3.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: 'greater_than:3'
      }
    }
  });

  var a = Task.create({count: 3});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule greater_than array', function(assert)
{
  var prefix = 'rule_greater_than_array_';

  var expectedMessage = 'options must have more than 3 items.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['options'],
    validation: {
      rules: {
        options: 'greater_than:3'
      }
    }
  });

  var a = Task.create({options: [1, 2, 3]});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2, 3, 4];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule greater_than invalid arguments', function(assert)
{
  var prefix = 'rule_greater_than_invalid_arguments_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'greater_than'
        }
      }
    });
  }, 'greater_than validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'greater_than:'
        }
      }
    });
  }, 'greater_than validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'nan',
      fields: ['count'],
      validation: {
        rules: {
          count: 'greater_than:X'
        }
      }
    });
  }, 'X is not a valid number for the greater_than rule');
});

// rule greater_than custom message
// rule greater_than aliased message
// rule greater_than override message
// rule greater_than raw params

test( 'rule max string', function(assert)
{
  var prefix = 'rule_max_string_';

  var expectedMessage = 'name must have no more than 3 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'max:3'
      }
    }
  });

  var a = Task.create({name: '4444'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '333';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule max number', function(assert)
{
  var prefix = 'rule_max_number_';

  var expectedMessage = 'count must be no more than 3.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: 'max:3'
      }
    }
  });

  var a = Task.create({count: 4});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 3;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule max array', function(assert)
{
  var prefix = 'rule_max_array_';

  var expectedMessage = 'options must have no more than 3 items.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['options'],
    validation: {
      rules: {
        options: 'max:3'
      }
    }
  });

  var a = Task.create({options: [1, 2, 3, 4]});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2, 3];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule max invalid arguments', function(assert)
{
  var prefix = 'rule_max_invalid_arguments_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'max'
        }
      }
    });
  }, 'max validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'max:'
        }
      }
    });
  }, 'max validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'nan',
      fields: ['count'],
      validation: {
        rules: {
          count: 'max:X'
        }
      }
    });
  }, 'X is not a valid number for the max rule');
});

// rule max custom message
// rule max aliased message
// rule max override message
// rule max raw params

test( 'rule less_than string', function(assert)
{
  var prefix = 'rule_less_than_string_';

  var expectedMessage = 'name must have less than 3 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'less_than:3'
      }
    }
  });

  var a = Task.create({name: '333'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '22';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule less_than number', function(assert)
{
  var prefix = 'rule_less_than_number_';

  var expectedMessage = 'count must be less than 3.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: 'less_than:3'
      }
    }
  });

  var a = Task.create({count: 3});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 2;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule less_than array', function(assert)
{
  var prefix = 'rule_less_than_array_';

  var expectedMessage = 'options must have less than 3 items.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['options'],
    validation: {
      rules: {
        options: 'less_than:3'
      }
    }
  });

  var a = Task.create({options: [1, 2, 3]});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule less_than invalid arguments', function(assert)
{
  var prefix = 'rule_less_than_invalid_arguments_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'less_than'
        }
      }
    });
  }, 'less_than validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'less_than:'
        }
      }
    });
  }, 'less_than validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'nan',
      fields: ['count'],
      validation: {
        rules: {
          count: 'less_than:X'
        }
      }
    });
  }, 'X is not a valid number for the less_than rule');
});

// rule less_than custom message
// rule less_than aliased message
// rule less_than override message
// rule less_than raw params

test( 'rule equal string', function(assert)
{
  var prefix = 'rule_equal_string_';

  var expectedMessage = 'name must have 3 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'equal:3'
      }
    }
  });

  var a = Task.create({name: '22'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '333';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule equal number', function(assert)
{
  var prefix = 'rule_equal_number_';

  var expectedMessage = 'count must equal 3.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: 'equal:3'
      }
    }
  });

  var a = Task.create({count: 4});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 3;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule equal array', function(assert)
{
  var prefix = 'rule_equal_array_';

  var expectedMessage = 'options must have 3 items.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['options'],
    validation: {
      rules: {
        options: 'equal:3'
      }
    }
  });

  var a = Task.create({options: [1, 2, 3, 4]});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2, 3];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule equal invalid arguments', function(assert)
{
  var prefix = 'rule_equal_invalid_arguments_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'equal'
        }
      }
    });
  }, 'equal validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'equal:'
        }
      }
    });
  }, 'equal validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'nan',
      fields: ['count'],
      validation: {
        rules: {
          count: 'equal:X'
        }
      }
    });
  }, 'X is not a valid number for the equal rule');
});

// rule equal custom message
// rule equal aliased message
// rule equal override message
// rule equal raw params

test( 'rule not_equal string', function(assert)
{
  var prefix = 'rule_not_equal_string_';

  var expectedMessage = 'name must not have 3 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'not_equal:3'
      }
    }
  });

  var a = Task.create({name: '333'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '22';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_equal number', function(assert)
{
  var prefix = 'rule_not_equal_number_';

  var expectedMessage = 'count must not equal 3.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: 'not_equal:3'
      }
    }
  });

  var a = Task.create({count: 3});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_equal array', function(assert)
{
  var prefix = 'rule_not_equal_array_';

  var expectedMessage = 'options must not have 3 items.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['options'],
    validation: {
      rules: {
        options: 'not_equal:3'
      }
    }
  });

  var a = Task.create({options: [1, 2, 3]});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_equal invalid arguments', function(assert)
{
  var prefix = 'rule_not_equal_invalid_arguments_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'not_equal'
        }
      }
    });
  }, 'not_equal validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'not_equal:'
        }
      }
    });
  }, 'not_equal validation rule requires a number argument');

  throws(function() {
    Rekord({
      name: prefix + 'nan',
      fields: ['count'],
      validation: {
        rules: {
          count: 'not_equal:X'
        }
      }
    });
  }, 'X is not a valid number for the not_equal rule');
});

// rule not_equal custom message
// rule not_equal aliased message
// rule not_equal override message
// rule not_equal raw params

test( 'rule array custom message', function(assert)
{
  var prefix = 'rule_array_custom_message_';

  var expectedMessage = 'Task name must be an array.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'array'
      },
      messages: {
        name: expectedMessage
      }
    }
  });

  var a = Task.create({name: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = [];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule array default message', function(assert)
{
  var prefix = 'rule_array_default_message_';

  var expectedMessage = 'name must be an array.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'array'
      }
    }
  });

  var a = Task.create({name: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = [];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule array aliased message', function(assert)
{
  var prefix = 'rule_array_aliased_message_';

  var expectedMessage = 'Task name must be an array.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'array'
      },
      aliases: {
        name: 'Task name'
      }
    }
  });

  var a = Task.create({name: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = [];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule array override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.array, {
    message: '{$alias} is an array field.'
  });

  var prefix = 'rule_array_override_message_';

  var expectedMessage = 'name is an array field.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'array'
      }
    }
  });

  var a = Task.create({name: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = [];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

// rule array invalid arguments

test( 'rule string default message', function(assert)
{
  var prefix = 'rule_string_default_message_';

  var expectedMessage = 'name must be a string.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'string'
      }
    }
  });

  var a = Task.create({name: 4});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 'what';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule string custom message
// rule string aliased message
// rule string override message
// rule string invalid arguments

test( 'rule number default message', function(assert)
{
  var prefix = 'rule_number_default_message_';

  var expectedMessage = 'name must be a number.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'number'
      }
    }
  });

  var a = Task.create({name: '4'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule number custom message
// rule number aliased message
// rule number override message
// rule number invalid arguments

test( 'rule object default message', function(assert)
{
  var prefix = 'rule_object_default_message_';

  var expectedMessage = 'name must be an object.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'object'
      }
    }
  });

  var a = Task.create({name: '4'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = {butt: ['what']};

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule object custom message
// rule object aliased message
// rule object override message
// rule object invalid arguments

test( 'rule boolean default message', function(assert)
{
  var prefix = 'rule_boolean_default_message_';

  var expectedMessage = 'name must be a true or false.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'boolean'
      }
    }
  });

  var a = Task.create({name: '4'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule boolean custom message
// rule boolean aliased message
// rule boolean override message
// rule boolean invalid arguments

test( 'rule model default message', function(assert)
{
  var prefix = 'rule_model_default_message_';

  var expectedMessage = 'name must have a value.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'model'
      }
    }
  });

  var b = Task.create();
  var a = Task.create({name: null});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = b;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule model custom message
// rule model aliased message
// rule model override message
// rule model invalid arguments

test( 'rule between string', function(assert)
{
  var prefix = 'rule_between_string_';

  var expectedMessage = 'name must have between 3 to 8 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'between:3,8'
      }
    }
  });

  var a = Task.create({name: '22'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '999999999';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '333';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.name = '88888888';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule between number', function(assert)
{
  var prefix = 'rule_between_number_';

  var expectedMessage = 'count must be between 3 and 8.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: 'between:3,8'
      }
    }
  });

  var a = Task.create({count: 2});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 9;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 3;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.count = 8;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule between array', function(assert)
{
  var prefix = 'rule_between_array_';

  var expectedMessage = 'options must have between 3 to 8 items.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['options'],
    validation: {
      rules: {
        options: 'between:3,8'
      }
    }
  });

  var a = Task.create({options: [1, 2]});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2, 3];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.options = [1, 2, 3, 4, 5, 6, 7, 8];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule between raw params', function(assert)
{
  var prefix = 'rule_between_raw_params_';

  var expectedMessage = 'count must be between 3 and 8.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: {
          between: [3, 8]
        }
      }
    }
  });

  var a = Task.create({count: 2});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 9;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 3;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.count = 8;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule between raw params object', function(assert)
{
  var prefix = 'rule_between_raw_params_object_';

  var expectedMessage = 'count must be between 3 and 8.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: {
          between: {start: 3, end: 8}
        }
      }
    }
  });

  var a = Task.create({count: 2});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 9;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 3;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.count = 8;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule between invalid arguments', function(assert)
{
  var prefix = 'rule_between_invalid_arguments_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'between'
        }
      }
    });
  }, 'between validation rule requires a range argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'between:'
        }
      }
    });
  }, 'between validation rule requires a range argument');

  throws(function() {
    Rekord({
      name: prefix + 'nan,',
      fields: ['count'],
      validation: {
        rules: {
          count: 'between:X'
        }
      }
    });
  }, 'X is not a valid range of numbers for the between rule');

  throws(function() {
    Rekord({
      name: prefix + 'nan,num',
      fields: ['count'],
      validation: {
        rules: {
          count: 'between:X,3'
        }
      }
    });
  }, 'X,3 is not a valid range of numbers for the between rule');

  throws(function() {
    Rekord({
      name: prefix + 'num,nan',
      fields: ['count'],
      validation: {
        rules: {
          count: 'between:4,'
        }
      }
    });
  }, '4, is not a valid range of numbers for the between rule');
});

// rule between custom message
// rule between aliased message
// rule between override message

test( 'rule not_between string', function(assert)
{
  var prefix = 'rule_not_between_string_';

  var expectedMessage = 'name must not have between 3 to 8 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'not_between:3,8'
      }
    }
  });

  var a = Task.create({name: '333'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '88888888';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '22';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.name = '999999999';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_between number', function(assert)
{
  var prefix = 'rule_not_between_number_';

  var expectedMessage = 'count must not be between 3 and 8.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['count'],
    validation: {
      rules: {
        count: 'not_between:3,8'
      }
    }
  });

  var a = Task.create({count: 3});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 8;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {count: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.count = 2;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.count = 9;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_between array', function(assert)
{
  var prefix = 'rule_not_between_array_';

  var expectedMessage = 'options must not have between 3 to 8 items.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['options'],
    validation: {
      rules: {
        options: 'not_between:3,8'
      }
    }
  });

  var a = Task.create({options: [1, 2, 3]});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2, 3, 4, 5, 6, 7, 8];

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {options: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.options = [1, 2];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.options = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_between raw params', function(assert)
{
  var prefix = 'rule_not_between_raw_params_';

  var expectedMessage = 'name must not have between 3 to 8 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: {
          not_between: [3, 8]
        }
      }
    }
  });

  var a = Task.create({name: '333'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '88888888';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '22';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.name = '999999999';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_between raw params object', function(assert)
{
  var prefix = 'rule_not_between_raw_params_object_';

  var expectedMessage = 'name must not have between 3 to 8 characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: {
          not_between: {start: 3, end: 8}
        }
      }
    }
  });

  var a = Task.create({name: '333'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '88888888';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '22';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.name = '999999999';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_between invalid arguments', function(assert)
{
  var prefix = 'rule_not_between_invalid_arguments_';

  throws(function() {
    Rekord({
      name: prefix + 'no_colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'not_between'
        }
      }
    });
  }, 'not_between validation rule requires a range argument');

  throws(function() {
    Rekord({
      name: prefix + 'colon',
      fields: ['count'],
      validation: {
        rules: {
          count: 'not_between:'
        }
      }
    });
  }, 'not_between validation rule requires a range argument');

  throws(function() {
    Rekord({
      name: prefix + 'nan,',
      fields: ['count'],
      validation: {
        rules: {
          count: 'not_between:X'
        }
      }
    });
  }, 'X is not a valid range of numbers for the not_between rule');

  throws(function() {
    Rekord({
      name: prefix + 'nan,num',
      fields: ['count'],
      validation: {
        rules: {
          count: 'not_between:X,3'
        }
      }
    });
  }, 'X,3 is not a valid range of numbers for the not_between rule');

  throws(function() {
    Rekord({
      name: prefix + 'num,nan',
      fields: ['count'],
      validation: {
        rules: {
          count: 'not_between:4,'
        }
      }
    });
  }, '4, is not a valid range of numbers for the not_between rule');
});

// rule not_between custom message
// rule not_between aliased message
// rule not_between override message

test( 'rule whole custom message', function(assert)
{
  var prefix = 'rule_whole_custom_message_';

  var expectedMessage = 'Task name must be a whole number.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'whole'
      },
      messages: {
        name: expectedMessage
      }
    }
  });

  var a = Task.create({name: 4.1});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '4';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule whole default message', function(assert)
{
  var prefix = 'rule_whole_default_message_';

  var expectedMessage = 'name must be a whole number.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'whole'
      }
    }
  });

  var a = Task.create({name: 2.3});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '2';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule whole aliased message', function(assert)
{
  var prefix = 'rule_whole_aliased_message_';

  var expectedMessage = 'Task name must be a whole number.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'whole'
      },
      aliases: {
        name: 'Task name'
      }
    }
  });

  var a = Task.create({name: 4.5});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '4';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule whole override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.whole, {
    message: '{$alias} must be an integer.'
  });

  var prefix = 'rule_whole_override_message_';

  var expectedMessage = 'name must be an integer.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'whole'
      }
    }
  });

  var a = Task.create({name: 6.6});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '6';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

// rule whole invalid arguments

test( 'rule numeric custom message', function(assert)
{
  var prefix = 'rule_numeric_custom_message_';

  var expectedMessage = 'Task name must be numeric.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'numeric'
      },
      messages: {
        name: expectedMessage
      }
    }
  });

  var a = Task.create({name: 'taco tuesday'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 23.4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule numeric default message', function(assert)
{
  var prefix = 'rule_numeric_default_message_';

  var expectedMessage = 'name must be numeric.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'numeric'
      }
    }
  });

  var a = Task.create({name: null});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '2.5';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule numeric aliased message', function(assert)
{
  var prefix = 'rule_numeric_aliased_message_';

  var expectedMessage = 'Task name must be numeric.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'numeric'
      },
      aliases: {
        name: 'Task name'
      }
    }
  });

  var a = Task.create({name: 'y4.5'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 4.1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule numeric override message', function(assert)
{
  var pop = pushChanges( Rekord.Validation.Rules.numeric, {
    message: '{$alias} must be a decimal.'
  });

  var prefix = 'rule_numeric_override_message_';

  var expectedMessage = 'name must be a decimal.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'numeric'
      }
    }
  });

  var a = Task.create({name: true});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = '6.6';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  pop();
});

// rule numeric invalid arguments

test( 'rule alpha default message', function(assert)
{
  var prefix = 'rule_alpha_default_message_';

  var expectedMessage = 'text should only contain alphabetic characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: 'alpha'
      }
    }
  });

  var a = Task.create({text: 'ayo2'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'w hat';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'okay';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = 'sure';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule alpha custom message
// rule alpha aliased message
// rule alpha override message
// rule alpha invalid arguments

test( 'rule alpha_dash default message', function(assert)
{
  var prefix = 'rule_alpha_dash_default_message_';

  var expectedMessage = 'text should only contain alpha-numeric characters, dashes, and underscores.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: 'alpha_dash'
      }
    }
  });

  var a = Task.create({text: 'ayo2 '});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'what?';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'o_kay34';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = 's-ure';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule alpha_dash custom message
// rule alpha_dash aliased message
// rule alpha_dash override message
// rule alpha_dash invalid arguments

test( 'rule alpha_num default message', function(assert)
{
  var prefix = 'rule_alpha_num_default_message_';

  var expectedMessage = 'text should only contain alpha-numeric characters.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: 'alpha_num'
      }
    }
  });

  var a = Task.create({text: 'ayo2 '});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'what_';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'okay34';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = 'sure';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule alpha_num custom message
// rule alpha_num aliased message
// rule alpha_num override message
// rule alpha_num invalid arguments

test( 'rule email default message', function(assert)
{
  var prefix = 'rule_email_default_message_';

  var expectedMessage = 'text is not a valid email.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: 'email'
      }
    }
  });

  var a = Task.create({text: '@meow.com'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'what@taco';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'pdiffenderfer@gmail.com';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = 'rekord.js+extra@gmail-site.com';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule email custom message
// rule email aliased message
// rule email override message
// rule email invalid arguments

test( 'rule url default message', function(assert)
{
  var prefix = 'rule_url_default_message_';

  var expectedMessage = 'text is not a valid URL.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: 'url'
      }
    }
  });

  var a = Task.create({text: '@meow'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'ftp://website.com';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'http://www.google.com/maps?q=Your+Mom';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = 'google.com';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule url custom message
// rule url aliased message
// rule url override message
// rule url invalid arguments

test( 'rule uri default message', function(assert)
{
  var prefix = 'rule_uri_default_message_';

  var expectedMessage = 'text is not a valid URI.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: 'uri'
      }
    }
  });

  var a = Task.create({text: '@meow'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = '192.168.2.1';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'http://www.google.com/maps?q=Your+Mom';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = 'ftp://website.domain';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule uri custom message
// rule uri aliased message
// rule uri override message
// rule uri invalid arguments

test( 'rule phone default message', function(assert)
{
  var prefix = 'rule_phone_default_message_';

  var expectedMessage = 'text is not a valid phone number.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: 'phone'
      }
    }
  });

  var a = Task.create({text: '666666'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = '1(717)341-567';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = '1(717)341-5675';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = '717 3415678';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule phone custom message
// rule phone aliased message
// rule phone override message
// rule phone invalid arguments

test( 'rule regex default message', function(assert)
{
  var prefix = 'rule_regex_default_message_';

  var expectedMessage = 'text is not a valid value.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: 'regex:/^[a-z][0-9][_-]$/i'
      }
    }
  });

  var a = Task.create({text: 'z0'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'r1.';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'Q4_';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = 't3-';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule regex raw params', function(assert)
{
  var prefix = 'rule_regex_raw_params_';

  var expectedMessage = 'text is not a valid value.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['text'],
    validation: {
      rules: {
        text: {
          regex: /^[a-z][0-9][_-]$/i
        }
      }
    }
  });

  var a = Task.create({text: 'z0'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'r1.';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {text: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.text = 'Q4_';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.text = 't3-';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule regex custom message
// rule regex aliased message
// rule regex override message
// rule regex invalid arguments

test( 'rule date_like default message', function(assert)
{
  var prefix = 'rule_date_like_default_message_';

  var expectedMessage = 'value must be a valid date.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'date_like'
      }
    }
  });

  var a = Task.create({value: '01/2016'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'not date either';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 67867567; // ms

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = '01/03/1989';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = new Date();

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule date_like custom message
// rule date_like aliased message
// rule date_like override message
// rule date_like invalid arguments

test( 'rule confirmed default message', function(assert)
{
  var prefix = 'rule_confirmed_default_message_';

  var expectedMessage = 'value must match value_again.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value', 'value_again'],
    validation: {
      rules: {
        value: 'confirmed:value_again'
      }
    }
  });

  var a = Task.create({value: 'taco', value_again: 'not taco'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'not taco either';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'not taco'; // ms

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 42;
  a.value_again = 42;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule confirmed multiple fields
// rule confirmed custom message
// rule confirmed aliased message
// rule confirmed override message
// rule confirmed invalid arguments

test( 'rule different default message', function(assert)
{
  var prefix = 'rule_different_default_message_';

  var expectedMessage = 'value must not match value_again.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value', 'value_again'],
    validation: {
      rules: {
        value: 'different:value_again'
      }
    }
  });

  var a = Task.create({value: 'taco', value_again: 'taco'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 1;
  a.value_again = 1;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 1;
  a.value_again = '1';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 42;
  a.value_again = 43;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule different multiple fields
// rule different custom message
// rule different aliased message
// rule different override message
// rule different invalid arguments

test( 'rule if_valid default message', function(assert)
{
  var prefix = 'rule_if_valid_default_message_';

  var expectedMessage1 = 'name is required.';
  var expectedMessage2 = 'done must be a yes or no.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done'],
    validation: {
      rules: {
        name: 'required',
        done: 'if_valid:name|yesno'
      }
    }
  });

  var a = Task.create({name: '', done: 2});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage1} );
  deepEqual( a.$validationMessages, [expectedMessage1] );

  a.name = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage1} );
  deepEqual( a.$validationMessages, [expectedMessage1] );

  a.name = 'taco';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {done: expectedMessage2} );
  deepEqual( a.$validationMessages, [expectedMessage2] );

  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule if_valid multiple fields
// rule if_valid custom message
// rule if_valid aliased message
// rule if_valid override message
// rule if_valid invalid arguments

test( 'rule exists custom message', function(assert)
{
  var prefix = 'rule_exists_custom_message_';

  var expectedMessage = 'Value must match an existing value.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'exists'
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  Task.create({value: 'exists'});
  Task.create({value: 'also exists'});

  var a = Task.create({value: 'not exists'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'does not exist either';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'exists';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 'also exists';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule exists raw params', function(assert)
{
  var prefix = 'rule_exists_raw_params';

  var expectedMessage = 'Value must match an existing value.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: {
          exists: {field: 'value'}
        }
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  Task.create({value: 'exists'});
  Task.create({value: 'also exists'});

  var a = Task.create({value: 'not exists'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'does not exist either';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'exists';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 'also exists';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule exists foreign class
// rule exists different field
// rule exists foreign class field
// rule exists multiple fields
// rule exists default message
// rule exists aliased message
// rule exists override message
// rule exists raw params model class
// rule exists raw params models array
// rule exists invalid arguments

test( 'rule unique custom message', function(assert)
{
  var prefix = 'rule_unique_custom_message_';

  var expectedMessage = 'Value must be unique.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'unique'
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  Task.create({value: 'unique1'});
  Task.create({value: 'unique2'});

  var a = Task.create({value: 'unique1'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'unique2';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'unique3';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = '';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule unique raw params', function(assert)
{
  var prefix = 'rule_unique_raw_params_';

  var expectedMessage = 'Value must be unique.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: {
          unique: {field: 'value'}
        }
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  Task.create({value: 'unique1'});
  Task.create({value: 'unique2'});

  var a = Task.create({value: 'unique1'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'unique2';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'unique3';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = '';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule unique foreign class
// rule unique different field
// rule unique foreign class field
// rule unique multiple fields
// rule unique default message
// rule unique aliased message
// rule unique override message
// rule unique raw params model class
// rule unique raw params models array
// rule unique invalid arguments

test( 'rule contains default message', function(assert)
{
  var prefix = 'rule_contains_default_message_';

  var expectedMessage = 'tasks does not contain an item whose done equals true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: 'contains:done,true'
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0', done: false});
  var t1 = Task.create({name: 't1'});
  var a = TaskList.create({
    name: 'list1',
    tasks: [ t0, t1 ]
  });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t0.done = 1;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  t0.done = true;
  t1.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule contains raw params', function(assert)
{
  var prefix = 'rule_contains_raw_params_';

  var expectedMessage = 'tasks does not contain an item whose done equals true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: {
          contains: {
            field: 'done',
            value: true,
            equals: Rekord.equals
          }
        }
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0', done: false});
  var t1 = Task.create({name: 't1'});
  var a = TaskList.create({
    name: 'list1',
    tasks: [ t0, t1 ]
  });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t0.done = 1;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  t0.done = true;
  t1.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule contains raw params array', function(assert)
{
  var prefix = 'rule_contains_raw_params_array_';

  var expectedMessage = 'tasks does not contain an item whose done equals true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: {
          contains: ['done', true, Rekord.equals]
        }
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0', done: false});
  var t1 = Task.create({name: 't1'});
  var a = TaskList.create({
    name: 'list1',
    tasks: [ t0, t1 ]
  });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t0.done = 1;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  t0.done = true;
  t1.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule contains custom message
// rule contains aliased message
// rule contains override message
// rule contains invalid arguments

test( 'rule not_contains default message', function(assert)
{
  var prefix = 'rule_not_contains_default_message_';

  var expectedMessage = 'tasks contains an item whose done equals true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: 'not_contains:done,true'
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0', done: true});
  var t1 = Task.create({name: 't1'});
  var a = TaskList.create({
    name: 'list1',
    tasks: [ t0, t1 ]
  });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t0.done = false;
  t1.done = true;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  t0.done = null;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_contains raw params', function(assert)
{
  var prefix = 'rule_not_contains_raw_params_';

  var expectedMessage = 'tasks contains an item whose done equals true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: {
          not_contains: {
            field: 'done',
            value: true,
            equals: Rekord.equals
          }
        }
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0', done: true});
  var t1 = Task.create({name: 't1'});
  var a = TaskList.create({
    name: 'list1',
    tasks: [ t0, t1 ]
  });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t0.done = false;
  t1.done = true;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  t0.done = null;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_contains raw params array', function(assert)
{
  var prefix = 'rule_not_contains_raw_params_array_';

  var expectedMessage = 'tasks contains an item whose done equals true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: {
          not_contains: ['done', true, Rekord.equals]
        }
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0', done: true});
  var t1 = Task.create({name: 't1'});
  var a = TaskList.create({
    name: 'list1',
    tasks: [ t0, t1 ]
  });

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t0.done = false;
  t1.done = true;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  t0.done = null;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule not_contains custom message
// rule not_contains aliased message
// rule not_contains override message
// rule not_contains invalid arguments

test( 'rule in default message', function(assert)
{
  var prefix = 'rule_in_default_message_';

  var expectedMessage = 'value must be one of A, B, C, or true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'in:A,B,C,true'
      }
    }
  });

  var a = Task.create({value: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'D';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'A';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 'B';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule in raw params', function(assert)
{
  var prefix = 'rule_in_raw_params_';

  var expectedMessage = 'value must be one of A, B, C, or true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: {
          in: ['A', 'B', 'C', true]
        }
      }
    }
  });

  var a = Task.create({value: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'D';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'A';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 'B';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule in custom message
// rule in aliased message
// rule in override message
// rule in invalid arguments
// rule in raw params function

test( 'rule not_in default message', function(assert)
{
  var prefix = 'rule_not_in_default_message_';

  var expectedMessage = 'value must not be one of A, B, C, or true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'not_in:A,B,C,true'
      }
    }
  });

  var a = Task.create({value: 'A'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = true;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'D';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = null;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule not_in raw params', function(assert)
{
  var prefix = 'rule_not_in_raw_params_';

  var expectedMessage = 'value must not be one of A, B, C, or true.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: {
          not_in: ['A', 'B', 'C', true]
        }
      }
    }
  });

  var a = Task.create({value: 'A'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = true;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'D';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = null;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule not_in custom message
// rule not_in aliased message
// rule not_in override message
// rule not_in invalid arguments
// rule not_in raw params function

test( 'rule yesno default message', function(assert)
{
  var prefix = 'rule_yesno_default_message_';

  var expectedMessage = 'value must be a yes or no.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'yesno'
      }
    }
  });

  var a = Task.create({value: 'A'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 'f';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule yesno custom yesno
// rule yesno custom message
// rule yesno aliased message
// rule yesno override message
// rule yesno invalid arguments

test( 'rule required_if default message', function(assert)
{
  var prefix = 'rule_required_if_default_message_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done'],
    validation: {
      rules: {
        due_date: 'required_if:done,true,1'
      }
    }
  });

  var a = Task.create({due_date: '', done: true});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = '';
  a.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule required_if raw params', function(assert)
{
  var prefix = 'rule_required_if_raw_params_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done'],
    validation: {
      rules: {
        due_date: {
          required_if: {
            field: 'done',
            values: [true, 1]
          }
        }
      }
    }
  });

  var a = Task.create({due_date: '', done: true});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = '';
  a.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule required_if raw params array', function(assert)
{
  var prefix = 'rule_required_if_raw_params_array_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done'],
    validation: {
      rules: {
        due_date: {
          required_if: ['done', true, 1]
        }
      }
    }
  });

  var a = Task.create({due_date: '', done: true});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = '';
  a.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule required_if custom message
// rule required_if aliased message
// rule required_if override message
// rule required_if invalid arguments

test( 'rule required_unless default message', function(assert)
{
  var prefix = 'rule_required_unless_default_message_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done'],
    validation: {
      rules: {
        due_date: 'required_unless:done,false,0'
      }
    }
  });

  var a = Task.create({due_date: '', done: true});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = '';
  a.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule required_unless raw params', function(assert)
{
  var prefix = 'rule_required_unless_raw_params_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done'],
    validation: {
      rules: {
        due_date: {
          required_unless: {
            field: 'done',
            values: [false, 0]
          }
        }
      }
    }
  });

  var a = Task.create({due_date: '', done: true});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = '';
  a.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule required_unless raw params array', function(assert)
{
  var prefix = 'rule_required_unless_raw_params_array_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done'],
    validation: {
      rules: {
        due_date: {
          required_unless: ['done', false, 0]
        }
      }
    }
  });

  var a = Task.create({due_date: '', done: true});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = '';
  a.done = false;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule required_unless custom message
// rule required_unless aliased message
// rule required_unless override message
// rule required_unless invalid arguments

test( 'rule required_with default message', function(assert)
{
  var prefix = 'rule_required_with_default_message_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done', 'summary'],
    validation: {
      rules: {
        due_date: 'required_with:done,summary'
      }
    }
  });

  var a = Task.create({due_date: '', done: true, summary: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.done = null;
  a.summary = 'summary';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = '';
  a.done = null;
  a.summary = '';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule required_with custom message
// rule required_with aliased message
// rule required_with override message
// rule required_with invalid arguments

test( 'rule required_with_all default message', function(assert)
{
  var prefix = 'rule_required_with_all_default_message_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done', 'summary'],
    validation: {
      rules: {
        due_date: 'required_with_all:done,summary'
      }
    }
  });

  var a = Task.create({due_date: '', done: true, summary: 'summary'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.done = 'y';
  a.summary = 'summary';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = null;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = '';
  a.done = null;
  a.summary = '';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule required_with_all custom message
// rule required_with_all aliased message
// rule required_with_all override message
// rule required_with_all invalid arguments

test( 'rule required_without default message', function(assert)
{
  var prefix = 'rule_required_without_default_message_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done', 'summary'],
    validation: {
      rules: {
        due_date: 'required_without:done,summary'
      }
    }
  });

  var a = Task.create({due_date: '', done: null, summary: 'summary'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.done = 'y';
  a.summary = '';

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = null;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = 'taco';
  a.done = null;
  a.summary = '';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule required_without custom message
// rule required_without aliased message
// rule required_without override message
// rule required_without invalid arguments

test( 'rule required_without_all default message', function(assert)
{
  var prefix = 'rule_required_without_all_default_message_';

  var expectedMessage = 'due_date is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['due_date', 'done', 'summary'],
    validation: {
      rules: {
        due_date: 'required_without_all:done,summary'
      }
    }
  });

  var a = Task.create({due_date: '', done: null, summary: ''});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.summary = null;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {due_date: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.due_date = '01/01/2000';
  a.summary = '';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.due_date = null;
  a.done = true;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.done = null;
  a.summary = 'summary';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule required_without_all custom message
// rule required_without_all aliased message
// rule required_without_all override message
// rule required_without_all invalid arguments

test( 'rule if default message', function(assert)
{
  var prefix = 'rule_if_default_message_';

  var expectedMessage = 'value must be odd when over 6.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'if:value:min:6|regex:/[13579]$/' // odd
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 8});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 10;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 7;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 21;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule if raw params', function(assert)
{
  var prefix = 'rule_if_raw_params_';

  var expectedMessage = 'value must be odd when over 6.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: {
          if: {
            field: 'value',
            rules: {
              min: 6
            }
          },
          regex: /[13579]$/ // odd
        }
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 8});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 10;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 7;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 21;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule if all', function(assert)
{
  var prefix = 'rule_if_all_';

  var expectedMessage = 'value must be odd when over 6 and under 12.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'if:value:min:6\\|max:12|regex:/[13579]$/' // odd
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 8});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 10;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 11;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 7;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 14;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule if all raw params', function(assert)
{
  var prefix = 'rule_if_all_raw_params_';

  var expectedMessage = 'value must be odd when over 6 and under 12.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: {
          if: {
            rules: {
              min: 6,
              max: 12
            }
          },
          regex: /[13579]$/ // odd
        }
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 8});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 10;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 11;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 7;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 14;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule if custom message
// rule if aliased message
// rule if override message
// rule if invalid arguments
// rule if raw params array
// rule if default field

test( 'rule if_any default message', function(assert)
{
  var prefix = 'rule_if_any_default_message_';

  var expectedMessage = 'value must be odd when over 6 or an array.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'if_any:value:min:6\\|array|regex:/[13579]$/' // odd
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 8});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = [1,2,3,4,5,6,7,8];

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 11;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = [1,2,3,4,5,6,7];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule if_any raw params', function(assert)
{
  var prefix = 'rule_if_any_raw_params_';

  var expectedMessage = 'value must be odd when over 6 or an array.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: {
          if_any: {
            rules: 'min:6|array'
          },
          regex: /[13579]$/ // odd
        }
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 8});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = [1,2,3,4,5,6,7,8];

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 11;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = [1,2,3,4,5,6,7];

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule if_any custom message
// rule if_any aliased message
// rule if_any override message
// rule if_any invalid arguments
// rule if_any raw params array
// rule if_any default field

test( 'rule if_not default message', function(assert)
{
  var prefix = 'rule_if_not_default_message_';

  var expectedMessage = 'value must be odd when under 6.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'if_not:value:min:6|regex:/[13579]$/' // odd
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 4});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 2;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 3;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 7;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule if_not raw params', function(assert)
{
  var prefix = 'rule_if_not_raw_params_';

  var expectedMessage = 'value must be odd when under 6.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: {
          if_not: {
            rules: {
              min: 6
            }
          },
          regex: /[13579]$/ // odd
        }
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 4});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 2;

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 3;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 7;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );

  a.value = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

// rule if_not custom message
// rule if_not aliased message
// rule if_not override message
// rule if_not invalid arguments
// rule if_not raw params array
// rule if_not default field

test( 'rule validate message', function(assert)
{
  var prefix = 'rule_validate_message_';

  var expectedMessage = 'Tasks are required to have names.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'list_id'],
    validation: {
      rules: {
        name: 'required'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: 'validate:message'
      },
      messages: {
        tasks: expectedMessage
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var a = new TaskList({
    name: 'a',
    tasks: [
      {name: 't0'},
      {name: null}
    ]
  });

  var t0 = a.tasks[0];
  var t1 = a.tasks[1];

  strictEqual( t0.list_id, a.id );
  strictEqual( t1.list_id, a.id );

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.name = 't1';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule validate models', function(assert)
{
  var prefix = 'rule_validate_models_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'list_id'],
    validation: {
      rules: {
        name: 'required'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: 'validate:models'
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var a = new TaskList({
    name: 'a',
    tasks: [
      {name: 't0'},
      {name: null}
    ]
  });

  var t0 = a.tasks[0];
  var t1 = a.tasks[1];
  var expectedMessage = Rekord.collect( t1 );

  strictEqual( t0.list_id, a.id );
  strictEqual( t1.list_id, a.id );

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.name = 't1';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'rule validate validations', function(assert)
{
  var prefix = 'rule_validate_validations_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'list_id'],
    validation: {
      rules: {
        name: 'required'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'task_list',
    fields: ['name'],
    validation: {
      rules: {
        tasks: 'validate:validations'
      }
    },
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var a = new TaskList({
    name: 'a',
    tasks: [
      {name: 't0'},
      {name: null}
    ]
  });

  var t0 = a.tasks[0];
  var t1 = a.tasks[1];

  var expectedMessage = {}
  expectedMessage[ t1.id ] = {
    name: 'name is required.'
  };

  strictEqual( t0.list_id, a.id );
  strictEqual( t1.list_id, a.id );

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {tasks: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  t1.name = 't1';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'custom validation', function(assert)
{
  var prefix = 'custom_validation_';

  var expectedMessage = 'Name must start with a two character code followed by a colon followed by a description.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: '$isValidName'
      }
    },
    methods: {
      $isValidName: function(nm) {
        if (nm && !/^\w\w\:.*$/.test(nm)) {
          return expectedMessage;
        }
      }
    }
  });

  var a = Task.create({name: 'not valid'});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 'TK: meow';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'validation required', function(assert)
{
  var prefix = 'validation_required_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: 'required'
      },
      required: true
    }
  });

  var a = new Task();

  strictEqual( a.$valid, void 0 );
  notOk( a.$isSaved() );

  a.$save();

  strictEqual( a.$valid, false );
  notOk( a.$isSaved() );

  a.name = 'Hello World!';
  a.$save();

  strictEqual( a.$valid, true );
  ok( a.$isSaved() );
});

test( 'rule specific message', function(assert)
{
  var prefix = 'rule_specific_message_';

  var expectedMessage = 'Task name is required.'

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name'],
    validation: {
      rules: {
        name: {
          'required': expectedMessage
        }
      }
    }
  });

  var a = new Task();

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 't1';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'alias multiple message', function(assert)
{
  var prefix = 'alias_multiple_message_';

  var expectedMessage = 'Task name must match task password.'

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'password'],
    validation: {
      rules: {
        name: 'confirmed:password'
      },
      aliases: {
        name: 'Task name',
        password: 'task password'
      }
    }
  });

  var a = new Task({name: 0, password: 1});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {name: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.name = 1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'expression date', function(assert)
{
  var prefix = 'expression_date_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date']
  });

  var expr = Rekord.Validation.parseExpression( '10/03/2014', Task.Database );

  ok( Rekord.isFunction( expr ) );

  var millis = expr();

  ok( Rekord.isNumber( millis ) );

  var date = new Date( millis );

  strictEqual( 9, date.getMonth() );
  strictEqual( 3, date.getDate() );
  strictEqual( 2014, date.getFullYear() );
});

test( 'expression field', function(assert)
{
  var prefix = 'expression_field_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date']
  });

  var expr = Rekord.Validation.parseExpression( 'name', Task.Database );

  ok( Rekord.isFunction( expr ) );

  var model = new Task({name: 'taskName'});

  var name = expr( null, model );

  strictEqual( name, 'taskName' );
});

test( 'expression relative', function(assert)
{
  var prefix = 'expression_relative_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date']
  });

  var expr = Rekord.Validation.parseExpression( '+1hr', Task.Database );

  ok( Rekord.isFunction( expr ) );

  var hourlater = expr();
  var expected = Date.now() + 60 * 60 * 1000;

  ok( Math.abs( hourlater - expected ) < 10 );
});

test( 'expression today', function(assert)
{
  var prefix = 'expression_today_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date']
  });

  var expr = Rekord.Validation.parseExpression( 'today', Task.Database );

  ok( Rekord.isFunction( expr ) );

  var exprTime = expr();
  var expected = Rekord.startOfDay( new Date() ).getTime() + 0 * (24 * 60 * 60 * 1000);

  ok( Math.abs( exprTime - expected ) < 10 );
});

test( 'expression tomorrow', function(assert)
{
  var prefix = 'expression_tomorrow_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date']
  });

  var expr = Rekord.Validation.parseExpression( 'tomorrow', Task.Database );

  ok( Rekord.isFunction( expr ) );

  var exprTime = expr();
  var expected = Rekord.startOfDay( new Date() ).getTime() + 1 * (24 * 60 * 60 * 1000);

  ok( Math.abs( exprTime - expected ) < 10 );
});

test( 'expression yesterday', function(assert)
{
  var prefix = 'expression_yesterday_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'due_date']
  });

  var expr = Rekord.Validation.parseExpression( 'yesterday', Task.Database );

  ok( Rekord.isFunction( expr ) );

  var exprTime = expr();
  var expected = Rekord.startOfDay( new Date() ).getTime() - 1 * (24 * 60 * 60 * 1000);

  ok( Math.abs( exprTime - expected ) < 10 );
});

test( 'transform ceil', function(assert)
{
  var prefix = 'transform_ceil_';

  var expectedMessage = 'value must be over 3.5';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'ceil|min:3.5'
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 3});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 3.1;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'transform floor', function(assert)
{
  var prefix = 'transform_floor_';

  var expectedMessage = 'value must be over 3.5';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'floor|min:3.5'
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 3.9});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'transform trim', function(assert)
{
  var prefix = 'transform_trim_';

  var expectedMessage = 'value is required.';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'trim|required'
      }
    }
  });

  var a = Task.create({value: '   '});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 'a';

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'transform round', function(assert)
{
  var prefix = 'transform_round_';

  var expectedMessage = 'value must be over 3.5';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'round|min:3.5'
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 3.4});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'transform mod', function(assert)
{
  var prefix = 'transform_mod_';

  var expectedMessage = 'value must be even';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'mod:2|equal:0'
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: 3});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'transform abs', function(assert)
{
  var prefix = 'transform_abs_';

  var expectedMessage = 'value must be over 3.5';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'abs|floor|min:3.5'
      },
      messages: {
        value: expectedMessage
      }
    }
  });

  var a = Task.create({value: -3.9});

  notOk( a.$validate() );
  notOk( a.$valid );
  deepEqual( a.$validations, {value: expectedMessage} );
  deepEqual( a.$validationMessages, [expectedMessage] );

  a.value = 4;

  ok( a.$validate() );
  ok( a.$valid );
  deepEqual( a.$validations, {} );
  deepEqual( a.$validationMessages, [] );
});

test( 'transform apply', function(assert)
{
  var prefix = 'transform_apply_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'abs|floor|apply'
      }
    }
  });

  var a = Task.create({value: '-3.9'});

  ok( a.$validate() );

  strictEqual( a.value, 3 );
});

test( 'transform filter', function(assert)
{
  var prefix = 'transform_filter_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'filter|apply'
      }
    }
  });

  var a = Task.create({value: [null, 1, 2, null, 3, 4, null]});

  ok( a.$validate() );

  deepEqual( a.value, [1, 2, 3, 4] );
});

test( 'transform startOfDay', function(assert)
{
  var prefix = 'transform_startOfDay_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'startOfDay'
      }
    }
  });

  var d = new Date();

  var a = Task.create({value: d});

  ok( a.$validate() );

  strictEqual( a.value.getHours(), 0 );
});

test( 'transform endOfDay', function(assert)
{
  var prefix = 'transform_endOfDay_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'endOfDay'
      }
    }
  });

  var d = new Date();

  var a = Task.create({value: d});

  ok( a.$validate() );

  strictEqual( a.value.getHours(), 23 );
});

test( 'transform base64', function(assert)
{
  var prefix = 'transform_base64_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'base64|apply'
      }
    }
  });

  var a = Task.create({value: 'Hello World'});

  ok( a.$validate() );

  strictEqual( a.value, 'SGVsbG8gV29ybGQ=' );
});

test( 'transform unbase64', function(assert)
{
  var prefix = 'transform_unbase64_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'unbase64|apply'
      }
    }
  });

  var a = Task.create({value: 'SGVsbG8gV29ybGQ='});

  ok( a.$validate() );

  strictEqual( a.value, 'Hello World' );
});

test( 'transform null', function(assert)
{
  var prefix = 'transform_null_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['value'],
    validation: {
      rules: {
        value: 'if::equal:0|null'
      }
    }
  });

  var a = Task.create({value: 'notnull'});

  ok( a.$validate() );

  strictEqual( a.value, 'notnull' );

  a.value = 0;

  ok( a.$validate() );

  strictEqual( a.value, null );
});


// transform null

// required
ruleGenerator('required',
  '{$alias} is required.',
  function isInvalid(value) {
    return isEmpty( value );
  }
);

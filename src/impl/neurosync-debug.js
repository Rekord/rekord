(function(Neuro)
{

  if ( !window.console ) 
  {
    return;
  }

  var eventToDescription = 
  {
    /* Neuro */
    0:  'Created',
    /**/
    /* REST */
    1:  'REST',
    /**/
    /* Remote Data Processed */
    2:  'Remote data received, existing model updated',
    3:  'Remote data received, new model created',
    /**/
    /* Loading */
    4:  'Model remotely removed, removed locally',
    5:  'Models loaded remotely',
    6:  'Offline, failed loading models remotely',
    7:  'Error loading remote models',
    8:  'Saved model removed locally because it does not exist remotely',
    9:  'Models loaded locally',
    10: 'Model deleted locally, resuming remote deletion',
    11: 'Model loaded but not saved, resuming save',
    12: 'Model loaded',
    73: 'Auto-refresh',
    /**/
    /* Real-time */
    13: 'Real-time save',
    14: 'Real-time removal',
    /**/
    /* Save */
    15: 'Model saved values',
    16: 'Model save published',
    17: 'Model save failure, conflicted',
    18: 'Model update failure, does not exist remotely',
    19: 'Model save error for',
    20: 'Model save failure, offline!',
    21: 'Model save resume',
    22: 'Models loading remotely resumed',
    23: 'Model saved locally',
    24: 'Model failed to save locally, will still try to save it remotely',
    25: 'Model saved remotely',
    /**/
    /* Remove */
    26: 'Model remove published',
    27: 'Model removed locally',
    28: 'Model remove failure, does not exist remotely',
    29: 'Model remove error',
    30: 'Model remove failure, offline!',
    31: 'Model remove resume',
    32: 'Model removed remotely',
    33: 'Model removed locally',
    34: 'Model failed to remove locally, will still try to remove it remotely',
    /**/
    /* Get */
    104: 'Model local get skipped',
    105: 'Model local get',
    106: 'Model local get error',
    107: 'Model remote get',
    108: 'Model remote get error',
    /**/
    /* Network Status */
    35: 'Application Online',
    36: 'Application Offline',
    /**/
    /* Live */
    37: 'LIVE',
    /**/
    /* Save */
    38: 'Model local save ineffective, model is deleted',
    39: 'Model local save blocked, waiting until previous operation finishes',
    40: 'Model save ineffective, model is deleted',
    41: 'Model remote save ineffective, model is deleted',
    42: 'Model remove save blocked, waiting until previous operation finishes',
    /**/
    /* Remove */
    43: 'Model remote remove blocked, waiting until previous operation finishes',
    44: 'Model local remove blocked, waiting until previous operation finishes',
    45: 'Model local remove ineffective, no local model to remove',
    46: 'Model local remove effective, unsaved model removed',
    /**/
    /* Save Block */
    47: 'Model had a pending save that was canceled by remove',
    48: 'Model update blocked with older revision',
    /**/
    /* Has One Relationship */
    49: 'Model ninja removed',
    50: 'Model ninja saved',
    51: 'Initial pulled from model',
    52: 'Initial value loaded',
    53: 'Initialized',
    54: 'Relation cleared',
    55: 'Relation set',
    56: 'Pre-save',
    57: 'Post-remove',
    58: 'Clear key',
    59: 'Set key',
    60: 'Loaded',
    /**/
    /* Belongs To Relationship */
    61: 'Initialized',
    62: 'Model ninja removed',
    63: 'Model ninja saved',
    64: 'Initial pulled from model',
    65: 'Initial value loaded',
    66: 'Relation cleared',
    67: 'Relation set',
    69: 'Post-remove',
    70: 'Clear key',
    71: 'Set key',
    72: 'Loaded',
    /**/
    /* Has Many Relationship */
    74: 'Initialized',
    75: 'Model ninja removed',
    76: 'Model ninja saved',
    77: 'Initial value loaded',
    78: 'Initial pulled from model',
    79: 'Model removed',
    80: 'Models sorted',
    81: 'Model added',
    82: 'Models lazily loaded',
    83: 'Model grabbed based on initial',
    84: 'Model ninja added',
    85: 'Auto-saving',
    86: 'Pre-remove',
    87: 'Post-save',
    /**/
    /* Has Many Through Relationship */
    88: 'Initialized',
    89: 'Model ninja removed',
    90: 'Model ninja saved',
    91: 'Through ninja removed',
    92: 'Initial value loaded',
    93: 'Initial pulled from model',
    94: 'Model removed',
    95: 'Models sorted',
    96: 'Model added',
    97: 'Models lazily loaded',
    98: 'Model grabbed based on initial',
    99: 'Model ninja added',
    100:'Auto-saving',
    101:'Pre-remove',
    102:'Post-save',
    103:'Through added',
    68: 'Through removed'
    /**/
  };

  function getContext(x) 
  {
    if ( x instanceof Neuro.Model ) 
    {
      return '[' + x.$db.className + ':' + x.$db.toString( x ) + '] ';
    }
    if ( x instanceof Neuro.Database ) 
    {
      return '[' + x.className + '] ';
    }
    if ( x instanceof Neuro.Relation )
    {
      return '[' + x.database.className + ':' + x.type + ':' + x.model.Database.className + '] ';
    }
    if ( x instanceof Neuro.Operation )
    { 
      return '[' + x.type + '] ';
    }

    return false;
  }

  function findContext(that, args) 
  {
    var c = getContext( that );

    if (c !== false) 
    {
      return c;
    }

    for (var i = 0; i < args.length; i++) 
    {
      var c = getContext( args[i] );

      if ( c !== false ) 
      {
        return c;
      }
    }

    return '[Neuro] ';
  }

  Neuro.debugExclude = [];

  Neuro.debugInclude = false;

  Neuro.debugNoData = [];

  Neuro.debugWithData = false;

  Neuro.debugTrace = false;

  Neuro.debugStyle = 'color:blue; font-weight:bold';

  Neuro.debug = function(eventType, source) 
  {
    if ( Neuro.debugInclude !== false )
    {
      if ( Neuro.indexOf( Neuro.debugInclude, eventType ) === false )
      {
        return;
      }
    }
    else if ( Neuro.indexOf( Neuro.debugExclude, eventType ) !== false )
    {
      return;
    }

    if ( eventType in eventToDescription ) 
    {
      var args = Array.prototype.slice.call( arguments, 1 ); 

      if ( Neuro.debugWithData !== false )
      {
        if ( Neuro.indexOf( Neuro.debugWithData, eventType ) === false )
        {
          args = [];
        }
      }
      else if ( Neuro.indexOf( Neuro.debugNoData, eventType ) !== false )
      {
        args = [];
      }

      var context = findContext( source, args );
      var description = eventToDescription[ eventType ];

      if ( Neuro.debugTrace )
      {
        args.push( new Error() );
      }

      if ( args.length && console.groupCollapsed )
      {
        console.groupCollapsed( '%c' + context + description, Neuro.debugStyle );
        for (var i = 0; i < args.length; i++) {
          console.log( args[i] );
        }
        console.groupEnd();
      }
      else
      {
        console.log( '%c' + context + description, Neuro.debugStyle );        
      }
    }
    else
    {
      if ( arguments.length > 1 && console.groupCollapsed )
      {
        console.groupCollapsed( '%c' + arguments[0], Neuro.debugStyle );
        for (var i = 1; i < arguments.length; i++) {
          console.log( arguments[ i ] );
        }
        console.groupEnd();
      }
      else
      {
        console.log.apply( console, arguments );
      }
    }
  };

})( Neuro );
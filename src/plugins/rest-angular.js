angular.module('neurosync', [])
  .factory('Neuro', ['$http', '$interpolate', '$log', function($http, $interpolate, $log) 
  {

    var EventToDescription = {
      0:  $interpolate('Neuro created, options = {{ a }}'),
      1:  $interpolate('{{ a.method }} {{ a.data }} to {{ a.url }}'),
      2:  $interpolate('Remote data received to {{ b.id }}, existing model updated {{ a }}'),
      3:  $interpolate('Remote data received, new model created {{ a }}'),
      4:  $interpolate('Model remotely removed, removed locally {{ a.$toJSON() }}'),
      5:  $interpolate('Models loaded remotely: {{ a.length }}'),
      6:  $interpolate('Offline, failed loading models remotely'),
      7:  $interpolate('Error loading remote models, status: {{ a }}'),
      8:  $interpolate('Saved model removed locally because it does not exist remotely {{ a }}'),
      9:  $interpolate('Models loaded locally: {{ a.length }}'),
      10: $interpolate('Model deleted locally, resuming remote deletion of {{ a.$toJSON() }}'),
      11: $interpolate('Model loaded but not saved, resuming save of {{ a.$toJSON() }}'),
      12: $interpolate('Model loaded {{ a.$toJSON() }}'),
      13: $interpolate('Real-time save {{ a }}'),
      14: $interpolate('Real-time removal {{ a }}'),
      15: $interpolate('Model saved values: {{ a }}'),
      16: $interpolate('Model save published {{ a }} for {{ b.$toJSON() }}'),
      17: $interpolate('Model save failure, conflict for {{ a }}'),
      18: $interpolate('Model update failure, does not exist remotely for {{ a }}'),
      19: $interpolate('Model save error for {{ a.$toJSON() }} with status {{ b }}'),
      20: $interpolate('Model save failure, offline! {{ a.$toJSON() }}'),
      21: $interpolate('Model save resume {{ a.$toJSON() }}'),
      22: $interpolate('Models loading remotely resumed'),
      23: $interpolate('Model saved locally {{ a.$toJSON() }}'),
      24: $interpolate('Model failed to save locally, will still try to save it remotely. Error {{ b }} for model {{ a.$toJSON() }}'),
      25: $interpolate('Model saved remotely {{ a.$toJSON() }}'),
      26: $interpolate('Model remove published with key {{ a }}: {{ b.$toJSON() }}'),
      27: $interpolate('Model removed locally with key {{ a }}: {{ b.$toJSON() }}'),
      28: $interpolate('Model remove failure, does not exist remotely with key {{ a }}: {{ b.$toJSON() }}'),
      29: $interpolate('Model remove error with status {{ a }} for {{ b.$toJSON() }}'),
      30: $interpolate('Model remove failure, offline! {{ a.$toJSON() }}'),
      31: $interpolate('Model remove resume for {{ a.$toJSON() }}'),
      32: $interpolate('Model removed remotely {{ a.$toJSON() }}'),
      33: $interpolate('Model removed locally {{ a.$toJSON() }}'),
      34: $interpolate('Model failed to remove locally, will still try to remove it remotely. Error: {{ b }} for {{ a.$toJSON() }}'),
      35: $interpolate('Application Online'),
      36: $interpolate('Application Offline'),
      37: $interpolate('PUBSUB created {{ a.url }}'),
      38: $interpolate('Model local save ineffective, model is deleted {{ a.$toJSON() }}'),
      39: $interpolate('Model local save blocked, waiting until previous operation finishes for {{ a.$toJSON() }}'),
      40: $interpolate('Model save ineffective, model is deleted {{ a.$toJSON() }}'),
      41: $interpolate('Model remote save ineffective, model is deleted {{ a.$toJSON() }}'),
      42: $interpolate('Model remove save blocked, waiting until previous operation finishes for {{ a.$toJSON() }}'),
      43: $interpolate('Model remote remove blocked, waiting until previous operation finishes for {{ a.$toJSON() }}'),
      44: $interpolate('Model local remove blocked, waiting until previous operation finishes for {{ a.$toJSON() }}'),
      45: $interpolate('Model local remove ineffective, no local model to remove for {{ a.$toJSON() }}'),
      46: $interpolate('Model local remove effective, unsaved model removed {{ a.$toJSON() }}'),
      47: $interpolate('Model had a pending save that was canceled by remove for {{ a.$toJSON() }}'),
      48: $interpolate('Model update blocked with older revision {{ a.$toJSON() }}: {{ b }}')
    };

    Neuro.debug = function(event, a, b, c)
    {
      var exp = EventToDescription[ event ];
      var result = exp( { a: a, b: b, c: c } );

      $log.debug( event + ' - ' +  result );
    };

    Neuro.rest = function(database)
    {
      return function(options, success, failure) 
      {
        Neuro.debug( Neuro.Events.REST, options );

        if ( Neuro.forceOffline )
        {
          failure( {}, 0 );
        } 
        else 
        {
          function onRestSuccess(response) 
          {
            success( response.data );
          }
          
          function onRestError(response) 
          {
            failure( response.data, response.status );
          }

          $http( options ).then( onRestSuccess, onRestError );
        }            
      };
    };

    Neuro.listenToNetworkStatus();

    return Neuro;
  }])
;
(function (app, undefined)
{

  var NeuroSettings = {
    debug: false
  };

  app
    .constant( 'NeuroSettings', NeuroSettings )
    .factory( 'Neuro', ['$http', NeuroFactory] )
    .factory( 'NeuroBind', ['$log', NeuroBindFactory] )
  ;

  function NeuroFactory($http)
  {

    Neuro.rest = function(database)
    {

      function execute( method, data, url, success, failure, offlineValue )
      {
        Neuro.debug( Neuro.Debugs.REST, this, method, url, data );

        if ( Neuro.forceOffline )
        {
          failure( offlineValue, 0 );
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

          var options = 
          {
            method: method,
            data: data,
            url: url
          };

          $http( options ).then( onRestSuccess, onRestError );
        }
      }
      
      return {
        all: function( success, failure )
        {
          execute( 'GET', undefined, database.api, success, failure, [] );
        },
        get: function( model, success, failure )
        {
          execute( 'GET', undefined, database.api + model.$key(), success, failure );
        },
        create: function( model, encoded, success, failure )
        {
          execute( 'POST', encoded, database.api, success, failure, {} );
        },
        update: function( model, encoded, success, failure )
        {
          execute( 'PUT', encoded, database.api + model.$key(), success, failure, {} );
        },
        remove: function( model, success, failure )
        {
          execute( 'DELETE', undefined, database.api + model.$key(), success, failure, {} );
        }
      };

    };

    var Neuro_debug = Neuro.debug;

    Neuro.debug = function()
    {
      if ( NeuroSettings.debug )
      {
        Neuro_debug.apply( this, arguments );
      }
    };

    Neuro.Debugs.ScopeEval = 100000;

    Neuro.listenToNetworkStatus();

    return Neuro;
  }

  function NeuroBindFactory($log)
  {
    function NeuroBind( scope, target, callback )
    {
      if ( !(this instanceof NeuroBind) ) return new NeuroBind( scope, target, callback );

      this.scope = scope;
      this.target = target;
      this.callback = callback;

      this.notify = this.newNotification();
      this.release = this.newRelease();
      
      this.on();
    }

    NeuroBind.Events = {
      Database: 'updated',
      Model: 'saved removed remote-update relation-update',
      Scope: '$destroy'
    };

    NeuroBind.prototype = 
    {
      on: function()
      {
        if ( Neuro.isNeuro( this.target ) )
        {
          this.target = this.target.Database;
        }

        if ( this.target instanceof Neuro.Database )
        {
          this.target.on( NeuroBind.Events.Database, this.notify  );
        }
        else if ( this.target instanceof Neuro.Model )
        {
          this.target.$on( NeuroBind.Events.Model, this.notify );
        }

        this.scope.$on( NeuroBind.Events.Scope, this.release );
      },
      off: function()
      {
        if ( this.target instanceof Neuro.Database )
        {
          this.target.off( NeuroBind.Events.Database, this.notify );
        }
        else if ( this.target instanceof Neuro.Model )
        {
          this.target.$off( NeuroBind.Events.Model, this.notify );
        }
      },
      newRelease: function()
      {
        var binder = this;

        return function()
        {
          binder.off();
        };
      },
      newNotification: function()
      {
        var binder = this;

        return function()
        {
          binder.scope.$evalAsync(function()
          {
            if ( binder.callback )
            {
              binder.callback.apply( binder.target );
            }

            if ( NeuroSettings.debug )
            {
              Neuro.debug( '[Scope:$evalAsync]', binder.scope );
            }
          });
        };
      }
    };

    return NeuroBind;
  }

})( angular.module('neurosync', []) );
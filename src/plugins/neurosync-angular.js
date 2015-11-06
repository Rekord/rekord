(function (app)
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
      return function(method, model, data, success, failure) 
      {
        var options = {
          method: method,
          data: data,
          url: (!model || method === 'POST') ? database.api : database.api + model.$key()
        };

        Neuro.debug( Neuro.Events.REST, this, options.method, options.url, options.data );

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

    var Neuro_debug = Neuro.debug;

    Neuro.debug = function()
    {
      if ( NeuroSettings.debug )
      {
        Neuro_debug.apply( this, arguments );
      }
    };

    Neuro.Events.ScopeEval = 100000;

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
        if ( this.target.Database && this.target.Model )
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
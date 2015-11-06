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
      return function(options, success, failure) 
      {
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
          this.target.on( 'updated', this.notify  );
        }
        else if ( this.target instanceof Neuro.Model )
        {
          this.target.$on( 'saved removed remote-update', this.notify );
        }

        this.scope.$on( '$destroy', this.release );
      },
      off: function()
      {
        if ( this.target instanceof Neuro.Database )
        {
          this.target.off( 'updated', this.notify );
        }
        else if ( this.target instanceof Neuro.Model )
        {
          this.target.$off( 'saved removed remote-update', this.notify );
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
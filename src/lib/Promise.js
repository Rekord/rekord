
function Promise(executor, cancelable)
{
  this.status = Promise.Status.Pending;
  this.cancelable = cancelable !== false;
  this.nexts = [];

  Class.prop( this, 'results', null );

  if ( isFunction( executor ) )
  {
    executor(
      bind(this, this.resolve),
      bind(this, this.reject),
      bind(this, this.noline),
      bind(this, this.cancel)
    );
  }
}

Promise.Status =
{
  Pending:    'pending',
  Success:    'success',
  Failure:    'failure',
  Offline:    'offline',
  Canceled:   'canceled'
};

Promise.Events =
{
  Success:      'success',
  Failure:      'failure',
  Offline:      'offline',
  Canceled:     'canceled',
  Unsuccessful: 'failure offline canceled',
  Complete:     'success failure offline canceled'
};

Promise.all = function(iterable)
{
  var all = new Promise();
  var successes = 0;
  var goal = iterable.length;
  var results = [];

  function handleSuccess()
  {
    results.push( AP.slice.apply( arguments ) );

    if ( ++successes === goal )
    {
      all.resolve( results );
    }
  }

  for (var i = 0; i < iterable.length; i++)
  {
    var p = iterable[ i ];

    if ( p instanceof Promise )
    {
      p.then( handleSuccess, all.reject, all.noline, all.cancel, all );
    }
    else
    {
      goal--;
    }
  }

  return all;
};

Promise.race = function(iterable)
{
  var race = new Promise();

  for (var i = 0; i < iterable.length; i++)
  {
    var p = iterable[ i ];

    if ( p instanceof Promise )
    {
      p.bind( race );
    }
  }

  return race;
};

Promise.reject = function(reason)
{
  var p = new Promise();
  p.reject.apply( p, arguments );
  return p;
};

Promise.resolve = function()
{
  var p = new Promise();
  p.resolve.apply( p, arguments );
  return p;
};

Promise.noline = function(reason)
{
  var p = new Promise();
  p.noline.apply( p, arguments );
  return p;
};

Promise.cancel = function()
{
  var p = new Promise();
  p.cancel.apply( p, arguments );
  return p;
};

Promise.then = function()
{
  var p = new Promise();
  p.resolve();
  return p.then.apply( p, arguments );
};

Promise.singularity = (function()
{
  var singularity = null;
  var singularityResult = null;
  var consuming = false;
  var promiseCount = 0;
  var promiseComplete = 0;

  function handleSuccess()
  {
    if ( ++promiseComplete === promiseCount )
    {
      singularity.resolve( singularityResult );
    }
  }

  function bindPromise(promise)
  {
    promiseCount++;
    promise.then( handleSuccess, singularity.reject, singularity.noline, null, singularity );
  }

  return function(promiseOrContext, contextOrCallback, callbackOrNull)
  {
    var promise = promiseOrContext;
    var context = contextOrCallback;
    var callback = callbackOrNull;

    if (!(promise instanceof Promise))
    {
      promise = false;
      context = promiseOrContext;
      callback = contextOrCallback;
    }

    if ( !consuming )
    {
      consuming = true;
      singularity = new Promise( null, false );
      singularityResult = context;
      promiseCount = 0;
      promiseComplete = 0;

      if (promise)
      {
        bindPromise( promise );
      }

      try
      {
        callback.call( context, singularity );
      }
      catch (ex)
      {
        Rekord.trigger( Rekord.Events.Error, [ex] );

        throw ex;
      }
      finally
      {
        consuming = false;
      }
    }
    else
    {
      if (promise)
      {
        bindPromise( promise );
      }

      callback.call( context, singularity );
    }

    if (promiseCount === 0)
    {
      singularity.resolve();
    }

    return singularity;
  };

})();

Class.create( Promise,
{
  resolve: function()
  {
    this.finish( Promise.Status.Success, Promise.Events.Success, arguments );
  },

  reject: function()
  {
    this.finish( Promise.Status.Failure, Promise.Events.Failure, arguments );
  },

  noline: function()
  {
    this.finish( Promise.Status.Offline, Promise.Events.Offline, arguments );
  },

  cancel: function()
  {
    if ( this.cancelable )
    {
      this.finish( Promise.Status.Canceled, Promise.Events.Canceled, arguments );
    }
  },

  bind: function(promise)
  {
    this.success( promise.resolve, promise );
    this.failure( promise.reject, promise );
    this.offline( promise.noline, promise );
    this.canceled( promise.cancel, promise );
  },

  then: function(success, failure, offline, canceled, context, persistent )
  {
    // The promise which can be resolved if any of the callbacks return
    // a Promise which is resolved.
    var next = new Promise();

    this.success( success, context, persistent, next );
    this.failure( failure, context, persistent, next );
    this.offline( offline, context, persistent, next );
    this.canceled( canceled, context, persistent, next );
    this.addNext( next );
    
    return next;
  },

  addNext: function(next)
  {
    var nexts = this.nexts;

    if (nexts.length === 0)
    {
      // If this promise is not successful, let all chained promises know.
      this.unsuccessful(function()
      {
        for (var i = 0; i < nexts.length; i++)
        {
          nexts[ i ].finish( this.status, this.status, arguments );
        }
      });
    }

    nexts.push( next );
  },

  reset: function(clearListeners)
  {
    this.status = Promise.Status.Pending;

    if ( clearListeners )
    {
      this.off();
    }

    return this;
  },

  finish: function(status, events, results)
  {
    if ( this.status === Promise.Status.Pending )
    {
      this.results = AP.slice.apply( results );
      this.status = status;
      this.trigger( events, results );
    }
  },

  listenFor: function(immediate, events, callback, context, persistent, next)
  {
    if ( isFunction( callback ) )
    {
      var handleEvents = function()
      {
        var result = callback.apply( context || this, this.results );

        if ( result instanceof Promise &&
             next instanceof Promise &&
             next.isPending() )
        {
          result.bind( next );
        }
      };

      if ( this.status === Promise.Status.Pending )
      {
        if ( persistent )
        {
          this.on( events, handleEvents, this );
        }
        else
        {
          this.once( events, handleEvents, this );
        }
      }
      else if ( immediate )
      {
        handleEvents.apply( this );
      }
    }

    return this;
  },

  success: function(callback, context, persistent, next)
  {
    return this.listenFor( this.isSuccess(), Promise.Events.Success, callback, context, persistent, next );
  },

  unsuccessful: function(callback, context, persistent, next)
  {
    return this.listenFor( this.isUnsuccessful(), Promise.Events.Unsuccessful, callback, context, persistent, next );
  },

  failure: function(callback, context, persistent, next)
  {
    return this.listenFor( this.isFailure(), Promise.Events.Failure, callback, context, persistent, next );
  },

  catch: function(callback, context, persistent, next)
  {
    return this.listenFor( this.isFailure(), Promise.Events.Failure, callback, context, persistent, next );
  },

  offline: function(callback, context, persistent, next)
  {
    return this.listenFor( this.isOffline(), Promise.Events.Offline, callback, context, persistent, next );
  },

  canceled: function(callback, context, persistent, next)
  {
    return this.listenFor( this.isCanceled(), Promise.Events.Canceled, callback, context, persistent, next );
  },

  complete: function(callback, context, persistent, next)
  {
    return this.listenFor( true, Promise.Events.Complete, callback, context, persistent, next );
  },

  isSuccess: function()
  {
    return this.status === Promise.Status.Success;
  },

  isUnsuccessful: function()
  {
    return this.status !== Promise.Status.Success && this.status !== Promise.Status.Pending;
  },

  isFailure: function()
  {
    return this.status === Promise.Status.Failure;
  },

  isOffline: function()
  {
    return this.status === Promise.Status.Offline;
  },

  isCanceled: function()
  {
    return this.status === Promise.Status.Canceled;
  },

  isPending: function()
  {
    return this.status === Promise.Status.Pending;
  },

  isComplete: function()
  {
    return this.status !== Promise.Status.Pending;
  }

});

addEventful( Promise );

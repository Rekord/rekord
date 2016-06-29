
function Promise(executor, cancelable)
{
  this.status = Promise.Status.Pending;
  this.results = null;
  this.cancelable = cancelable !== false;

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
      p.then( race.resolve, race.reject, race.noline, race.cancel, race );
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

  return function(promise, context, callback)
  {
    if ( !consuming )
    {
      consuming = true;
      singularity = new Promise( null, false );
      singularityResult = context;
      promiseCount = 0;
      promiseComplete = 0;

      bindPromise( promise );

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
      bindPromise( promise );

      callback.call( context, singularity );
    }

    return singularity;
  };

})();

addMethods( Promise.prototype,
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

  then: function(success, failure, offline, canceled, context, persistent )
  {
    this.success( success, context, persistent );
    this.failure( failure, context, persistent );
    this.offline( offline, context, persistent );
    this.canceled( canceled, context, persistent );

    return this;
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

  listenFor: function(immediate, events, callback, context, persistent)
  {
    if ( isFunction( callback ) )
    {
      if ( this.status === Promise.Status.Pending )
      {
        if ( persistent )
        {
          this.on( events, callback, context );
        }
        else
        {
          this.once( events, callback, context );
        }
      }
      else if ( immediate )
      {
        callback.apply( context || this, this.results );
      }
    }

    return this;
  },

  success: function(callback, context, persistent)
  {
    return this.listenFor( this.isSuccess(), Promise.Events.Success, callback, context, persistent );
  },

  unsuccessful: function(callback, context, persistent)
  {
    return this.listenFor( this.isUnsuccessful(), Promise.Events.Unsuccessful, callback, context, persistent );
  },

  failure: function(callback, context, persistent)
  {
    return this.listenFor( this.isFailure(), Promise.Events.Failure, callback, context, persistent );
  },

  catch: function(callback, context, persistent)
  {
    return this.listenFor( this.isFailure(), Promise.Events.Failure, callback, context, persistent );
  },

  offline: function(callback, context, persistent)
  {
    return this.listenFor( this.isOffline(), Promise.Events.Offline, callback, context, persistent );
  },

  canceled: function(callback, context, persistent)
  {
    return this.listenFor( this.isCanceled(), Promise.Events.Canceled, callback, context, persistent );
  },

  complete: function(callback, context, persistent)
  {
    return this.listenFor( true, Promise.Events.Complete, callback, context, persistent );
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

addEventful( Promise.prototype );

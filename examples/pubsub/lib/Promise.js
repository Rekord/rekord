
/**
 * Instantiates a new Promise. 
 *
 * @constructor
 * @memberOf Stork
 * @param {Object} context
 *        The `this` to apply to the success, failure, and error callbacks.
 * @param {function} [success]
 *        A success callback to add to be invoked.
 * @param {function} [failure]
 *        A failure callback to add to be invoked.
 * @param {Stork.Promise} [root]
 *        The root promise, if one exists.
 */
function Promise(context, success, failure, root)
{
  /**
   * The `this` to apply to the callbacks.
   * 
   * @type {Object}
   */
  this.context = context;

  /**
   * The root promise in the chain of promises.
   * 
   * @type {Promise}
   */
  this.root = root || this;

  /**
   * The next promise in the chain of promises.
   * 
   * @type {Promise}
   */
  this.next = null;

  /**
   * The first valid promise returned from a success callback.
   * @private
   * 
   * @type {Promise}
   */
  this.nextFromSuccess = null;

  /**
   * The current state of this promise.
   * 
   * @type {Number}
   * @default Promise.PENDING
   */
  this.state = Promise.PENDING;

  /**
   * An array of success callbacks to invoke when the promise is marked as
   * successful.
   * 
   * @type {function[]}
   */
  this.successes = [];

  /**
   * An array of failure callbacks to invoke when the promise is marked as
   * failed.
   * 
   * @type {function[]}
   */
  this.failures = [];

  /**
   * An array of error callbacks stored at the root promise.
   * 
   * @type {function[]}
   */
  this.errors = [];

  /**
   * An array of arguments that are to be passed to the success or failure 
   * callbacks.
   * 
   * @type {Array}
   */
  this.args = null;

  // Queue the passed in success & failure callbacks.
  this.$queue( success, failure );
}

/**
 * Promise is awaiting for a success or failure notification.
 * @type {Number}
 */
Promise.PENDING = 0;

/**
 * Promise has been marked as a failure.
 * @type {Number}
 */
Promise.FAILURE = 1;

/**
 * Promise has been marked as a success.
 * @type {Number}
 */
Promise.SUCCESS = 2;

/**
 * Promise has been marked as a success and the next promise has been notified.
 * @type {Number}
 */
Promise.CHAINED = 3;

Promise.prototype = 
{
  /**
   * Adds success and optionally a failure callback to be invoked when the 
   * promised operation completes. The success callback can return a promise 
   * to chain promises.
   * 
   * @param  {function} success
   *         The function to invoke with the success arguments.
   * @param  {function} [failure]
   *         The function to invoke with the failure arguments.
   * @return {Stork.Promise} -
   *         The next promise to invoke when the returned promise from the 
   *         success callback finishes.
   */
  then: function(success, failure)
  {
    this.$queue( success, failure );  

    if ( !this.next )
    {
      this.next = new Promise( this.context, undefined, undefined, this );
    }
   
    if ( this.state & Promise.SUCCESS ) 
    {
      this.$handleSuccesses();
    } 
    else if ( this.state === Promise.FAILURE ) 
    {
      this.$handleFailures();
    }

    return this.next;
  },

  /**
   * Adds a generic error to be called if any of the promises in the chain have
   * failed.
   * 
   * @param  {function} error
   *         A function to invoke if any of the promises fail.
   * @return {Stork.Promise} -
   *         A reference to this promise.
   */
  error: function(error)
  {
    if ( typeof error === 'function' )
    {
      this.root.errors.push( error );

      if ( this.state === Promise.FAILURE )
      {
        this.$handleFailures();
      }  
    }

    return this;
  },

  // When the given promise finishes it will finish this promise as well.
  $bindTo: function(to, replacementArguments)
  {
    var from = this;

    to.then(
      function() {
        from.context = to.context;
        from.$success( replacementArguments || to.args );
      },
      function() {
        from.context = to.context;
        from.$failure( replacementArguments || to.args );
      })
    ;
  },

  // Returns true if the promise has yet to finish.
  $pending: function()
  {
    return this.state === Promise.PENDING;
  },

  // Adds a success and/or failure callback to this promise.
  $queue: function(success, failure)
  {
    if ( typeof success === 'function' ) this.successes.push( success );
    if ( typeof failure === 'function' ) this.failures.push( failure );
  },

  // Executes all successes currently on the promise.
  $handleSuccesses: function()
  {
    var succs = this.successes;
    for (var i = 0; i < succs.length; i++) 
    {
      var s = succs[ i ];
      var result = s.apply( this.context, this.args );

      if ( result instanceof Promise && !this.nextFromSuccess ) 
      {
        this.nextFromSuccess = result;
      }
    }

    succs.length = 0;

    this.$handleNext();
  },

  // If a next promise is given and one of the success callbacks return a 
  // promise, this promise is bound to the returned promise to complete the 
  // link in the chain.
  $handleNext: function()
  {
    var next = this.next;
    var returned = this.nextFromSuccess;

    if (next && returned && this.state === Promise.SUCCESS)
    {
      next.$bindTo( returned );
      this.state = Promise.CHAINED;
    }
  },

  // Marks this promise as a success if the promise hasn't finished yet.
  $success: function(args)
  {
    if ( this.state === Promise.PENDING ) 
    {
      this.args = args || [];
      this.state = Promise.SUCCESS;
      this.$handleSuccesses();
    }
  },

  // Executes all failures currently on the promise.
  $handleFailures: function()
  {
    var fails = this.failures;
    for (var i = 0; i < fails.length; i++) 
    {
      fails[ i ].apply( this.context, this.args );
    }
    fails.length = 0;

    var errors = this.root.errors;
    var errorArgument = [ this.args[ this.args.length - 1 ] ];
    for (var i = 0; i < errors.length; i++)
    {
      errors[ i ].apply( this.context, errorArgument );
    }
    errors.length = 0;
  },

  // Marks this promise as a failure if the promise hasn't finished yet.
  $failure: function(args)
  {
    if ( this.state === Promise.PENDING ) 
    {
      this.args = args || [];
      this.state = Promise.FAILURE;
      this.$handleFailures();
    }
  }

};

// Export the Promise class.
module.exports = Promise;
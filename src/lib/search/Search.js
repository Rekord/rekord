
/**
 * Options you can pass to {@link Rekord.Search} or {@link Rekord.Model.search}.
 *
 * @typedef {Object} searchOptions
 * @property {Function} [$encode] -
 *    A function which converts the search into an object to pass to the
 *    specified methods.
 * @property {Function} [$decode] -
 *    A function which takes the data returned from the server and returns
 *    The array of models which are to be placed in the
 *    {@link Rekord.Search#$results} property.
 */

/**
 *
 * @constructor
 * @memberof Rekord
 * @augments Rekord.Eventful$
 */
function Search(database, url, options)
{
  this.$init( database, url, options );
}

Search.Events =
{
  Ready:      'ready',
  Success:    'success',
  Failure:    'failure'
};

Search.Status =
{
  Pending:    'pending',
  Success:    'success',
  Failure:    'failure'
};

Search.Defaults =
{
};

addMethods( Search.prototype,
{

  $getDefaults: function()
  {
    return Search.Defaults;
  },

  $init: function(database, url, options)
  {
    applyOptions( this, options, this.$getDefaults(), true );

    this.$append = false;
    this.$db = database;
    this.$url = url;
    this.$results = new ModelCollection( database );
    this.$status = Search.Status.Success;
    this.$request = new Request( this, this.$handleSuccess, this.$handleFailure );
  },

  $set: function(props)
  {
    return transfer( props, this );
  },

  $run: function()
  {
    var encoded = this.$encode();
    var success = this.$request.onSuccess();
    var failure = this.$request.onFailure();

    this.$status = Search.Status.Pending;
    this.$db.rest.query( this.$url, encoded, success, failure );

    return this;
  },

  $cancel: function()
  {
    this.$off( Search.Events.Ready );
    this.$off( Search.Events.Success );
    this.$off( Search.Events.Failure );

    this.$request.cancel();

    return this;
  },

  $ready: function(callback, context)
  {
    if ( this.$status === Search.Status.Pending )
    {
      this.$once( Search.Events.Ready, callback, context );
    }
    else
    {
      callback.call( context, this );
    }

    return this;
  },

  $success: function(callback, context)
  {
    if ( this.$status === Search.Status.Pending )
    {
      this.$once( Search.Events.Success, callback, context );
    }
    else if ( this.$status === Search.Status.Success )
    {
      callback.call( context, this );
    }

    return this;
  },

  $failure: function(callback, context)
  {
    if ( this.$status === Search.Status.Pending )
    {
      this.$once( Search.Events.Failure, callback, context );
    }
    else if ( this.$status === Search.Status.Failure )
    {
      callback.call( context, this );
    }

    return this;
  },

  $handleSuccess: function(response)
  {
    var models = this.$decode.apply( this, arguments );

    this.$status = Search.Status.Success;

    if ( this.$append )
    {
      this.$results.addAll( models, false, true );
    }
    else
    {
      this.$results.reset( models, true );
    }

    this.$trigger( Search.Events.Ready, [this, response] );
    this.$trigger( Search.Events.Success, [this, response] );
  },

  $handleFailure: function(response)
  {
    this.$status = Search.Status.Failure;
    this.$trigger( Search.Events.Ready, [this, response] );
    this.$trigger( Search.Events.Failure, [this, response] );
  },

  $encode: function()
  {
    return cleanFunctions( copy( this ) );
  },

  $decode: function(models)
  {
    return models;
  },

  $key: function()
  {
    return '';
  }

});

eventize( Search.prototype, true );


/**
 * Options you can pass to {@link Rekord.Search} or {@link Rekord.Model.search}.
 *
 * @typedef {Object} searchOptions
 * @property {String} [$method='create'] -
 *    The function that's invoked on the {@link Rekord.rest} service
 * @property {Function} [$encode] -
 *    A function which converts the search into an object to pass to the
 *    specified methods.
 * @property {Function} [$decode] -
 *    A function which takes the data returned from the server and returns
 *    The array of models which are to be placed in the
 *    {@link Rekord.Search#$results} property.
 */

function Search(database, options)
{
  this.$init( database, options );
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
  $method:     'create'
};

Search.prototype =
{

  $getDefaults: function()
  {
    return Search.Defaults;
  },

  $init: function(database, options)
  {
    applyOptions( this, options, Search.Defaults, true );

    this.$db = database;
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

    this.$status = Search.Status.Pending;

    var success = this.$request.onSuccess();
    var failure = this.$request.onFailure();

    switch (this.$method) {
      case 'create':
        this.$db.rest.create( this, encoded, success, failure );
        break;
      case 'update':
        this.$db.rest.update( this, encoded, success, failure );
        break;
      case 'query':
        this.$db.rest.query( encoded, success, failure );
        break;
      default:
        throw 'Invalid search method: ' + this.$method;
    }

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
    this.$results.reset( models, true );
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

};

eventize( Search.prototype, true );

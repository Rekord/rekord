
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
 */
function Search(database, url, options, props, run)
{
  this.$init( database, url, options, props, run );
}

Search.Defaults =
{
};

addMethods( Search.prototype,
{

  $getDefaults: function()
  {
    return Search.Defaults;
  },

  $init: function(database, url, options, props, run)
  {
    applyOptions( this, options, this.$getDefaults(), true );

    this.$append = false;
    this.$db = database;
    this.$url = url;
    this.$set( props );
    this.$results = new ModelCollection( database );
    this.$promise = Promise.resolve( this );

    if ( run )
    {
      this.$run();
    }
  },

  $set: function(props)
  {
    if ( isObject( props ) )
    {
      transfer( props, this );
    }

    return this;
  },

  $unset: function()
  {
    for (var prop in this)
    {
      if ( prop.charAt(0) !== '$' )
      {
        delete this[ prop ];
      }
    }

    return this;
  },

  $run: function(url, props)
  {
    this.$url = url || this.$url;
    this.$set( props );

    var encoded = this.$encode();
    var success = bind( this, this.$handleSuccess );
    var failure = bind( this, this.$handleFailure );

    batchExecute(function()
    {
      this.$cancel();
      this.$promise = new Promise();
      this.$db.rest.query( this.$url, encoded, success, failure );

    }, this );

    return this.$promise;
  },

  $handleSuccess: function(response)
  {
    if ( !this.$promise.isPending() )
    {
      return;
    }

    var models = this.$decode.apply( this, arguments );

    if ( this.$append )
    {
      this.$results.addAll( models, false, true );
    }
    else
    {
      this.$results.reset( models, true );
    }

    this.$promise.resolve( this, response, this.$results );
  },

  $handleFailure: function(response, status)
  {
    if ( !this.$promise.isPending() )
    {
      return;
    }

    var offline = RestStatus.Offline[ status ];

    if ( offline )
    {
      Rekord.checkNetworkStatus();

      offline = !Rekord.online;
    }

    if ( offline )
    {
      this.$promise.noline( this, response, status );
    }
    else
    {
      this.$promise.reject( this, response, status );
    }
  },

  $cancel: function()
  {
    this.$promise.cancel();
  },

  $clear: function()
  {
    this.$results.clear();
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

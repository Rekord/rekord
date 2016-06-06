
/**
 * An instance
 *
 * @constructor
 * @memberof Rekord
 * @augments Rekord.Eventful$
 * @param {Rekord.Database} db
 *        The database instance used in model instances.
 */
function Model(db)
{
  this.$db = db;

  /**
   * @property {Database} $db
   *           The reference to the database this model is stored in.
   */

  /**
   * @property {Object} [$saved]
   *           An object of encoded data representing the values saved remotely.
   *           If this object does not exist - the model hasn't been created
   *           yet.
   */

  /**
   * @property {Object} [$local]
   *           The object of encoded data that is stored locally. It's $saved
   *           property is the same object as this $saved property.
   */

  /**
   * @property {Boolean} $status
   *           Whether there is a pending save for this model.
   */
}

Model.Events =
{
  Created:              'created',
  Saved:                'saved',
  PreSave:              'pre-save',
  PostSave:             'post-save',
  PreRemove:            'pre-remove',
  PostRemove:           'post-remove',
  PartialUpdate:        'partial-update',
  FullUpdate:           'full-update',
  Updated:              'updated',
  Detach:               'detach',
  Change:               'change',
  CreateAndSave:        'created saved',
  UpdateAndSave:        'updated saved',
  KeyUpdate:            'key-update',
  RelationUpdate:       'relation-update',
  Removed:              'removed',
  RemoteUpdate:         'remote-update',
  LocalSave:            'local-save',
  LocalSaveFailure:     'local-save-failure',
  LocalSaves:           'local-save local-save-failure',
  RemoteSave:           'remote-save',
  RemoteSaveFailure:    'remote-save-failure',
  RemoteSaveOffline:    'remote-save-offline',
  RemoteSaves:          'remote-save remote-save-failure remote-save-offline',
  LocalRemove:          'local-remove',
  LocalRemoveFailure:   'local-remove-failure',
  LocalRemoves:         'local-remove local-remove-failure',
  RemoteRemove:         'remote-remove',
  RemoteRemoveFailure:  'remote-remove-failure',
  RemoteRemoveOffline:  'remote-remove-offline',
  RemoteRemoves:        'remote-remove remote-remove-failure remote-remove-offline',
  LocalGet:             'local-get',
  LocalGetFailure:      'local-get-failure',
  LocalGets:            'local-get local-get-failure',
  RemoteGet:            'remote-get',
  RemoteGetFailure:     'remote-get-failure',
  RemoteGetOffline:     'remote-get-offline',
  RemoteGets:           'remote-get remote-get-failure remote-get-offline',
  RemoteAndRemove:      'remote-remove removed',
  SavedRemoteUpdate:    'saved remote-update',
  OperationsStarted:    'operations-started',
  OperationsFinished:   'operations-finished',
  Changes:              'saved remote-update key-update relation-update removed change'
};

Model.Status =
{
  Synced:         0,
  SavePending:    1,
  RemovePending:  2,
  Removed:        3
};

Model.Blocked =
{
  toString: true,
  valueOf: true
};

addMethods( Model.prototype,
{

  $init: function(props, remoteData)
  {
    this.$status = Model.Status.Synced;
    this.$operation = null;
    this.$relations = {};
    this.$dependents = {};

    if ( remoteData )
    {
      var key = this.$db.getKey( props, true );

      if ( !isValue( key ) )
      {
        this.$invalid = true;

        return;
      }

      this.$db.all[ key ] = this;
      this.$set( props, undefined, remoteData );
    }
    else
    {
      this.$reset( props );
    }

    if ( this.$db.loadRelations )
    {
      var databaseRelations = this.$db.relations;

      for (var name in databaseRelations)
      {
        var relation = databaseRelations[ name ];

        if ( !relation.lazy )
        {
          this.$getRelation( name, undefined, remoteData );
        }
      }
    }
  },

  $load: function(relations)
  {
    if ( isArray( relations ) )
    {
      for (var i = 0; i < relations.length; i++)
      {
        this.$getRelation( relations[ i ] );
      }
    }
    else if ( isString( relations ) )
    {
      this.$getRelation( relations );
    }
    else
    {
      var databaseRelations = this.$db.relations;

      for (var name in databaseRelations)
      {
        this.$getRelation( name );
      }
    }
  },

  $reset: function(props)
  {
    var def = this.$db.defaults;
    var fields = this.$db.fields;
    var relations = this.$db.relations;
    var keyFields = this.$db.key;

    if ( !isEmpty( def ) )
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];
        var defaultValue = def[ prop ];
        var evaluatedValue = evaluate( defaultValue );

        this[ prop ] = evaluatedValue;
      }

      for (var prop in relations)
      {
        if ( prop in def )
        {
          var defaultValue = def[ prop ];
          var evaluatedValue = evaluate( defaultValue );
          var relation = this.$getRelation( prop );

          relation.set( this, evaluatedValue );
        }
      }
    }
    else
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];

        this[ prop ] = undefined;
      }
    }

    var key = null;

    // First try pulling key from properties (only if it hasn't been
    // initialized through defaults)
    if ( props )
    {
      key = this.$db.getKey( props, true );
    }

    // If the key wasn't specified, try generating it on this model
    if ( !isValue( key ) )
    {
      key = this.$db.getKey( this );
    }
    // The key was specified in the properties, apply it to this model
    else
    {
      if ( isString( keyFields ) )
      {
        this[ keyFields ] = key;
      }
      else // if ( isArray( keyFields ) )
      {
        for (var i = 0; i < keyFields.length; i++)
        {
          var k = keyFields[ i ];

          this[ k ] = props[ k ];
        }
      }
    }

    // The key exists on this model - place the reference of this model
    // in the all map and set the cached key.
    if ( isValue( key ) )
    {
      this.$db.all[ key ] = this;
      this.$$key = key;
    }

    // Set the remaing properties
    this.$set( props );
  },

  $set: function(props, value, remoteData, avoidChange)
  {
    if ( isObject( props ) )
    {
      for (var prop in props)
      {
        this.$set( prop, props[ prop ], remoteData, true );
      }
    }
    else if ( isString( props ) )
    {
      if ( Model.Blocked[ props ] )
      {
        return;
      }

      var relation = this.$getRelation( props, value, remoteData );

      if ( relation )
      {
        relation.set( this, value, remoteData );
      }
      else
      {
        this[ props ] = value;
      }
    }

    if ( !avoidChange && isValue( props ) )
    {
      this.$trigger( Model.Events.Change, [props, value] );
    }
  },

  $get: function(props, copyValues)
  {
    if ( isArray( props ) )
    {
      return grab( this, props, copyValues );
    }
    else if ( isObject( props ) )
    {
      for (var p in props)
      {
        props[ p ] = copyValues ? copy( this[ p ] ) : this[ p ];
      }

      return props;
    }
    else if ( isString( props ) )
    {
      if ( Model.Blocked[ props ] )
      {
        return;
      }

      var relation = this.$getRelation( props );

      if ( relation )
      {
        var values = relation.get( this );

        return copyValues ? copy( values ) : values;
      }
      else
      {
        return copyValues ? copy( this[ props ] ) : this[ props ];
      }
    }
  },

  $decode: function()
  {
    this.$db.decode( this );
  },

  $isDependentsSaved: function(callbackOnSaved, contextOnSaved)
  {
    var dependents = this.$dependents;
    var off;

    var onDependentSave = function()
    {
      callbackOnSaved.apply( contextOnSaved || this, arguments );

      off();
    };

    for (var uid in dependents)
    {
      var dependent = dependents[ uid ];

      if ( !dependent.$isSaved() )
      {
        off = dependent.$once( Model.Events.RemoteSaves, onDependentSave );

        return false;
      }
    }

    return true;
  },

  $relate: function(prop, relate)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.relate( this, relate );
    }
  },

  $unrelate: function(prop, unrelated)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.unrelate( this, unrelated );
    }
  },

  $isRelated: function(prop, related)
  {
    var relation = this.$getRelation( prop );

    return relation && relation.isRelated( this, related );
  },

  $getRelation: function(prop, initialValue, remoteData)
  {
    var databaseRelations = this.$db.relations;
    var relation = databaseRelations[ prop ];

    if ( relation )
    {
      if ( !(prop in this.$relations) )
      {
        relation.load( this, initialValue, remoteData );
      }

      return relation;
    }

    return false;
  },

  $save: function(setProperties, setValue, cascade)
  {
    var cascade =
      (arguments.length === 3 ? cascade :
        (arguments.length === 2 && isObject( setProperties ) && isNumber( setValue ) ? setValue :
          (arguments.length === 1 && isNumber( setProperties ) ?  setProperties : this.$db.cascade ) ) );

    if ( this.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_DELETED, this.$db, this );

      return Promise.resolve( this );
    }

    if ( !this.$hasKey() )
    {
      throw 'Key missing from model';
    }

    var promise = createModelPromise( this, cascade,
      Model.Events.RemoteSave,
      Model.Events.RemoteSaveFailure,
      Model.Events.RemoteSaveOffline,
      Model.Events.LocalSave,
      Model.Events.LocalSaveFailure
    );

    return Promise.singularity( promise, this, function(singularity)
    {
      batchExecute(function()
      {
        this.$db.addReference( this );

        this.$set( setProperties, setValue );

        this.$trigger( Model.Events.PreSave, [this] );

        this.$db.save( this, cascade );

        this.$trigger( Model.Events.PostSave, [this] );

      }, this );
    });
  },

  $remove: function(cascade)
  {
    var cascade = isNumber( cascade ) ? cascade : this.$db.cascade;

    if ( !this.$exists() )
    {
      return Promise.resolve( this );
    }

    var promise = createModelPromise( this, cascade,
      Model.Events.RemoteRemove,
      Model.Events.RemoteRemoveFailure,
      Model.Events.RemoteRemoveOffline,
      Model.Events.LocalRemove,
      Model.Events.LocalRemoveFailure
    );

    return Promise.singularity( promise, this, function(singularity)
    {
      batchExecute(function()
      {
        this.$trigger( Model.Events.PreRemove, [this] );

        this.$db.remove( this, cascade );

        this.$trigger( Model.Events.PostRemove, [this] );

      }, this );
    });
  },

  $refresh: function(cascade)
  {
    var promise = createModelPromise( this, cascade,
      Model.Events.RemoteGet,
      Model.Events.RemoteGetFailure,
      Model.Events.RemoteGetOffline,
      Model.Events.LocalGet,
      Model.Events.LocalGetFailure
    );

    if ( canCascade( cascade, Cascade.Rest ) )
    {
      this.$addOperation( GetRemote, cascade );
    }
    else if ( canCascade( cascade, Cascade.Local ) )
    {
      this.$addOperation( GetLocal, cascade );
    }
    else
    {
      promise.resolve( this );
    }

    return promise;
  },

  $autoRefresh: function()
  {
    Rekord.on( Rekord.Events.Online, this.$refresh, this );

    return this;
  },

  $cancel: function(reset)
  {
    if ( this.$saved )
    {
      this.$save( this.$saved );
    }
    else if ( reset )
    {
      this.$reset();
    }
  },

  $clone: function(properties)
  {
    // If field is given, evaluate the value and use it instead of value on this object
    // If relation is given, call clone on relation

    var db = this.$db;
    var key = db.key;
    var fields = db.fields;
    var relations = db.relations;
    var values = {};

    for (var i = 0; i < fields.length; i++)
    {
      var f = fields[ i ];

      if ( properties && f in properties )
      {
        values[ f ] = evaluate( properties[ f ] );
      }
      else if ( f in this )
      {
        values[ f ] = copy( this[ f ] );
      }
    }

    if ( isString( key ) )
    {
      delete values[ key ];
    }

    var cloneKey = db.getKey( values );
    var modelKey = this.$key();

    if ( cloneKey === modelKey )
    {
      throw 'A clone cannot have the same key as the original model.';
    }

    for (var relationName in relations)
    {
      if ( properties && relationName in properties )
      {
        relations[ relationName ].preClone( this, values, properties[ relationName ] );
      }
    }

    var clone = db.instantiate( values );
    var relationValues = {};

    for (var relationName in relations)
    {
      if ( properties && relationName in properties )
      {
        relations[ relationName ].postClone( this, relationValues, properties[ relationName ] );
      }
    }

    clone.$set( relationValues );

    return clone;
  },

  $push: function(fields)
  {
    this.$savedState = this.$db.encode( this, grab( this, fields || this.$db.fields, true ), false );
  },

  $pop: function(dontDiscard)
  {
    if ( isObject( this.$savedState ) )
    {
      this.$set( this.$savedState );

      if ( !dontDiscard )
      {
        this.$discard();
      }
    }
  },

  $discard: function()
  {
    delete this.$savedState;
  },

  $exists: function()
  {
    return !this.$isDeleted() && this.$db.models.has( this.$key() );
  },

  $addOperation: function(OperationType, cascade)
  {
    var operation = new OperationType( this, cascade );

    if ( !this.$operation )
    {
      this.$operation = operation;
      this.$operation.execute();
    }
    else
    {
      this.$operation.queue( operation );
    }
  },

  $toJSON: function( forSaving )
  {
    var encoded = this.$db.encode( this, grab( this, this.$db.fields, true ), forSaving );

    var databaseRelations = this.$db.relations;
    var relations = this.$relations;

    for (var name in relations)
    {
      databaseRelations[ name ].encode( this, encoded, forSaving );
    }

    return encoded;
  },

  $changed: function()
  {
    this.$trigger( Model.Events.Change );
  },

  $key: function(quietly)
  {
    if ( !this.$$key )
    {
      this.$$key = this.$db.getKey( this, quietly );
    }

    return this.$$key;
  },

  $keys: function()
  {
    return this.$db.getKeys( this );
  },

  $uid: function()
  {
    return this.$db.name + '$' + this.$key();
  },

  $hasKey: function()
  {
    return hasFields( this, this.$db.key, isValue );
  },

  $isSynced: function()
  {
    return this.$status === Model.Status.Synced;
  },

  $isSaving: function()
  {
    return this.$status === Model.Status.SavePending;
  },

  $isPending: function()
  {
    return this.$status === Model.Status.SavePending || this.$status === Model.Status.RemovePending;
  },

  $isDeleted: function()
  {
    return this.$status >= Model.Status.RemovePending;
  },

  $isSaved: function()
  {
    return !!this.$saved;
  },

  $isSavedLocally: function()
  {
    return !!this.$local;
  },

  $isNew: function()
  {
    return !(this.$saved || this.$local);
  },

  $getChanges: function(alreadyEncoded)
  {
    var saved = this.$saved;
    var encoded = alreadyEncoded || this.$toJSON( true );
    var fields = this.$db.saveFields;

    return saved ? diff( encoded, saved, fields, equals ) : encoded;
  },

  $hasChanges: function()
  {
    if (!this.$saved)
    {
      return true;
    }

    var ignore = this.$db.ignoredFields;
    var encoded = this.$toJSON( true );
    var saved = this.$saved;

    for (var prop in encoded)
    {
      var currentValue = encoded[ prop ];
      var savedValue = saved[ prop ];

      if ( ignore[ prop ] )
      {
        continue;
      }

      if ( !equals( currentValue, savedValue ) )
      {
        return true;
      }
    }

    return false;
  },

  $listenForOnline: function(cascade)
  {
    if (!this.$offline)
    {
      this.$offline = true;

      Rekord.once( Rekord.Events.Online, this.$resume, this );
    }

    this.$resumeCascade = cascade;
  },

  $resume: function()
  {
    if (this.$status === Model.Status.RemovePending)
    {
      Rekord.debug( Rekord.Debugs.REMOVE_RESUME, this );

      this.$addOperation( RemoveRemote, this.$resumeCascade );
    }
    else if (this.$status === Model.Status.SavePending)
    {
      Rekord.debug( Rekord.Debugs.SAVE_RESUME, this );

      this.$addOperation( SaveRemote, this.$resumeCascade );
    }

    this.$offline = false;
  },

  toString: function()
  {
    return this.$db.className + ' ' + JSON.stringify( this.$toJSON() );
  }

});

addEventful( Model.prototype, true );

addEventFunction( Model.prototype, '$change', Model.Events.Changes, true );

function createModelPromise(model, cascade, restSuccess, restFailure, restOffline, localSuccess, localFailure)
{
  var promise = new Promise( null, false );

  if ( canCascade( cascade, Cascade.Rest ) )
  {
    var off1 = model.$once( restSuccess, function(data) {
      off2();
      off3();
      promise.resolve( model, data );
    });
    var off2 = model.$once( restFailure, function(data, status) {
      off1();
      off3();
      promise.reject( model, status, data );
    });
    var off3 = model.$once( restOffline, function() {
      off1();
      off2();
      promise.noline( model );
    });
  }
  else if ( canCascade( cascade, Cascade.Local ) )
  {
    var off1 = model.$once( localSuccess, function(data)
    {
      off2();
      promise.resolve( model, data );
    });
    var off2 = model.$once( localFailure, function(data, status)
    {
      off1();
      promise.reject( model, data );
    });
  }
  else
  {
    promise.resolve( model );
  }

  return promise;
}

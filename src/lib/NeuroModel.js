
/**
 * An instance
 * 
 * @constructor
 * @memberOf Neuro
 * @alias Model
 * @param {Neuro.Database} db
 *        The database instance used in model instances.
 */
function NeuroModel(db)
{
  this.$db = db;

  /**
   * @property {NeuroDatabase} $db
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

NeuroModel.Events = 
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
  RemoteSaves:          'remote-save remote-save-failure',
  LocalRemove:          'local-remove',
  LocalRemoveFailure:   'local-remove-failure',
  LocalRemoves:         'local-remove local-remove-failure',
  RemoteRemove:         'remote-remove',
  RemoteRemoveFailure:  'remote-remove-failure',
  RemoteRemoves:        'remote-remove remote-remove-failure',
  LocalGet:             'local-get',
  LocalGetFailure:      'local-get-failure',
  LocalGets:            'local-get local-get-failure',
  RemoteGet:            'remote-get',
  RemoteGetFailure:     'remote-get-failure',
  RemoteGets:           'remote-get remote-get-failure',
  RemoteAndRemove:      'remote-remove removed',
  SavedRemoteUpdate:    'saved remote-update',
  Changes:              'saved remote-update key-update relation-update removed change'
};

NeuroModel.Status =
{
  Synced:         0,
  SavePending:    1,
  RemovePending:  2,
  Removed:        3
};

NeuroModel.Blocked = 
{
  toString: true
};

NeuroModel.prototype =
{

  $init: function(props, remoteData)
  {
    this.$status = NeuroModel.Status.Synced;
    this.$operation = null;
    this.$relations = {};
    this.$dependents = {};

    if ( remoteData )
    {
      this.$set( props, void 0, remoteData );
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
          this.$getRelation( name, remoteData ); 
        }
      }
    }
  },

  $reset: function(props)
  {
    var def = this.$db.defaults;
    var fields = this.$db.fields;
    var relations = this.$db.relations;

    if ( isObject( def ) )
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

    this.$set( props );
  },

  $set: function(props, value, remoteData)
  {
    if ( isObject( props ) )
    {
      for (var prop in props)
      {
        this.$set( prop, props[ prop ], remoteData );
      }
    }
    else if ( isString( props ) )
    {
      if ( NeuroModel.Blocked[ props ] )
      {
        return;
      }

      var relation = this.$getRelation( props, remoteData );
      
      if ( relation )
      {
        relation.set( this, value, remoteData );
      }
      else
      {
        this[ props ] = value;
      }
    }

    if ( isValue( props ) )
    {
      this.$trigger( NeuroModel.Events.Change, [props, value] );      
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
      if ( NeuroModel.Blocked[ props ] )
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

  $isDependentsSaved: function(callbackOnSaved, contextOnSaved)
  {
    var dependents = this.$dependents;

    for (var uid in dependents)
    {
      var dependent = dependents[ uid ];

      if ( !dependent.$isSaved() )
      {
        var off = dependent.$once( NeuroModel.Events.RemoteSaves, onDependentSave );

        function onDependentSave()
        {
          callbackOnSaved.apply( contextOnSaved || this, arguments );
          off();
        }

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

  $getRelation: function(prop, remoteData)
  {
    var databaseRelations = this.$db.relations;
    var relation = databaseRelations[ prop ];

    if ( relation )
    {
      if ( !(prop in this.$relations) )
      {
        relation.load( this, remoteData );
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
          (arguments.length === 1 && isNumber( setProperties ) ?  setProperties : Neuro.Cascade.All ) ) );

    var existing = this.$db.preSave( this );

    this.$set( setProperties, setValue );

    this.$trigger( NeuroModel.Events.PreSave, [this] );

    this.$db.save( this, cascade, existing );

    this.$trigger( NeuroModel.Events.PostSave, [this] );
  },

  $remove: function(cascade)
  {
    if ( this.$exists() )
    {
      this.$trigger( NeuroModel.Events.PreRemove, [this] );

      this.$db.remove( this, cascade );

      this.$trigger( NeuroModel.Events.PostRemove, [this] );
    }
  },

  $refresh: function(cascade)
  {
    this.$db.refreshModel( this, cascade );
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

  $push: function(fields)
  {
    this.$savedState = this.$db.encode( grab( this, fields || this.$db.fields, true ) );
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
    var encoded = this.$db.encode( grab( this, this.$db.fields, true ) );

    var databaseRelations = this.$db.relations;
    var relations = this.$relations;

    for (var name in relations)
    {
      databaseRelations[ name ].encode( this, encoded, forSaving );
    }

    return encoded;
  },

  $change: function()
  {
    this.$trigger( NeuroModel.Events.Change );
  },

  $key: function()
  {
    return this.$db.getKey( this );
  },

  $keys: function()
  {
    return this.$db.getKeys( this );
  },

  $uid: function()
  {
    return this.$db.name + '$' + this.$db.getKey( this );
  },

  $hasKey: function()
  {
    return hasFields( this, this.$db.key, isValue );
  },

  $isSynced: function()
  {
    return this.$status === NeuroModel.Status.Synced;
  },

  $isPending: function()
  {
    return this.$status === NeuroModel.Status.SavePending;
  },

  $isDeleted: function()
  {
    return this.$status >= NeuroModel.Status.RemovePending;
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

    var encoded = this.$toJSON( true );
    var saved = this.$saved;

    for (var prop in encoded) 
    {
      var currentValue = encoded[ prop ];
      var savedValue = saved[ prop ];

      if ( !equals( currentValue, savedValue ) ) 
      {
        return true;
      }
    }

    return false;
  },

  toString: function()
  {
    return this.$db.className + ' ' + JSON.stringify( this.$toJSON() );
  }

};

eventize( NeuroModel.prototype, true );
addEventFunction( NeuroModel.prototype, '$change', NeuroModel.Events.Changes, true );
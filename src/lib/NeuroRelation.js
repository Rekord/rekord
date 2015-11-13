function NeuroRelation()
{

}

Neuro.Relations = {

};

Neuro.Store = {
  None: 0,
  Model: 1,
  Key: 2,
  Keys: 3
};

Neuro.Save = {
  None: 0,
  Model: 4
};

NeuroRelation.prototype =
{

  /**
   * Initializes this relation with the given database, field, and options.
   * 
   * @param  {[type]} database [description]
   * @param  {[type]} field    [description]
   * @param  {[type]} options  [description]
   * @return {[type]}          [description]
   */
  init: function(database, field, options)
  {
    this.database = database;
    this.name = field;
    this.options = options;
    this.store = options.store || Neuro.Store.None;
    this.save = options.save || Neuro.Save.None;
    this.auto = !!options.auto;
    this.property = !!options.property;
    this.discriminator = options.discriminator || 'discriminator';
    this.discriminators = options.discriminators || {};
    this.discriminated = !!options.discriminators;

    var setNeuro = this.setNeuro( database, field, options );

    if ( !isNeuro( options.model ) )
    {
      Neuro.get( options.model, setNeuro, this );
    }
    else
    {
      setNeuro.call( this, options.model );
    }
  },

  /**
   * 
   * @param {[type]} neuro [description]
   */
  setNeuro: function(database, field, options)
  {
    return function(neuro)
    {
      this.model = neuro;

      if ( !this.property )
      {
        this.property = indexOf( database.fields, this.name ) !== false;        
      }

      if ( this.discriminated )
      {
        this.loadDiscriminators();
      }

      this.onInitialized( database, field, options );
    };
  },

  /**
   * 
   * @param  {[type]} database [description]
   * @param  {[type]} fields   [description]
   * @param  {[type]} options  [description]
   * @return {[type]}          [description]
   */
  onInitialized: function(database, fields, options)
  {

  },

  /**
   * Loads the model.$relation variable with what is necessary to get, set, 
   * relate, and unrelate models. If serialize is true, look at model[ name ]
   * to load models/keys. If it contains values that don't exist or aren't 
   * actually related
   * 
   * @param  {[type]} model [description]
   * @return {[type]}       [description]
   */
  load: function(model)
  {
    
  },

  relate: function(model, input)
  {

  },

  unrelate: function(model, input)
  {

  },

  get: function(model)
  {

  },

  set: function(model, input)
  {
    this.unrelate( model );
    this.relate( model, input );
  },

  encode: function(model, out, forSaving)
  {
    
  },

  preSave: function(model)
  {

  },

  postSave: function(model)
  {

  },

  preRemove: function(model)
  {

  },

  postRemove: function(model)
  {

  },

  clearFields: function(target, targetFields)
  {
    var changes = false;

    if ( isString( targetFields ) )
    {
      if ( target[ targetFields ] )
      {
        target[ targetFields ] = null;
        changes = true;
      }
    }
    else // isArray ( targetFields )
    {
      for (var i = 0; i < targetFields.length; i++)
      {
        var targetField = targetFields[ i ];

        if ( target[ targetField ] )
        {
          target[ targetField ] = null;
          changes = true;
        }
      }
    }

    if ( changes && this.auto && !target.$isNew() )
    {
      target.$save();
    }
    
    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields)
  {
    var changes = false;

    source.$key();

    if ( isString( targetFields ) ) // && isString( sourceFields )
    {
      var targetValue = target[ targetFields ];
      var sourveValue = source[ sourceFields ];

      if ( !equals( targetValue, sourveValue ) )
      {
        target[ targetFields ] = sourveValue;
        changes = true;
      }
    }
    else // if ( isArray( targetFields ) && isArray( sourceFields ) )
    {
      for (var i = 0; i < targetFields.length; i++)
      {
        var targetField = targetFields[ i ];
        var targetValue = target[ targetField ];
        var sourceField = sourceFields[ i ];
        var sourceValue = source[ sourceField ];

        if ( !equals( targetValue, sourceValue ) )
        {
          target[ targetField ] = copy( sourceValue );
          changes = true;
        }
      }
    }

    if ( changes && this.auto && !target.$isNew() )
    {
      target.$save();
    }

    return changes;
  },

  getStoredArray: function(relateds, mode)
  {
    if ( !mode )
    {
      return null;
    }

    var stored = [];

    for (var i = 0; i < relateds.length; i++)
    {
      var related = this.getStored( relateds[ i ], mode );

      if ( related !== null )
      {
        stored.push( related );
      }
    }

    return stored;
  },

  getStored: function(related, mode)
  {
    if ( related )
    {
      switch (mode) 
      {
      case Neuro.Save.Model:
        return related.$toJSON( true );

      case Neuro.Store.Model:
        if ( related.$local ) 
        {
          return related.$local;
        } 
        else 
        {
          var local = related.$toJSON( false );

          if ( related.$saved ) 
          {
            local.$saved = related.$saved;
          }

          return local;
        }

      case Neuro.Store.Key:
        return related.$key();

      case Neuro.Store.Keys:
        return related.$keys();

      }
    }

    return null;
  },

  /* Polymorphic Relationships */

  loadDiscriminators: function()
  {
    for (var discriminator in this.discriminators)
    {
      var name = this.discriminators[ discriminator ];

      Neuro.get( name, this.setDiscriminated, this );
    }
  },

  setDiscriminated: function(discriminator)
  {
    return function(neuro)
    {
      this.discriminators[ discriminator ] = neuro;
    };
  },

  getDiscriminator: function(model)
  {
    return model[ this.discriminator ];
  },

  getDiscriminatorDatabase: function(model)
  {
    var discriminator = this.getDiscriminator( model );

    if ( discriminator in this.discriminators )
    {
      var model = this.discriminators[ discriminator ];

      return model.Database;
    }

    return false;
  },

  parseDiscriminated: function(input)
  {
    if ( isObject( input ) )
    {
      var db = this.getDiscriminatorDatabase( input );

      return db.parseModel( input );
    }

    return false;
  },

  grabModel: function(isRelated, forModel, input, callback)
  {
    if ( this.discriminated )
    {
      if ( this.grabDiscriminated( input, callback ) )
      {
        return true;
      }
      else
      {
        var discriminator = this.getDiscriminatorByType( forModel );

        
      }
    }
  },

  grabDiscriminated: function(input, callback)
  {
    if ( isObject( input ) )
    {
      var db = this.getDiscriminatorDatabase( input );

      if ( db !== false )
      {
        db.grabModel( input, callack, this );

        return true;
      }
    }

    return true;
  },

  getDiscriminatorByType: function(model)
  {
    for (var discriminator in this.discriminators)
    {
      var type = this.discriminators[ discriminator ];

      if ( model instanceof type )
      {
        return discriminator;
      }
    }

    return false;
  },

  loadAllRelated: function(isRelated, callback)
  {
    if ( this.discriminated )
    {
      this.loadAllDiscriminated( isRelated, callback );
    }
    else
    {
      var relatedDatabase = this.model.Database;

      relatedDatabase.ready( this.loadAllReady( isRelated, callback ), this );
    }
  },

  loadAllReady: function(isRelated, callback)
  {
    return function(db)
    {
      var related = db.models.filter( isRelated );

      callback.call( this, related );
    };
  },

  loadAllDiscriminated: function(isRelated, callback)
  {
    var related = new NeuroMap();
    var callbackContext = this;
    var total = sizeof( this.discriminators );
    var current = 0;

    for (var discriminator in this.discriminators)
    {
      var type = this.discriminators[ discriminator ];
      var db = type.Database;

      db.ready(function(db)
      {
        db.models.filter( isRelated, related );

        if ( ++current === total )
        {
          callback.call( callbackContext, related );
        }
      });
    }
  }

};
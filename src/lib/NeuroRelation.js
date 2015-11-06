function NeuroRelation()
{

}

Neuro.STORE_NONE = 0;
Neuro.STORE_MODEL = 1;
Neuro.STORE_KEY = 2;
Neuro.STORE_KEYS = 3;

Neuro.SAVE_NONE = 0;
Neuro.SAVE_MODEL = 4;

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
    this.store = options.store || Neuro.STORE_NONE;
    this.save = options.save || Neuro.SAVE_NONE;
    this.auto = !!options.auto;
    this.property = !!options.property;

    var setNeuro = this.setNeuro( database, field, options );

    if ( !isNeuro( options.model ) )
    {
      Neuro.get( options.model, setNeuro, this );
    }
    else
    {
      setNeuro( options.model );
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
      case Neuro.SAVE_MODEL:
        return related.$toJSON( true );

      case Neuro.STORE_MODEL:
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

      case Neuro.STORE_KEY:
        return related.$key();

      case Neuro.STORE_KEYS:
        return related.$keys();

      }
    }

    return null;
  }

};

/**
 * An extension of the {@link Neuro.Collection} class which is a filtered view
 * of another collection.
 *
 * ```javascript
 * var isEven = function(x) { return x % 2 === 0; };
 * var c = Neuro.collect([1, 2, 3, 4, 5, 6, 7]);
 * var f = c.filtered( isEven );
 * f; // [2, 4, 6]
 * c.add( 8 );
 * c.remove( 2 );
 * f; // [4, 6, 8]
 * ```
 *
 * @constructor
 * @memberof Neuro
 * @extends Neuro.Collection
 * @param {Neuro.Collection} base -
 *    The collection to listen to for changes to update this collection.
 * @param {whereCallback} filter -
 *    The function which determines whether an element in the base collection
 *    should exist in this collection.
 * @see Neuro.Collection#filtered
 */
function FilteredCollection(base, filter)
{
  this.onAdd      = bind( this, this.handleAdd );
  this.onAdds     = bind( this, this.handleAdds );
  this.onRemove   = bind( this, this.handleRemove );
  this.onRemoves  = bind( this, this.handleRemoves );
  this.onReset    = bind( this, this.handleReset );
  this.onUpdates  = bind( this, this.handleUpdates );
  this.onCleared  = bind( this, this.handleCleared );

  this.init( base, filter );
}

/**
 * The collection to listen to for changes to update this collection.
 *
 * @memberof Neuro.FilteredCollection#
 * @member {Neuro.Collection} base
 */

 /**
  * The function which determines whether an element in the base collection
  * should exist in this collection.
  *
  * @memberof Neuro.FilteredCollection#
  * @member {whereCallback} filter
  */

extendArray( Collection, FilteredCollection,
{

  /**
   * Initializes the filtered collection by setting the base collection and the
   * filtering function.
   *
   * @method
   * @memberof Neuro.FilteredCollection#
   * @param {Neuro.Collection} base -
   *    The collection to listen to for changes to update this collection.
   * @param {whereCallback} filter -
   *    The function which determines whether an element in the base collection
   *    should exist in this collection.
   * @return {Neuro.FilteredCollection} -
   *    The reference to this collection.
   * @emits Neuro.Collection#reset
   */
  init: function(base, filter)
  {
    if ( this.base !== base )
    {
      if ( this.base )
      {
        this.disconnect();
      }

      this.base = base;
      this.connect();
    }

    this.filter = filter;
    this.sync();

    return this;
  },

  /**
   * Sets the filter function of this collection and re-sychronizes it with the
   * base collection.
   *
   * @method
   * @memberof Neuro.FilteredCollection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Neuro.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Neuro.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Neuro.createWhere}
   * @return {Neuro.FilteredCollection} -
   *    The reference to this collection.
   * @see Neuro.createWhere
   * @emits Neuro.Collection#reset
   */
  setFilter: function(whereProperties, whereValue, whereEquals)
  {
    this.filter = createWhere( whereProperties, whereValue, whereEquals );
    this.sync();

    return this;
  },

  /**
   * Registers callbacks with events of the base collection.
   *
   * @method
   * @memberof Neuro.FilteredCollection#
   * @return {Neuro.FilteredCollection} -
   *    The reference to this collection.
   */
  connect: function()
  {
    this.base.on( Collection.Events.Add, this.onAdd );
    this.base.on( Collection.Events.Adds, this.onAdds );
    this.base.on( Collection.Events.Remove, this.onRemove );
    this.base.on( Collection.Events.Removes, this.onRemoves );
    this.base.on( Collection.Events.Reset, this.onReset );
    this.base.on( Collection.Events.Updates, this.onUpdates );
    this.base.on( Collection.Events.Cleared, this.onClear );

    return this;
  },

  /**
   * Unregisters callbacks with events from the base collection.
   *
   * @method
   * @memberof Neuro.FilteredCollection#
   * @return {Neuro.FilteredCollection} -
   *    The reference to this collection.
   */
  disconnect: function()
  {
    this.base.off( Collection.Events.Add, this.onAdd );
    this.base.off( Collection.Events.Adds, this.onAdds );
    this.base.off( Collection.Events.Remove, this.onRemove );
    this.base.off( Collection.Events.Removes, this.onRemoves );
    this.base.off( Collection.Events.Reset, this.onReset );
    this.base.off( Collection.Events.Updates, this.onUpdates );
    this.base.off( Collection.Events.Cleared, this.onClear );

    return this;
  },

  /**
   * Synchronizes this collection with the base collection. Synchronizing
   * involves iterating over the base collection and passing each element into
   * the filter function and if it returns a truthy value it's added to this
   * collection.
   *
   * @method
   * @memberof Neuro.FilteredCollection#
   * @return {Neuro.FilteredCollection} -
   *    The reference to this collection.
   * @emits Neuro.Collection#reset
   */
  sync: function()
  {
    var base = this.base;
    var filter = this.filter;

    this.length = 0;

    for (var i = 0; i < base.length; i++)
    {
      var value = base[ i ];

      if ( filter( value ) )
      {
        this.push( value );
      }
    }

    this.trigger( Collection.Events.Reset, [this] );

    return this;
  },

  /**
   * Responds to the {@link Neuro.Collection#event:add} event.
   */
  handleAdd: function(collection, value)
  {
    var filter = this.filter;

    if ( filter( value ) )
    {
      this.add( value );
    }
  },

  /**
   * Responds to the {@link Neuro.Collection#event:adds} event.
   */
  handleAdds: function(collection, values)
  {
    var filter = this.filter;
    var filtered = [];

    for (var i = 0; i < values.length; i++)
    {
      var value = values[ i ];

      if ( filter( value ) )
      {
        filtered.push( value );
      }
    }

    this.addAll( filtered );
  },

  /**
   * Responds to the {@link Neuro.Collection#event:remove} event.
   */
  handleRemove: function(collection, value)
  {
    this.remove( value );
  },

  /**
   * Responds to the {@link Neuro.Collection#event:removes} event.
   */
  handleRemoves: function(collection, values)
  {
    this.removeAll( values );
  },

  /**
   * Responds to the {@link Neuro.Collection#event:reset} event.
   */
  handleReset: function(collection)
  {
    this.sync();
  },

  /**
   * Responds to the {@link Neuro.Collection#event:updates} event.
   */
  handleUpdates: function(collection, updates)
  {
    var filter = this.filter;

    for (var i = 0; i < updates.length; i++)
    {
      var value = updates[ i ];

      if ( filter( value ) )
      {
        this.add( value, true );
      }
      else
      {
        this.remove( value, true );
      }
    }

    this.sort();
  },

  /**
   * Responds to the {@link Neuro.Collection#event:cleared} event.
   */
  handleCleared: function(collection)
  {
    this.clear();
  },

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Neuro.FilteredCollection#
   * @return {Neuro.FilteredCollection} -
   *    The reference to a clone collection.
   */
  clone: function()
  {
    return new this.constructor( this.base, this.filter );
  },

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Neuro.FilteredCollection#
   * @return {Neuro.FilteredCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: function()
  {
    return new this.constructor( this.base, this.filter );
  }

});

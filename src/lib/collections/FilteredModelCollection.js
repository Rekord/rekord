
/**
 * An extension of the {@link Rekord.ModelCollection} class which is a filtered
 * view of another model collection. Changes made to the base collection are
 * reflected in the filtered collection - possibly resulting in additions and
 * removals from the filtered collection.
 *
 * ```javascript
 * var Task = Rekord({
 *   fields: ['name', 'done']
 * });
 * var finished = Task.filtered('done', true);
 * finished; // will always contain tasks that are done
 * ```
 *
 * @constructor
 * @memberof Rekord
 * @extends Rekord.ModelCollection
 * @param {Rekord.ModelCollection} base -
 *    The model collection to listen to for changes to update this collection.
 * @param {whereCallback} filter -
 *    The function which determines whether a model in the base collection
 *    should exist in this collection.
 * @see Rekord.Collection#filtered
 */
function FilteredModelCollection(base, filter)
{
  this.bind();
  this.init( base, filter );
}

/**
 * The collection to listen to for changes to update this collection.
 *
 * @memberof Rekord.FilteredModelCollection#
 * @member {Rekord.ModelCollection} base
 */

 /**
  * The function which determines whether an element in the base collection
  * should exist in this collection.
  *
  * @memberof Rekord.FilteredModelCollection#
  * @member {whereCallback} filter
  */

Class.extend( ModelCollection, FilteredModelCollection,
{

  /**
   * Generates the handlers which are passed to the base collection when this
   * filtered collection is connected or disconnected - which happens on
   * initialization and subsequent calls to {@link FilteredModelCollection#init}.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   */
  bind: function()
  {
    Filtering.bind.apply( this );

    Class.props(this, {
      onModelUpdated: bind( this, this.handleModelUpdate )
    });
  },

  /**
   * Initializes the filtered collection by setting the base collection and the
   * filtering function.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @param {Rekord.ModelCollection} base -
   *    The model collection to listen to for changes to update this collection.
   * @param {whereCallback} filter -
   *    The function which determines whether a model in the base collection
   *    should exist in this collection.
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  init: function(base, filter)
  {
    if ( this.base )
    {
      this.base.database.off( Database.Events.ModelUpdated, this.onModelUpdated );
    }

    ModelCollection.prototype.init.call( this, base.database );

    Filtering.init.call( this, base, filter );

    base.database.on( Database.Events.ModelUpdated, this.onModelUpdated );

    return this;
  },

  /**
   * Sets the filter function of this collection and re-sychronizes it with the
   * base collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @emits Rekord.Collection#reset
   */
  setFilter: Filtering.setFilter,

  /**
   * Registers callbacks with events of the base collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   */
  connect: Filtering.connect,

  /**
   * Unregisters callbacks with events from the base collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   */
  disconnect: Filtering.disconnect,

  /**
   * Synchronizes this collection with the base collection. Synchronizing
   * involves iterating over the base collection and passing each element into
   * the filter function and if it returns a truthy value it's added to this
   * collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  sync: Filtering.sync,

  /**
   * Handles the ModelUpdated event from the database.
   */
  handleModelUpdate: function(model)
  {
    var exists = this.has( model.$key() );
    var matches = this.filter( model );

    if ( exists && !matches )
    {
      this.remove( model );
    }
    if ( !exists && matches )
    {
      this.add( model );
    }
  },

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to a clone collection.
   */
  clone: Filtering.clone,

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Rekord.FilteredModelCollection#
   * @return {Rekord.FilteredModelCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: Filtering.cloneEmpty

});

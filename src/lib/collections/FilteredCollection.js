
/**
 * An extension of the {@link Rekord.Collection} class which is a filtered view
 * of another collection.
 *
 * ```javascript
 * var isEven = function(x) { return x % 2 === 0; };
 * var c = Rekord.collect([1, 2, 3, 4, 5, 6, 7]);
 * var f = c.filtered( isEven );
 * f; // [2, 4, 6]
 * c.add( 8 );
 * c.remove( 2 );
 * f; // [4, 6, 8]
 * ```
 *
 * @constructor
 * @memberof Rekord
 * @extends Rekord.Collection
 * @param {Rekord.Collection} base -
 *    The collection to listen to for changes to update this collection.
 * @param {whereCallback} filter -
 *    The function which determines whether an element in the base collection
 *    should exist in this collection.
 * @see Rekord.Collection#filtered
 */
function FilteredCollection(base, filter)
{
  this.bind();
  this.init( base, filter );
}

/**
 * The collection to listen to for changes to update this collection.
 *
 * @memberof Rekord.FilteredCollection#
 * @member {Rekord.Collection} base
 */

 /**
  * The function which determines whether an element in the base collection
  * should exist in this collection.
  *
  * @memberof Rekord.FilteredCollection#
  * @member {whereCallback} filter
  */

Class.extend( Collection, FilteredCollection,
{

  /**
   * Generates the handlers which are passed to the base collection when this
   * filtered collection is connected or disconnected - which happens on
   * initialization and subsequent calls to {@link FilteredCollection#init}.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   */
  bind: Filtering.bind,

  /**
   * Initializes the filtered collection by setting the base collection and the
   * filtering function.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @param {Rekord.Collection} base -
   *    The collection to listen to for changes to update this collection.
   * @param {whereCallback} filter -
   *    The function which determines whether an element in the base collection
   *    should exist in this collection.
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  init: Filtering.init,

  /**
   * Sets the filter function of this collection and re-sychronizes it with the
   * base collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @emits Rekord.Collection#reset
   */
  setFilter: Filtering.setFilter,

  /**
   * Registers callbacks with events of the base collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   */
  connect: Filtering.connect,

  /**
   * Unregisters callbacks with events from the base collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
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
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to this collection.
   * @emits Rekord.Collection#reset
   */
  sync: Filtering.sync,

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to a clone collection.
   */
  clone: Filtering.clone,

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Rekord.FilteredCollection#
   * @return {Rekord.FilteredCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: Filtering.cloneEmpty

});

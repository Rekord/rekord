
/**
 * An extension of the Array class adding many useful functions and events. This
 * is the base collection class in Neurosync.
 *
 * A collection of any type can be created via {@link Neuro.collect}.
 *
 * ```
 * var nc = new Neuro.Collection([1, 2, 3, 4]);
 * ```
 *
 * @constructor
 * @memberof Neuro
 * @alias Collection
 * @extends Array
 * @see Neuro.collect
 */
function NeuroCollection(values)
{
  this.addAll( values );
}

/**
 * The events a collection can emit.
 *
 * {@link Neuro.Collection#event:add Add}
 * {@link Neuro.Collection#event:adds Adds}
 * {@link Neuro.Collection#event:sort Sort}
 * {@link Neuro.Collection#event:remove Remove}
 * {@link Neuro.Collection#event:removes Removes}
 * {@link Neuro.Collection#event:updates Updates}
 * {@link Neuro.Collection#event:reset Reset}
 * {@link Neuro.Collection#event:cleared Cleared}
 * {@link Neuro.Collection#event:changes Changes}
 *
 * @static
 */
NeuroCollection.Events =
{
  /**
   * An event triggered when a single value is added to a collection.
   *
   * @event Neuro.Collection#add
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   * @argument {T} value -
   *    The value added.
   * @see Neuro.Collection#add
   * @see Neuro.Collection#insertAt
   * @see Neuro.ModelCollection#add
   * @see Neuro.ModelCollection#push
   */
  Add:            'add',

  /**
   * An event triggered when multiple values are added to a collection.
   *
   * @event Neuro.Collection#adds
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   * @argument {T[]} value -
   *    The values added.
   * @see Neuro.Collection#addAll
   * @see Neuro.ModelCollection#addAll
   */
  Adds:           'adds',

  /**
   * An event triggered when a collection is resorted. This may automatically
   * be triggered by any method that modifies the collection.
   *
   * @event Neuro.Collection#sort
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   * @see Neuro.Collection#resort
   * @see Neuro.ModelCollection#resort
   */
  Sort:           'sort',

  /**
   * An event triggered when a collection has an element removed at a given index.
   *
   * @event Neuro.Collection#remove
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   * @argument {Any} removing -
   *    The element that was removed.
   * @argument {Number} index -
   *    The index where the element was removed at.
   * @see Neuro.Collection#remove
   * @see Neuro.Collection#removeAt
   * @see Neuro.ModelCollection#remove
   */
  Remove:         'remove',

  /**
   * An event triggered when a collection has multiple elements removed.
   *
   * @event Neuro.Collection#removes
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   * @argument {Any[]} removed -
   *    The array of elements removed from the collection.
   * @see Neuro.Collection#removeAll
   * @see Neuro.Collection#removeWhere
   */
  Removes:        'removes',

  /**
   * An event triggered when a collection has elements modified.
   *
   * @event Neuro.Collection#updates
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   * @argument {Array} updated -
   *    The array of elements modified.
   * @see Neuro.ModelCollection#update
   * @see Neuro.ModelCollection#updateWhere
   */
  Updates:        'updates',

  /**
   * An event triggered when a collection's elements are entirely replaced by
   * a new set of elements.
   *
   * @event Neuro.Collection#reset
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   * @argument {Array} updated -
   *    The array of elements modified.
   * @see Neuro.FilteredCollection#sync
   * @see Neuro.ModelCollection#reset
   * @see Neuro.Query#sync
   */
  Reset:          'reset',

  /**
   * An event triggered when a collection is cleared of all elements.
   *
   * @event Neuro.Collection#cleared
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   * @see Neuro.Collection#clear
   */
  Cleared:        'cleared',

  /**
   * All events triggered by a collection when the contents of the collection changes.
   *
   * @event Neuro.Collection#changes
   * @argument {Neuro.Collection} collection -
   *    The collection that triggered the event.
   */
  Changes:        'add adds sort remove removes updates reset cleared'

};

extendArray( Array, NeuroCollection,
{

  /**
   * Sets the comparator for this collection and performs a resort.
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {ComparatorInput} comparator -
   *    The comparator input to convert to a comparison function.
   * @param {Boolean} [nullsFirst=false] -
   *    When a comparison is done involving a null/undefined value this can
   *    determine which is ordered before the other.
   * @emits Neuro.Collection#sort
   * @see Neuro.createComparator
   * @return {Neuro.Collection}
   */
  setComparator: function(comparator, nullsFirst)
  {
    this.comparator = createComparator( comparator, nullsFirst );
    this.resort();

    return this;
  },

  /**
   * Adds a comparator to the existing comparator. This added comparator is ran
   * after the current comparator when it finds two elements equal. If no
   * comparator exists on this collection then it's set to the given comparator.
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {ComparatorInput} comparator -
   *    The comparator input to convert to a comparison function.
   * @param {Boolean} [nullsFirst=false] -
   *    When a comparison is done involving a null/undefined value this can
   *    determine which is ordered before the other.
   * @emits Neuro.Collection#sort
   * @see Neuro.createComparator
   * @return {Neuro.Collection}
   */
  addComparator: function(comparator, nullsFirst)
  {
    this.comparator = addComparator( this.comparator, comparator, nullsFirst );
    this.resort();

    return this;
  },

  /**
   * Determines if the collection is currently sorted based on the current
   * comparator of the collection unless a comparator is given
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {ComparatorInput} [comparator] -
   *    The comparator input to convert to a comparison function.
   * @param {Boolean} [nullsFirst=false] -
   *    When a comparison is done involving a null/undefined value this can
   *    determine which is ordered before the other.
   * @see Neuro.createComparator
   * @return {Boolean}
   */
  isSorted: function(comparator, nullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, nullsFirst ) : this.comparator;

    return isSorted( cmp, this );
  },

  /**
   * Sorts the elements in this collection based on the current comparator
   * unless a comparator is given. If a comparator is given it will not override
   * the current comparator, subsequent operations to the collection may trigger
   * a resort if the collection has a comparator.
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {ComparatorInput} [comparator] -
   *    The comparator input to convert to a comparison function.
   * @param {Boolean} [nullsFirst=false] -
   *    When a comparison is done involving a null/undefined value this can
   *    determine which is ordered before the other.
   * @return {Neuro.Collection} -
   *    The reference to this collection.
   * @emits Neuro.Collection#sort
   * @see Neuro.createComparator
   */
  resort: function(comparator, nullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, nullsFirst ) : this.comparator;

    if ( !isSorted( cmp, this ) )
    {
      this.sort( cmp );
      this.trigger( NeuroCollection.Events.Sort, [this] );
    }

    return this;
  },

  /**
   * Creates a limited view of this collection known as a page. The resulting
   * page object changes when this collection changes. At the very least the
   * page size is required, and a starting page index can be specified.
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Number} pageSize -
   *    The maximum number of elements allowed in the page at once.
   * @param {Number} [pageIndex=0]
   *    The starting page offset. This isn't an element offset, but the element
   *    offset can be calculated by multiplying the page index by the page size.
   * @return {Neuro.Page} -
   *    The newly created Page.
   */
  page: function(pageSize, pageIndex)
  {
    return new NeuroPage( this, pageSize, pageIndex );
  },

  /**
   * Creates a sub view of this collection known as a filtered collection. The
   * resulting collection changes when this collection changes. Any time an
   * element is added or removed to this collection it may be added or removed
   * from the filtered collection if it fits the filter function. The filter
   * function is created by passing the arguments of this function to
   * {@link Neuro.createWhere}.
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {String|Object|Array|whereCallback} [whereProperties] -
   *    See {@link Neuro.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Neuro.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Neuro.createWhere}
   * @return {Neuro.Collection} -
   *    The newly created live filtered view of this collection.
   * @see Neuro.createWhere
   */
  filtered: function(whereProperties, whereValue, whereEquals)
  {
    var filter = createWhere( whereProperties, whereValue, whereEquals );

    return new NeuroFilteredCollection( this, filter );
  },

  /**
   * Creates a copy of this collection with elements that match the supplied
   * parameters. The parameters are passed to the {@link Neuro.createWhere}
   * to generate a function which tests each element of this collection for
   * inclusion in the newly created collection.
   *
   * ```javascript
   * var isEven = function() { return x % 2 == 0; };
   * var c = Neuro.collect(1, 2, 3, 4, 5);
   * var w = c.where(isEven); // [2, 4]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {String|Object|Array|whereCallback} [whereProperties] -
   *    See {@link Neuro.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Neuro.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Neuro.createWhere}
   * @param {Array} [out=new this.constructor()] -
   *    The array to place the elements that match.
   * @return {Neuro.Collection} -
   *    The copy of this collection ran through a filtering function.
   * @see Neuro.createWhere
   */
  where: function(whereProperties, whereValue, whereEquals, out)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var target = out || new this.constructor();

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];

      if ( where( a ) )
      {
        target.add( a );
      }
    }

    return target;
  },

  /**
   * Returns a collection with elements that exist in this collection but does
   * not exist in the given collection.
   *
   * ```javascript
   * var a = Neuro.collect(1, 2, 3, 4);
   * var b = Neuro.collect(1, 3, 5);
   * var c = a.subtract( b ); // [2, 4]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Array} collection -
   *    The array of elements that shouldn't exist in the resulting collection.
   * @param {Array} [out=new this.constructor()] -
   *    The array to place the elements that exist in this collection but not in
   *    the given collection. If this is not given - a collection of this type
   *    will be created.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to an element that exists in the given
   *    collection.
   * @return {Array} -
   *    The collection of elements that exist in this collection and not the
   *    given collection.
   */
  subtract: function(collection, out, equals)
  {
    var target = out || new this.constructor();
    var equality = equals || equalsStrict;

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];
      var exists = false;

      for (var j = 0; j < collection.length && !exists; j++)
      {
        exists = equality( a, collection[ j ] );
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  /**
   * Returns a collection of elements that are shared between this collection
   * and the given collection.
   *
   * ```javascript
   * var a = Neuro.collect(1, 2, 3, 4);
   * var b = Neuro.collect(1, 3, 5);
   * var c = a.intersect( b ); // [1, 3]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Array} collection -
   *    The collection of elements to intersect with this collection.
   * @param {Array} [out=new this.constructor()] -
   *    The array to place the elements that exist in both this collection and
   *    the given collection. If this is not given - a collection of this type
   *    will be created.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to an element that exists in the given
   *    collection.
   * @return {Array} -
   *    The collection of elements that exist in both collections.
   */
  intersect: function(collection, out, equals)
  {
    var target = out || new this.constructor();
    var equality = equals || equalsStrict;

    for (var i = 0; i < collection.length; i++)
    {
      var a = collection[ i ];
      var exists = false;

      for (var j = 0; j < this.length && !exists; j++)
      {
        exists = equality( a, this[ j ] );
      }

      if (exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  /**
   * Returns a collection of elements that exist in the given collection but
   * not in this collection.
   *
   * ```javascript
   * var a = Neuro.collect(1, 2, 3, 4);
   * var b = Neuro.collect(1, 3, 5);
   * var c = a.complement( b ); // [5]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Array} collection -
   *    The array of elements that could exist in the resulting collection.
   * @param {Array} [out=new this.constructor()] -
   *    The array to place the elements that exist in given collection but not
   *    in this collection. If this is not given - a collection of this type
   *    will be created.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to an element that exists in the given
   *    collection.
   * @return {Array} -
   *    The collection of elements that exist in the given collection and not
   *    this collection.
   */
  complement: function(collection, out, equals)
  {
    var target = out || new this.constructor();
    var equality = equals || equalsStrict;

    for (var i = 0; i < collection.length; i++)
    {
      var a = collection[ i ];
      var exists = false;

      for (var j = 0; j < this.length && !exists; j++)
      {
        exists = equality( a, this[ j ] );
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  /**
   * Clears all elements from this collection.
   *
   * ```javascript
   * var a = Neuro.collect(1, 2, 3, 4);
   * a.clear(); // []
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @return {Neuro.Collection} -
   *    The reference to this collection.
   * @emits Neuro.Collection#sort
   */
  clear: function()
  {
    this.length = 0;
    this.trigger( NeuroCollection.Events.Cleared, [this] );

    return this;
  },


  /**
   * Adds an element to this collection - resorting the collection if a
   * comparator is set on this collection and `delaySort` is not a specified or
   * a true value.
   *
   * ```javascript
   * var a = Neuro.collect(1, 2, 3, 4);
   * a.add( 5 ); // [1, 2, 3, 4, 5]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Any} value -
   *    The value to add to this collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Neuro.Collection#resort resort}.
   * @return {Neuro.Collection} -
   *    The reference to this collection.
   * @emits Neuro.Collection#add
   * @emits Neuro.Collection#sort
   */
  add: function(value, delaySort)
  {
    this.push( value );
    this.trigger( NeuroCollection.Events.Add, [this, value] );

    if ( !delaySort )
    {
      this.resort();
    }

    return this;
  },

  /**
   * Adds all elements in the given array to this collection - resorting the
   * collection if a comparator is set on this collection and `delaySort` is
   * not specified or a true value.
   *
   * ```javascript
   * var a = Neuro.collect(1, 2, 3, 4);
   * a.addAll( [5, 6] ); // [1, 2, 3, 4, 5, 6]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Any[]} values -
   *    The values to add to this collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Neuro.Collection#resort resort}.
   * @return {Neuro.Collection} -
   *    The reference to this collection.
   * @emits Neuro.Collection#adds
   * @emits Neuro.Collection#sort
   */
  addAll: function(values, delaySort)
  {
    if ( isArray( values ) && values.length )
    {
      this.push.apply( this, values );
      this.trigger( NeuroCollection.Events.Adds, [this, values] );

      if ( !delaySort )
      {
        this.resort();
      }
    }

    return this;
  },

  /**
   * Inserts an element into this collection at the given index - resorting the
   * collection if a comparator is set on this collection and `delaySort` is not
   * specified or a true value.
   *
   * ```javascript
   * var c = Neuro.collect(1, 2, 3, 4);
   * c.insertAt( 0, 0 ); // [0, 1, 2, 3, 4]
   * c.insertAt( 2, 1.5 ); // [0, 1, 1.5, 2, 3, 4]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Number} i -
   *    The index to insert the element at.
   * @param {Any} value -
   *    The value to insert into the collection.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Neuro.Collection#resort resort}.
   * @return {Neuro.Collection} -
   *    The reference to this collection.
   * @emits Neuro.Collection#add
   * @emits Neuro.Collection#sort
   */
  insertAt: function(i, value, delaySort)
  {
    this.splice( i, 0, value );
    this.trigger( NeuroCollection.Events.Add, [this, value] );

    if ( !delaySort )
    {
      this.resort();
    }

    return this;
  },

  /**
   * Removes the element in this collection at the given index `i` - resorting
   * the collection if a comparator is set on this collection and `delaySort` is
   * not specified or a true value.
   *
   * ```javascript
   * var c = Neuro.collect(1, 2, 3, 4);
   * c.removeAt( 1 ); // 2
   * c.removeAt( 5 ); // undefined
   * c // [1, 3, 4]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Number} i -
   *    The index of the element to remove.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Neuro.Collection#resort resort}.
   * @return {Any} -
   *    The element removed, or undefined if the index was invalid.
   * @emits Neuro.Collection#remove
   * @emits Neuro.Collection#sort
   */
  removeAt: function(i, delaySort)
  {
    var removing;

    if (i >= 0 && i < this.length)
    {
      removing = this[ i ];

      this.splice( i, 1 );
      this.trigger( NeuroCollection.Events.Remove, [this, removing, i] );

      if ( !delaySort )
      {
        this.resort();
      }
    }

    return removing;
  },

  /**
   * Removes the given value from this collection if it exists - resorting the
   * collection if a comparator is set on this collection and `delaySort` is not
   * specified or a true value.
   *
   * ```javascript
   * var c = Neuro.collect(1, 2, 3, 4);
   * c.remove( 1 ); // 1
   * c.remove( 5 ); // undefined
   * c // [2, 3, 4]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Any} value -
   *    The value to remove from this collection if it exists.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Neuro.Collection#resort resort}.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to the given value.
   * @return {Any} -
   *    The element removed from this collection.
   * @emits Neuro.Collection#remove
   * @emits Neuro.Collection#sort
   */
  remove: function(value, delaySort, equals)
  {
    var i = this.indexOf( value, equals );
    var element = this[ i ];

    if ( i !== -1 )
    {
      this.removeAt( i, delaySort );
    }

    return element;
  },

  /**
   * Removes the given values from this collection - resorting the collection if
   * a comparator is set on this collection and `delaySort` is not specified or
   * a true value.
   *
   * ```javascript
   * var c = Neuro.collect(1, 2, 3, 4);
   * c.removeAll( [1, 5] ); // [1]
   * c // [2, 3, 4]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Any[]} values -
   *    The values to remove from this collection if they exist.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Neuro.Collection#resort resort}.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to any of the given values.
   * @return {Any[]} -
   *    The elements removed from this collection.
   * @emits Neuro.Collection#removes
   * @emits Neuro.Collection#sort
   */
  removeAll: function(values, delaySort, equals)
  {
    var removed = [];

    if ( isArray( values ) && values.length )
    {
      for (var i = 0; i < values.length; i++)
      {
        var value = values[ i ];
        var k = this.indexOf( value, equals );

        if ( k !== -1 )
        {
          this.splice( k, 1 );
          removed.push( value );
        }
      }

      this.trigger( NeuroCollection.Events.Removes, [this, removed] );

      if ( !delaySort )
      {
        this.resort();
      }
    }

    return removed;
  },

  /**
   * Removes elements from this collection that meet the specified criteria. The
   * given criteria are passed to {@link Neuro.createWhere} to create a filter
   * function. All elements removed are returned
   *
   * ```javascript
   * var isEven = function(x) { return x % 2 === 0; };
   * var c = Neuro.collect(1, 2, 3, 4);
   * c.removeWhere( isEven ); // [2, 4];
   * c // [1, 3]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {whereInput} [whereProperties] -
   *    See {@link Neuro.createWhere}
   * @param {Any} [whereValue] -
   *    See {@link Neuro.createWhere}
   * @param {equalityCallback} [whereEquals] -
   *    See {@link Neuro.createWhere}
   * @param {Array} [out=new this.constructor()] -
   *    The array to place the elements that match.
   * @param {Boolean} [delaySort=false] -
   *    Whether automatic sorting should be delayed until the user manually
   *    calls {@link Neuro.Collection#resort resort}.
   * @return {Neuro.Collection} -
   *    The reference to this collection.
   * @emits Neuro.Collection#removes
   * @emits Neuro.Collection#sort
   * @see Neuro.createWhere
   */
  removeWhere: function(whereProperties, whereValue, whereEquals, out, delaySort)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var removed = out || new this.constructor();

    for (var i = this.length - 1; i >= 0; i--)
    {
      var value = this[ i ];

      if ( where( value ) )
      {
        this.splice( i, 1 );
        removed.push( value );
      }
    }

    this.trigger( NeuroCollection.Events.Removes, [this, removed] );

    if ( !delaySort )
    {
      this.resort();
    }

    return removed;
  },

  /**
   * Returns the index of the given element in this collection or returns -1
   * if the element doesn't exist in this collection.
   *
   * ```javascript
   * var c = Neuro.collect(1, 2, 3, 4);
   * c.indexOf( 1 ); // 0
   * c.indexOf( 2 ); // 1
   * c.indexOf( 5 ); // -1
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Any} value -
   *    The value to search for.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    The function which determines whether one of the elements that exist in
   *    this collection are equivalent to the given value.
   * @return {Number} -
   *    The index of the element in this collection or -1 if it was not found.
   * @see Neuro.equals
   * @see Neuro.equalsStrict
   */
  indexOf: function(value, equals)
  {
    var equality = equals || equalsStrict;

    for (var i = 0; i < this.length; i++)
    {
      if ( equality( value, this[ i ] ) )
      {
        return i;
      }
    }

    return -1;
  },

  /**
   * Returns the element with the minimum value given a comparator.
   *
   * ```javascript
   * var c = Neuro.collect({age: 4}, {age: 5}, {age: 6}, {age: 3});
   * c.minModel('age'); // {age: 3}
   * c.minModel('-age'); // {age: 6}
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {comparatorInput} comparator -
   *    The comparator which calculates the minimum model.
   * @param {Any} [startingValue]
   *    The initial minimum value. If a value is specified, it's compared
   *    against all elements in this collection until the comparator function
   *    finds a more minimal value. If it doesn't - this is the value returned.
   * @return {Any} -
   *    The minimum element in the collection given the comparator function.
   * @see Neuro.createComparator
   */
  minModel: function(comparator, startingValue)
  {
    var cmp = createComparator( comparator || this.comparator, false );
    var min = startingValue;

    for (var i = 0; i < this.length; i++)
    {
      if ( cmp( min, this[i] ) > 0 )
      {
        min = this[i];
      }
    }

    return min;
  },

  /**
   * Returns the element with the maximum value given a comparator.
   *
   * ```javascript
   * var c = Neuro.collect({age: 4}, {age: 5}, {age: 6}, {age: 3});
   * c.maxModel('age'); // {age: 6}
   * c.maxModel('-age'); // {age: 3}
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {comparatorInput} comparator -
   *    The comparator which calculates the maximum model.
   * @param {Any} [startingValue] -
   *    The initial maximum value. If a value is specified, it's compared
   *    against all elements in this collection until the comparator function
   *    finds a more maximal value. If it doesn't - this is the value returned.
   * @return {Any} -
   *    The maximum element in the collection given the comparator function.
   * @see Neuro.createComparator
   */
  maxModel: function(comparator, startingValue)
  {
    var cmp = createComparator( comparator || this.comparator, true );
    var max = startingValue;

    for (var i = 0; i < this.length; i++)
    {
      if ( cmp( max, this[i] ) < 0 )
      {
        max = this[i];
      }
    }

    return max;
  },

  /**
   * Returns the minimum value for the given property expression out of all the
   * elements this collection.
   *
   * ```javascript
   * var c = Neuro.collect({age: 6}, {age: 5}, {notage: 5});
   * c.min('age');  // 5
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {propertyResolverInput} [properties] -
   *    The expression which takes an element in this container and resolves a
   *    value that can be compared to the current minimum.
   * @param {String} [delim=','] -
   *    A delimiter to use to join multiple properties into a string.
   * @param {Any} [startingValue] -
   *    The initial minimum value. If a value is specified, it's compared
   *    against all elements in this collection until the comparator function
   *    finds a more minimal value. If it doesn't - this is the value returned.
   * @return {Any} -
   *    The minimum value found.
   * @see Neuro.createPropertyResolver
   * @see Neuro.compare
   */
  min: function(properties, delim, startingValue)
  {
    var resolver = createPropertyResolver( properties, delim );
    var min = startingValue;

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( compare( min, resolved, false ) > 0 )
      {
        min = resolved;
      }
    }

    return min;
  },

  /**
   * Returns the maximum value for the given property expression out of all the
   * elements this collection.
   *
   * ```javascript
   * var c = Neuro.collect({age: 6}, {age: 5}, {notage: 5});
   * c.max('age');  // 6
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {propertyResolverInput} [properties] -
   *    The expression which takes an element in this container and resolves a
   *    value that can be compared to the current maximum.
   * @param {String} [delim=','] -
   *    A delimiter to use to join multiple properties into a string.
   * @param {Any} [startingValue] -
   *    The initial maximum value. If a value is specified, it's compared
   *    against all elements in this collection until the comparator function
   *    finds a more maximal value. If it doesn't - this is the value returned.
   * @return {Any} -
   *    The maximum value found.
   * @see Neuro.createPropertyResolver
   * @see Neuro.compare
   */
  max: function(properties, delim, startingValue)
  {
    var resolver = createPropertyResolver( properties, delim );
    var max = startingValue;

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( compare( max, resolved, true ) < 0 )
      {
        max = resolved;
      }
    }

    return max;
  },

  /**
   * Returns the first element where the given expression is true.
   *
   * ```javascript
   * var c = Neuro.collect([{x: 5}, {y: 6}, {y: 6, age: 8}, {z: 7}]);
   * c.firstWhere('y', 6); // {x: 6}
   * c.firstWhere(); // {x: 5}
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {whereInput} [properties] -
   *    The expression used to create a function to test the elements in this
   *    collection.
   * @param {Any} [value] -
   *    When the first argument is a string this argument will be treated as a
   *    value to compare to the value of the named property on the object passed
   *    through the filter function.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    An alternative function can be used to compare to values.
   * @return {Any} -
   *    The first element in this collection that matches the given expression.
   * @see Neuro.createWhere
   */
  firstWhere: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        return model;
      }
    }

    return null;
  },

  /**
   * Returns the first non-null value in this collection given a property
   * expression. If no non-null values exist for the given property expression,
   * then undefined will be returned.
   *
   * ```javascript
   * var c = Neuro.collect([{x: 5}, {y: 6}, {y: 4}, {z: 7}]);
   * c.first('y'); // 6
   * c.first(); // {x: 5}
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {propertyResolverInput} [properties] -
   *    The expression which converts one value into another.
   * @param {String} [delim=','] -
   *    A delimiter to use to join multiple properties into a string.
   * @return {Any} -
   * @see Neuro.createPropertyResolver
   * @see Neuro.isValue
   */
  first: function(properties, delim)
  {
    var resolver = createPropertyResolver( properties, delim );

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( isValue( resolved ) )
      {
        return resolved;
      }
    }
  },

  /**
   * Returns the last element where the given expression is true.
   *
   * ```javascript
   * var c = Neuro.collect([{x: 5}, {y: 6}, {y: 6, age: 8}, {z: 7}]);
   * c.lastWhere('y', 6); // {x: 6, age: 8}
   * c.lastWhere(); // {z: 7}
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {whereInput} [properties] -
   *    The expression used to create a function to test the elements in this
   *    collection.
   * @param {Any} [value] -
   *    When the first argument is a string this argument will be treated as a
   *    value to compare to the value of the named property on the object passed
   *    through the filter function.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    An alternative function can be used to compare to values.
   * @return {Any} -
   *    The last element in this collection that matches the given expression.
   * @see Neuro.createWhere
   */
  lastWhere: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );

    for (var i = this.length - 1; i >= 0; i--)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        return model;
      }
    }

    return null;
  },

   /**
    * Returns the last non-null value in this collection given a property
    * expression. If no non-null values exist for the given property expression,
    * then undefined will be returned.
    *
    * ```javascript
    * var c = Neuro.collect([{x: 5}, {y: 6}, {y: 4}, {z: 7}]);
    * c.last('y'); // 4
    * c.last(); // {z: 7}
    * ```
    *
    * @method
    * @memberof Neuro.Collection#
    * @param {propertyResolverInput} [properties] -
    *    The expression which converts one value into another.
    * @param {String} [delim=','] -
    *    A delimiter to use to join multiple properties into a string.
    * @return {Any} -
    * @see Neuro.createPropertyResolver
    * @see Neuro.isValue
    */
  last: function(properties, delim)
  {
    var resolver = createPropertyResolver( properties, delim );

    for (var i = this.length - 1; i >= 0; i--)
    {
      var resolved = resolver( this[ i ] );

      if ( isValue( resolved ) )
      {
        return resolved;
      }
    }
  },

  /**
   * Iterates over all elements in this collection and passes them through the
   * `resolver` function. The returned value is passed through the `validator`
   * function and if that returns true the resolved value is passed through the
   * `process` function. After iteration, the `getResult` function is executed
   * and the returned value is returned by this function.
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Function} resolver -
   *    The function which takes an element in this collection and returns a
   *    value based on that element.
   * @param {Function} validator -
   *    The function which takes the resolved value and determines whether it
   *    passes some test.
   * @param {Function} process -
   *    The function which is given the resolved value if it passes the test.
   * @param {Function} getResult -
   *    The function which is executed at the end of iteration and the result is
   *    is returned by this function.
   * @return {Any} -
   *    The value returned by `getResult`.
   */
  aggregate: function(resolver, validator, process, getResult)
  {
    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( validator( resolved ) )
      {
        process( resolved );
      }
    }

    return getResult();
  },

  /**
   * Sums all numbers resolved from the given property expression and returns
   * the result.
   *
   * ```javascript
   * var c = Neuro.collect([2, 3, 4]);
   * c.sum(); // 9
   * var d = Neuro.collect([{age: 5}, {age: 4}, {age: 2}]);
   * d.sum('age'); // 11
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {propertyResolverInput} [numbers]
   *    The expression which converts an element in this collection to a number.
   * @return {Number} -
   *    The sum of all valid numbers found in this collection.
   * @see Neuro.createNumberResolver
   */
  sum: function(numbers)
  {
    var resolver = createNumberResolver( numbers );
    var result = 0;

    function process(x)
    {
      result += x;
    }

    function getResult()
    {
      return result;
    }

    return this.aggregate( resolver, isNumber, process, getResult );
  },

  /**
   * Averages all numbers resolved from the given property expression and
   * returns the result.
   *
   * ```javascript
   * var c = Neuro.collect([2, 3, 4]);
   * c.avg(); // 3
   * var d = Neuro.collect([{age: 5}, {age: 4}, {age: 2}]);
   * d.avg('age'); // 3.66666
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {propertyResolverInput} [numbers]
   *    The expression which converts an element in this collection to a number.
   * @return {Number} -
   *    The average of all valid numbers found in this collection.
   * @see Neuro.createNumberResolver
   */
  avg: function(numbers)
  {
    var resolver = createNumberResolver( numbers );
    var result = 0;
    var total = 0;

    function process(x)
    {
      result += x;
      total++;
    }

    function getResult()
    {
      return total === 0 ? 0 : result / total;
    }

    return this.aggregate( resolver, isNumber, process, getResult );
  },

  /**
   * Counts the number of elements in this collection that past the test
   * function generated by {@link Neuro.createWhere}.
   *
   * ```javascript
   * var c = Neuro.collect([{name: 't1', done: 1}, {name: 't2', done: 0}, {name: 't3', done: 1}, {name: 't4'}]);
   * c.countWhere('done'); // 3
   * c.countWhere('done', 0); // 1
   * c.countWhere('done', 1); // 2
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {whereInput} [properties] -
   *    The expression used to create a function to test the elements in this
   *    collection.
   * @param {Any} [value] -
   *    When the first argument is a string this argument will be treated as a
   *    value to compare to the value of the named property on the object passed
   *    through the filter function.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    An alternative function can be used to compare to values.
   * @return {Number} -
   *    The number of elements in the collection that passed the test.
   * @see Neuro.createWhere
   */
  countWhere: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );
    var met = 0;

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        met++;
      }
    }

    return met;
  },

  /**
   * Counts the number of elements in this collection that has a value for the
   * given property expression.
   *
   * ```javascript
   * var c = Neuro.collect([{age: 2}, {age: 3}, {taco: 4}]);
   * c.count('age'); // 2
   * c.count('taco'); // 1
   * c.count(); // 3
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {propertyResolverInput} [properties] -
   *    The expression which converts one value into another.
   * @return {Number} -
   *    The number of elements that had values for the property expression.
   * @see Neuro.createPropertyResolver
   * @see Neuro.isValue
   */
  count: function(properties)
  {
    if ( !isValue( properties ) )
    {
      return this.length;
    }

    var resolver = createPropertyResolver( properties );
    var result = 0;

    for (var i = 0; i < this.length; i++)
    {
      var resolved = resolver( this[ i ] );

      if ( isValue( resolved ) )
      {
        result++;
      }
    }

    return result;
  },

  /**
   * Plucks values from elements in the collection. If only a `values` property
   * expression is given the result will be an array of resolved values. If the
   * `keys` property expression is given, the result will be an object where the
   * property of the object is determined by the key expression.
   *
   * ```javascript
   * var c = Neuro.collect([{age: 2, nm: 'T'}, {age: 4, nm: 'R'}, {age: 5, nm: 'G'}]);
   * c.pluck(); // c
   * c.pluck('age'); // [2, 4, 5]
   * c.pluck('age', 'nm'); // {T: e, R: 4, G: 5}
   * c.pluck(null, 'nm'); // {T: {age: 2, nm: 'T'}, R: {age: 4, nm: 'R'}, G: {age: 5, nm: 'G'}}
   * c.pluck('{age}-{nm}'); // ['2-T', '4-R', '5-G']
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {propertyResolverInput} [values] -
   *    The expression which converts an element into a value to pluck.
   * @param {propertyResolverInput} [keys] -
   *    The expression which converts an element into an object property (key).
   * @param {String} [valuesDelim=','] -
   *    A delimiter to use to join multiple value properties into a string.
   * @param {String} [keysDelim=','] -
   *    A delimiter to use to join multiple key properties into a string.
   * @return {Array|Object} -
   *    The plucked values.
   * @see Neuro.createPropertyResolver
   */
  pluck: function(values, keys, valuesDelim, keysDelim)
  {
    var valuesResolver = createPropertyResolver( values, valuesDelim );

    if ( keys )
    {
      var keysResolver = createPropertyResolver( keys, keysDelim );
      var result = {};

      for (var i = 0; i < this.length; i++)
      {
        var model = this[ i ];
        var value = valuesResolver( model );
        var key = keysResolver( model );

        result[ key ] = value;
      }

      return result;
    }
    else
    {
      var result = [];

      for (var i = 0; i < this.length; i++)
      {
        var model = this[ i ];
        var value = valuesResolver( model );

        result.push( value );
      }

      return result;
    }
  },

  /**
   * Iterates over each element in this collection and passes the element and
   * it's index to the given function. An optional function context can be given.
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Function} callback -
   *    The function to invoke for each element of this collection passing the
   *    element and the index where it exists.
   * @param {Object} [context] -
   *    The context to the callback function.
   * @return {Neuro.Collection} -
   *    The reference to this collection.
   */
  each: function(callback, context)
  {
    var callbackContext = context || this;

    for (var i = 0; i < this.length; i++)
    {
      var item = this[ i ];

      callback.call( context, item, i );

      if ( this[ i ] !== item )
      {
        i--;
      }
    }

    return this;
  },

  /**
   * Reduces all the elements of this collection to a single value. All elements
   * are passed to a function which accepts the currently reduced value and the
   * current element and returns the new reduced value.
   *
   * ```javascript
   * var reduceIt = function(curr, elem) {
   *  return curr + ( elem[0] * elem[1] );
   * };
   * var c = Neuro.collect([[2, 1], [3, 2], [5, 6]]);
   * c.reduce( reduceIt, 0 ); // 38
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Function} reducer -
   *    A function which accepts the current reduced value and an element and
   *    returns the new reduced value.
   * @param {Any} [initialValue] -
   *    The first value to pass to the reducer function.
   * @return {Any} -
   *    The reduced value.
   */
  reduce: function(reducer, initialValue)
  {
    for (var i = 0; i < this.length; i++)
    {
      initialValue = reducer( initialValue, this[ i ] );
    }

    return initialValue;
  },

  /**
   * Returns a random element in this collection.
   *
   * @method
   * @memberof Neuro.Collection#
   * @return {Any} -
   *    The randomly chosen element from this collection.
   */
  random: function()
  {
    var i = Math.floor( Math.random() * this.length );

    return this[ i ];
  },

  /**
   * Breaks up the collection into an array of arrays of a maximum size (chunks).
   * A destination array can be used to avoid re-allocating arrays.
   *
   * ```javascript
   * var c = Neuro.collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);
   * c.chunk(4); // [[1, 2, 3, 4], [5, 6, 7, 8], [9]]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Number} chunkSize -
   *    The maximum number of elements that can exist in a chunk.
   * @param {Array} [out] -
   *    The destination array to place the chunks.
   * @return {Array} -
   *    The array of chunks of elements taken from this collection.
   */
  chunk: function(chunkSize, out)
  {
    var outer = out || [];
    var outerIndex = 0;
    var inner = outer[ outerIndex ] = outer[ outerIndex ] || [];
    var innerIndex = 0;

    for (var i = 0; i < this.length; i++)
    {
      inner[ innerIndex ] = this[ i ];

      if ( ++innerIndex >= chunkSize )
      {
        innerIndex = 0;
        outerIndex++;
        inner.length = chunkSize;
        inner = outer[ outerIndex ] = outer[ outerIndex ] || [];
      }
    }

    if ( innerIndex !== 0 )
    {
      outerIndex++;
    }

    inner.length = innerIndex;
    outer.length = outerIndex;

    return outer;
  },

  /**
   * Determines whether at least one element in this collection matches the
   * given criteria.
   *
   * ```javascript
   * var c = Neuro.collect([{age: 2}, {age: 6}]);
   * c.contains('age', 2); // true
   * c.contains('age', 3); // false
   * c.contains('age'); // true
   * c.contains('name'); // false
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {whereInput} [properties] -
   *    The expression used to create a function to test the elements in this
   *    collection.
   * @param {Any} [value] -
   *    When the first argument is a string this argument will be treated as a
   *    value to compare to the value of the named property on the object passed
   *    through the filter function.
   * @param {equalityCallback} [equals=Neuro.equalsStrict] -
   *    An alternative function can be used to compare to values.
   * @return {Boolean} -
   *    True if any of the elements passed the test function, otherwise false.
   * @see Neuro.createWhere
   */
  contains: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        return true;
      }
    }

    return false;
  },

  /**
   * Groups the elements into sub collections given some property expression to
   * use as the value to group by.
   *
   * ```javascript
   * var c = Neuro.collect([
   *  { name: 'Tom', age: 6, group: 'X' },
   *  { name: 'Jon', age: 7, group: 'X' },
   *  { name: 'Rob', age: 8, group: 'X' },
   *  { name: 'Bon', age: 9, group: 'Y' },
   *  { name: 'Ran', age: 10, group: 'Y' },
   *  { name: 'Man', age: 11, group: 'Y' },
   *  { name: 'Tac', age: 12, group: 'Z' }
   * ]);
   *
   * c.group({by: 'group'});
   * // [{group: 'X', $count: 3, $group: [...]},
   * //  {group: 'Y', $count: 3, $group: [...]},
   * //  {group: 'Z', $count: 1, $group: [.]}]
   *
   * c.group({by: 'group', select: {age: 'avg', name: 'first'}});
   * // [{group: 'X', age: 7, name: 'Tom', $count: 3, $group: [...]},
   * //  {group: 'Y', age: 9, name: 'Bon', $count: 3, $group: [...]},
   * //  {group: 'Z', age: 12, name: 'Tac', $count: 1, $group: [.]}]
   *
   * c.group({by: 'group', track: false, count: false});
   * // [{group: 'X'}, {group: 'Y'}, {group: 'Z'}]
   *
   * var havingMoreThanOne = function(grouping, groupElements) {
   *  return groupElements.length > 0;
   * };
   * c.group({by: 'group', select: {age: 'avg'}, comparator: '-age', having: havingMoreThanOne, track: false, count: false});
   * // [{group: 'Y', age: 9},
   * //  {group: 'X', age: 7}]
   * ```
   *
   * @method
   * @memberof Neuro.Collection#
   * @param {Object} grouping -
   *    An object specifying how elements in this collection are to be grouped
   *    and what properties from the elements should be aggregated in the
   *    resulting groupings.
   *      - `by`: A property expression that resolves how elements will be grouped.
   *      - `bySeparator`: When an array or object property expression is specified, this is the string that joins them.
   *      - `select`: An object which contains properties that should be aggregated where the value is the aggregate collection function to call (sum, avg, count, first, last, etc).
   *      - `having`: A having expression which takes a grouping and the grouped elements and determines whether the grouping should be in the final result.
   *      - `comparator`: A comparator for sorting the resulting collection of groupings.
   *      - `comparatorNullsFirst`: Whether nulls should be sorted to the top.
   *      - `track`: Whether all elements in the group should exist in a collection in the `$group` property of each grouping.
   *      - `count`: Whether the number of elements in the group should be placed in the `$count` property of each grouping.
   * @return {Neuro.Collection} -
   *    A collection of groupings.
   */
  group: function(grouping)
  {
    var by = createPropertyResolver( grouping.by, grouping.bySeparator || '/' );
    var having = createHaving( grouping.having );
    var select = grouping.select || {};
    var map = {};

    if ( isString( grouping.by ) )
    {
      if ( !(grouping.by in select) )
      {
        select[ grouping.by ] = 'first';
      }
    }
    else if ( isArray( grouping.by ) )
    {
      for (var prop in grouping.by)
      {
        if ( !(prop in select) )
        {
          select[ prop ] = 'first';
        }
      }
    }

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];
      var key = by( model );
      var group = map[ key ];

      if ( !group )
      {
        group = map[ key ] = new this.constructor();
      }

      group.add( model, true );
    }

    var groupings = new this.constructor();

    groupings.setComparator( grouping.comparator, grouping.comparatorNullsFirst );

    for (var key in map)
    {
      var grouped = {};
      var groupArray = map[ key ];

      for (var propName in select)
      {
        var aggregator = select[ propName ];

        if ( isString( aggregator ) )
        {
          grouped[ propName ] = groupArray[ aggregator ]( propName );
        }
        else if ( isFunction( aggregator ) )
        {
          grouped[ propName ] = aggregator( groupArray, propName );
        }
      }

      if ( grouping.track !== false )
      {
        grouped.$group = groupArray;
      }

      if ( grouping.count !== false )
      {
        grouped.$count = groupArray.length;
      }

      if ( having( grouped, groupArray ) )
      {
        groupings.push( grouped );
      }
    }

    groupings.resort();

    return groupings;
  },

  /**
   * Returns a copy of this collection as a plain Array.
   *
   * @method
   * @memberof Neuro.Collection#
   * @return {Array} -
   *    The copy of this collection as a plain array.
   */
  toArray: function()
  {
    return this.slice();
  }

});

eventize( NeuroCollection.prototype );

/**
 * Adds a listener for change events on this collection.
 *
 * @method change
 * @memberof Neuro.Collection#
 * @param {Function} callback -
 *    A function to call every time a change occurs in this collection.
 * @param {Object} [context] -
 *    The desired context (this) for the given callback function.
 * @return {Function} -
 *    A function to call to stop listening for change events.
 * @see Neuro.Collection#event:changes
 */
addEventFunction( NeuroCollection.prototype, 'change', NeuroCollection.Events.Changes );

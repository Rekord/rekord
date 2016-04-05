
/**
 * A Map has the key-to-value benefits of a map and iteration benefits of an
 * array. This is especially beneficial when most of the time the contents of
 * the structure need to be iterated and order doesn't matter (since removal
 * performs a swap which breaks insertion order).
 *
 * @constructor
 * @memberof Neuro
 */
function Map()
{
  /**
   * An array of the values in this map.
   * @member {Array}
   */
  this.values = [];

  /**
   * An array of the keys in this map.
   * @type {Array}
   */
  this.keys = [];

  /**
   * An object of key to index mappings.
   * @type {Object}
   */
  this.indices = {};
}

Map.prototype =
{

  /**
   * Resets the map by initializing the values, keys, and indexes.
   *
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  reset: function()
  {
    this.values.length = 0;
    this.keys.length = 0;
    this.indices = {};

    return this;
  },

  /**
   * Puts the value in the map by the given key.
   *
   * @param {String} key
   * @param {V} value
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  put: function(key, value)
  {
    if ( key in this.indices )
    {
      this.values[ this.indices[ key ] ] = value;
    }
    else
    {
      this.indices[ key ] = this.values.length;
      AP.push.call( this.values, value );
      AP.push.call( this.keys, key );
    }

    return this;
  },

  /**
   * Returns the value mapped by the given key.
   *
   * @param {String} key
   * @return {V}
   */
  get: function(key)
  {
    return this.values[ this.indices[ key ] ];
  },

  /**
   * Removes the value by a given key
   *
   * @param {String} key
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  remove: function(key)
  {
    var index = this.indices[ key ];

    if ( isNumber( index ) )
    {
      this.removeAt( index );
    }

    return this;
  },

  /**
   * Removes the value & key at the given index.
   *
   * @param {Number} index
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  removeAt: function(index)
  {
    var key = this.keys[ index ];
    var lastValue = AP.pop.apply( this.values );
    var lastKey = AP.pop.apply( this.keys );

    if ( index < this.values.length )
    {
      this.values[ index ] = lastValue;
      this.keys[ index ] = lastKey;
      this.indices[ lastKey ] = index;
    }

    delete this.indices[ key ];

    return this;
  },

  /**
   * Returns whether this map has a value for the given key.
   *
   * @param {String} key
   * @return {Boolean}
   */
  has: function(key)
  {
    return key in this.indices;
  },

  /**
   * Returns the number of elements in the map.
   *
   * @return {Number}
   */
  size: function()
  {
    return this.values.length;
  },

  subtract: function(map, dest)
  {
    var out = dest || new Map();
    var n = this.size();
    var values = this.values;
    var keys = this.keys;

    for (var i = 0; i < n; i++)
    {
      var v = values[ i ];
      var k = keys[ i ];

      if ( !map.has( k ) )
      {
        out.put( k, v );
      }
    }

    return out;
  },

  /**
   * Passes all values & keys in this map to a callback and if it returns a
   * truthy value then the key and value are placed in the destination map.
   *
   * @param  {Function} callback [description]
   * @param  {Neuro.Map} [dest]     [description]
   * @return {Neuro.Map}            [description]
   */
  filter: function(callback, dest)
  {
    var out = dest || new Map();
    var n = this.size();
    var values = this.values;
    var keys = this.keys;

    for (var i = 0; i < n; i++)
    {
      var v = values[ i ];
      var k = keys[ i ];

      if ( callback( v, k ) )
      {
        out.put( k, v );
      }
    }

    return out;
  },

  /**
   * Reverses the order of the underlying values & keys.
   *
   * @return {Neuro.Map} -
   *         The referense to this map.
   */
  reverse: function()
  {
    var max = this.size() - 1;
    var half = Math.ceil( max / 2 );

    for (var i = 0; i < half; i++)
    {
      swap( this.values, i, max - i );
      swap( this.keys, i, max - i );
    }

    this.rebuildIndex();

    return this;
  },

  /**
   *
   * @param  {function}  comparator [description]
   * @return {Boolean}            [description]
   */
  isSorted: function(comparator)
  {
    return isSorted( comparator, this.values );
  },

  /**
   * Sorts the underlying values & keys given a value compare function.
   *
   * @param  {function} comparator
   *         A function which accepts two values and returns a number used for
   *         sorting. If the first argument is less than the second argument, a
   *         negative number should be returned. If the arguments are equivalent
   *         then 0 should be returned, otherwise a positive number should be
   *         returned.
   * @return {Map} -
   *         The reference to this map.
   */
  sort: function(comparator)
  {
    var map = this;

    // Sort this partition!
    function partition(left, right)
    {
      var pivot = map.values[ Math.floor((right + left) / 2) ];
      var i = left;
      var j = right;

      while (i <= j)
      {
        while (comparator( map.values[i], pivot ) < 0) i++
        while (comparator( map.values[j], pivot ) > 0) j--;

        if (i <= j) {
          swap( map.values, i, j );
          swap( map.keys, i, j );
          i++;
          j--;
        }
      }

      return i;
    }

    // Quicksort
    function qsort(left, right)
    {
      var index = partition( left, right );

      if (left < index - 1)
      {
        qsort( left, index - 1 );
      }

      if (index < right)
      {
        qsort( index, right );
      }
    }

    var right = this.size() - 1;

    // Are there elements to sort?
    if ( right > 0 )
    {
      qsort( 0, right );

      this.rebuildIndex();
    }

    return this;
  },

  /**
   * Rebuilds the index based on the keys.
   *
   * @return {Neuro.Map} -
   *         The reference to this map.
   */
  rebuildIndex: function()
  {
    this.indices = {};

    for (var i = 0, l = this.keys.length; i < l; i++)
    {
      this.indices[ this.keys[ i ] ] = i;
    }

    return this;
  }

};

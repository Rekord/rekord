function NeuroCollection(values)
{
  this.addAll( values );
}

NeuroCollection.Events =
{
  Add:            'add',
  Adds:           'adds',
  Sort:           'sort',
  Remove:         'remove',
  Removes:        'removes',
  Updates:        'updates',
  Reset:          'reset',
  Cleared:        'cleared',
  Changes:        'add adds sort remove removes updates reset cleared'
};

extendArray( Array, NeuroCollection, 
{

  setComparator: function(comparator, comparatorNullsFirst)
  {
    this.comparator = createComparator( comparator, comparatorNullsFirst );
    this.resort();

    return this;
  },

  isSorted: function(comparator, comparatorNullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, comparatorNullsFirst ) : this.comparator;

    return isSorted( cmp, this );
  },

  resort: function(comparator, comparatorNullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, comparatorNullsFirst ) : this.comparator;

    if ( !isSorted( cmp, this ) )
    {
      this.sort( cmp );
      this.trigger( NeuroCollection.Events.Sort, [this] );
    }

    return this;
  },

  page: function(pageSize, pageIndex)
  {
    return new NeuroPage( this, pageSize, pageIndex );
  },

  filtered: function(whereProperties, whereValue, whereEquals)
  {
    var filter = createWhere( whereProperties, whereValue, whereEquals );

    return new NeuroFilteredCollection( this, filter );
  },

  filter: function(whereProperties, whereValue, whereEquals)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var target = new this.constructor();

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

  subtract: function(collection, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];
      var exists = false;

      for (var j = 0; j < collection.length && !exists; j++)
      {
        exists = equals( a, collection[ j ] );
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  intersect: function(collection, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < collection.length; i++)
    {
      var a = collection[ i ];
      var exists = false;

      for (var j = 0; j < this.length && !exists; j++)
      {
        exists = equals( a, this[ j ] );
      }

      if (exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  complement: function(collection, out)
  {
    var target = out || new this.constructor();

    for (var i = 0; i < collection.length; i++)
    {
      var a = collection[ i ];
      var exists = false;

      for (var j = 0; j < this.length && !exists; j++)
      {
        exists = equals( a, this[ j ] );
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  clear: function()
  {
    this.length = 0;
    this.trigger( NeuroCollection.Events.Cleared, [this] );
  },

  add: function(value, delaySort)
  {
    this.push( value );
    this.trigger( NeuroCollection.Events.Add, [this, value] );

    if ( !delaySort )
    {
      this.resort();
    }
  },

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
  },

  removeAt: function(i, delaySort)
  {
    if (i >= 0 && i < this.length)
    {
      var removing = this[ i ];

      this.splice( i, 1 );
      this.trigger( NeuroCollection.Events.Remove, [this, removing, i] );

      if ( !delaySort )
      {
        this.resort();
      }
    }
  },

  remove: function(value)
  {
    var i = this.indexOf( value );

    if ( i !== -1 )
    {
      this.removeAt( i );
    }
  },

  removeAll: function(values, equals, delaySort)
  {
    if ( isArray( values ) && values.length )
    {
      var removed = [];

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

      return removed;
    }
  },

  removeWhere: function(whereProperties, whereValue, whereEquals)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var removed = [];

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
    this.resort();

    return removed;
  },

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

  insertAt: function(i, value, delaySort)
  {
    this.splice( i, 0, value );
    this.trigger( NeuroCollection.Events.Add, [this, value] );

    if ( !delaySort )
    {
      this.resort();
    }
  },

  minModel: function(comparator)
  {
    var cmp = createComparator( comparator || this.comparator, false );
    var min = undefined;

    for (var i = 0; i < this.length; i++)
    {
      if ( cmp( min, this[i] ) > 0 )
      {
        min = this[i];
      }
    }

    return min;
  },

  maxModel: function(comparator)
  {
    var cmp = createComparator( comparator || this.comparator, true );
    var max = undefined;

    for (var i = 0; i < this.length; i++)
    {
      if ( cmp( max, this[i] ) < 0 )
      {
        max = this[i];
      }
    }

    return max;
  },

  min: function(properties, delim)
  {
    var resolver = createPropertyResolver( properties, delim );
    var min = undefined;

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

  max: function(properties, delim)
  {
    var resolver = createPropertyResolver( properties, delim );
    var max = undefined;

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

  each: function(callback, context)
  {
    var callbackContext = context || this;

    for (var i = 0; i < this.length; i++)
    {
      callback.call( context, this[ i ], i );
    }
  },

  reduce: function(reducer, initialValue)
  {
    for (var i = 0; i < this.length; i++)
    {
      initialValue = reducer( initialValue, this[ i ] );
    }

    return initialValue;
  },

  random: function()
  {
    var i = Math.floor( Math.random() * this.length );

    return this[ i ];
  },

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

  where: function(properties, value, equals)
  {
    var where = createWhere( properties, value, equals );
    var result = [];

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        result.push( model );
      }
    }

    return result;
  },

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

  toArray: function()
  {
    return this.slice();
  },

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

      if ( having( grouped ) )
      {
        groupings.push( grouped );        
      }
    }

    groupings.resort();

    return groupings;
  }

});

eventize( NeuroCollection.prototype );
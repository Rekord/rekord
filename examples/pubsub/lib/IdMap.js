
/**
 * Instantiates an IdMap to store objects with an id property.
 */
function IdMap()
{
  this.size = 0;
  this.items = {};
}

IdMap.prototype = 
{
  
  /**
   * Adds the item to this IdMap if an item with the same id has not been added yet.
   *
   * @param object item
   *   The object with the id property to place in the IdMap (if itemToAdd is absent).
   * @param any itemToAdd
   *   An optional value to place in the map. If not specified the item will be used as the value.
   * @return True if the item was added, false if an item with the id already exists.
   */
  add: function(item, itemToAdd)
  {
    var added = !(item.id in this.items);
    
    if (added)
    {
      this.items[ item.id ] = itemToAdd || item;
      this.size++;
    }
    
    return added;
  },
  
  /**
   * Returns the item in the map with the given id.
   *
   * @param string id
   *   The id of the item to return.
   * @return The item in the map with the given id or undefined if it doesn't exist.
   */
  at: function(id)
  {
    return this.items[ id ];
  },
  
  /**
   * Removes the item from the IdMap with the same id if it exists.
   * 
   * @param object item
   *   The object with the id property to remove from the IdMap.
   * @return True if the item was removed, false if an item with the id didn't exist.
   */
  remove: function(item)
  {
    var removed = (item.id in this.items);
    
    if (removed)
    {
      delete this.items[ item.id ];
      this.size--;
    }
    
    return removed;
  },
  
  /**
   * Removes and returns the item in the map with a matching id. 
   *
   * @param object item
   *   The object with the id property to remove from the IdMap.
   * @return The object in the IdMap removed, or undefined if nothing was removed.
   */
  take: function(item)
  {
    var taken = this.items[ item.id ];
    this.remove( item );
    return taken;
  },
  
  /**
   * Determines whether an item exists in the map with the same id.
   *
   * @param object item
   *   The object with the id property to check for existence.
   * @return True if the IdMap contains an item with the given item's id.
   */
  has: function(item)
  {
    return ( item.id in this.items );
  },
  
  /**
   * Iterates over each item in the map and invokes a callback.
   *
   * @param string skipId
   *   An item id to skip during iteration, if any.
   * @param any context
   *   The "this" of the callback function.
   * @param function callback
   *   The function to invoke for each item in the IdMap. The first argument is
   *   the id the item is mapped by and the second argument is the item itself.
   */
  each: function(skipId, context, callback)
  {    
    for (var id in this.items)
    {
      if (id !== skipId)
      {
        callback.call( context, id, this.items[id] );
      }
    }
  }
  
};

// Export the IdMap class.
module.exports = IdMap;
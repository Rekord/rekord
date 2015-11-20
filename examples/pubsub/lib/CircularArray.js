
/**
 * An array with an add method which ensures the array length doesn't exceed a
 * given capacity. If the array is full the oldest value [0] is copied over.
 *
 * @param number capacity
 *   The maximum number of values allowed in this CircularArray.
 */
function CircularArray(capacity)
{
  this.capacity = capacity;
}

/**
 * CircularArray should inherit Array.
 */
CircularArray.prototype = new Array();

/**
 * Adds a new item to the end of this array possibly removing elements form the
 * beginning of the array to keep it's size within capacity.
 * 
 * @param any item
 *   The item to add to the array.
 */
CircularArray.prototype.add = function(item)
{
  if (this.capacity > 0)
  {
    while (this.length >= this.capacity)
    {
      this.shift();
    }
    
    this.push(item);
  }
};

// Export the CircularArray class.
module.exports = CircularArray;
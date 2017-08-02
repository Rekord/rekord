
var Lives = {};

/**
 * The factory responsible for creating a service which publishes operations
 * and receives operations that have occurred. The first argument is a reference
 * to the Database and the second argument is a function to invoke when a
 * live operation occurs. This function must return a function that can be passed
 * an operation to be delegated to other clients.
 *
 * @param  {Database} database
 *         The database this live function is for.
 * @return {function} -
 *         The function which sends operations.
 */
Lives.Default =
Rekord.defaultLive =
Rekord.live = function(database)
{
  return {

    save: function(model, data)
    {
      // ignore save
    },

    remove: function(model)
    {
      // ignore remove
    }

  };
};

/**
 * Sets the live implementation provided the factory function. This function
 * can only be called once - all subsequent calls will be ignored unless
 * `overwrite` is given as a truthy value.
 *
 * @memberof Rekord
 * @param {Function} factory -
 *    The factory which provides live implementations.
 * @param {Boolean} [overwrite=false] -
 *    True if existing implementations are to be ignored and the given factory
 *    should be the implementation.
 */
Rekord.setLive = function(factory, overwrite)
{
  if ( !Rekord.liveSet || overwrite )
  {
    Rekord.live = factory;
    Rekord.liveSet = true;
  }
};

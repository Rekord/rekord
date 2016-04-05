
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
Neuro.live = function(database)
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
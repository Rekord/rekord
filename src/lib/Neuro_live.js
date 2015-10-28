
/**
 * The factory responsible for creating a service which publishes operations
 * and receives operations that have occurred. The first argument is a reference
 * to the NeuroDatabase and the second argument is a function to invoke when a
 * live operation occurs. This function must return a function that can be passed
 * an operation to be delegated to other clients.
 * 
 * @param  {NeuroDatabase} database
 *         The database this live function is for.
 * @param  {function} onPublish
 *         The function which receives live operations.
 * @return {function} -
 *         The function which sends operations.
 */
Neuro.live = function(database, onPublish)
{
  return function publish(message)
  {
    // ignore the message.
  };
};
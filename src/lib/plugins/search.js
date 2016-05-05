Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  /**
   * Creates a new search for model instances. A search is an object with
   * properties that are passed to a configurable {@link Rekord.rest} function
   * which expect an array of models to be returned from the remote call that
   * match the search parameters.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name', 'done']
   * });
   * var search = Task.search('/api/task/search');
   * search.name = 'like this';
   * search.done = true;
   * search.anyProperty = [1, 3, 4];
   * var promise = search.$run();
   * promise.success( function(search) {
   *   search.$results; // collection of returned results
   * });
   * ```
   *
   * @method search
   * @memberof Rekord.Model
   * @param {String} url -
   *    A URL to send the search data to.
   * @param {searchOptions} [options] -
   *    Options for the search.
   * @param {Object} [props] -
   *    Initial set of properties on the search.
   * @param {Boolean} [run=false] -
   *    Whether or not to run the search immediately.
   * @return {Rekord.Search} -
   *    A new search for models.
   */
  model.search = function(url, options, props, run)
  {
    return new Search( db, url, options, props, run );
  };
});

addPlugin(function(model, db, options)
{

  /**
   * Creates a new search for model instances and returns the results collection.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name', 'done']
   * });
   * var results = Task.results('/api/task/search', {name: 'like this', done: true});
   * // results populated when search finishes running.
   * // results.$search is the Search object.
   * // results.$search.$promise is the promise of the search.
   * ```
   *
   * @method results
   * @memberof Rekord.Model
   * @param {String} url -
   *    A URL to send the search data to.
   * @param {Object} [props] -
   *    Initial set of properties on the search.
   * @param {searchOptions} [options] -
   *    Options for the search.
   * @return {Rekord.ModelCollection} -
   *    A collection containing the results of the search.
   */
  model.results = function(url, props, options)
  {
    return new Search( db, url, options, props, true ).$results;
  };
});

Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  /**
   * Creates a new search with pagination for model instances. A paginated
   * search is an object with properties that are passed to a configurable
   * {@link Rekord.rest} function which expect an array of models to be returned
   * as well as paging information from the remote call. Special properties are
   * passed to the server (`page_index`, `page_size`) which dictate which
   * chunk of data should be returned. A special `total` property is expected to
   * be returned with `results` which tells the search how many records would've
   * been returned without the pagination.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name', 'done']
   * });
   * var search = Task.searchPaged('/api/task/searchPaged');
   * search.name = 'like this';
   * search.done = true;
   * search.anyProperty = [1, 3, 4];
   * search.$run();
   * search.$success( function(search) {
   *   search.$results; // collection of returned results
   *   search.total; // number of results that would've been returned without pagination
   *   search.page_index; // the zero-based page index
   *   search.page_size; // the number of results to be returned
   * });
   * search.$next(); // increase page_index, get the next page
   * ```
   *
   * @method searchPaged
   * @memberof Rekord.Model
   * @param {String} url -
   *    A URL to send the search data to.
   * @param {searchPageOptions} [options] -
   *    Options for the search.
   * @return {Rekord.SearchPaged} -
   *    A new paginated search for models.
   */
  model.searchPaged = function(url, options)
  {
    return new SearchPaged( db, url, options );
  };
});

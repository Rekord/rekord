addPlugin(function(model, db, options)
{

  model.searchAt = function(index, url, paging, options, props, success, failure)
  {
    var page = {page_index: index, page_size: 1};

    var search = paging ?
      new SearchPaged( db, url, collapse( options, page ), props ) :
      new Search( db, url, options, props );

    var promise = new Promise();

    promise.success( success );
    promise.failure( failure );

    search.$run().then(
      function onSuccess(search, response, results) {
        promise.resolve( results[ paging ? 0 : index ] );
      },
      function onFailure() {
        promise.reject();
      },
      function onOffline() {
        promise.noline();
      }
    );

    return promise;
  };

});

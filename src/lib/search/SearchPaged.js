
/**
 * Options you can pass to {@link Rekord.SearchPaged} or
 * {@link Rekord.Model.searchPaged}.
 *
 * @typedef {Object} searchPageOptions
 * @property {Number} [page_size=10] -
 *    The size of the pages.
 * @property {Number} [page_index=0] -
 *    The index of the search page.
 * @property {Number} [total=0] -
 *    The total number of models that exist in the search without pagination
 *    - this is expected to be provided by the remote search response.
 * @property {Function} [$encode] -
 *    A function which converts the search into an object to pass to the
 *    specified methods.
 * @property {Function} [$decode] -
 *    A function which takes the data returned from the server and updates
 *    this search with the results and paging information.
 * @property {Function} [$decodeResults] -
 *    A function which takes the data returned from the server and returns the
 *    array of models which are to be placed in the
 *    {@link Rekord.Search#$results} property.
 * @property {Function} [$updatePageSize] -
 *    A function which takes the data returned from the server and sets an
 *    updated page size of the search.
 * @property {Function} [$updatePageIndex] -
 *    A function which takes the data returned from the server and sets an
 *    updated page index of the search.
 * @property {Function} [$updateTotal] -
 *    A function which takes the data returned from the server and sets an
 *    updated total of the search.
 */

function SearchPaged(database, url, options, props, run)
{
  this.$init( database, url, options, props, run );
}

SearchPaged.Defaults =
{
  page_size:   10,
  page_index:  0,
  total:       0
};

extend( Search, SearchPaged,
{

  $getDefaults: function()
  {
    return SearchPaged.Defaults;
  },

  $goto: function(index, dontRun)
  {
    var pageIndex = this.$getPageIndex();
    var pageCount = this.$getPageCount();
    var desired = Math.max( 0, Math.min( index, pageCount - 1 ) );

    if ( pageIndex !== desired )
    {
      this.$setPageIndex( desired );

      if ( !dontRun )
      {
        this.$append = false;
        this.$run();
      }
    }

    return this.$promise;
  },

  $more: function()
  {
    var next = this.$getPageIndex() + 1;

    if ( next < this.$getPageCount() )
    {
      this.$setPageIndex( next );
      this.$append = true;
      this.$run();
      this.$promise.complete( this.$onMoreEnd, this );
    }

    return this.$promise;
  },

  $onMoreEnd: function()
  {
    this.$append = false;
  },

  $first: function(dontRun)
  {
    return this.$goto( 0, dontRun );
  },

  $last: function(dontRun)
  {
    return this.$goto( this.$getPageCount() - 1, dontRun );
  },

  $prev: function(dontRun)
  {
    return this.$goto( this.$getPageIndex() - 1, dontRun );
  },

  $next: function(dontRun)
  {
    return this.$goto( this.$getPageIndex() + 1, dontRun );
  },

  $total: function()
  {
    return this.$getTotal();
  },

  $pages: function()
  {
    return this.$getPageCount();
  },

  $page: function(index)
  {
    return Math.max( 0, Math.min( index, this.$pages() - 1 ) );
  },

  $can: function(index)
  {
    return this.$getTotal() && index >= 0 && index < this.$getPageCount();
  },

  $canFirst: function()
  {
    return this.$canPrev();
  },

  $canLast: function()
  {
    return this.$canNext();
  },

  $canPrev: function()
  {
    return this.$getTotal() && this.$getPageIndex() > 0;
  },

  $canNext: function()
  {
    return this.$getTotal() && this.$getPageIndex() < this.$getPageCount() - 1;
  },

  $decode: function(response)
  {
    this.$updatePageSize( response );
    this.$updatePageIndex( response );
    this.$updateTotal( response );

    return this.$decodeResults( response );
  },

  $decodeResults: function(response)
  {
    return response.results;
  },

  $updatePageSize: function(response)
  {
    if ( isNumber( response.page_size ) )
    {
      this.page_size = response.page_size;
    }
  },

  $setPageSize: function(page_size)
  {
    this.page_size = page_size;
  },

  $getPageSize: function()
  {
    return this.page_size;
  },

  $updatePageIndex: function(response)
  {
    if ( isNumber( response.page_index ) )
    {
      this.page_index = response.page_index;
    }
  },

  $setPageIndex: function(page_index)
  {
    this.page_index = page_index || 0;
  },

  $getPageIndex: function()
  {
    return this.page_index;
  },

  $getPageOffset: function()
  {
    return this.page_index * this.page_size;
  },

  $updateTotal: function(response)
  {
    if ( isNumber( response.total ) )
    {
      this.total = response.total;
    }
  },

  $setTotal: function(total)
  {
    this.total = total || 0;
  },

  $getTotal: function()
  {
    return this.total;
  },

  $getPageCount: function()
  {
    return Math.ceil( this.$getTotal() / this.$getPageSize() );
  }

});

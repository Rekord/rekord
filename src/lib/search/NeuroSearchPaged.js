
function NeuroSearchPaged(database, options)
{
  this.$init( database, options );
}

extend( NeuroSearch, NeuroSearchPaged,
{

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
        this.$run();
      }
    }

    return this;
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

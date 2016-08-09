
/**
 *
 * @constructor
 * @memberof Rekord
 * @augments Rekord.Eventful
 */
function Page(collection, pageSize, pageIndex)
{
  this.onChanges = bind( this, this.handleChanges );
  this.pageSize = pageSize;
  this.pageIndex = pageIndex || 0;
  this.pageCount = 0;
  this.setCollection( collection );
}

Page.Events =
{
  Change:       'change',
  Changes:      'change'
};

extendArray( Array, Page,
{

  setPageSize: function(pageSize)
  {
    this.pageSize = pageSize;
    this.handleChanges();
  },

  setPageIndex: function(pageIndex)
  {
    this.goto( pageIndex );
  },

  setCollection: function(collection)
  {
    if ( collection !== this.collection )
    {
      if ( this.collection )
      {
        this.disconnect();
      }

      this.collection = collection;
      this.connect();
      this.handleChanges( true );
    }
  },

  connect: function()
  {
    this.collection.on( Collection.Events.Changes, this.onChanges );
  },

  disconnect: function()
  {
    this.collection.off( Collection.Events.Changes, this.onChanges );
  },

  goto: function(pageIndex)
  {
    var actualIndex = this.page( pageIndex );

    if ( actualIndex !== this.pageIndex )
    {
      this.pageIndex = actualIndex;
      this.update();
      this.trigger( Page.Events.Change, [ this ] );
    }
  },

  next: function()
  {
    this.goto( this.pageIndex + 1 );
  },

  prev: function()
  {
    this.goto( this.pageIndex - 1 );
  },

  jump: function(to)
  {
    this.goto( to );
  },

  first: function()
  {
    this.goto( 0 );
  },

  last: function()
  {
    this.goto( this.pageCount - 1 );
  },

  total: function()
  {
    return this.collection.length;
  },

  pages: function()
  {
    return Math.ceil( this.total() / this.pageSize );
  },

  page: function(index)
  {
    return Math.max( 0, Math.min( index, this.pages() - 1 ) );
  },

  can: function(index)
  {
    return this.total() && index >= 0 && index < this.pageCount;
  },

  canFirst: function()
  {
    return this.canPrev();
  },

  canLast: function()
  {
    return this.canNext();
  },

  canPrev: function()
  {
    return this.total() && this.pageIndex > 0;
  },

  canNext: function()
  {
    return this.total() && this.pageIndex < this.pageCount - 1;
  },

  handleChanges: function(forceApply)
  {
    var pageCount = this.pages();
    var pageIndex = this.page( this.pageIndex );
    var apply = forceApply || this.pageIndex !== pageIndex || this.length !== this.pageSize;
    var changes = apply || this.pageCount !== pageCount;

    this.pageIndex = pageIndex;
    this.pageCount = pageCount;

    if ( apply )
    {
      this.update();
    }
    if ( changes )
    {
      this.trigger( Page.Events.Change, [ this ] );
    }
  },

  update: function()
  {
    var source = this.collection;
    var n = source.length;
    var start = this.pageIndex * this.pageSize;
    var end = Math.min( start + this.pageSize, n );
    var length = end - start;

    this.length = 0;

    for (var i = 0; i < length; i++)
    {
      this.push( source[ start++ ] );
    }
  },

  more: function(pages)
  {
    var source = this.collection;
    var limit = source.length;
    var pageCount = pages || 1;
    var offset = this.pageIndex * this.pageSize;
    var start = offset + this.length;
    var adding = this.pageSize * pageCount;
    var desiredEnd = start + adding;
    var actualEnd = Math.min( limit, desiredEnd );

    while (start < actualEnd)
    {
      this.push( source[ start++ ] );
    }
  },

  toArray: function()
  {
    return this.slice();
  }

});

addEventful( Page.prototype );
addEventFunction( Page.prototype, 'change', Page.Events.Changes );

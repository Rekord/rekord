
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
    var actualIndex = Math.max( 0, Math.min( pageIndex, this.pageCount - 1 ) );

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

  handleChanges: function(forceApply)
  {
    var n = this.collection.length;
    var pageCount = Math.ceil( n / this.pageSize );
    var pageIndex = Math.max( 0, Math.min( this.pageIndex, pageCount - 1 ) );
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

addEventable( Page.prototype );
addEventFunction( Page.prototype, 'change', Page.Events.Changes );

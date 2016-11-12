
function Context(models)
{
  this.databases = [];
  this.alls = [];
  this.models = [];

  if ( isEmpty( models ) )
  {
    for (var name in Rekord.classes)
    {
      this.add( name );
    }
  }
  else if ( isArray( models ) )
  {
    for (var i = 0; i < models.length; i++)
    {
      this.add( models[ i ] );
    }
  }
}

Context.start = function(models)
{
  var context = new Context( models );

  context.apply();

  return context;
};

Class.create( Context,
{

  add: function(type)
  {
    if ( isString( type ) )
    {
      type = Rekord.classes[ type ];
    }

    if ( isRekord( type ) )
    {
      type = type.Database;
    }

    if ( type instanceof Database )
    {
      this.databases.push( type );
      this.alls.push( {} );
      this.models.push( new ModelCollection( type ) );
    }
  },

  getApplied: function()
  {
    var applied = 0;

    this.each(function(db)
    {
      if (db.context === this)
      {
        applied++;
      }
    });

    return applied / this.databases.length;
  },

  apply: function()
  {
    this.each( this.applyDatabase );
  },

  applyDatabase: function(db, all, models, i)
  {
    db.all = all;
    db.models = models;
    db.context = this;
    db.contextIndex = i;
  },

  discard: function()
  {
    this.each( this.discardDatabase );
  },

  discardDatabase: function(db)
  {
    if (db.context === this)
    {
      db.all = db.allCached;
      db.models = db.modelsCached;
      db.context = null;
      db.contextIndex = -1;
    }
  },

  destroy: function()
  {
    this.each( this.destroyDatabase );

    this.databases.length = 0;
    this.alls.length = 0;
    this.models.length = 0;
  },

  destroyDatabase: function(db, alls, models, i)
  {
    this.discardDatabase( db );

    this.databases[ i ] = null;
    this.alls[ i ] = null;
    this.models[ i ].clear();
    this.models[ i ] = null;
  },

  clear: function(db)
  {
    this.alls[ db.contextIndex ] = {};
  },

  each: function(iterator)
  {
    var dbs = this.databases;
    var alls = this.alls;
    var models = this.models;

    for (var i = 0; i < dbs.length; i++)
    {
      iterator.call( this, dbs[ i ], alls[ i ], models[ i ], i );
    }
  }

});


function Operation()
{
}

Class.create( Operation,
{

  reset: function(model, cascade, options)
  {
    this.model = model;
    this.cascade = isNumber( cascade ) ? cascade : Cascade.All;
    this.options = options;
    this.db = model.$db;
    this.next = null;
    this.finished = false;
  },

  canCascade: function(cascade)
  {
    var expected = cascade || this.cascading;
    var actual = this.cascade;

    return (expected & actual) !== 0;
  },

  notCascade: function(expected)
  {
    var actual = this.cascade;

    return (expected & actual) === 0;
  },

  queue: function(operation)
  {
    if ( this.next && !operation.interrupts )
    {
      this.next.queue( operation );
    }
    else
    {
      this.next = operation;
      this.model.$trigger( Model.Events.OperationsStarted );
    }
  },

  tryNext: function(OperationType)
  {
    var setNext = !this.next;

    if ( setNext )
    {
      this.next = new OperationType( this.model, this.cascade, this.options );
    }

    return setNext;
  },

  insertNext: function(OperationType)
  {
    var op = new OperationType( this.model, this.cascade, this.options );

    op.next = this.next;
    this.next = op;
  },

  execute: function()
  {
    if ( this.db.pendingOperations === 0 )
    {
      this.db.trigger( Database.Events.OperationsStarted );
    }

    this.db.pendingOperations++;

    try
    {
      this.run( this.db, this.model );
    }
    catch (ex)
    {
      this.finish();

      Rekord.trigger( Rekord.Events.Error, [ex] );

      throw ex;
    }
  },

  run: function(db, model)
  {
    throw 'Operation.run Not implemented';
  },

  finish: function()
  {
    if ( !this.finished )
    {
      this.finished = true;
      this.model.$operation = this.next;

      if ( this.next )
      {
        this.next.execute();
      }

      this.db.pendingOperations--;

      if ( !this.next )
      {
        this.model.$trigger( Model.Events.OperationsFinished );
      }

      if ( this.db.pendingOperations === 0 )
      {
        this.db.onOperationRest();
        this.db.trigger( Database.Events.OperationsFinished );
      }
    }

    return this;
  },

  success: function()
  {
    return bind( this, this.handleSuccess );
  },

  handleSuccess: function()
  {
    try
    {
      this.onSuccess.apply( this, arguments );
    }
    catch (ex)
    {
      Rekord.trigger( Rekord.Events.Error, [ex] );

      throw ex;
    }
    finally
    {
      this.finish();
    }
  },

  onSuccess: function()
  {

  },

  failure: function()
  {
    return bind( this, this.handleFailure );
  },

  handleFailure: function()
  {
    try
    {
      this.onFailure.apply( this, arguments );
    }
    catch (ex)
    {
      Rekord.trigger( Rekord.Events.Error, [ex] );

      throw ex;
    }
    finally
    {
      this.finish();
    }
  },

  onFailure: function()
  {

  }

});

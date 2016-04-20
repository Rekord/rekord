
function Operation()
{
}

addMethods( Operation.prototype,
{
  reset: function(model, cascade)
  {
    this.model = model;
    this.cascade = isNumber( cascade ) ? cascade : Rekord.Cascade.All;
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
    }
  },

  tryNext: function(OperationType)
  {
    var setNext = !this.next;

    if ( setNext )
    {
      this.next = new OperationType( this.model, this.cascade );
    }

    return setNext;
  },

  insertNext: function(OperationType)
  {
    var op = new OperationType( this.model, this.cascade );

    op.next = this.next;
    this.next = op;
  },

  execute: function()
  {
    this.db.pendingOperations++;

    this.run( this.db, this.model );
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

      if ( this.model.$operation = this.next )
      {
        this.next.execute();
      }

      this.db.pendingOperations--;

      if ( this.db.pendingOperations === 0 )
      {
        this.db.onOperationRest();
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
    this.onSuccess.apply( this, arguments );
    this.finish();
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
    this.onFailure.apply( this, arguments );
    this.finish();
  },

  onFailure: function()
  {

  }

});

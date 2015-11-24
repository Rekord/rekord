
Neuro.Cascade = {
  None:     0,
  Local:    1,
  Rest:     2,
  Live:     4,
  Remote:   6,
  All:      7
};

function NeuroOperation(interrupts, type)
{
  this.interrupts = interrupts;
  this.type = type;
}

NeuroOperation.prototype = 
{
  reset: function(model, cascade)
  {
    this.model = model;
    this.cascade = isValue( cascade ) ? cascade : Neuro.Cascade.All;
    this.db = model.$db;
    this.next = null;
    this.finished = false;
  },

  canCascade: function(type)
  {
    return !!(this.cascade & type);
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

  execute: function()
  {
    this.db.remoteOperations++;

    this.run( this.db, this.model );
  },

  run: function(db, model)
  {
    throw 'NeuroOperation.run Not implemented';
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

      this.db.remoteOperations--;

      if ( this.db.remoteOperations === 0 )
      {
        this.db.onRemoteRest();
      }
    }

    return this;
  },

  tryNext: function(OperationType, cascade)
  {
    if ( !this.next )
    {
      this.next = new OperationType( this.model, cascade );
    }
  },

  insertNext: function(OperationType, cascade)
  {
    var op = new OperationType( this.model, cascade );

    op.next = this.next;
    this.next = op;
  },

  success: function()
  {
    var op = this;

    return function handleSuccess() 
    {
      op.onSuccess.apply( op, arguments );
      op.finish();
    };
  },

  onSuccess: function()
  {

  },

  failure: function()
  {
    var op = this;

    return function handleFailure() 
    {
      op.onFailure.apply( op, arguments );
      op.finish();
    };
  },

  onFailure: function()
  {

  }

};

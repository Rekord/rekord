
function NeuroOperation(interrupts, type)
{
  this.interrupts = interrupts;
  this.type = type;
}

NeuroOperation.prototype = 
{
  reset: function(model)
  {
    this.model = model;
    this.db = model.$db;
    this.next = null;
    this.finished = false;
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
    }

    return this;
  },

  tryNext: function(OperationType)
  {
    if ( !this.next )
    {
      this.next = new OperationType( this.model );
    }
  },

  insertNext: function(OperationType)
  {
    var op = new OperationType( this.model );

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

/**

$operation;

$addOperation: function(OperationType) {
  var operation = new OperationType( this );
  if ( !this.$operation ) {
    this.$operation = operation;
    this.$operation.execute();
  } else {
    this.$operation.queue( operation );
  }
}

 */
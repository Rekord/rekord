
function Request(context, success, failure)
{
  this.context = context;
  this.success = success;
  this.failure = failure;
  this.call = 0;
  this.callCanceled = 0;
}

addMethods( Request.prototype,
{

  onSuccess: function()
  {
    return this.handleCall( this, ++this.call, this.success );
  },

  onFailure: function()
  {
    return this.handleCall( this, this.call, this.failure );
  },

  handleCall: function(request, currentCall, callback)
  {
    return function onHandleCall()
    {
      if ( request.call === currentCall &&
           currentCall > request.callCanceled &&
           isFunction( callback ) )
      {
        callback.apply( request.context, arguments );
      }
    };
  },

  cancel: function()
  {
    this.callCanceled = this.call;
  }

});

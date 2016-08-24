define([

], function () {
  function MinimumInputLength (decorated, $e, options) {
    this.minimumInputLength = options.get('minimumInputLength');

    decorated.call(this, $e, options);
  }

  MinimumInputLength.prototype.query = function (decorated, params, callback) {
    params.term = params.term || '';
    var minimumInputLength = typeof(this.minimumInputLength) == 'function' && this.minimumInputLength(params) || this.minimumInputLength;

    if (params.term.length < minimumInputLength) {
      this.trigger('results:message', {
        message: 'inputTooShort',
        args: {
          minimum: minimumInputLength,
          input: params.term,
          params: params
        }
      });

      return;
    }

    decorated.call(this, params, callback);
  };

  return MinimumInputLength;
});

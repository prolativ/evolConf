define(['./module',
        'app.msg'],
        function (module, msg) {

  'use strict';

  module.controller('TextInputModalCtrl', function ($uibModalInstance, title, inputs) {
    this.msg = msg;
    this.title = title;
    this.inputs = inputs || {};

    for(var i=0; i<this.inputs.length; ++i){
      var input = this.inputs[i];
      input.text = input.initialText || ""; 
    };

    this.accept = function () {
      $uibModalInstance.close(this.inputs);
    };

    this.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });
});
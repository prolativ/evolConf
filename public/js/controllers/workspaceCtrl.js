define(['./module',
        'app.msg',
        '../blockly/toolbox',
        '../blockly/codeGenerator',
        'blockly.inject',
        'jquery.bootstrap'
        ], function (module, msg, toolbox, codeGenerator) {

  'use strict';

  module.controller('WorkspaceCtrl',
      ['$scope', '$http', 'projectService',
      function ($scope, $http, projectService) {

    this.init = function(){
      this.msg = msg;

      this.workspace = Blockly.inject('blockly-div', {
        toolbox: toolbox,
        media: 'lib/blockly/media/'
      });

      $('#blockly-div').trigger('resize');

      function updateCodePreview(code){
        $("#generated-code")
          .empty()
          .append(code);
      }


      var self = this;

      this.workspace.addChangeListener(function(){
        var blocksDom = Blockly.Xml.workspaceToDom(self.workspace);
        projectService.setBlocksXml(Blockly.Xml.domToText(blocksDom));
        self.code = self.generateCode();
        updateCodePreview(self.code);
      });

      this.hiddenSidebar = false;
      this.isCodeVisible = true;

      this.loadProject();

      //resize after some time to initialize/position workspace
      function initWorkspacePosition(repetitions){
        if(repetitions > 0){
          Blockly.fireUiEvent(window, 'resize');
          setTimeout(function(){
            initWorkspacePosition(repetitions - 1);
          }, 200);
        }
      }

      initWorkspacePosition(10);
  	};

    this.loadProject = function(){
      var project = projectService.getProject();

      this.code = "";
      this.workspace.clear();
      this.workspace.updateToolbox(toolbox);

      if(project.blocksXml){
        var blocksDom = Blockly.Xml.textToDom(project.blocksXml);
        Blockly.Xml.domToWorkspace(this.workspace, blocksDom);
      }

      this.workspace.fireChangeEvent();
    };

    this.cleanWorkspace = function() {
      this.workspace.clear();
    };

    this.generateCode = function(){
      return codeGenerator.generateCode(this.workspace);
    };

    var self = this;
    $scope.$on("projectLoaded", function(){
      self.loadProject();
    })

    this.init();
  }]);
});
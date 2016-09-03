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
        var blocksXml = Blockly.Xml.domToText(blocksDom);
        projectService.setBlocksXml(0, self.editionMode, blocksXml);
        self.code = self.generateCode();
        updateCodePreview(self.code);
      });

      this.hiddenSidebar = false;
      this.isCodeVisible = true;

      this.editionMode = 'template';

      this.reloadBlocks();

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

    this.loadBlocks = function(index, editionMode){
      this.code = "";
      this.workspace.clear();
      this.workspace.updateToolbox(toolbox);
      var blocksXml = projectService.getBlocksXml(index, editionMode);
      if(blocksXml){
        var blocksDom = Blockly.Xml.textToDom(blocksXml);
        Blockly.Xml.domToWorkspace(this.workspace, blocksDom);
      }

      this.workspace.fireChangeEvent();
    }

    this.reloadBlocks = function(){
      this.loadBlocks(0, this.editionMode);
    };

    this.cleanWorkspace = function() {
      this.workspace.clear();

      var editable;
      var xmlText;

      if(this.editionMode == "template"){
        editable = true
        xmlText = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"procedures_defreturn\"><field name=\"NAME\">foo</field></block></xml>';
      } else if(this.editionMode == "implementation"){
        editable = false
        xmlText = projectService.getBlocksXml(0, "template");
      }

      var dom = Blockly.Xml.textToDom(xmlText);
      var block = Blockly.Xml.domToBlock(this.workspace, dom.childNodes[0]);
      //block.setEditable(editable);
      block.setDeletable(false);
    };

    this.generateCode = function(){
      return codeGenerator.generateCode(this.workspace);
    };

    var self = this;
    $scope.$on("projectLoaded", function(){
      self.reloadBlocks();
    })

    this.init();
  }]);
});
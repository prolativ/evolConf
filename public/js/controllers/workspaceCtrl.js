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

    var self = this;

    function updateCodePreview(code){
      $("#generated-code")
        .empty()
        .append(code);
    }

    var onWorkspaceChange = function(){
      var blocksDom = Blockly.Xml.workspaceToDom(self.workspace);
      var blocksXml = Blockly.Xml.domToText(blocksDom);
      projectService.setBlocksXml(0, self.editionMode, blocksXml);
      self.code = self.generateCode();
      updateCodePreview(self.code);
    }

    this.init = function(){
      this.msg = msg;

      this.workspace = Blockly.inject('blockly-div', {
        toolbox: toolbox,
        media: 'lib/blockly/media/'
      });

      $('#blockly-div').trigger('resize');

      var self = this;

      this.workspace.addChangeListener(this.onWorkspaceChange);

      this.hiddenSidebar = false;
      this.isCodeVisible = true;

      this.editionMode = 'template';

      this.reloadBlocks();

      //resize after some time to initialize/position workspace
      function initWorkspacePosition(repetitions){
        if(repetitions > 0){
          Blockly.svgResize(self.workspace);
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
        Blockly.Xml.domToWorkspace(blocksDom, this.workspace);
      }

      onWorkspaceChange();
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
      var block = Blockly.Xml.domToBlock(dom.childNodes[0], this.workspace);
      block.setEditable(editable);
      block.setDeletable(false);
    };

    this.generateCode = function(){
      return codeGenerator.generateCode(this.workspace);
    };

    this.toggleCodeVisible = function() {
      this.isCodeVisible = !this.isCodeVisible;
      if (this.isCodeVisible) {
        $("#blockly-area").width("60%");
      } else {
        $("#blockly-area").width("97%");
      }
      Blockly.svgResize(self.workspace);
    };

    $scope.$on("projectLoaded", function(){
      self.reloadBlocks();
    })

    this.init();
  }]);
});
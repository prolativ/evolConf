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
      projectService.setBlocksXml(self.configName, self.workspace.editionMode, blocksXml);
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

      this.workspace.addChangeListener(onWorkspaceChange);

      this.workspace.editionMode = projectService.getProjectType();

      this.workspace.cleanWorkspace = function(){
        this.clear();
        onWorkspaceChange();
      };

      this.workspace.reloadFromTemplate = function(){
        this.clear();
        self.loadBlocks(self.configName, "template", true);
        onWorkspaceChange();
      }

      this.hiddenSidebar = false;
      this.isCodeVisible = false;

      this.configNames = projectService.getConfigNames();
      this.configName = this.configNames[0];

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

    var disableTopFunctionsEdition = function(){
      var blocks = self.workspace.getTopBlocks();
      for(var i=0; i<blocks.length; ++i){
        var block = blocks[i];
        if(block.type == "procedures_defreturn"){
          block.setEditable(false);
          block.setDeletable(false);
        }
      }
    };

    this.loadBlocks = function(configName, editionMode, setTopFunctionsUneditable){
      this.code = "";
      this.workspace.clear();
      this.workspace.updateToolbox(toolbox);
      var blocksXml = projectService.getBlocksXml(configName, editionMode);
      if(blocksXml){
        var blocksDom = Blockly.Xml.textToDom(blocksXml);
        Blockly.Xml.domToWorkspace(blocksDom, this.workspace);
        if(setTopFunctionsUneditable){
          disableTopFunctionsEdition();
        }
      }

      onWorkspaceChange();
    }

    this.reloadBlocks = function(implementingTemplate){
      this.loadBlocks(this.configName, this.workspace.editionMode, implementingTemplate);
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
      Blockly.svgResize(this.workspace);
    };

    this.removeConfig = function(configName){
      projectService.removeConfig(configName);
      this.configNames = projectService.getConfigNames();
      if(this.configNames.indexOf(this.configName) < 0){
        this.configName = this.configNames[0];
        this.reloadBlocks();
      }
    };

    this.selectConfig = function(configName){
      this.configName = configName;
      this.loadBlocks(configName, this.workspace.editionMode);
    };

    this.configsEditable = function(){
      return this.workspace.editionMode == 'template';
    };

    this.canDownloadConfigs = function(){
      return this.workspace.editionMode == 'implementation';
    };

    this.getConfigFileName = function(configName){
      return projectService.getConfigFileName(configName);
    };

    this.isConfigSelected = function(configName){
      return configName === this.configName;
    };

    this.isConfigSelectedAndEditable = function(configName){
      return configName === this.configName && this.workspace.editionMode == 'template';
    }

    this.isConfigFileNameVisible = function(configName){
      return this.isConfigSelectedAndEditable(configName);
    }

    $scope.$on("projectLoaded", function(event, action){
      self.workspace.editionMode = projectService.getProjectType();
      self.configNames = projectService.getConfigNames();
      self.configName = self.configNames[0];
      var implementingTemplate = action == "implementTemplate";
      self.reloadBlocks(implementingTemplate);
    });

    $scope.$on("configAdded", function(event, configName){
      self.configNames = projectService.getConfigNames();
      self.configName = configName;
      self.reloadBlocks();
    });

    $scope.$on("downloadConfigFiles", function(event, downloadingFun){
      for(var i=0; i<self.configNames.length; ++i){
        var workspace = new Blockly.Workspace();
        var configName = self.configNames[i];
        var configFileName = projectService.getConfigFileName(configName);
        var xml = projectService.getBlocksXml(configName, "implementation");
        var dom = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(dom, workspace);
        var code = Blockly.JavaScript.workspaceToCode(workspace)
        downloadingFun(configFileName, code);
      }
    });

    this.init();
  }]);
});

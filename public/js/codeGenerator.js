define(['blockly.javascript',
        './commons',
        './blocklyBlocks',
        './blocklyGenerators'], function(){

  var generator = {};

  generator.generateCode = function(workspace){

    /*var Copernicus = Blockly.Copernicus;

    //inject copernicus block
    var extendedWorkspace = new Blockly.Workspace();
    var copernicusBlock = Blockly.Block.obtain(extendedWorkspace, 'copernicus');
    copernicusBlock.childBlocks_ = workspace.getTopBlocks().slice();

    Copernicus.activeSensors = [];
    Copernicus.textInputEvent = undefined;
    Copernicus.isAlwaysTimerDefined = false;

    var encoding = "# -*- coding: utf-8 -*-\n";
    var blocksCode = Blockly.JavaScript.workspaceToCode(extendedWorkspace);
    var code = encoding + "\n" + blocksCode;

    Copernicus.activeSensors = [];*/

    var code = "test code";

    return code;
  };

  return generator;

});
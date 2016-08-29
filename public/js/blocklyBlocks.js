define(['angular',
        'app.msg',
        './commons',
        'blockly'], function(ng, msg){

  /*Blockly.Blocks['copernicus_timer_start'] = {
    init: function() {
      this.setColour(Copernicus.actionBlocksColour);
      this.appendDummyInput()
        .appendField(msg.actionBlockTitles["timerStart"]);
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(Copernicus.controllableTimersNames), 'TIMER_NAME');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
    },

    getVars: function() {
      return [this.getFieldValue('TIMER_NAME')];
    }
  };*/

Blockly.Blocks.maps = {};

Blockly.Blocks.maps.HUE = 260;

Blockly.Blocks['maps_create_empty'] = {
  init: function() {
    this.jsonInit({
      "message0": msg.mapBlocks.createEmpty,
      "output": "Map",
      "colour": Blockly.Blocks.maps.HUE,
    });
  }
};

Blockly.Blocks['maps_create_with'] = {
  init: function() {
    this.setColour(Blockly.Blocks.maps.HUE);
    this.itemCount_ = 1;
    this.updateShape_();
    this.setOutput(true, 'Map');
    this.setMutator(new Blockly.Mutator(['maps_create_with_entry']));
  },
  /**
   * Create XML to represent map inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the map inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        Blockly.Block.obtain(workspace, 'maps_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = Blockly.Block.obtain(workspace, 'maps_create_with_entry');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.itemCount_; i++) {
      if (connections[i]) {
        this.getInput('ADD' + i).connection.connect(connections[i]);
      }
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    // Delete everything.
    if (this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else {
      this.removeInput('NONEMPTY_HEADER');
      var i = 0;
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i);
        i++;
      }
    }
    // Rebuild block.
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendField(msg.mapBlocks.createEmpty);
    } else {
      this.appendDummyInput('NONEMPTY_HEADER').appendField(msg.mapBlocks.createWith);
      for (var i = 0; i < this.itemCount_; i++) {
        this.appendValueInput('ADD' + i)
          .appendField(msg.mapBlocks.key)
          .appendField(new Blockly.FieldTextInput(''), 'TEXT')
          .appendField(msg.mapBlocks.value);
      }
    }
  }
};

Blockly.Blocks['maps_create_with_container'] = {
  init: function() {
    this.setColour(Blockly.Blocks.maps.HUE);
    this.appendDummyInput()
        .appendField(msg.mapBlocks.createWithContainerTileAdd);
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  }
};

Blockly.Blocks['maps_create_with_entry'] = {
  init: function() {
    this.setColour(Blockly.Blocks.maps.HUE);
    this.appendDummyInput()
        .appendField(msg.mapBlocks.createWithEntryTile);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = false;
  }
};


Blockly.Blocks['maps_get'] = {
  init: function() {
    this.setColour(Blockly.Blocks.maps.HUE);
    this.setOutput(true);
    this.appendValueInput('MAP')
      .appendField(msg.mapBlocks.getValue)
      .appendField(new Blockly.FieldTextInput(''), 'KEY')
      .appendField(msg.mapBlocks.valueFrom);
  }
};

Blockly.Blocks['maps_update'] = ng.copy(Blockly.Blocks['maps_create_with']);
Blockly.Blocks['maps_update'].init = function() {
  Blockly.Blocks['maps_create_with'].init.apply(this, []);
  this.setOutput(false);
};
Blockly.Blocks['maps_update'].updateShape_ = function() {
  // Delete everything.
  this.removeInput('MAP');
  var i = 0;
  while (this.getInput('ADD' + i)) {
    this.removeInput('ADD' + i);
    i++;
  }
  // Rebuild block.
  this.appendValueInput('MAP').appendField(msg.mapBlocks.update);
  for (var i = 0; i < this.itemCount_; i++) {
    this.appendValueInput('ADD' + i)
      .appendField(msg.mapBlocks.key)
      .appendField(new Blockly.FieldTextInput(''), 'TEXT')
      .appendField(msg.mapBlocks.value);
  }
};


Blockly.Blocks['evolConf'] = {
  //Block automatically added to workspace to force code insertion - has no graphical representation
};

});

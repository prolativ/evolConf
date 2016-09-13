define(['app.msg',
        'blockly.base',
        'blockly.blocks',
        'blockly.msg'], function(msg){

  Blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
    if (this.workspace.options.readOnly || !this.contextMenu) {
      return;
    }
    // Save the current block in a variable for use in closures.
    var block = this;
    var menuOptions = [];

    if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
      // Option to duplicate this block.
      var duplicateOption = {
        text: Blockly.Msg.DUPLICATE_BLOCK,
        enabled: true,
        callback: function() {
          Blockly.duplicate_(block);
        }
      };
      if (this.getDescendants().length > this.workspace.remainingCapacity()) {
        duplicateOption.enabled = false;
      }
      menuOptions.push(duplicateOption);

      // Option to make block inline.
      if (!this.collapsed_) {
        for (var i = 1; i < this.inputList.length; i++) {
          if (this.inputList[i - 1].type != Blockly.NEXT_STATEMENT &&
              this.inputList[i].type != Blockly.NEXT_STATEMENT) {
            // Only display this option if there are two value or dummy inputs
            // next to each other.
            var inlineOption = {enabled: true};
            var isInline = this.getInputsInline();
            inlineOption.text = isInline ?
                Blockly.Msg.EXTERNAL_INPUTS : Blockly.Msg.INLINE_INPUTS;
            inlineOption.callback = function() {
              block.setInputsInline(!isInline);
            };
            menuOptions.push(inlineOption);
            break;
          }
        }
      }

      if (this.workspace.options.collapse) {
        // Option to collapse/expand block.
        if (this.collapsed_) {
          var expandOption = {enabled: true};
          expandOption.text = Blockly.Msg.EXPAND_BLOCK;
          expandOption.callback = function() {
            block.setCollapsed(false);
          };
          menuOptions.push(expandOption);
        } else {
          var collapseOption = {enabled: true};
          collapseOption.text = Blockly.Msg.COLLAPSE_BLOCK;
          collapseOption.callback = function() {
            block.setCollapsed(true);
          };
          menuOptions.push(collapseOption);
        }
      }

      if (this.workspace.options.disable) {
        // Option to disable/enable block.
        var disableOption = {
          text: this.disabled ?
              Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK,
          enabled: !this.getInheritedDisabled(),
          callback: function() {
            block.setDisabled(!block.disabled);
          }
        };
        menuOptions.push(disableOption);
      }

      // Option to delete this block.
      // Count the number of blocks that are nested in this block.
      var descendantCount = this.getDescendants().length;
      var nextBlock = this.getNextBlock();
      if (nextBlock) {
        // Blocks in the current stack would survive this block's deletion.
        descendantCount -= nextBlock.getDescendants().length;
      }
      var deleteOption = {
        text: descendantCount == 1 ? Blockly.Msg.DELETE_BLOCK :
            Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
        enabled: true,
        callback: function() {
          Blockly.Events.setGroup(true);
          block.dispose(true, true);
          Blockly.Events.setGroup(false);
        }
      };
      menuOptions.push(deleteOption);
    }

    if (!block.isInFlyout) {
      if (!this.collapsed_ && this.workspace.options.comments) {
        // Option to add/remove a comment.
        var commentOption = {enabled: !goog.userAgent.IE};
        if (this.comment) {
          commentOption.text = Blockly.Msg.REMOVE_COMMENT;
          commentOption.callback = function() {
            block.setCommentText(null);
          };
        } else {
          commentOption.text = Blockly.Msg.ADD_COMMENT;
          commentOption.callback = function() {
            block.setCommentText('');
          };
        }
        menuOptions.push(commentOption);
      }


      if (this.workspace.options.collapse) {
        // Option to collapse/expand block.
        if (this.collapsed_) {
          var expandOption = {enabled: true};
          expandOption.text = Blockly.Msg.EXPAND_BLOCK;
          expandOption.callback = function() {
            block.setCollapsed(false);
          };
          menuOptions.push(expandOption);
        } else {
          var collapseOption = {enabled: true};
          collapseOption.text = Blockly.Msg.COLLAPSE_BLOCK;
          collapseOption.callback = function() {
            block.setCollapsed(true);
          };
          menuOptions.push(collapseOption);
        }
      }
    }

    // Option to get help.
    var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
    var helpOption = {enabled: !!url};
    helpOption.text = Blockly.Msg.HELP;
    helpOption.callback = function() {
      block.showHelp_();
    };
    menuOptions.push(helpOption);

    // Allow the block to add or modify menuOptions.
    if (this.customContextMenu && !block.isInFlyout) {
      this.customContextMenu(menuOptions);
    }

    Blockly.ContextMenu.show(e, menuOptions, this.RTL);
    Blockly.ContextMenu.currentBlock = this;
  };


  /////////////////////////////////////////////////////////////////////////////////////////////////////////


  Blockly.WorkspaceSvg.prototype.showContextMenu_ = function(e) {
    if (this.options.readOnly || this.isFlyout) {
      return;
    }
    var menuOptions = [];
    var topBlocks = this.getTopBlocks(true);
    var eventGroup = Blockly.genUid();

    // Options to undo/redo previous action.
    var undoOption = {};
    undoOption.text = Blockly.Msg.UNDO;
    undoOption.enabled = this.undoStack_.length > 0;
    undoOption.callback = this.undo.bind(this, false);
    menuOptions.push(undoOption);
    var redoOption = {};
    redoOption.text = Blockly.Msg.REDO;
    redoOption.enabled = this.redoStack_.length > 0;
    redoOption.callback = this.undo.bind(this, true);
    menuOptions.push(redoOption);

    // Option to clean up blocks.
    if (this.scrollbar) {
      var cleanOption = {};
      cleanOption.text = Blockly.Msg.CLEAN_UP;
      cleanOption.enabled = topBlocks.length > 1;
      cleanOption.callback = this.cleanUp.bind(this);
      menuOptions.push(cleanOption);
    }

    // Add a little animation to collapsing and expanding.
    var DELAY = 10;
    if (this.options.collapse) {
      var hasCollapsedBlocks = false;
      var hasExpandedBlocks = false;
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i];
        while (block) {
          if (block.isCollapsed()) {
            hasCollapsedBlocks = true;
          } else {
            hasExpandedBlocks = true;
          }
          block = block.getNextBlock();
        }
      }

      /**
       * Option to collapse or expand top blocks.
       * @param {boolean} shouldCollapse Whether a block should collapse.
       * @private
       */
      var toggleOption = function(shouldCollapse) {
        var ms = 0;
        for (var i = 0; i < topBlocks.length; i++) {
          var block = topBlocks[i];
          while (block) {
            setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms);
            block = block.getNextBlock();
            ms += DELAY;
          }
        }
      };

      // Option to collapse top blocks.
      var collapseOption = {enabled: hasExpandedBlocks};
      collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
      collapseOption.callback = function() {
        toggleOption(true);
      };
      menuOptions.push(collapseOption);

      // Option to expand top blocks.
      var expandOption = {enabled: hasCollapsedBlocks};
      expandOption.text = Blockly.Msg.EXPAND_ALL;
      expandOption.callback = function() {
        toggleOption(false);
      };
      menuOptions.push(expandOption);
    }

    // Option to delete all blocks.
    // Count the number of blocks that are deletable.
    var deleteList = [];
    function addDeletableBlocks(block) {
      if (block.isDeletable()) {
        deleteList = deleteList.concat(block.getDescendants());
      } else {
        var children = block.getChildren();
        for (var i = 0; i < children.length; i++) {
          addDeletableBlocks(children[i]);
        }
      }
    }
    for (var i = 0; i < topBlocks.length; i++) {
      addDeletableBlocks(topBlocks[i]);
    }

    function deleteNext() {
      Blockly.Events.setGroup(eventGroup);
      var block = deleteList.shift();
      if (block) {
        if (block.workspace) {
          block.dispose(false, true);
          setTimeout(deleteNext, DELAY);
        } else {
          deleteNext();
        }
      }
      Blockly.Events.setGroup(false);
    }

    var workspace = this;

    if(this.editionMode == 'implementation'){
      var reloadOption = {
        text: msg.blocks.fromTemplate,
        enabled: true,
        callback: function() {
          workspace.reloadFromTemplate();
        }
      };
      menuOptions.push(reloadOption);
    } else {
      var deleteOption = {
        text: deleteList.length == 1 ? Blockly.Msg.DELETE_BLOCK :
            Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(deleteList.length)),
        enabled: deleteList.length > 0,
        callback: function() {
          workspace.cleanWorkspace();
        }
      };
      menuOptions.push(deleteOption);
    }

    Blockly.ContextMenu.show(e, menuOptions, this.RTL);
  };


  /////////////////////////////////////////////////////////////////////////////////////////////////////////


  Blockly.Comment.prototype.setVisible = function(visible) {
    if (visible == this.isVisible()) {
      // No change.
      return;
    }
    Blockly.Events.fire(
        new Blockly.Events.Ui(this.block_, 'commentOpen', !visible, visible));
    if (goog.userAgent.IE) {
      // Steal the code from warnings to make an uneditable text bubble.
      // MSIE does not support foreignobject; textareas are impossible.
      // http://msdn.microsoft.com/en-us/library/hh834675%28v=vs.85%29.aspx
      // Always treat comments in IE as uneditable.
      Blockly.Warning.prototype.setVisible.call(this, visible);
      return;
    }
    // Save the bubble stats before the visibility switch.
    var text = this.getText();
    var size = this.getBubbleSize();
    if (visible) {
      // Create the bubble.
      this.bubble_ = new Blockly.Bubble(
          /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
          this.createEditor_(), this.block_.svgPath_,
          this.iconXY_, this.width_, this.height_);
      this.bubble_.registerResizeEvent(this.resizeBubble_.bind(this));
      this.updateColour();
    } else {
      // Dispose of the bubble.
      this.bubble_.dispose();
      this.bubble_ = null;
      this.textarea_ = null;
      this.foreignObject_ = null;
    }
    // Restore the bubble stats after the visibility switch.
    this.setText(text);
    this.setBubbleSize(size.width, size.height);
  };

  return Blockly;

});
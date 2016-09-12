define(['./commons',
        'blockly.javascript'], function(){

  Blockly.JavaScript['maps_create_empty'] = function(block) {
    return ['{}', Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.JavaScript['maps_create_with'] = function(block) {
    var code = new Array(block.entry_count);
    for (var n = 0; n < block.entry_count; n++) {
      var key = Blockly.JavaScript.quote_(block.getFieldValue('KEY' + n));
      var value = Blockly.JavaScript.valueToCode(
        block, 'VALUE' + n, Blockly.JavaScript.ORDER_COMMA
        ) || 'null';
      code[n] = key + ': ' + value;
    }
    code = '{' + code.join(', ') + '}';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.JavaScript['maps_get'] = function(block) {
    var map = Blockly.JavaScript.valueToCode(
      block, 'MAP', Blockly.JavaScript.ORDER_MEMBER
      ) || '{}';
    var key = Blockly.JavaScript.quote_(block.getFieldValue('KEY'));
    var code = map + '[' + key + ']';
    return [code, Blockly.JavaScript.ORDER_MEMBER];
  }

  Blockly.JavaScript['maps_update'] = function(block) {
    var map = Blockly.JavaScript.valueToCode(
      block, 'MAP', Blockly.JavaScript.ORDER_ATOMIC
      ) || '{}';
    var code = new Array(block.entry_count);
    for (var n = 0; n < block.entry_count; n++) {
      var key = Blockly.JavaScript.quote_(block.getFieldValue('KEY' + n));
      var value = Blockly.JavaScript.valueToCode(
        block, 'VALUE' + n, Blockly.JavaScript.ORDER_ASSIGNMENT
        ) || 'null';
      code[n] = map + '[' + key + '] = ' + value + ';\n';
    }
    code = code.join('');
    return code;
  }

});

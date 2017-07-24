#strict on
#target indesign

// Tests for ESPM

/*------------------------------------------
    S E T U P
------------------------------------------*/
#include 'presetManager.js'

// Template presets
var Template = { name  : "New Preset",
                 bool  : null,
                 arr   : null,
                 obj   : { x : 0, y : 0 },
                 num   : null };

var testPreset01 = { name  : "Test 01",
                     bool  : true,
                     arr   : [1,2,3,4],
                     obj   : { x : 1, y : 2 },
                     num   : 1.11 };
var testPreset02 = { name  : "Test 02",
                     bool  : false,
                     arr   : [5,6,7,8],
                     obj   : { x : 10, y : 20 },
                     num   : 11.1 };
var testPreset03 = { name  : "Test 03",
                     bool  : true,
                     arr   : [9,10,11,12],
                     obj   : { x : 100, y : 200 },
                     num   : 111 };

var standardPresets = [testPreset01,testPreset02,testPreset03];

// Load a new instance of Pm
var Pm = new presetManager("ESPM_Presets_Test", standardPresets, Template);
Pm.Presets.removeFromDisk(); // Force clean

/*------------------------------------------
    T E S T S
------------------------------------------*/

var tests = {

  /*

    T E S T   P R E S E T S
    -----------------------

  */

  test_presets_get: function() {
    var myPresets = Pm.Presets.get();
    assert("Three presets expected", myPresets.length == 3);
    assert("Second preset name does not match", myPresets[1].name == "Test 02");
  },

  test_presets_get_by_Key: function() {
    // Test multiple keys here
    var aPreset = Pm.Presets.getByKey('name','Test 02');
    assert("received wrong preset", aPreset.name == 'Test 02');
  },

  test_presets_get_by_Index: function() {
    var aPreset = Pm.Presets.getByIndex( 1 );
    assert("Received wrong preset with positive index", aPreset.name == "Test 02");
    var aPreset = Pm.Presets.getByIndex( -2 );
    assert("Received wrong preset with negative index", aPreset.name == "Test 02");
  },

  test_presets_get_property_list: function() {
    var props = Pm.Presets.getPropList("name");
    assert("Received wrong preset with negative index", sameArrayPositions( props, ['Test 01','Test 02','Test 03'] ) );
  },

  test_presets_overwriteIndex_and_reset: function() {
    var testPreset = { name  : "Test 04"};
    Pm.Presets.overwriteIndex(0,testPreset);
    assert("Did not overwrite the preset", Pm.Presets.getByIndex( 0 ).name == "Test 04");
    
    testPreset = { name  : "Test 05"};
    Pm.Presets.overwriteIndex(-2,testPreset);
    assert("Did not overwrite the preset", Pm.Presets.getByIndex( -2 ).name == "Test 05");

    Pm.Presets.reset();
    assert("Did not reset", Pm.Presets.getByIndex( 0 ).name == "Test 01");
  },

  test_presets_load: function() {
    var testPresets = [{ name  : "Load 01"},{ name  : "Load 02"},{ name  : "Load 03"}];
    Pm.Presets.load(testPresets);
    assert("Did not overwrite presets", Pm.Presets.getByIndex( 1 ).name == "Load 02");
  },

  test_presets_add: function() {
    var testPreset04 = { name  : "[ Test 04 ]",
                         bool  : false,
                         arr   : [8,9,10,11],
                         obj   : { x : 1, y : 2 },
                         num   : 1 };
    var newPresets;

    Pm.Presets.add(testPreset04);
    newPresets = Pm.Presets.get();
    assert("Received wrong preset 1", newPresets[newPresets.length-1].name == "[ Test 04 ]");
    
    Pm.Presets.add(testPreset04, {position: 1});
    newPresets = Pm.Presets.get();
    assert("Received wrong preset 2", newPresets[1].name == "[ Test 04 ]");
    
    Pm.Presets.add(testPreset04, {position: -2});
    newPresets = Pm.Presets.get();
    assert("Received wrong preset 3", newPresets[newPresets.length-2].name == "[ Test 04 ]");

    Pm.Presets.add(testPreset04, {position: -1});
    newPresets = Pm.Presets.get();
    assert("Received wrong preset 4", newPresets[newPresets.length-1].name == "[ Test 04 ]");

  },

  test_presets_add_unique: function() {
    var notSoUniquePreset = { name  : "Test 01",
                              bool  : false,
                              arr   : [8,9,10,11],
                              obj   : { x : 1, y : 2 },
                              num   : 1 };

    Pm.Presets.load([testPreset01,testPreset01,testPreset02,testPreset02,testPreset03]);
    Pm.Presets.addUnique(notSoUniquePreset, 'name', {silently: true, position:3});
    assert("Did not remove double preset", Pm.Presets.get().length == 4);
    assert("Not in right position", Pm.Presets.getByIndex(3).name == "Test 01");
  },

  test_presets_remove: function() {
    Pm.Presets.remove(0);
    assert("Could not remove preset", Pm.Presets.getByIndex(0).name == "Test 02");
  },

  test_presets_remove_where: function() {
    Pm.Presets.removeWhere('bool', false);
    assert("Could not remove preset", Pm.Presets.get().length == 2);
    assert("Removed wrong preset", Pm.Presets.getByIndex(0).bool == true);
    assert("Removed wrong preset", Pm.Presets.getByIndex(1).bool == true);
  },

  test_presets_load_save_to_disk: function() {
    var presetsFile = File( Pm.getPresetsFilePath() );
    if(presetsFile.exists) {
      presetsFile.remove();
    }

    assert("Did not remove from disk", presetsFile.exists == false);

    Pm = new presetManager("ESPM_Presets_Test_2", [testPreset01,testPreset01,testPreset01,testPreset01,testPreset01,testPreset01], Template);
    var presetsFile = File( Pm.getPresetsFilePath() );
    assert("File does not exist", presetsFile.exists);

    assert("Did not disk", Pm.Presets.get().length == 6);

    if(presetsFile.exists) {
      presetsFile.remove();
    }

    reset_testEnv( standardPresets, Template );
    assert("Did not disk", Pm.Presets.get().length == 3);
  },

  /*

    T E S T  T E M P  P R E S E T
    ------------------------------
    
  */
  test_dont_save_temp_presets_to_disk: function() {
    var tempPreset = { name  : "TEMP",
                       bool  : false,
                       arr   : [8,9,10,11],
                       obj   : { x : 1, y : 2 },
                       num   : 1 };

    Pm.Presets.load([testPreset01,testPreset01,testPreset02,testPreset02,testPreset03]);

    Pm.Presets.add(tempPreset, {temporary: true});

    assert("Did not added temp preset", Pm.Presets.get().length == 6);
    Pm.Presets.saveToDisk();
    Pm.Presets.loadFromDisk();
    assert("Saved temp preset to disk", Pm.Presets.get().length == 5);
  },

  /*

    T E S T   ( U I ) P R E S E T
    ------------------------------
    
  */

  test_UiPreset_save: function() {
    Pm.UiPreset.save( Pm.Presets.getByIndex(0) );
    assert("Did not save preset in UiPreset", Pm.UiPreset.get().name == Pm.Presets.getByIndex(-1).name);
  },

  test_UiPreset_reset: function() {
    // We need to set a few things here so we can do some spot checks
    Pm.UiPreset.setProp('name',"New Name");
    assert("UiPreset.setProp failed", Pm.UiPreset.get().name == "New Name");
    var ok = Pm.reset();
    assert("Something went wrong resetting Pm", Pm.UiPreset.get().name == "New Preset");
  },

  test_UiPreset_loadIndex: function() {
    Pm.UiPreset.loadIndex( 1 );
    assert("Did not load right preset unto UiPreset", Pm.UiPreset.get().name == Pm.Presets.getByIndex(1).name );
  },

  test_UiPreset_load: function() {
    var aPreset = Pm.Presets.getByIndex( 2 );
    Pm.UiPreset.load(aPreset);
    assert("Did not load right preset unto UiPreset", Pm.UiPreset.get().name == Pm.Presets.getByIndex(2).name );
  },

  test_update_prop: function() {
    var testPresetProp = { name     : "[ Test New Prop ]",
                           bool     : false,
                           newProp  : "Things change...",
                           arra     : [4,5,6,7],
                           obje     : { x : 10, y : 20 },
                           vnumm     : 10 };

    reset_testEnv( standardPresets, testPresetProp );
    var UiPreset = Pm.UiPreset.get();
    assert("Can't get UiPreset", UiPreset.name == "[ Test New Prop ]");

    var aPreset = Pm.Presets.getByKey('name','Test 02');
    assert("Presets properties did not updated", aPreset.newProp == "Things change...");

  },

  test_UiPreset_Get: function() {
    var UiPreset = Pm.UiPreset.get();
    assert("Can't get UiPreset", UiPreset.name == "New Preset");
  },

  // Tests for UiPreset
  test_Set_Get_Reset_Prop_UiPreset: function() {
    var num;
    num = Pm.UiPreset.getProp('num');
    assert("Did not get correct property value A", num === null);
    Pm.UiPreset.setProp('num', 2);
    num = Pm.UiPreset.getProp('num');
    assert("Did not get correct property value B", num === 2);
    Pm.UiPreset.reset();
    num = Pm.UiPreset.getProp('num');
    assert("Did not get correct property value C", num === null);
  },

}

/*------------------------------------------
    E N D  -  T E S T S
------------------------------------------*/

/*------------------------------------------
    H E L P E R S
------------------------------------------*/

function reset_testEnv( standardPresets, Template ) {
  Pm = new presetManager("ESPM_Presets_Test", standardPresets, Template);
  Pm.reset();
}

function log(text) {
  $.writeln(text);
}

function sameArrayPositions( arr1, arr2 ) {
  var arr1len = arr1.length-1;
  var arr2len = arr2.length-1;
  if(arr1len != arr2len) return false;

  for(var i = 0; i < arr1len; i++) {
        if(arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function assert(msg, success) {
  if (!success) {
    throw msg;
  }
}

function clearConsole(){
  var bt = new BridgeTalk();
  bt.target = 'estoolkit';
  bt.body = function(){
    app.clc();
  }.toSource()+"()";
  bt.send(5);
}

function runTests(){
  try{
    clearConsole();  
  } catch ( err ) {
    // Likely to be run in different environment
    log("Could not clear the ExtendScript Toolkit console.");
  }

  var result = "Pass";
  for (var test in tests) {
    try {
        reset_testEnv( standardPresets, Template );
        tests[test]();
        log('.');
    } catch (e) {
        result = "Fail";
        log(test + " failed: " + e.description);
        log("(Line " + e.line + " in file " + e.fileName + ")");
    }
  }
  return result;
}

alert( runTests() );

//EOF

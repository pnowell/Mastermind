var screenWidth = 320;
var screenHeight = 450;
var dividerY = 285;
var maxRowY = dividerY;
var numRows = 10;
var rowHeightLarge = 60;
var rowHeightSmall = 0;
var elementPrefix = ["hint", "slot"];
var rowInfo = {};
rowInfo.hint = [];
rowInfo.slot = [];
var currentRow = 0;
var pegEmpty = "assets/peg_empty.png";
var pegRed = "assets/peg_red.png";
var pegBlue = "assets/peg_blue.png";
var pegGreen = "assets/peg_green.png";
var pegYellow = "assets/peg_yellow.png";
var pegWhite = "assets/peg_white.png";
var pegBlack = "assets/peg_black.png";
var currentColor = pegEmpty;
var okButtonBackground = "#eab208";
var okButtonGreyBackground = "#e2e2e2";
var okButtonGreyedOut = true;

setup();

resetBoard();

function setup() {
  var rowIndex;
  createCanvas("background");
  line(0, dividerY, screenWidth, dividerY);

  rememberRowLayout();

  // Create all the other rows
  for(rowIndex = 1; rowIndex < numRows; rowIndex++) {
    createRow(rowIndex);
  }
  
  // Set the event listener for the OK button.
  onEvent("ok", "click", function( ) {
    if (okButtonGreyedOut) {
      return;
    }
    setRow(currentRow + 1);
    greyOutOkButton(true);
  });
  
  // Set the event listeners for all the color buttons.
  onEvent("white", "click", function () { currentColor = pegWhite; });
  onEvent("black", "click", function () { currentColor = pegBlack; });
  onEvent("red", "click", function () { currentColor = pegRed; });
  onEvent("blue", "click", function () { currentColor = pegBlue; });
  onEvent("green", "click", function () { currentColor = pegGreen; });
  onEvent("yellow", "click", function () { currentColor = pegYellow; });
  
  
  // Set the event listener for all the slots.
  for(rowIndex = 0; rowIndex < numRows; rowIndex++) {
    for(var slotIndex = 0; slotIndex < 4; slotIndex++) {
      onEvent(slotId(slotIndex, rowIndex),
              "click",
              createSlotClickCallback(slotIndex, rowIndex));
    }
  }
  
  console.log("setup complete");
}

function createSlotClickCallback(slotIndex, rowIndex) {
  return function () {
    slotClick(slotIndex, rowIndex);
  };
}

function slotClick(clickedSlot, clickedRow) {
  // If this row isn't the selected row, don't do anything.
  if (clickedRow != currentRow) {
    return;
  }
  
  // Set this slot to the currently selected color.
  setImageURL(slotId(clickedSlot, clickedRow), currentColor);
  currentColor = pegEmpty;
  
  // Check to see if all the slots in this row are filled in.
  var filledIn = true;
  for (var slotIndex = 0; slotIndex < 4; slotIndex++) {
    if (getImageURL(slotId(slotIndex, currentRow)) == pegEmpty) {
      filledIn = false;
      break;
    }
  }
  greyOutOkButton(!filledIn);
}

function rememberRowLayout() {
  var minY = screenHeight;
  var i,j,prefix,id,bottom;
  maxRowY = 0;
  for (i = 0; i < 4; i++) {
    for (j = 0; j < elementPrefix.length; j++) {
      prefix = elementPrefix[j];
      id = pegId(prefix, i, 0);
      var info = {};
      info.x = getXPosition(id); 
      info.y = getYPosition(id);
      info.width = getProperty(id, "width");
      info.height = getProperty(id, "height");
      rowInfo[prefix][i] = info;
      
      if (info.y < minY) {
        minY = info.y;
      }
      bottom = info.y + info.height;
      if (bottom > maxRowY) {
        maxRowY = bottom;
      }
    }
  }
  for (i = 0; i < 4; i++) {
    for (j = 0; j < elementPrefix.length; j++) {
      prefix = elementPrefix[j];
      id = pegId(prefix, i, 0);
      rowInfo[prefix][i].y -= minY;
    }
  }
  // Update the y extents to be correct
  rowHeightLarge = maxRowY - minY;
  rowHeightSmall = (maxRowY - rowHeightLarge) / (numRows - 1);
}

function resetBoard() {
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < elementPrefix.length; j++) {
        setImageURL(pegId(elementPrefix[j], i, rowIndex), pegEmpty);
      }
    }
  }
  setRow(0);
  greyOutOkButton(true);
}

function greyOutOkButton(value) {
  if (value) {
    setProperty("ok", "background-color", okButtonGreyBackground);
  } else {
    setProperty("ok", "background-color", okButtonBackground);
  }
  okButtonGreyedOut = value;
}

function setRow(index) {
  currentRow = index;
  var y = maxRowY;
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    if (rowIndex == currentRow) {
      y -= rowHeightLarge;
      setRowPositionAndSize(rowIndex, y, rowHeightLarge);
    } else {
      y -= rowHeightSmall;
      setRowPositionAndSize(rowIndex, y, rowHeightSmall);
    }
  }
}

function setRowPositionAndSize(rowIndex, y, rowHeight) {
  var scale = rowHeight / rowHeightLarge;
  var x = screenWidth / 2 * (1 - scale);
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < elementPrefix.length; j++) {
      var prefix = elementPrefix[j];
      var info = rowInfo[prefix][i];
      var id = pegId(prefix, i, rowIndex);
      setPosition(
        id,
        x + info.x * scale,
        y + info.y * scale,
        info.width * scale,
        info.height * scale);
    }
  }
}

function createRow(rowIndex) {
  for(var i = 0; i < 4; i++) {
    for (var j = 0; j < elementPrefix.length; j++) {
      var prefix = elementPrefix[j];
      var originalId = pegId(prefix, i, 0);
      var id = pegId(prefix, i, rowIndex);
      copyPeg(originalId, id);
    }
  }
}

function hintId(index, rowIndex) {
  return pegId("hint", index, rowIndex);
}

function slotId(index, rowIndex) {
  return pegId("slot", index, rowIndex);
}

function pegId(prefix, index, rowIndex) {
  return prefix + index + "_row" + rowIndex;
}

function copyPeg(pegId, newId) {
  var properties = [
    "border-width",
    "border-color",
    "border-radius",
  ];
  image(newId, getImageURL(pegId));
  setPosition(
    newId,
    getXPosition(pegId), getYPosition(pegId),
    getProperty(pegId, "width"), getProperty(pegId, "height"));
  for (var i = 0; i < properties.length; i++) {
    var property = properties[i];
    var value = getProperty(pegId, property);
    setProperty(newId, property, value);
  }
}

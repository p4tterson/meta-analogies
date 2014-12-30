var currentExample = 0;

var selectedRock = null;
var correct = false;

function setCorrect() {
	correct = true;
}

function setIncorrect() {
	correct = false;
}

var showCorrect = function(zoneID) {
	d3.select(zoneID)
	  .attr('stroke', correctColor);
}

var showIncorrect = function(zoneID) {
	d3.select(zoneID)
	  .attr('stroke', incorrectColor);
}

var showNeutral = function(zoneID) {
	d3.select(zoneID)
		.attr('stroke', 'rgb(112,112,112)');
}

function setupBoard() {
	var svg = d3.select('body').append('svg')
		.attr('id', 'board')
		.attr('width', boardWidth)
		.attr('height', boardHeight)
		.classed('noselect', true);
		//.style({ display:'block', margin:'auto', padding:'0' });

	svg.append('rect')
	   .style('fill', boardColor)
	   .attr({width: '100%', height: '100%', 'stroke-width':'3', stroke:'rgb(0, 0, 0)'})
	   .classed('noselect', true);

	return svg;
}

function setupControlRockZone() {
	d3.select('#board').append('rect')
		 .attr('id', 'controlZone')
	   .style('fill', rockZoneColor)
	   .attr({width: rockZoneWidth, height: rockZoneHeight, 'stroke-width': '6', stroke: correctColor})
	   .attr({x: controlRockZoneX, y: controlRockZoneY})
	   .classed('noselect', true);
}

function setupUserRockZone() {
	d3.select('#board').append('rect')
		 .attr('id', 'userZone')
	   .style('fill', rockZoneColor)
	   .attr({width: rockZoneWidth, height: rockZoneHeight, 'stroke-width': '6', stroke: incorrectColor})
	   .attr({x: userRockZoneX, y: userRockZoneY})
	   .classed('noselect', true);
}

function setupRefreshButton() {
	var board = d3.select('#board');
	var button = board.append('g')
				.attr('id', 'refreshButton');
	button.append('ellipse')
		.attr('id', 'refreshButtonRect')
		.style({fill: activatedButtonColor})
		.attr({cx: refreshButtonCX, cy: refreshButtonCY, rx: buttonWidth, ry: buttonHeight});
	button.append('text')
		.style({fill: 'rgb(240,240,240)', stroke: 'none', 'font-family': 'sans-serif', 'font-style':'bold', 'font-size': 32})
		.attr({x: refreshButtonCX-buttonWidth*2/8, y: refreshButtonCY+buttonHeight/5})
		.text("Refresh");
}

function clickRefresh() {
	collectPhaseOneData('refresh')
	collection.clearCollection();
	collection.extendCollection(rockSetupData);
	collection.extendCollection(stimuli.data[currentExample]);
	collection.extendCollection(benchRockData);
	setupRocks();
	displayUserFeedback();
}

function setupRefreshButtonListener() {
	var button = d3.select('#refreshButton');
	button.on('click', clickRefresh);
}

function setupNextButton() {
	var board = d3.select('#board');
	var button = board.append('g')
				.attr('id', 'nextButton');
  button.append('ellipse')
		.attr('id', 'nextButtonRect')
		.style({fill: buttonPushedColor})
		.attr({cx: nextButtonCX, cy: nextButtonCY, rx: buttonWidth, ry: buttonHeight});
	button.append('text')
		.style({fill: 'black', stroke: 'none', 'font-family': 'sans-serif', 'font-style': 'bold', 'font-size': 32})
		.attr({x: nextButtonCX-buttonWidth*3/7, y: nextButtonCY+buttonHeight/5})
		//.attr({x: nextButtonX+10, y: nextButtonY+15})
		.text("Next example");
}

function clickNext() {
	if (correct && currentExample<stimuli.data.length-1) {
		collectPhaseOneData('next');
		collection.clearCollection();
		currentExample++;
		collection.extendCollection(rockSetupData);
		collection.extendCollection(stimuli.data[currentExample]);
		collection.extendCollection(benchRockData);
		setupRocks();
		displayUserFeedback();
		collectPhaseOneData('start');
		// setIncorrect();
	} else if (correct) {
		collectPhaseOneData('next');
		collection.clearCollection();
		teardownPhaseOne();
		initializePhaseTwo();
	}
}

function setupNextButtonListener() {
	var button = d3.select('#nextButton');
	button.on('click', clickNext);
}

var activateNextButton = function() {
	d3.select('#nextButtonRect').style({fill: activatedButtonColor});
}

var deactivateNextButton = function() {
	d3.select('#nextButtonRect').style("fill", buttonPushedColor);
}

function setupRockDrag() {
	var rockDrag = d3.behavior.drag()
	    	.origin(function(d) { return d; })
	    	.on('dragstart', rockDragstart)
	    	.on('drag', rockDragmove)
	    	.on('dragend', rockDragend);
	return rockDrag;
}

function setupResizeDrag() {
	var resizeDrag = d3.behavior.drag()
				.origin(function(d) { return d; })
				.on('dragstart', resizeDragstart)
				.on('drag', resizeDragmove)
				.on('dragend', resizeDragend);
	return resizeDrag;
}

var rockDrag = setupRockDrag();
var resizeDrag = setupResizeDrag();

function createRockGroupSelection(rock) {
	var board = d3.select('#board');
	var d = rock.getData();
	var rockGroup = board.append('g')
										.datum(d)
										.attr('id', rock.getID()+'group');
	return rockGroup;
}

function createRockSelection(rock, group) {
	var r = group.append('rect')
						.attr('id', rock.getID())
						.attr('x', function(d) { return d.x })
						.attr('y', function(d) { return d.y })
						.attr('width', function(d) { return d.w })
						.attr('height', function(d) { return d.h })
						.style('fill', function(d) { return rockColors[d.c] })
		    		.attr({'stroke-width': 3, 'stroke': 'black', 'opacity': 1})
		    		.style('fill-opacity', 0.75)
		    		.call(rockDrag);
  return r;
}

function createHandleSelection(rock, group) {
	var h = group.append('rect')
						.attr('id', rock.getID()+'handle')
						.attr('x', function(d) { return d.x+d.w*4/5 })
						.attr('y', function(d) { return d.y+d.h*4/5 })
						.attr('width', function(d) { return d.w*1/5 })
						.attr('height', function(d) { return d.h*1/5 })
						.style('fill', function(d) { return rockColors[d.c] })
						.style('fill-opacity', 0)
						.attr('cursor', 'nwse-resize')
    				.call(resizeDrag);
  return h;
}

function setupRocks() {
	var rocks = collection.getRocks();
	for (var i=0; i<rocks.length; i++) {
		var rock = rocks[i];
		var groupSelection = createRockGroupSelection(rock);
		var rockSelection = createRockSelection(rock, groupSelection);
		var handleSelection = createHandleSelection(rock, groupSelection);
		rock.setGroupSelection(groupSelection);
		rock.setRockSelection(rockSelection);
		rock.setHandleSelection(handleSelection);
		groupSelection.on('dblclick', dblclickRock)
	}
	displayUserFeedback();
}

var dblclickRock = function() {
	var rock = collection.getRockByElement(this);
	changeRockColor(rock);
	displayUserFeedback();
	// double-clicks end up recording two drag events, which are meaningless data.  here we remove those.
	game.record.push();
	game.record.push();
	collectPhaseOneData('color');
}

function changeRockColor(rock) {
	rock.color = (rock.color+1)%3;
	rock.getRockSelection().style('fill', rockColors[rock.color]);
	rock.getHandleSelection().style('fill', rockColors[rock.color]);
}

var draggedRock = null;
var firstUpdate = true;

function rockDragstart(d) {
	var rock_sel = d3.select(this);
	draggedRock = collection.getRockBySelection(rock_sel);
  firstUpdate = true;
}

function rockDragmove(d) {
	if (firstUpdate) {
		showNeutral('#controlZone');
  	showNeutral('#userZone');
  	firstUpdate = false;
  	d.c = draggedRock.color;
	}
	d.x = d3.event.x;
	d.y = d3.event.y;
	draggedRock.getRockSelection()
		.attr('x', function(d) { return d.x })
		.attr('y', function(d) { return d.y });
	draggedRock.getHandleSelection()
		.attr('x', function(d) { return d.x+d.w*4/5 })
		.attr('y', function(d) { return d.y+d.h*4/5 });
}

function rockDragend(d) {
	draggedRock.setXY(d.x, d.y);
	displayUserFeedback();
	collectPhaseOneData('drag');
}

var resizeBox = {};

function resizeDragstart(d) {
	var handle_sel = d3.select(this);
	var rock = collection.getRockBySelection(handle_sel);
	resizeBox.rock = rock;
	resizeBox.box = appendResizeBox(rock);
	resizeBox.handle = handle_sel;
	resizeBox.handleCoor = [d.x+d.w*4/5, d.y+d.h*4/5];
	resizeBox.otherSizes = getOtherSizes(rock.type);
	resizeBox.offset = 0;
}

function resizeDragmove(d) {
	var diffX = d3.event.x - d.x
	   ,diffY = d3.event.y - d.y;
	var diff = diffX > diffY ? diffX : diffY;
	resizeBox.offset = diff;
	resizeBox.handle
		.attr('x', resizeBox.handleCoor[0]+resizeBox.offset)
		.attr('y', resizeBox.handleCoor[1]+resizeBox.offset);
	resizeBox.box
		.attr('width', resizeBox.width+resizeBox.offset)
		.attr('height', resizeBox.height+resizeBox.offset);
	if (!resizeBox.previewBox1) {
		appendPreviewBoxes(resizeBox.rock);
	}
	var newSize;
	if (newSize = resizeBoxInRangeOfOtherSize()) {
		resizeBox.rock.type = newSize.type;
		resizeBox.rock.updateSize();
		d.w = resizeBox.rock.width;
		d.h = resizeBox.rock.height;
		resizeBox.rock.getRockSelection()
			.attr('width', function(d) { return d.w })
			.attr('height', function(d) { return d.h });
		displayUserFeedback();
		collectPhaseOneData('resize');
		clearPreviewBoxes();
		resizeBox.otherSizes = getOtherSizes(resizeBox.rock.type);
		appendPreviewBoxes(resizeBox.rock);
		resizeBox.offset = 0;
	}
}

function resizeDragend(d) {
	clearPreviewBoxes();
	resizeBox.box.remove();
	var newStats = resizeBox.rock.getData();
	d.w = newStats.w;
	d.h = newStats.h;
	resizeBox.rock.getHandleSelection()
		.attr('x', function(d) { return d.x+d.w*4/5 })
		.attr('y', function(d) { return d.y+d.h*4/5 })
		.attr('width', function(d) { return d.w*1/5 })
		.attr('height', function(d) { return d.h*1/5 });
	delete resizeBox.rock;
	delete resizeBox.box;
	delete resizeBox.handle;
	delete resizeBox.handleCoor;
	delete resizeBox.otherSizes;
	delete resizeBox.offset;
	delete resizeBox.width;
	delete resizeBox.height;
}

function appendResizeBox(rock) {
	resizeBox.width = rock.width;
	resizeBox.height = rock.height;
	var box = d3.select('#board').append('rect')
		.attr('id', 'resizeBox')
		.attr('x', rock.x)
		.attr('y', rock.y)
		.attr('width', rock.width)
		.attr('height', rock.height)
		.attr({'stroke-width': 1, 'stroke': 'black'})
		.style({fill: 'none'});
	return box;
}

function appendPreviewBoxes(rock) {
	otherSizes = resizeBox.otherSizes;
	var box1 = board.append('rect')
		.attr({x: rock.x, y: rock.y
		      ,width: otherSizes[0].width, height: otherSizes[0].height})
		.attr({'stroke-width': 1, 'stroke': 'black', opacity: 0.5})
		.style({fill: 'none'});
	var box2 = board.append('rect')
		.attr({x: rock.x, y: rock.y
					,width: otherSizes[1].width, height: otherSizes[1].height})
		.attr({'stroke-width': 1, 'stroke': 'black', opacity: 0.5})
		.style({fill: 'none'});
	resizeBox.previewBox1 = box1;
	resizeBox.previewBox2 = box2;
}

function clearPreviewBoxes() {
	if (resizeBox.previewBox1) {
		resizeBox.previewBox1.remove();
		delete resizeBox.previewBox1;
	}
	if (resizeBox.previewBox2) {
		resizeBox.previewBox2.remove();
		delete resizeBox.previewBox2;
	}
}

function getOtherSizes(size) {
	var small = getSizeDimensions('small')
	   ,medium = getSizeDimensions('medium')
	   ,large = getSizeDimensions('large');
	switch (size) {
		case 'small':
			return [medium, large];
		case 'medium':
			return [small, large];
		case 'large':
			return [small, medium];
	}
}

function getSizeDimensions(size) {
	switch (size) {
		case 'small':
			return {type: 'small', width: smallRockWidth, height: smallRockHeight};
		case 'medium':
			return {type: 'medium', width: mediumRockWidth, height: mediumRockHeight};
		case 'large':
			return {type: 'large', width: largeRockWidth, height: largeRockHeight};
	}
}

function resizeBoxInRangeOfOtherSize() {
	var width = resizeBox.width+resizeBox.offset;
	var halfBorderThickness = 3;
	for (var i=0; i<resizeBox.otherSizes.length; i++) {
		if (aboutEqual(width, resizeBox.otherSizes[i].width, 3))
			return resizeBox.otherSizes[i];
	}
	return false
}

function displayUserFeedback() {
	checkControlWindow();
	checkUserWindow();
}

function checkControlWindow() {
	//if (controlWindowSatisfiesSupportCategory()) {
  if (controlWindowSatisfiesSandwichCategory()) {
		showCorrect('#controlZone');
	} else {
		showIncorrect('#controlZone');
	}
}

function checkUserWindow() {
	//if (userWindowSatisfiesSupportCategory()) {
	if (userWindowSatisfiesSandwichCategory()) {
		showCorrect('#userZone');
		setCorrect();
		activateNextButton();
	} else {
		showIncorrect('#userZone');
		setIncorrect();
		deactivateNextButton();
	}
}

function collectPhaseOneData(action) {
	var d = new Date();
	var dataRow = new Row();
	dataRow.subjectID = game.getSubjectID();
	dataRow.date = d.toDateString();
	dataRow.t = d.toTimeString();
	dataRow.stimulusNum = currentExample;
	dataRow.stimulus = stimuli.data[currentExample];
	dataRow.userRocks = getRocksWithinUserZoneWindow();
	dataRow.userAction = action;
	dataRow.categorySatisfied = correct;

	console.log(dataRow);
	game.addRow(dataRow);
}

function initializePhaseOne() {
	setupBoard();
	setupControlRockZone();
	setupUserRockZone();
	setupRefreshButton();
	setupNextButton();
	setupNextButtonListener();
	setupRefreshButtonListener();

	collection.extendCollection(rockSetupData);
	collection.extendCollection(stimuli.data[currentExample]);
	collection.extendCollection(benchRockData);
	setupRocks();
}

function teardownPhaseOne() {
	d3.select('#board').remove();
}
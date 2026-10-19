

/*Functions for app settings and logic*/
function appInit(){

	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var coreStrip = document.getElementById("coreStrip");

	/*Define global variables*/
	//data for the marks to be rendered on canvases
	markData = {
		userGraph: { normal: [], //Members: x, y
					 falses: [], //Members: x
					 wide: [],   //Members: x
					 absent: []	 //Members: x
		},
		masterGraph: { normal: [],	//Members: x, y
					   wide: [],	//Members: x
					   index: []	//Members:
		},
		coreStrip: { ring: []		//Members: x, width, color
		}
	};

	userAction = {
		done: [],
		undone: []
	}; //Members: x, y(if applicable), type, mode
	
	//Corresponds to settings in control panel
	appSettings = {
	 absents: "off",
	 falses: "off",
	 graphMag: "Large",
	 coreMag: "1x",
	 mouseMode: "Draw",	
	 mouseMark: "Normal",
	 hintVis: "Hidden",
	 answerVis: "Hidden",
	 masterVis: "Hidden",
	 sensitivity: 1,
	 sensitivityNext: 1,
	 rings: 61,
	 ringsNext: 61
	};

	//Values to be displayed
	answer = {
		yearStart: 0,
		yearEnd: 0,
		falses: [],	//Array of two ring numbers
		absents: []	//Array of years
	}

	//misc global variables
	data = {
		masterLengthFactor: 6,
		masterYearStart: 0,
		targetRingWidth: 50,
		coreLength: 0
	}


	//Position Elements
	userGraph.style.top = "74px";
	userGraph.style.left = "10px";

	masterGraph.style.top = parseInt(userGraph.style.top) + Skel.height(userGraph) + "px";
	masterGraph.style.left = "10px";

	coreStrip.style.top = "10px";
	coreStrip.style.left = "10px";


	inputInit();
	applySettings();
	populateRings();
	writeAnswer();
	writeHint();
	renderGraphics();
}

//Initializes check status of input elements
function inputInit() {
 	var allInputs = document.getElementsByTagName("input");
	for(var x=0;x<allInputs.length;x++){
		if(allInputs[x].value == "Absents" || allInputs[x].value == "Falses"){
		    allInputs[x].checked = false;
		}
	}	
}

function restart(){
	//Update settings
	appSettings.rings = appSettings.ringsNext;
	appSettings.sensitivity = appSettings.sensitivityNext;

	//Reset mark values and answers
	markData = {
		userGraph: { normal: [], 
					 falses: [], 
					 wide: [], 
					 absent: []
		},
		masterGraph: { normal: [],
					   wide: [],
					   index: []
		},
		coreStrip: { ring: []
		}
	};


	answer = {
		yearStart: 0,
		yearEnd: 0,
		falses: [],
		absents: []
	}

	data = {
		masterLengthFactor: 6,
		masterYearStart: 0,
		targetRingWidth: 50,
		coreLength: 0
	}

	userAction = {
		done: [],
		undone: []
	};

	//Reposition elements
	userGraph.style.top = "74px";
	userGraph.style.left = "10px";

	masterGraph.style.top = parseInt(userGraph.style.top) + Skel.height(userGraph) + "px";
	masterGraph.style.left = "10px";

	coreStrip.style.top = "10px";
	coreStrip.style.left = "10px";

	applySettings();
	populateRings();
	writeAnswer();
	writeHint();
	
}

//Reads appSettings, makes necessary changes
function applySettings() {
	var i;
	if(typeof graphUnit !== 'undefined'){graphUnitPrev = graphUnit;}	//Set previous graph unit if not the first time

	//scales graphUnit; used for rendering graphs
	switch(appSettings.graphMag){
		case "Large":
			graphUnit = 8;
		break;
		case "Medium":
			graphUnit = 6;
		break;
		case "Small":
			graphUnit = 5;
		break;
	}

	//Toggles hint visibility
	switch(appSettings.hintVis) {
		case "Hidden":
			document.getElementById("hintText").style.visibility = "hidden";
		break;
		case "Visible":
			document.getElementById("hintText").style.visibility = "visible";
		break;
	}

	//Toggles answer visibility
	switch(appSettings.answerVis) {
		case "Hidden":
			document.getElementById("answerBox").style.visibility = "hidden";
		break;
		case "Visible":
			document.getElementById("answerBox").style.visibility = "visible";
		break;
	}

	//Toggles master visibility
	switch(appSettings.masterVis) {
		case "Hidden":
			document.getElementById("masterGraph").style.visibility = "hidden";
		break;
		case "Visible":
			document.getElementById("masterGraph").style.visibility = "visible";
		break;
		
	}
	
	//Show which toggles are on
	setPressed("Hint", appSettings.hintVis == "Visible");
	setPressed("Answer", appSettings.answerVis == "Visible");
	setPressed("Master", appSettings.masterVis == "Visible");

	//Reads displayed values for ringNumber and sensitivity, sends them to appSettings
	document.getElementById("sensitivityNumber").innerHTML = appSettings.sensitivityNext;
	document.getElementById("ringNumber").innerHTML = appSettings.ringsNext;

	renderGraphics();
}

//Horizontal middle of the workspace, in pixels: the point magnification zooms around
function workspaceMiddle() {
	return document.getElementById("workspace").clientWidth / 2;
}

//Mark a toggle button (Hint, Answer, Master) as on or off
function setPressed(value, pressed) {
	var button = document.querySelector('#panel button[value="' + value + '"]');
	if(button) {
		button.setAttribute("aria-pressed", pressed ? "true" : "false");
	}
}

/*Detects and responds to interaction with control panel*/
function handleInputPress(e){
	var targ = e.target ? e.target : e.srcElement;

	//Detect which input is being changed
	switch(targ.type){
		case "checkbox":
			switch(targ.value) { //Toggle absents or falses on or off
				case "Absents":
					appSettings.absents = targ.checked ? "on" : "off";
				break;
				case "Falses":
					appSettings.falses = targ.checked ? "on" : "off";
				break;
			}
		break;

		case "radio":
			switch(targ.name) {	//update settings to value of input
				case "coreMag":
					appSettings.coreMag = targ.value;
				break;
				case "graphMag":				
					appSettings.graphMag = targ.value;
				break;
				case "mouseMode":
					appSettings.mouseMode = targ.value; 
				break;
				case "mouseMark":
					appSettings.mouseMark = targ.value;
				break;		
			}		
		break;

		case "button":
			switch(targ.value) {	//Toggles visibility of elements
				case "Undo":
					undo();
				break;
				case "Redo":
					redo();
				break;
				case "Hint":
					if(appSettings.hintVis == "Hidden"){
						appSettings.hintVis = "Visible";
					}
					else{
						appSettings.hintVis = "Hidden";
					}
				break;
				case "Answer":
					if(appSettings.answerVis == "Hidden"){
						appSettings.answerVis = "Visible";
					}
					else{
						appSettings.answerVis = "Hidden";
					}
				break;
				case "Master":
					if(appSettings.masterVis == "Hidden"){
						appSettings.masterVis = "Visible";
					}
					else{
						appSettings.masterVis = "Hidden";
					}
				break;
			
				
				}
		}
			
	//Increase/Decrease sensitivity and ringNumbers
				
	if(targ == document.getElementById("decreaseSensitivity")){
			if(appSettings.sensitivityNext > 1) {
				--appSettings.sensitivityNext;
			}
		}
	else if(targ == document.getElementById("decreaseRings")) {
		if(appSettings.ringsNext > 11) {
			appSettings.ringsNext -= 10;
		}
	}


	if(targ == document.getElementById("increaseSensitivity")){
		if(appSettings.sensitivityNext < 9) {
			++appSettings.sensitivityNext;
		}
	}
	else if(targ == document.getElementById("increaseRings")){
		if(appSettings.ringsNext < 401) {
			appSettings.ringsNext += 10;
		}
	}

	if(targ.value == "Restart a New Core"){restart();}

	applySettings();
}

//Graphics Functions
function renderGraphics(){
	scaleGraphs();
	drawCoreStrip();
}

//Render graphPaper background for userGraph and masterGraph
function renderGraphPaper(canvas) {
	var height = Skel.height(canvas);
	var width = Skel.width(canvas);
	var ctx = canvas.getContext("2d");
	var font = "italic bold " + labelSize() + "px Times";

	//Leave 5 units for margin
	Skel.drawGrid(ctx, graphUnit*5, width, height, graphUnit);

	//Draw special margins; depend on which graph it is
	switch(canvas){
		case document.getElementById("userGraph"):
			//Draw Margin Markers
			ctx.beginPath();
			ctx.strokeStyle = "red"
			ctx.moveTo(graphUnit*5+.5, graphUnit*5 + 1);
			ctx.lineTo(graphUnit*5+.5, height);
			ctx.stroke();
			ctx.moveTo(graphUnit*5+.5, graphUnit*13+.5);
			ctx.lineTo(graphUnit*3, graphUnit*13+.5);
			ctx.stroke();
			ctx.lineTo(graphUnit*5, height-.5);
			ctx.stroke();

			ctx.moveTo(width-graphUnit*15+.5, graphUnit*5+1);
			ctx.lineTo(width-graphUnit*15+.5, height);
			ctx.stroke();
			ctx.moveTo(width-graphUnit*15+.5, graphUnit*13+.5);
			ctx.lineTo(width-graphUnit*13+.5, graphUnit*13+.5);
			ctx.stroke();
			ctx.lineTo(width-graphUnit*15+.5, height-.5);
			ctx.stroke();
			ctx.closePath();

			Skel.drawRingNumbers(ctx, graphUnit*5, width, graphUnit, font);
		break;
		case document.getElementById("masterGraph"):
			Skel.drawMasterAxes(ctx, width, graphUnit, data.masterYearStart, font);
		break;
	}
}

//Font size for graph labels at the current magnification
function labelSize() {
	switch(graphUnit) {
		case 5: return 10;
		case 6: return 12;
		case 8: return 15;
	}
}

//Font size for marks at the current magnification
function markSize() {
	switch(graphUnit) {
		case 5: return 10;
		case 6: return 12;
		case 8: return 16;
	}
}

function scaleGraphs(){
	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");

	if(typeof graphUnitPrev === 'undefined') {	//If first time, define previous graph unit as current graphunit
		graphUnitPrev = graphUnit;	//Note: one graph square == 5 * graphUnit
	}

	//Modify userGraph dimensions
	//15 squares tall, and long enough for one square per ring plus 5 units of margin on the left and 15 on the right
	Skel.sizeCanvas(userGraph, graphUnit*(appSettings.rings-1) + graphUnit*20, graphUnit*15 + 1);

	//Modify graph positions
	//Zoom around the middle of the workspace
	userGraph.style.left = workspaceMiddle() - (workspaceMiddle() - parseInt(userGraph.style.left)) * graphUnit/graphUnitPrev +"px";
	masterGraph.style.left = workspaceMiddle() - (workspaceMiddle() - parseInt(masterGraph.style.left)) * graphUnit/graphUnitPrev +"px";

	//Mark positions are stored in graph units, so they need no rescaling here

	//Modify masterGraph dimensions
	Skel.sizeCanvas(masterGraph, (markData.masterGraph.index.length*graphUnit) + graphUnit*20  - graphUnit - 1, graphUnit*30 + 1);
	//Reposition Graphs
	masterGraph.style.top = parseInt(userGraph.style.top) + Skel.height(userGraph) + "px";

	drawGraphMarks();
}

function drawGraphMarks(){
	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var ctxU = userGraph.getContext("2d");
	var ctxM = masterGraph.getContext("2d");
	var userHeight = Skel.height(userGraph);
	var marks = markData.userGraph;
	var master = markData.masterGraph;
	var i;

	ctxU.clearRect(0, 0, Skel.width(userGraph), userHeight);
	renderGraphPaper(userGraph);

	ctxM.clearRect(0, 0, Skel.width(masterGraph), Skel.height(masterGraph));
	renderGraphPaper(masterGraph);

	//Normal marks: user marks rise from the bottom, master marks hang from the top
	ctxU.lineWidth = 3;
	for(i = 0; i < marks.normal.length; ++i) {
		Skel.drawBar(ctxU, marks.normal[i].x*graphUnit+.5, marks.normal[i].y*graphUnit-.5, userHeight);
	}

	ctxM.lineWidth = 3;
	for(i = 0; i < master.normal.length; ++i) {
		Skel.drawBar(ctxM, master.normal[i].x*graphUnit+.5, master.normal[i].y*graphUnit-.5, 0);
	}

	//Wide Marks
	for(i = 0; i < marks.wide.length; ++i) {
		Skel.drawWideMark(ctxU, marks.wide[i].x*graphUnit, 6.5*graphUnit, "bold " + markSize() + "px Times");
	}

	for(i = 0; i < master.wide.length; ++i) {
		Skel.drawWideMark(ctxM, master.wide[i].x*graphUnit, 9.5*graphUnit, "bold " + markSize() + "px Times");
	}

	//Absent and False Marks
	for(i = 0; i < marks.absent.length; ++i) {
		Skel.drawAbsentMark(ctxU, marks.absent[i].x*graphUnit, userHeight, graphUnit, "normal " + markSize() + "px Times");
	}

	for(i = 0; i < marks.falses.length; ++i) {
		Skel.drawFalseMark(ctxU, marks.falses[i].x*graphUnit, userHeight, graphUnit, "normal " + markSize() + "px Times");
	}

	//Master Index Plot
	Skel.drawIndexPlot(ctxM, master.index, graphUnit);
}

function drawCoreStrip() {
	var coreStrip = document.getElementById("coreStrip");
	var mag = parseInt(appSettings.coreMag);
	var prevMag = (Skel.width(coreStrip) - 20) / data.coreLength;

	Skel.drawCoreStrip(coreStrip, markData.coreStrip.ring, data.coreLength, mag);

	//Reposition strip so that it does not leave center anchor
	if(prevMag > 0 && prevMag < 4) {
		coreStrip.style.left = workspaceMiddle() - (workspaceMiddle() - parseInt(coreStrip.style.left)) * mag/prevMag +"px";
	}
}

function writeAnswer() {
	var answerText = document.getElementById("answerText");
	var i;
	answerText.innerHTML = "All of these are part of the answer:\n";
	answerText.innerHTML += "Start year: " + answer.yearStart + "\n";
	answerText.innerHTML += "Absent rings: ";
	if(appSettings.absents == "on") {
		for(i = 0; i < answer.absents.length; ++i) {
			answerText.innerHTML += answer.absents[i] + " ";
		}
	}
	answerText.innerHTML += "\n";
	answerText.innerHTML += "False rings: "
	if(appSettings.falses == "on") {
		if(answer.falses.length != 0 ) {
			answerText.innerHTML += "Rings " + answer.falses[0] + " & " + answer.falses[1] +" are 1 ring"
		}
	}
	answerText.innerHTML += "\n"
	answerText.innerHTML += "End year: " + answer.yearEnd;
}

function writeHint() {
	var hintText = document.getElementById("hintText");

	hintText.innerHTML = "Hint: Core is missing " + answer.absents.length + " rings and has ";
	hintText.innerHTML += answer.falses.length / 2 + " false ring(s).";
}


/*Pointer Action Functions (mouse, touch and pen)*/

//If element has multiple pointer actions, determine which one to use
//Here, only used on userGraph
function handleClick(e) {
	var pos = Skel.position(e);

	//If top 1/3 of element, drag
	if(pos.y < Skel.height(e.currentTarget) / 3) {
		startDrag(e);
	}
	//If lower 2/3 of graph and outside of white margin, draw/erase on tap
	else if (pos.x >= 5*graphUnit) {
		Skel.onTap(e, function(point) {
			if(appSettings.mouseMode == "Draw"){
				addMark(point);
			}
			else if (appSettings.mouseMode == "Erase"){
				removeMark(point);
			}
			drawGraphMarks();
		});
	}
}

function startDrag(e) {
	Skel.dragHoriz(e, function(targ, left) {
		targ.style.left = left + "px";
		dragLimit(targ);
	});
}

//Conforms dragged element to specific restraints
function dragLimit(targ) {
	var frameWidth = document.getElementById("workspace").clientWidth;
	switch(targ) {
		//Keep graphs inside the workspace by 50px
		case document.getElementById("userGraph"):
		case document.getElementById("masterGraph"):
			if(parseInt(targ.style.left) > frameWidth - 50) {
				targ.style.left = frameWidth - 50 + "px";
			}
			if(parseInt(targ.style.left) < 50 - Skel.width(targ)) {
				targ.style.left = 50 - Skel.width(targ) + "px";
			}
		break;
		//Keep coreStrip anchored to middle of screen
		case document.getElementById("coreStrip"):
			if(parseInt(targ.style.left) > frameWidth / 2) {
				targ.style.left = frameWidth / 2 +"px";
			}
			if(parseInt(targ.style.left) < frameWidth / 2 - Skel.width(targ)) {
				targ.style.left = frameWidth / 2 - Skel.width(targ) + "px";
			}
		break;
	}
}


/*Functions for mark Data*/

//Add a mark to array when userGraph is drawn on by user
//Mark positions are stored in graph units (pixels / graphUnit) so they survive magnification changes
function addMark(e) {
	var newMark, array;
	var line = Math.round((e.offsetX-1)/graphUnit);	//nearest vertical graph line

	switch(appSettings.mouseMark) {
		case "Normal":
			newMark = {x:line, y:e.offsetY/graphUnit};
			array = markData.userGraph.normal;
		break;
		case "Wide":
			newMark = {x:e.offsetX/graphUnit};
			array = markData.userGraph.wide;
		break;
		case "Absent":
		case "False":
			//Snap to the middle of the square on the clicked side of the nearest line
			if(e.offsetX < line*graphUnit+1) {
				newMark = {x:line - 0.5};
			}
			else {
				newMark = {x:line + 0.5};
			}
			array = appSettings.mouseMark == "Absent" ? markData.userGraph.absent : markData.userGraph.falses;
		break;
	}
	array.push(newMark);
	userAction.done.push({mark: newMark, array: array, mode:"draw"});
	userAction.undone = [];
}

//Remove mark from array when user erases userGraph mark
function removeMark(e){
	var arrays = [markData.userGraph.normal, markData.userGraph.falses, markData.userGraph.wide, markData.userGraph.absent];
	var bestArray = null;
	var bestIdx = 0;
	var bestNum = graphUnit;	//user must click within one graphUnit away from desired mark
	var i, j, dist;

	//For each type of mark, sift through array and find closest mark. Save its index and array
	for(j = 0; j < arrays.length; ++j) {
		for(i = 0; i < arrays[j].length; ++i) {
			dist = Math.abs(e.offsetX - arrays[j][i].x*graphUnit);
			if(dist < bestNum) {
				bestNum = dist;
				bestArray = arrays[j];
				bestIdx = i;
			}
		}
	}

	//If no mark is found, do nothing
	if(bestArray != null) {
		userAction.done.push({mark: bestArray[bestIdx], array: bestArray, mode:"erase"});
		userAction.undone = [];
		bestArray.splice(bestIdx, 1);
	}
}

//Remove a specific mark object from its array
function removeFromArray(array, mark) {
	var i = array.indexOf(mark);
	if(i >= 0) {
		array.splice(i, 1);
	}
}

function undo() {
	var action = userAction.done.pop();
	if(!action) {
		return;
	}

	switch(action.mode) {
		case "draw":
			removeFromArray(action.array, action.mark);
		break;
		case "erase":
			action.array.push(action.mark);
		break;
	}
	userAction.undone.push(action);

	drawGraphMarks();
}

function redo() {
	var action = userAction.undone.pop();
	if(!action) {
		return;
	}

	switch(action.mode) {
		case "draw":
			action.array.push(action.mark);
		break;
		case "erase":
			removeFromArray(action.array, action.mark);
		break;
	}
	userAction.done.push(action);

	drawGraphMarks();
}



//Creates ring data for master and dimensions of rings on core strip
function populateRings() {
	var i, masterYearStartSeed, coreStart, newMark, newX, newY, newWidth, year, falseYear;
	var color = [];
	var falses = 0; var absents = 0;
	var coreLength = 0;
	var index = markData.masterGraph.index;
	var masterNormal = markData.masterGraph.normal;
	var indexMin = 100;
	var indexMax = 0;
	var absoluteValueCutoff = 2;
	var firstDifferenceCutoff = 2;
	var masterBoneWideCutoff = 0.95;
	var numMinPixel = 0;

	//Populate Master Plot
	masterYearStartSeed = Math.random() * 0.75 + .05;
	index.length = data.masterLengthFactor*appSettings.rings; //index holds all ring data

	//Randomly set start year of master plot
	data.masterYearStart = Math.floor(1998 - index.length - masterYearStartSeed * 100);
	data.masterYearStart -= Math.floor(1998 - index.length - masterYearStartSeed * 100)%10 - 5;

	//Randomly set ring widths
	for(i = 0; i < index.length; ++i) {
		index[i] = 0;
		//Width is averaged according to sensitivity
		for(var replicate = 0; replicate<appSettings.sensitivity; ++replicate){
			index[i] += Math.random()*2;
		}
		index[i] /= appSettings.sensitivity;
		//Keep track of maximum and minimum indices
		if(index[i] < indexMin) {
			indexMin = index[i];
		}
		else if (index[i] > indexMax) {
			indexMax = index[i];
		}	
	}
	
	//Populate masterGraph with marks for rings that conform to certainparameters
	for(i = 0; i < index.length; ++i) {
		if(i > 0 && index[i] < (1-(1-indexMin)/absoluteValueCutoff) ||
			index[i]-index[i-1] < (indexMin-indexMax)/firstDifferenceCutoff){
			newX = i+5;
			newY = 0;	
		
			if(absoluteValueCutoff>1) {
				newY = 10 - index[i]/(1-(1-indexMin)/absoluteValueCutoff)*10;
			}
			if(firstDifferenceCutoff > 1 && index[i] < index[i-1]) {
				newY = Math.max(newY, 10-((index[i] - index[i-1]) - (indexMin-indexMax)) / 
					((indexMin-indexMax)/firstDifferenceCutoff-(indexMin-indexMax))*10);
			}
			newMark = {x:newX, y:newY, year:i+data.masterYearStart};
			masterNormal.push(newMark);

		}
		
	
		if(index[i] > masterBoneWideCutoff*indexMax) {
			newX = 5 + i;
			markData.masterGraph.wide.push({x:newX});
		}

	}

	//Populate Core
	coreStart = Math.random() * 0.75 + 0.05;
	answer.yearStart = data.masterYearStart + Math.floor(coreStart*index.length);
	

	for(year = Math.floor(coreStart*index.length); year < Math.floor(coreStart*index.length) + appSettings.rings - falses; ++year){
		var ring = year - Math.floor(coreStart*index.length);
		//mising rings; can't be first or last
		while(index[year+absents] < 0.06) {
			if (appSettings.absents=="on" && year > Math.floor(coreStart*index.length) && year < Math.floor(coreStart*index.length) + appSettings.rings - 1 ){
				answer.absents.push(year + data.masterYearStart + absents);
				absents++;
			}
			else {
				//Absents are off, or this is the first or last ring
				index[year+absents]=0.06;
			}
		}

		if(index[year+absents] >= 0.06 && index[year+absents] < 0.15) {
			index[year+absents] = 0.15;
		}

		//False rings; can't be first or last, or fall on a numbered (every 10th) ring
		if(appSettings.falses == "on" && index[year+absents] > 1.95 && year > Math.floor(coreStart*index.length) &&
			year < Math.floor(coreStart*index.length) + appSettings.rings - 1 && falses == 0 && (year - Math.floor(coreStart*index.length))%10 != 0 &&
			(year - Math.floor(coreStart*index.length)+1)%10 != 0) {
				falseYear = year;
				index[year+absents] = 2.00;
				answer.falses.push(falseYear - Math.floor(coreStart*index.length));
				answer.falses.push(falseYear - Math.floor(coreStart*index.length)+1);
				falses++;
		}

		//Adjust coreLength according to ring widths - if ring width is less than 3, it will be set to 3
		data.coreLength += Skel.ringWidth(index[year+absents], data.targetRingWidth);

		//Randomly select latewood color
		color.push(Skel.randomLatewood());
	}

	var tempFalses = 0;
	var tempAbsent = 0;
	var ring = 0;
	var newX = 0;
	var adjIndex;
	while(ring < appSettings.rings - tempFalses){
			year = ring + Math.floor(coreStart*index.length);
			var divisor = 1;
			if(year == falseYear) {
				divisor = 2;
				tempFalses++;
				
			}
			while(index[year+tempAbsent] < 0.06 &&
				ring > 0 && ring < appSettings.rings-1) {
				tempAbsent++;
			}

			for(i = 1; i < divisor+1; ++i) {
				newWidth = Skel.ringWidth(index[year+tempAbsent], data.targetRingWidth, divisor);
				if(markData.coreStrip.ring.length > 0) {
					if(divisor == 2 && i == 1) {
						adjIndex = 1;
						
					}
					else {
						adjIndex = 0;
					}
					newX = markData.coreStrip.ring[ring +tempFalses-adjIndex- 1].x + Math.floor(newWidth);
					//FIXME: fix newX calculation
				}
				else {newX = Math.floor(newWidth);}

				//The inner half of a split ring ends at the false ring's diffuse boundary
				markData.coreStrip.ring.push({x:Math.floor(newX), width: Math.floor(newWidth), color:color[ring], falseBoundary: divisor == 2 && i == 1});
			}
			ring++;
	}

	answer.yearEnd = answer.yearStart + appSettings.rings + absents - falses - 1;


}	





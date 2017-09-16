
function positionControls(){
	var panel = document.getElementById("panel");
	var anomaly = document.getElementById("anomalyControls");
	var magnification = document.getElementById("magnificationControls");
	var mouseAction = document.getElementById("mouseActionControls");
	var showHide = document.getElementById("showHideControls");
	var coreSettings = document.getElementById("coreSettingsControls");

	
	panel.width = 581;
	panel.height = 120;
	panel.style.width = panel.width+"px";
	panel.style.height = panel.height+"px";

	anomaly.style.width = 98+"px";
	anomaly.style.left = 0 + "px";
	magnification.style.width = 127+"px";
	magnification.style.left = parseInt(anomaly.style.left) + parseInt(anomaly.style.width)+1+"px";
	mouseAction.style.width = 150+"px";
	mouseAction.style.left = parseInt(magnification.style.left) + parseInt(magnification.style.width)+1 + "px";
	showHide.style.width = 69+"px";
	showHide.style.left = parseInt(mouseAction.style.left) + parseInt(mouseAction.style.width)+1 + "px";
	coreSettings.style.width = 133+"px";
	coreSettings.style.left = parseInt(showHide.style.left) + parseInt(showHide.style.width)+1 + "px";
}

/*Functions for app settings and logic*/
function appInit(){
	positionControls();

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
	userGraph.style.top = "190px";
	userGraph.style.left = "10px";

	masterGraph.style.top = masterGraph.style.top = parseInt(userGraph.style.top) + userGraph.height + "px";
	masterGraph.style.left = "10px";

	coreStrip.style.top = "134px";
	coreStrip.style.left = "10px";


	applySettings();
	populateRings();
	writeAnswer();
	writeHint();
	renderGraphics();
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


	//Reposition elements
	userGraph.style.top = "190px";
	userGraph.style.left = "10px";

	masterGraph.style.top = masterGraph.style.top = parseInt(userGraph.style.top) + userGraph.height + "px";
	masterGraph.style.left = "10px";

	coreStrip.style.top = "134px";
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
	
	//Reads displayed values for ringNumber and sensitivity, sends them to appSettings
	document.getElementById("sensitivityNumber").innerHTML = appSettings.sensitivityNext;
	document.getElementById("ringNumber").innerHTML = appSettings.ringsNext;

	renderGraphics();
}

/*Detects and responds to interaction with control panel*/
function handleInputPress(e){
	var targ = e.target ? e.target : e.srcElement;

	//Detect which input is being changed
	switch(targ.type){
		case "checkbox":
			switch(targ.value) { //Toggle absents or falses on or off
				case "Absents":
					if(targ.checked){
						appSettings.absents = "off";
					}
					else{
						appSettings.absents = "on";
					}
				break;
				case "Falses":
					if(targ.checked){
						appSettings.falses = "off";
					}
					else{
						appSettings.falses = "on";
					}
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
	var height = canvas.height;
	var width = canvas.width;
	var mag = appSettings.graphMag;
	var ctx = canvas.getContext("2d");
	var i, txt, txtWidth, temp;


	//Draw graph squares
	ctx.lineWidth = 1;

	//Draw vertical lines
	//Leave 5 units for margin
	for (i = graphUnit*5; i < width; i+=graphUnit) {
		ctx.beginPath();
		ctx.moveTo(i+.5, 0);
		ctx.lineTo(i+.5, height);
		ctx.strokeStyle = "rgb(102,255,102)";
		ctx.stroke();
		ctx.closePath();
	}

	//Draw horizontal lines
	for (i = 0; i < height; i+=graphUnit) {
		ctx.beginPath();
		ctx.moveTo(graphUnit*5, i+.5);	//Leave room for margin
		ctx.lineTo(width, i+.5);
		ctx.strokeStyle = "rgb(102,255,102)";
		ctx.stroke();
		ctx.closePath();
	}


	//Dark Green Lines every 5 squares
	for (i = graphUnit*5; i < width; i+=graphUnit*5) {
		ctx.beginPath();
		ctx.moveTo(i+.5, 0);
		ctx.lineTo(i+.5, height);
		ctx.strokeStyle = "rgb(000,204,051)";
		ctx.stroke();
		ctx.closePath();
	}

	for (i = 0; i < height; i+=graphUnit*5) {
		ctx.beginPath();
		ctx.moveTo(graphUnit*5, i+.5);
		ctx.lineTo(width, i+.5);
		ctx.strokeStyle = "rgb(000,204,051)"
		ctx.stroke();
		ctx.closePath();
	}

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

			//Write Ring Numbers
			for (i=graphUnit*5; i<width; i+=10*graphUnit) {
				ctx.font = "italic bold 15px Times";
				txt = i/graphUnit - 5;
				txtWidth = ctx.measureText(txt).width;
				ctx.fillText(txt, i-txtWidth/2, 4*graphUnit + 5);
			}
		break;
		case document.getElementById("masterGraph"):
			//Draw black horizontal lines
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(graphUnit*5, graphUnit*10 + .5);
			ctx.lineTo(width, graphUnit*10 + .5);
			ctx.moveTo(graphUnit*5, graphUnit*20 + .5);
			ctx.lineTo(width, graphUnit*20 + .5);
			ctx.strokeStyle = "rgb(0,0,0)";
			ctx.stroke();
			ctx.closePath();

			//Write Year Numbers
			for (i=graphUnit*10; i<width; i+=10*graphUnit) {
				ctx.font = "italic bold 15px Times";
				temp = data.masterYearStart + i/graphUnit - 5;
				if(temp%100 != 0){temp = temp%100;}
				txt = temp;
				txtWidth = ctx.measureText(txt).width;
				ctx.fillText(txt, i-txtWidth/2, 12*graphUnit);
			}

			//Note halfway mark on index plot
			ctx.font = "bold 18px Times";
			txt = "1.0";
			txtWidth = ctx.measureText(txt).width;
			ctx.fillText(txt, 2.5*graphUnit - txtWidth/2, 21*graphUnit);
		break;
	}
}

function scaleGraphs(){
	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var i;

	if(typeof graphUnitPrev === 'undefined') {	//If first time, define previous graph unit as current graphunit
		graphUnitPrev = graphUnit;	//Note: one graph square == 5 * graphUnit
	}

	//Modify userGraph dimensions
	userGraph.height = graphUnit*15 + 1;	//15 squares tall
	//userGraph must be long enough for all rings, the margin on left, and 3 large blocks to right
	userGraph.width = graphUnit*(appSettings.rings-1) + graphUnit*20;	//one square for each ring, plut 5 left margin and 15 right margin

	//Modify graph positions
	userGraph.style.left = 760/2 - (760/2 - parseInt(userGraph.style.left)) * graphUnit/graphUnitPrev +"px";
	masterGraph.style.left = 760/2 - (760/2 - parseInt(masterGraph.style.left)) * graphUnit/graphUnitPrev +"px";

	//Scale dimensions of all graph marks
	for(i = 0; i < markData.userGraph.normal.length; ++i){	
		markData.userGraph.normal[i].x *= graphUnit/graphUnitPrev;
		markData.userGraph.normal[i].y *= graphUnit/graphUnitPrev;
	}
	
	for(i = 0; i < markData.userGraph.wide.length; ++i){
		markData.userGraph.wide[i].x *= graphUnit/graphUnitPrev;
		markData.userGraph.wide[i].y *= graphUnit/graphUnitPrev;
	}

	for(i = 0; i < markData.userGraph.absent.length; ++i){
		markData.userGraph.absent[i].x *= graphUnit/graphUnitPrev;
		markData.userGraph.absent[i].y *= graphUnit/graphUnitPrev;
	}

	for(i = 0; i < markData.userGraph.falses.length; ++i){
		markData.userGraph.falses[i].x *= graphUnit/graphUnitPrev;
		markData.userGraph.falses[i].y *= graphUnit/graphUnitPrev;
	}

	for(i = 0; i < markData.masterGraph.normal.length; ++i){
		markData.masterGraph.normal[i].x *= graphUnit/graphUnitPrev;
		markData.masterGraph.normal[i].y *= graphUnit/graphUnitPrev;
	}

	for(i = 0; i < markData.masterGraph.wide.length; ++i){
		markData.masterGraph.wide[i].x *= graphUnit/graphUnitPrev;
		markData.masterGraph.wide[i].y *= graphUnit/graphUnitPrev;
	}



	//Modify masterGraph dimensions
	masterGraph.height = graphUnit*30 + 1;
	masterGraph.width = (markData.masterGraph.index.length*graphUnit) + graphUnit*20  - graphUnit - 1;
	//Reposition Graphs
	masterGraph.style.top = parseInt(userGraph.style.top) + userGraph.height + "px";

	drawGraphMarks();
}

function drawGraphMarks(){
	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var ctxU = userGraph.getContext("2d");
	var ctxM = masterGraph.getContext("2d");
	var i, txt, txtWidth, x, y;

	ctxU.clearRect(0, 0, userGraph.width, userGraph.height);
	renderGraphPaper(userGraph);

	ctxM.clearRect(0, 0, masterGraph.width, masterGraph.height);
	renderGraphPaper(masterGraph);

	//Make normal marks

	ctxU.lineWidth = 3;

	for(i = 0; i < markData.userGraph.normal.length; ++i) {
		ctxU.beginPath();
		ctxU.moveTo(markData.userGraph.normal[i].x-.5, markData.userGraph.normal[i].y-.5);
		ctxU.lineTo(markData.userGraph.normal[i].x-.5, userGraph.height);
		ctxU.strokeStyle = "rgb(0,0,0)";
		ctxU.stroke();
		ctxU.closePath();
	}

	for(i = 0; i < markData.masterGraph.normal.length; ++i) {
		ctxM.beginPath();
		ctxM.moveTo(markData.masterGraph.normal[i].x-.5, markData.masterGraph.normal[i].y-.5);
		ctxM.lineTo(markData.masterGraph.normal[i].x-.5, 0);
		ctxM.strokeStyle = "rgb(0,0,0)";
		ctxM.stroke();
		ctxM.closePath();
	}

	//Wide Marks
	for(i = 0; i < markData.userGraph.wide.length; ++i) {
		ctxU.font = "bold 16px Times  ";
		txt = "b";
		txtWidth = ctxU.measureText(txt).width;
		ctxU.fillText(txt, markData.userGraph.wide[i].x - txtWidth/2, 6.5*graphUnit);
	}

	for(i = 0; i < markData.masterGraph.wide.length; ++i) {
		ctxM.font = "bold 16px Times  ";
		txt = "b";
		txtWidth = ctxM.measureText(txt).width;
		ctxM.fillText(txt, markData.masterGraph.wide[i].x - txtWidth/2, 9.5*graphUnit);
	}

	//Absent Marks
	ctxU.lineWidth=2;
	ctxU.strokeStyle= "rgb(0,0,0)";
	for(i = 0; i < markData.userGraph.absent.length; ++i) {
		ctxU.beginPath();
		ctxU.moveTo(markData.userGraph.absent[i].x, userGraph.height -1);
		ctxU.lineTo(markData.userGraph.absent[i].x, userGraph.height - graphUnit*2 -1);
		ctxU.stroke();
		ctxU.moveTo(markData.userGraph.absent[i].x, userGraph.height - graphUnit*4-1);
		ctxU.lineTo(markData.userGraph.absent[i].x, userGraph.height - graphUnit*6-1);
		ctxU.stroke();
		ctxU.moveTo(markData.userGraph.absent[i].x, userGraph.height - graphUnit*8-1);
		ctxU.lineTo(markData.userGraph.absent[i].x, userGraph.height - graphUnit*10-1);
		ctxU.stroke();
		ctxU.closePath();

		ctxU.font = "normal 15px Times";
		txt = ">"
		txtWidth = ctxU.measureText(txt).width;
		ctxU.fillText(txt, markData.userGraph.absent[i].x-txtWidth/2, graphUnit + graphUnit*.75);
	}

	//False Marks
	ctxU.lineWidth = 1;
	for(i = 0; i < markData.userGraph.falses.length; ++i) {
		ctxU.beginPath();
		ctxU.moveTo(markData.userGraph.falses[i].x + graphUnit*.5, userGraph.height -1);
		ctxU.lineTo(markData.userGraph.falses[i].x - graphUnit*.5, userGraph.height - graphUnit*2-1);
		ctxU.stroke();
		ctxU.moveTo(markData.userGraph.falses[i].x + graphUnit*.5, userGraph.height - graphUnit*4-1);
		ctxU.lineTo(markData.userGraph.falses[i].x - graphUnit*.5, userGraph.height - graphUnit*6-1);
		ctxU.stroke();
		ctxU.moveTo(markData.userGraph.falses[i].x + graphUnit*.5, userGraph.height - graphUnit*8-1);
		ctxU.lineTo(markData.userGraph.falses[i].x - graphUnit*.5, userGraph.height - graphUnit*10-1);
		ctxU.stroke();
		ctxU.closePath();

		ctxU.font = "normal 15px Times";
		txt = "<"
		txtWidth = ctxU.measureText(txt).width;
		ctxU.fillText(txt, markData.userGraph.falses[i].x-txtWidth/2, graphUnit + graphUnit*.75);
	}

	//Master Index Plot
	ctxM.lineWidth = 1;
	
	for(i = 1; i < markData.masterGraph.index.length; ++i){
		ctxM.beginPath();
		ctxM.strokeStyle = "rgb(0,0,0)";
		if(i == 1){
			x = 5*graphUnit;
			y = (2-markData.masterGraph.index[i-1])*graphUnit*10 + 10*graphUnit;
			
		}
			ctxM.moveTo(x+.5, y+.5);
			x += graphUnit;
			y = (2-markData.masterGraph.index[i])*graphUnit*10 + 10*graphUnit;
			ctxM.lineTo(x+.5, y+.5);
			ctxM.stroke();
			
		ctxM.closePath();
		
		
	}
}

function drawCoreStrip() {
	var coreStrip =document.getElementById("coreStrip");
	var ctx = coreStrip.getContext("2d");
	var coreEdge1, coreEdge2;
	var i, txt, txtWidth;
	var adjRingWidth, adjRingX, prevMag;

	prevMag = (coreStrip.width - 20) / data.coreLength;

	coreStrip.height = 40;
	coreStrip.width = 20 + data.coreLength * parseInt(appSettings.coreMag);

	//Reposition strip so that it does not leave center anchor
	if(prevMag > 0 && prevMag < 4) {
		coreStrip.style.left = 760/2 - (760/2 - parseInt(coreStrip.style.left)) * parseInt(appSettings.coreMag)/prevMag +"px";
	}
	
	coreEdge1 = 10; coreEdge2 = coreStrip.width-20;

	ctx.clearRect(0, 0, coreStrip.width, coreStrip.height);

	ctx.lineWidth = 1;
	ctx.rect(10.5,10.5,coreStrip.width - 20,20);
	ctx.strokeStyle="rgb(0,0,0)";
	ctx.stroke();
	ctx.fillStyle="rgb(255,255,41)";
	ctx.fillRect(11.5,11.5,coreStrip.width-22,18);

	//Draw rings
	for(i = 0; i < markData.coreStrip.ring.length; ++i) {
		//Adjust ring position and width according to magnification setting
		adjRingX = markData.coreStrip.ring[i].x * parseInt(appSettings.coreMag) + 10;;
		adjRingWidth = markData.coreStrip.ring[i].width * parseInt(appSettings.coreMag);

		switch(markData.coreStrip.ring[i].color) {
			case "lightLatewood":
				ctx.fillStyle="rgb(255,204,051)"
			break;
			case "mediumLatewood":
				ctx.fillStyle="rgb(204,153,000)"
			break;
			case "darkLatewood":
				ctx.fillStyle="rgb(153,102,000)"
			break;
		}

		ctx.beginPath();
		//Draw latewood on left 0.25 of ring
		ctx.fillRect(Math.floor(adjRingX-adjRingWidth*0.25), 11, Math.floor(adjRingWidth*0.25)+1, 19);
		ctx.moveTo(adjRingX+.5, 10);
		ctx.lineTo(adjRingX+.5, 30);
		ctx.stroke();
		ctx.closePath();
		//Draw circle and ring number on every 10th ring
		ctx.fillStyle="rgb(0,0,0)";
		if(i % 10 == 0) {
			ctx.beginPath();
			ctx.arc(adjRingX-adjRingWidth/2, 20, 2, 0, 2*Math.PI);
			ctx.fill();
			ctx.closePath();			
			ctx.font = "bold 12px Times";
			txt = i;
			txtWidth = ctx.measureText(txt).width;
			ctx.fillText(txt, adjRingX-adjRingWidth/2-txtWidth/2, 40);
			
		}
	}
}

function writeAnswer() {
	var answerText = document.getElementById("answerText");
	var i;
	answerText.style.fontWeight = "900";
	answerText.style.fontFamily = "Times";
	answerText.style.fontSize = "16px";
	answerText.style.whiteSpace = "pre-line";
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
	hintText.style.fontFamily = "Times";
	hintText.style.fontWeight = "900";
	hintText.style.fontSize="12px";

	hintText.innerHTML = "Hint: Core is missing " + answer.absents.length + " rings and has ";
	hintText.innerHTML += answer.falses.length / 2 + " false ring(s).";
}


/*Mouse Action Functions*/

//If element has multiple mouse actions, determine which one to use
//Here, only used on userGraph
function handleClick(e) {
	var targ = e.target ? e.target : e.srcElement;

	//If top 1/3 of element, drag
	if(e.offsetY < targ.height / 3) {
		startDrag(e);
	}
	//If lower 1/3 of graph and outside of white margin, draw/erase
	else if (e.offsetY >= targ.height / 3 && e.offsetX >= 5*graphUnit) {
		if(appSettings.mouseMode == "Draw"){
			addMark(e);
		}
		else if (appSettings.mouseMode == "Erase"){
			removeMark(e);
		}
		drawGraphMarks();
	}	
}

function startDrag(e) {
    // IE uses srcElement, others use target
    var targ = e.target ? e.target : e.srcElement;
    document.dragTarg = targ;

    // calculate event X, Y coordinates
    offsetX = e.clientX;
    offsetY = e.clientY;

    // assign default values for top and left properties
    if(targ.style.left == "") { targ.style.left='0px'};
    if(targ.style.top == "") { targ.style.top='0px'};

    // calculate integer values for top and left 
    // properties
    coordX = parseInt(targ.style.left);
    coordY = parseInt(targ.style.top);
    // move element
    document.onmouseup = stopDrag;
    document.onmousemove=dragHoriz;

    return false;

}

function dragHoriz(e) {
    var targ = document.dragTarg;

    // move element
    targ.style.left=coordX+e.clientX-offsetX+'px';
    //Restrain element
    dragLimit(e);

    return false;
}

//Conforms dragged element to specific restraints
function dragLimit(e) {
	var targ = document.dragTarg;
	var frame = document.getElementById("appFrame");
	switch(targ) {
		//Keep graphs inside appFrame by 50px
		case document.getElementById("userGraph"):
		case document.getElementById("masterGraph"):
			if(parseInt(targ.style.left) > parseInt(frame.style.width) - 50) {
				targ.style.left=parseInt(frame.style.width) - 50 + "px";
			}
			if(parseInt(targ.style.left) < 50 - parseInt(targ.width)) {
				targ.style.left = 50 - parseInt(targ.width) + "px";
			}
		break;
		//Keep coreStrip anchored to middle of screen
		case document.getElementById("coreStrip"):
			if(parseInt(targ.style.left) > parseInt(frame.style.width) / 2) {
				targ.style.left=parseInt(frame.style.width) / 2 +"px";
			}
			if(parseInt(targ.style.left) < parseInt(frame.style.width) / 2 - parseInt(targ.width)) {
				targ.style.left = parseInt(frame.style.width) / 2 - parseInt(targ.width) + "px";
			}
		break;
	}
}

function stopDrag() {
    document.onmousemove = null;
    document.onmouseup = null;
    document.dragTarg = null;
}


/*Functions for mark Data*/

//Add a mark to array when userGraph is drawn on by user
function addMark(e) {
	var targ = e.target ? e.target : e.srcElement;

	switch(appSettings.mouseMark) {
		case "Normal":
			var newMark = {x:e.offsetX, y:e.offsetY};
			markData.userGraph.normal.push(newMark);
		break;
		case "Wide":
			var newMark = {x:e.offsetX};
			markData.userGraph.wide.push(newMark);
		break;
		case "Absent":
			var newMark = {x:e.offsetX};
			markData.userGraph.absent.push(newMark);
		break;
		case "False":
			var newMark = {x:e.offsetX};
			markData.userGraph.falses.push(newMark);
		break;
	}
}

//Remove mark from array when user erases userGraph mark
function removeMark(e){
	var targ = e.target ? e.target : e.srcElement;
	var bestArray = null;
	var bestIdx = 0;
	var bestNum = graphUnit;	//user must click within one graphUnit away from desired mark
	var i;

	//For each type of mark, sift through array and find closest mark. Save its index and array
	for(i = 0; i < markData.userGraph.normal.length; ++i) {
		if(Math.abs(e.offsetX - markData.userGraph.normal[i].x) < bestNum) {
			bestNum = Math.abs(e.offsetX - markData.userGraph.normal[i].x);
			bestArray = markData.userGraph.normal;
			bestIdx = i;
		}
	}

	for(i = 0; i < markData.userGraph.falses.length; ++i) {
		if(Math.abs(e.offsetX - markData.userGraph.falses[i].x) < bestNum) {
			bestNum = Math.abs(e.offsetX - markData.userGraph.falses[i].x);
			bestArray = markData.userGraph.falses;
			bestIdx = i;
		}
	}

	for(i = 0; i < markData.userGraph.wide.length; ++i) {
		if(Math.abs(e.offsetX - markData.userGraph.wide[i].x) < bestNum) {
			bestNum = Math.abs(e.offsetX - markData.userGraph.wide[i].x);
			bestArray = markData.userGraph.wide;
			bestIdx = i;
		}
	}

	for(i = 0; i < markData.userGraph.absent.length; ++i) {
		if(Math.abs(e.offsetX - markData.userGraph.absent[i].x) < bestNum) {
			bestNum = Math.abs(e.offsetX - markData.userGraph.absent[i].x);
			bestArray = markData.userGraph.absent;
			bestIdx = i;
		}
	}

	//If no mark is found, do nothing
	if(bestArray != null) {
		bestArray.splice(bestIdx, 1);
	}
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
			newX = (i+5)*graphUnit;
			newY = 0;	
		
			if(absoluteValueCutoff>1) {
				newY = 10 - index[i]/(1-(1-indexMin)/absoluteValueCutoff)*10;
			}
			if(firstDifferenceCutoff > 1 && index[i] < index[i-1]) {
				newY = Math.max(newY, 10-((index[i] - index[i-1]) - (indexMin-indexMax)) / 
					((indexMin-indexMax)/firstDifferenceCutoff-(indexMin-indexMax))*10);
			}
			newMark = {x:newX, y:newY*graphUnit, year:i+data.masterYearStart};
			masterNormal.push(newMark);

		}
		
	
		if(index[i] > masterBoneWideCutoff*indexMax) {
			newX = (5 + i)*graphUnit;
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
			if(appSettings.absents=="off") {
				index[year+absents]=0.06;
			}
			else if (year > Math.floor(coreStart*index.length) && year < Math.floor(coreStart*index.length) + appSettings.rings - 1 ){
				answer.absents.push(year + data.masterYearStart + absents);
				absents++;
			}
		}

		if(index[year+absents] >= 0.06 && index[year+absents < 0.15]) {
			index[year+absents] = 0.15;
		}

		//False rings; can't be first or last
		if(appSettings.falses == "on" && index[year+absents] > 1.95 && year > Math.floor(coreStart*index.length) &&
			Math.floor(coreStart*index.length) + appSettings.rings - 1 && falses == 0 && year- Math.floor(coreStart*index.length)%10 != 0 &&
			(year - Math.floor(coreStart*index.length)+1)%10 != 0) {
				falseYear = year;
				index[year+absents] = 2.00;
				answer.falses.push(falseYear - Math.floor(coreStart*index.length));
				answer.falses.push(falseYear - Math.floor(coreStart*index.length)+1);
				falses++;
		}

		//Adjust coreLength according to ring widths - if ring width is less than 3, it will be set to 3
		data.coreLength +=  Math.floor(index[year+absents]/2*data.targetRingWidth)+1 >=3 ? Math.floor(index[year+absents]/2*data.targetRingWidth)+1 : 3;
		
		//Randomly select latewood color
		var latewoodRandom = Math.random();
		var newColor;
		if(latewoodRandom > 0.85) {
			newColor = "darkLatewood";
		}
		else if(latewoodRandom < 0.15) {
			newColor = "lightLatewood";
		}
		else {
			newColor = "mediumLatewood";
		}
		color.push(newColor);
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
				newWidth = Math.floor(index[year+tempAbsent]/2*data.targetRingWidth/divisor)+1;
				if(newWidth < 3) {newWidth = 3};
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

				markData.coreStrip.ring.push({x:Math.floor(newX), width: Math.floor(newWidth), color:color[ring]});
			}
			ring++;
	}

	answer.yearEnd = answer.yearStart + appSettings.rings + absents - falses - 1;


}	





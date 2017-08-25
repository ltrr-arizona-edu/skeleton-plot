

//Functions for app settings, logic
function appInit(){
	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var coreStrip = document.getElementById("coreStrip");

	//Define global variables
	markData = {
		userGraph: { normal: [], 
					 falses: [], 
					 wide: [], 
					 absent: []
		},
		masterGraph: { normal: [],
					   wide: []
		},
		coreStrip: { ring: []
		}
	};
	
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
	 sensitivity: 9,
	 sensitivityNext: 9,
	 rings: 41,
	 ringsNext: 41
	};

	answer = {
		yearStart: 0,
		yearEnd: 0,
		falses: [1, 2],
		absents: [1, 2, 3]
	}

	//Position Elements
	userGraph.style.top = "190px";
	userGraph.style.left = "10px";

	masterGraph.style.top = masterGraph.style.top = parseInt(userGraph.style.top) + userGraph.height + "px";
	masterGraph.style.left = "10px";

	coreStrip.style.top = "134px";
	coreStrip.style.left = "10px";

	var newMark = {x:70, color: "lightLatewood", width:20};
			markData.coreStrip.ring.push(newMark);

	var newMark = {x:150, color: "darkLatewood", width:5};
	markData.coreStrip.ring.push(newMark);

	var newMark = {x:180, y:70};
	markData.masterGraph.normal.push(newMark);


	writeAnswer();
	writeHint();
	applySettings();
}

function restart(){
	//Position Elements
	appSettings.rings = appSettings.ringsNext;
	appSettings.sensitivity = appSettings.sensitivityNext;

	markData = {
		userGraph: { normal: [], 
					 falses: [], 
					 wide: [], 
					 absent: []
		},
		masterGraph: { normal: [],
					   wide: []
		},
		coreStrip: { ring: []
		}
	};

	userGraph.style.top = "190px";
	userGraph.style.left = "10px";

	masterGraph.style.top = masterGraph.style.top = parseInt(userGraph.style.top) + userGraph.height + "px";
	masterGraph.style.left = "10px";

	coreStrip.style.top = "134px";
	coreStrip.style.left = "10px";

	var newMark = {x:70, color: "lightLatewood", width:20};
			markData.coreStrip.ring.push(newMark);

	var newMark = {x:150, color: "darkLatewood", width:5};
	markData.coreStrip.ring.push(newMark);

	var newMark = {x:180, y:70};
	markData.masterGraph.normal.push(newMark);


	writeAnswer();
	writeHint();
	applySettings();
}

function applySettings() {
	var i;
	if(typeof graphUnit !== 'undefined'){graphUnitPrev = graphUnit;}

	switch(appSettings.absents) {

	}
	switch(appSettings.falses) {
		
	}
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

	switch(appSettings.mouseMode) {
		
	}
	switch(appSettings.mouseMark) {
		
	}
	switch(appSettings.hintVis) {
		case "Hidden":
			document.getElementById("hintText").style.visibility = "hidden";
		break;
		case "Visible":
			document.getElementById("hintText").style.visibility = "visible";
		break;
	}
	switch(appSettings.answerVis) {
		case "Hidden":
			document.getElementById("answerBox").style.visibility = "hidden";
		break;
		case "Visible":
			document.getElementById("answerBox").style.visibility = "visible";
		break;
	}
	switch(appSettings.masterVis) {
		case "Hidden":
			document.getElementById("masterGraph").style.visibility = "hidden";
		break;
		case "Visible":
			document.getElementById("masterGraph").style.visibility = "visible";
		break;
		
	}
	
	document.getElementById("sensitivityNumber").innerHTML = appSettings.sensitivityNext;
	document.getElementById("ringNumber").innerHTML = appSettings.ringsNext;

	scaleGraphs();
	drawCoreStrip();
}

function handleInputPress(e){
	var targ = e.target ? e.target : e.srcElement;

	switch(targ.type){
		case "checkbox":
			switch(targ.value) {
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
			switch(targ.name) {
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
			switch(targ.value) {
				case "     Hint     ":
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
				case " Master":
					if(appSettings.masterVis == "Hidden"){
						appSettings.masterVis = "Visible";
					}
					else{
						appSettings.masterVis = "Hidden";
					}
				break;
				case "‹": //FIXME:Add functionality for ringNo and sensitivity buttons
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
				break;
				case "›":
					if(targ == document.getElementById("increaseSensitivity")){
						if(appSettings.sensitivityNext < 9) {
							++appSettings.sensitivityNext;
						}
					}
					else if(targ == document.getElementById("increaseRings"))
						if(appSettings.ringsNext < 401) {
							appSettings.ringsNext += 10;
						}
				break;
			}
		break; 
	}

	if(targ.value == "Restart a New Core"){restart();}

	applySettings();
}

//Graphics Functions
function renderGraphPaper(canvas) {
	var height = canvas.height;
	var width = canvas.width;
	var mag = appSettings.graphMag;
	var ctx = canvas.getContext("2d");
	var i, txt, txtWidth;

	ctx.lineWidth = 1;

	for (i = graphUnit*5; i < width; i+=graphUnit) {
		ctx.beginPath();
		ctx.moveTo(i+.5, 0);
		ctx.lineTo(i+.5, height);
		if((i/graphUnit)%5 == 0) {
			ctx.strokeStyle = "rgb(000,204,051)"
		}
		else {
			ctx.strokeStyle = "rgb(102,255,102)";
		}
		ctx.stroke();
		ctx.closePath();
	}

	for (i = 0; i < height; i+=graphUnit) {
		ctx.beginPath();
		ctx.moveTo(graphUnit*5, i+.5);
		ctx.lineTo(width, i+.5);
		if((i/graphUnit)%5 == 0) {
			ctx.strokeStyle = "rgb(000,204,051)"
		}
		else {
			ctx.strokeStyle = "rgb(102,255,102)";
		}
		ctx.stroke();
		ctx.closePath();
	}

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

	//Draw Margin Markers
	switch(canvas){
		case document.getElementById("userGraph"):
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
		break;
		case document.getElementById("masterGraph"):
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(graphUnit*5, graphUnit*10 + .5);
			ctx.lineTo(width, graphUnit*10 + .5);
			ctx.moveTo(graphUnit*5, graphUnit*20 + .5);
			ctx.lineTo(width, graphUnit*20 + .5);
			ctx.strokeStyle = "rgb(0,0,0)";
			ctx.stroke();
			ctx.closePath();
		break;
	}

	for (i=graphUnit*5; i<width; i+=10*graphUnit) {
		ctx.font = "italic bold 15px Times";
		txt = i/graphUnit - 5;
		txtWidth = ctx.measureText(txt).width;
		ctx.fillText(txt, i-txtWidth/2, 4*graphUnit + 5);
	}
}

function scaleGraphs(){
	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var i;

	if(typeof graphUnitPrev === 'undefined') {
		graphUnitPrev = graphUnit;
	}

	//Modify userGraph dimensions
	userGraph.height = graphUnit*15 + 1;
	//userGraph must be long enough for all rings, the margin on left, and 3 large blocks to right
	userGraph.width = graphUnit*(appSettings.rings-1) + graphUnit*20;

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
	masterGraph.height = graphUnit*25 + 1;
	masterGraph.width = graphUnit*400 + 20;

	//Reposition Graphs
	

	
	masterGraph.style.top = parseInt(userGraph.style.top) + userGraph.height + "px";
	console.log(masterGraph.style["top"]);

	redraw();
}

function redraw(){
	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var ctxU = userGraph.getContext("2d");
	var ctxM = masterGraph.getContext("2d");
	var i, txt, txtWidth;

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
}

function drawCoreStrip() {
	var coreStrip =document.getElementById("coreStrip");
	var ctx = coreStrip.getContext("2d");
	var i, txt, txtWidth;
	var adjRingWidth, adjRingX;
	coreStrip.height = 40;
	coreStrip.width = 500 * parseInt(appSettings.coreMag);
	
	ctx.clearRect(0, 0, coreStrip.width, coreStrip.height);

	ctx.lineWidth = 1;
	ctx.rect(10.5,10.5,coreStrip.width - 20,20);
	ctx.strokeStyle="rgb(0,0,0)";
	ctx.stroke();
	ctx.fillStyle="rgb(255,255,41)";
	ctx.fillRect(11.5,11.5,coreStrip.width-22,18);

	for(i = 0; i < markData.coreStrip.ring.length; ++i) {
		adjRingX = markData.coreStrip.ring[i].x * parseInt(appSettings.coreMag);
		adjRingWidth = markData.coreStrip.ring[i].width * parseInt(appSettings.coreMag);

		switch(markData.coreStrip.ring[i].color) {
			case "earlyWood":
				ctx.fillStyle="rgb(255,255,051)"
			break;
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
		ctx.fillRect(adjRingX-adjRingWidth+.5, 11, adjRingWidth, 19);
		ctx.moveTo(adjRingX+.5, 10);
		ctx.lineTo(adjRingX+.5, 30);
		ctx.stroke();
		ctx.closePath();
		
	}
}
function writeAnswer() {
	var answerText = document.getElementById("answerText");
	var i;
	answerText.style.fontWeight = "900";
	answerText.style.whiteSpace = "pre-line";
	answerText.innerHTML = "All of these are part of the answer:\n";
	answerText.innerHTML += "Start year: " + answer.yearStart + "\n";
	answerText.innerHTML += "Absent rings: ";
	for(i = 0; i < answer.absents.length; ++i) {
		answerText.innerHTML += answer.absents[i] + " ";
	}
	answerText.innerHTML += "\n";
	answerText.innerHTML += "False rings: "
	if(answer.falses.length != 0 ) {
		answerText.innerHTML += "Rings " + answer.falses[0] + " & " + answer.falses[1] +" are 1 ring"
	}
	answerText.innerHTML += "\n"
	answerText.innerHTML += "End year: " + answer.yearEnd;
}

function writeHint() {
	var hintText = document.getElementById("hintText");
	hintText.style.fontWeight = "900";
	hintText.style.fontSize="12px";
	hintText.innerHTML = "Hint: Core is missing " + appSettings.absents.length + " rings and has ";
	hintText.innerHTML += appSettings.falses.length + " false ring(s).";

}




//Mouse Action Functions
function handleClick(e) {
	var targ = e.target ? e.target : e.srcElement;

	if(e.offsetY < targ.height / 3) {
		startDrag(e);
	}
	else if (e.offsetY >= targ.height / 3 && e.offsetX > 5*graphUnit) {
		if(appSettings.mouseMode == "Draw"){
			addMark(e);
		}
		else if (appSettings.mouseMode == "Erase"){
			removeMark(e);
		}
		redraw();
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

    if (targ == document.getElementById("coreStrip")){ document.onmousemove = dragHorizLimited;}
    else {document.onmousemove=dragHoriz;}

    return false;

}

function dragHoriz(e) {
    var targ = document.dragTarg;

    // move element
    targ.style.left=coordX+e.clientX-offsetX+'px';
    return false;
}

function dragHorizLimited(e) {
	var targ = document.dragTarg;

    // move element
    if(parseInt(coordX+e.clientX-offsetX) <= 381 && parseInt(coordX+e.clientX-offsetX) + parseInt(targ.width) >= 379){
    	targ.style.left=coordX+e.clientX-offsetX+'px';
	}
	if(parseInt(targ.style.left) > 381) {
		targ.style.left="380px";
	}
	if(parseInt(targ.style.left) < 379 - parseInt(targ.width)) {
		targ.style.left = 380 - parseInt(targ.width) + "px";
	}
	
    return false;

}

function stopDrag() {
    document.onmousemove = null;
    document.onmouseup = null;
    document.dragTarg = null;
}


//Functions for mark Data


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



function removeMark(e){
	var targ = e.target ? e.target : e.srcElement;
	var bestArray = null;
	var bestIdx = 0;
	var bestNum = graphUnit;
	var i;

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


	if(bestArray != null) {
		bestArray.splice(bestIdx, 1);
	}
}









/*Render Graph Paper*/



/*	TODO:
	- Create Core Strip
	- Core strip mag
	- Add Answer and hint
	- Enable functionality for drawing marks on master
	- Add Extra markings on master graph paper
	- Enable Master visibility functionality
	- Draw false and absents	
	- Enable sensitivity / ring number functionality
	- Put in actual algorithms
	- Add browser status*/



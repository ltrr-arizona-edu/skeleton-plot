function appInit(){

	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var answerTxt = document.getElementById("answer");

	/*Define global variables*/
	//data for the marks to be rendered on canvases
	markData = {
		userGraph: { normal: [], //Members: x, y
					 wide: [],   //Members: x
		},
		masterGraph: { normal: [],	//Members: x, y
					   wide: [],	//Members: x
					   index: []	//Members:
		},
	};
	
	//Corresponds to settings in control panel
	appSettings = {
	 sensitivity: 1,
	 rings: 31,
	};

	//Values to be displayed
	answer = {
		yearStart: 0,
		yearEnd: 0,
	}

	//misc global variables
	data = {
		masterLengthFactor: 2,
		masterYearStart: 0,
		targetRingWidth: 50,
	}

	graphUnit = 6;

	//Position draggable elements
	answerTxt.style.left = "45px";
	answerTxt.style.top = "30px";

	userGraph.style.left = "15px";
	userGraph.style.top = "50px";

	populateRings();
	renderGraphPaper(userGraph);
	renderGraphPaper(masterGraph);
	writeAnswer("undershoot");
	redraw();
}

function renderGraphPaper(canvas) {
	var height = canvas.height;
	var width = canvas.width;
	var mag = appSettings.graphMag;
	var ctx = canvas.getContext("2d");
	var i, txt, txtWidth, temp;

	if(canvas == document.getElementById("userGraph")) {
	//highlight upper 1/3 in grey
		ctx.beginPath();
		ctx.fillStyle = "rgb(204,204,204)";
		ctx.fillRect(0,0, width, height/3);
		ctx.closePath();
	}

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

	

	//Draw Dark Green Lines
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
			//Write Ring Numbers
			for (i=graphUnit*5; i<width; i+=10*graphUnit) {
				ctx.font = "italic bold 15px Times";
				ctx.fillStyle = "rgb(0,0,0)";
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
function redraw(){

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
		ctxU.moveTo(markData.userGraph.normal[i].x+.5, Math.floor(userGraph.height - markData.userGraph.normal[i].y ) -.5);
		ctxU.lineTo(markData.userGraph.normal[i].x+.5, userGraph.height);
		ctxU.strokeStyle = "rgb(0,0,0)";
		ctxU.stroke();
		ctxU.closePath();
	}

	for(i = 0; i < markData.masterGraph.normal.length; ++i) {
		ctxM.beginPath();
		ctxM.moveTo(markData.masterGraph.normal[i].x+.5, markData.masterGraph.normal[i].y+1.5);
		ctxM.lineTo(markData.masterGraph.normal[i].x+.5, 0);
		ctxM.strokeStyle = "rgb(0,0,0)";
		ctxM.stroke();
		ctxM.closePath();
	}

	//Wide Marks
	for(i = 0; i < markData.userGraph.wide.length; ++i) {
		ctxU.font = "bold 16px Times  ";
		ctxU.fillStyle = "rgb(0,0,0)";
		txt = "b";
		txtWidth = ctxU.measureText(txt).width;
		ctxU.fillText(txt, markData.userGraph.wide[i].x - txtWidth/2, 6.5*graphUnit);
	}

	for(i = 0; i < markData.masterGraph.wide.length; ++i) {
		ctxM.font = "bold 16px Times";
		ctxM.fillStyle = "rgb(0,0,0)";
		txt = "b";
		txtWidth = ctxM.measureText(txt).width;
		ctxM.fillText(txt, markData.masterGraph.wide[i].x - txtWidth/2, 9.5*graphUnit);
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

function populateRings() {
	var i, masterYearStartSeed, coreStart, newMark, newMarkUser, newX, newY, newWidth, year, falseYear;
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

	coreStart = Math.random() * 0.75 + 0.05;
	answer.yearStart = data.masterYearStart + Math.floor(coreStart*index.length);

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

			//Make marks on userGraph
			if(i >= Math.floor(coreStart*index.length) && i < Math.floor(coreStart * index.length) + appSettings.rings) {
				newX = ((i-Math.floor(coreStart*index.length) + 5) * graphUnit);
				newMarkUser = {x:newX, y:newY*graphUnit};
				markData.userGraph.normal.push(newMarkUser);
			}
			
			

		}
		
	
		if(index[i] > masterBoneWideCutoff*indexMax) {
			newX = (5 + i)*graphUnit;
			markData.masterGraph.wide.push({x:newX});

			//Make marks on userGraph
			if(i >= Math.floor(coreStart*index.length) && i < Math.floor(coreStart * index.length) + appSettings.rings) {
				newX = ((i-Math.floor(coreStart*index.length) + 5) * graphUnit);
				markData.userGraph.wide.push({x:newX});
			}

		}

	}


}

function checkAnswer() {
	var userGraphLeft = parseInt(document.getElementById("userGraph").style.left);
	var masterGraphLeft = parseInt(document.getElementById("masterGraph").style.left);
	var tolerance = 0.75;

	if((userGraphLeft - masterGraphLeft)/graphUnit > answer.yearStart - data.masterYearStart - tolerance) {
		if((userGraphLeft - masterGraphLeft)/graphUnit < answer.yearStart - data.masterYearStart + tolerance) {
			writeAnswer("correct");
		}
	}

	if((userGraphLeft - masterGraphLeft)/graphUnit < answer.yearStart - data.masterYearStart - tolerance) {
		writeAnswer("undershoot");
	}

	if((userGraphLeft - masterGraphLeft)/graphUnit > answer.yearStart - data.masterYearStart + tolerance) {
		writeAnswer("overshoot");
	}
}

function writeAnswer(position) {
	var answerTxt = document.getElementById("answer");

	switch(position) {
		case "undershoot":
			answerTxt.style.color = "rgb(0,0,255)";
			answerTxt.innerHTML = "No match here.";
		break;
		case "overshoot":
			answerTxt.style.color = "rgb(255,0,255)";
			answerTxt.innerHTML = "No match here.";
		break;
		case "correct":
			answerTxt.style.color = "rgb(255,0,0)";
			answerTxt.innerHTML = "Here's the match!";
		break;
	}
}

//Mouse Action Functions
function handleClick(e) {
	var targ = e.target ? e.target : e.srcElement;

	if(e.offsetY < targ.height / 3) {
		startDrag(e);
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
	var answer = document.getElementById("answer");
    var targ = document.dragTarg;

    // move element AND answer text
    targ.style.left=coordX+e.clientX-offsetX+'px';
    answer.style.left = coordX+e.clientX-offsetX+5*graphUnit+'px';

    limitDrag(e);

    checkAnswer();



    return false;
}

function limitDrag(e) {

   var targ = document.dragTarg;
	if(parseInt(targ.style.left) + parseInt(targ.width) < 50) {	
		targ.style.left=50 - parseInt(targ.width) + "px";
	}
	if(parseInt(targ.style.left) > 420){
		targ.style.left =  "420px";
	}

    return false;

}

function stopDrag() {

    document.onmousemove = null;
    document.onmouseup = null;
    document.dragTarg = null;
}


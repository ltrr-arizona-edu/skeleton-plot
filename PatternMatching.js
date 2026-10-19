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

	Skel.initCanvas(userGraph);
	Skel.initCanvas(masterGraph);

	populateRings();
	renderGraphPaper(userGraph);
	renderGraphPaper(masterGraph);
	writeAnswer("undershoot");
	redraw();
}

function renderGraphPaper(canvas) {
	var height = Skel.height(canvas);
	var width = Skel.width(canvas);
	var ctx = canvas.getContext("2d");

	if(canvas == document.getElementById("userGraph")) {
	//highlight upper 1/3 in grey
		ctx.beginPath();
		ctx.fillStyle = "rgb(204,204,204)";
		ctx.fillRect(0,0, width, height/3);
		ctx.closePath();
	}

	//Leave 5 units for margin
	Skel.drawGrid(ctx, graphUnit*5, width, height, graphUnit);

	//Draw special margins; depend on which graph it is
	switch(canvas){
		case document.getElementById("userGraph"):
			Skel.drawRingNumbers(ctx, graphUnit*5, width, graphUnit, "italic bold 15px Times");
		break;
		case document.getElementById("masterGraph"):
			Skel.drawMasterAxes(ctx, width, graphUnit, data.masterYearStart, "italic bold 15px Times");
		break;
	}
}
function redraw(){

	var userGraph = document.getElementById("userGraph");
	var masterGraph = document.getElementById("masterGraph");
	var ctxU = userGraph.getContext("2d");
	var ctxM = masterGraph.getContext("2d");
	var userHeight = Skel.height(userGraph);
	var i;

	ctxU.clearRect(0, 0, Skel.width(userGraph), userHeight);
	renderGraphPaper(userGraph);

	ctxM.clearRect(0, 0, Skel.width(masterGraph), Skel.height(masterGraph));
	renderGraphPaper(masterGraph);

	//Make normal marks: user marks rise from the bottom, master marks hang from the top
	ctxU.lineWidth = 3;
	for(i = 0; i < markData.userGraph.normal.length; ++i) {
		Skel.drawBar(ctxU, markData.userGraph.normal[i].x+.5, Math.floor(userHeight - markData.userGraph.normal[i].y) -.5, userHeight);
	}

	ctxM.lineWidth = 3;
	for(i = 0; i < markData.masterGraph.normal.length; ++i) {
		Skel.drawBar(ctxM, markData.masterGraph.normal[i].x+.5, markData.masterGraph.normal[i].y+1.5, 0);
	}

	//Wide Marks
	for(i = 0; i < markData.userGraph.wide.length; ++i) {
		Skel.drawWideMark(ctxU, markData.userGraph.wide[i].x, 6.5*graphUnit, "bold 16px Times");
	}

	for(i = 0; i < markData.masterGraph.wide.length; ++i) {
		Skel.drawWideMark(ctxM, markData.masterGraph.wide[i].x, 9.5*graphUnit, "bold 16px Times");
	}

	//Master Index Plot
	Skel.drawIndexPlot(ctxM, markData.masterGraph.index, graphUnit);
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

//Pointer Action Functions (mouse, touch and pen)
function handleClick(e) {
	//Drag by the grey top third
	if(Skel.position(e).y < Skel.height(e.currentTarget) / 3) {
		startDrag(e);
	}
}

function startDrag(e) {
	Skel.dragHoriz(e, function(targ, left) {
		// move element AND answer text
		targ.style.left = left + "px";
		document.getElementById("answer").style.left = left + 5*graphUnit + "px";
		limitDrag(targ);
		checkAnswer();
	});
}

function limitDrag(targ) {
	if(parseInt(targ.style.left) + Skel.width(targ) < 50) {	
		targ.style.left = 50 - Skel.width(targ) + "px";
	}
	if(parseInt(targ.style.left) > 420){
		targ.style.left =  "420px";
	}
}

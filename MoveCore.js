

function appInit(){
	var coreStrip = document.getElementById("coreStrip");

	/*Define global variables*/
	//data for the marks to be rendered on canvases
	markData = {
		coreStrip: { ring: []		//Members: x, width, color
		}
	};
	
	//Corresponds to settings in control panel
	appSettings = {
	 sensitivity: 1,
	 rings: 101,
	};

	data = {
		masterLengthFactor: 6,
		masterYearStart: 0,
		targetRingWidth: 50,
		coreLength: 0
	}

	
	populateRings();
	drawCoreStrip();
}

function populateRings() {
	var i, masterYearStartSeed, coreStart, newMark, newX, newY, newWidth, year, falseYear;
	var color = [];
	var coreLength = 0;
	var index = [];
	var indexMin = 100;
	var indexMax = 0;
	var absoluteValueCutoff = 2;
	var firstDifferenceCutoff = 2;
	var masterBoneWideCutoff = 0.95;
	

	index.length = appSettings.rings;

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

	//Populate Core
	

	for(i = 0; i < appSettings.rings; ++i){
		data.coreLength +=  Math.floor(index[i]/2*data.targetRingWidth)+1 >=3 ? Math.floor(index[i]/2*data.targetRingWidth)+1 : 3;
		
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

	var ring = 0;
	var newX = 0;
	var adjIndex;
	while(ring < appSettings.rings){
				newWidth = Math.floor(index[ring]/2*data.targetRingWidth)+1;
				if(newWidth < 3) {newWidth = 3};
				if(markData.coreStrip.ring.length > 0) {
					newX = markData.coreStrip.ring[ring-1].x + Math.floor(newWidth);
				}
				else {newX = Math.floor(newWidth);}

				markData.coreStrip.ring.push({x:Math.floor(newX), width: Math.floor(newWidth), color:color[ring]});
			
			ring++;

	}
}	

function drawCoreStrip() {
	var coreStrip =document.getElementById("coreStrip");
	var ctx = coreStrip.getContext("2d");
	var coreEdge1, coreEdge2;
	var i, txt, txtWidth;
	var adjRingWidth, adjRingX; 

	coreStrip.height = 40;
	coreStrip.width = 20 + data.coreLength;
	
	coreEdge1 = 10; coreEdge2 = coreStrip.width-20;

	ctx.clearRect(0, 0, coreStrip.width, coreStrip.height);

	ctx.lineWidth = 1;
	ctx.rect(10.5,10.5,coreStrip.width - 20,20);
	ctx.strokeStyle="rgb(0,0,0)";
	ctx.stroke();
	ctx.fillStyle="rgb(255,255,41)";
	ctx.fillRect(11.5,11.5,coreStrip.width-22,18);


	for(i = 0; i < markData.coreStrip.ring.length; ++i) {
		adjRingX = markData.coreStrip.ring[i].x + 10;
		adjRingWidth = markData.coreStrip.ring[i].width
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
		if(adjRingWidth < 3) {
			console.log(adjRingWidth);
		}
		ctx.fillRect(Math.floor(adjRingX-adjRingWidth*0.25), 11, Math.floor(adjRingWidth*0.25)+1, 19);
		ctx.moveTo(adjRingX+.5, 10);
		ctx.lineTo(adjRingX+.5, 30);
		ctx.stroke();
		ctx.closePath();
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
    var appFrame = document.getElementById("appFrame");



    // move element

    if(parseInt(coordX+e.clientX-offsetX) <= 580 && parseInt(coordX+e.clientX-offsetX) + parseInt(targ.width) >= 20){
    	targ.style.left=coordX+e.clientX-offsetX+'px';

	}
	




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

	var targ = document.dragTarg;
	if(parseInt(targ.style.left) + parseInt(targ.width) < 50) {	
		targ.style.left=50 - parseInt(targ.width) + "px";
	}
	if(parseInt(targ.style.left) > 550) {
		targ.style.left =  "550px";
	}


    document.onmousemove = null;
    document.onmouseup = null;
    document.dragTarg = null;

}
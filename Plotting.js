function appInit1(){

	var userGraph = document.getElementById("userGraph1");
	var coreStrip = document.getElementById("coreStrip");

	/*Define global variables*/
	//data for the marks to be rendered on canvases
	markData1 = {
		userGraph: { normal: [], //Members: x, y
					 wide: []   //Members: x
		},
		index: {all: [],		//index holds all marks, and keeps track of which ones the demo will point to
				narrow: -1,
				medium: -1,
				wide: -1
		},
		coreStrip: { ring: []		//Members: x, width, color
		},
		overlay: {
			narrow: {
				start: {
					x:0,
					y:0
				},
				end: {
					x:0,
					y:0
				}
			},
			medium: {
				start: {
					x:0,
					y:0
				},
				end: {
					x:0,
					y:0
				}
			},
			wide: {
				start: {
					x:0,
					y:0
				},
				end: {
					x:0,
					y:0
				}
			}
		}	
	};
	
	//Corresponds to settings in control panel
	appSettings = {
	 sensitivity: 5,
	 rings: 21,
	};

	//Values to be displayed

	//misc global variables
	data = {
		masterLengthFactor: 6,
		masterYearStart: 0,
		targetRingWidth: 50,
		coreLength: 0
	};

	graphUnit = 8;

	Skel.initCanvas(userGraph);
	Skel.initCanvas(document.getElementById("overlay"));

	populateRings();
	drawCoreStrip();
	renderGraphPaper1(userGraph);
	redraw1();
}

function drawCoreStrip() {
	var coreStrip = document.getElementById("coreStrip");

	//Start over with new rings if this core will not fit in the 600px frame
	if(20 + data.coreLength >= 600) {
		appInit1();
		return;
	}

	Skel.drawCoreStrip(coreStrip, markData1.coreStrip.ring, data.coreLength, 1);
	coreStrip.style.left = Math.floor(0.5 * (600 - Skel.width(coreStrip))) + "px";
}

function renderGraphPaper1(canvas) {
	var height = Skel.height(canvas);
	var width = Skel.width(canvas);
	var ctx = canvas.getContext("2d");

	//Leave 5 units for margin
	Skel.drawGrid(ctx, graphUnit*5, width, height, graphUnit);
	Skel.drawRingNumbers(ctx, graphUnit*5, width, graphUnit, "italic bold 15px Times");
}

function redraw1(){
	var userGraph = document.getElementById("userGraph1");
	var coreStrip = document.getElementById("coreStrip");
	var overlay = document.getElementById("overlay");
	var ctxU = userGraph.getContext("2d");	
	var ctxO = overlay.getContext("2d");
	var i;

	var userHeight = Skel.height(userGraph);
	var coreBottom = Skel.height(coreStrip) - 10 + parseInt(coreStrip.style.top);

	ctxU.clearRect(0, 0, Skel.width(userGraph), userHeight);
	renderGraphPaper1(userGraph);


	//Make normal marks, rising from the bottom
	ctxU.lineWidth = 3;
	for(i = 0; i < markData1.userGraph.normal.length; ++i) {
		Skel.drawBar(ctxU, markData1.userGraph.normal[i].x+.5, Math.floor(userHeight - markData1.userGraph.normal[i].y) -.5, userHeight);
	}

	for(i = 0; i < markData1.userGraph.wide.length; ++i) {
		Skel.drawWideMark(ctxU, markData1.userGraph.wide[i].x, 6.5*graphUnit, "bold 16px Times");
	}

	//Draw on Overlay

	ctxO.clearRect(0, 0, Skel.width(overlay), Skel.height(overlay));

	markData1.overlay.narrow.start.y = coreBottom;
	markData1.overlay.medium.start.y = coreBottom;
	markData1.overlay.wide.start.y = coreBottom;


	markData1.overlay.narrow.start.x = markData1.coreStrip.ring[markData1.index.narrow].x - .5*markData1.coreStrip.ring[markData1.index.narrow].width + parseInt(coreStrip.style.left) + 10;
	markData1.overlay.medium.start.x = markData1.coreStrip.ring[markData1.index.medium].x - .5*markData1.coreStrip.ring[markData1.index.medium].width + parseInt(coreStrip.style.left) + 10;
	markData1.overlay.wide.start.x = markData1.coreStrip.ring[markData1.index.wide].x - .5*markData1.coreStrip.ring[markData1.index.wide].width + parseInt(coreStrip.style.left) + 10;
	

	markData1.overlay.narrow.end.y = graphUnit * 5 + 1 + parseInt(userGraph.style.top);
	markData1.overlay.medium.end.y = graphUnit * 5 + 1 + parseInt(userGraph.style.top);
	markData1.overlay.wide.end.y = graphUnit * 5 + 1 + parseInt(userGraph.style.top);
	

	for(i=0; i < markData1.userGraph.normal.length; ++i) {
		if( markData1.userGraph.normal[i].y > 70) {
			markData1.overlay.narrow.end.x = markData1.userGraph.normal[i].x + parseInt(userGraph.style.left);
		}
	}

	
	for(i=0; i < markData1.userGraph.normal.length; ++i) {
		if( markData1.index.medium > (markData1.userGraph.normal[i].x)/graphUnit - 5 - 1 && markData1.index.medium < (markData1.userGraph.normal[i].x)/graphUnit - 5 + 1)  {
			markData1.overlay.medium.end.x = markData1.userGraph.normal[i].x + parseInt(userGraph.style.left);
		}
		
	}
	 
	markData1.overlay.wide.end.x = markData1.userGraph.wide[0].x + parseInt(userGraph.style.left);

	ctxO.lineWidth = 1;

	ctxO.beginPath();
	ctxO.moveTo(markData1.overlay.narrow.start.x, markData1.overlay.narrow.start.y);
	ctxO.lineTo(markData1.overlay.narrow.end.x, markData1.overlay.narrow.end.y);
	ctxO.strokeStyle = "rgb(0,0,255)";
	
	ctxO.stroke();
	ctxO.closePath();

	ctxO.beginPath();
	ctxO.moveTo(markData1.overlay.medium.start.x, markData1.overlay.medium.start.y);
	ctxO.lineTo(markData1.overlay.medium.end.x, markData1.overlay.medium.end.y);
	ctxO.strokeStyle = "rgb(255,0,0)";
	ctxO.stroke();
	ctxO.closePath();

	ctxO.beginPath();
	ctxO.moveTo(markData1.overlay.wide.start.x, markData1.overlay.wide.start.y);
	ctxO.lineTo(markData1.overlay.wide.end.x, markData1.overlay.wide.end.y);
	ctxO.strokeStyle = "rgb(0,255,0)";
	ctxO.stroke();
	ctxO.closePath();

}

function populateRings() {
	var i, masterYearStartSeed, coreStart, newMark, newX, newY, newWidth, year, falseYear;
	var color = [];
	var falses = 0; var absents = 0;
	var coreLength = 0;
	var index = markData1.index;
	var indexMin = 100;
	var indexMax = 0;
	var absoluteValueCutoff = 2;
	var firstDifferenceCutoff = 2;
	var masterBoneWideCutoff = 0.95;
	var numMinPixel = 0;
	
	//Set index
	index.all.length = appSettings.rings;

	//Randomly choose wide, narrow, and medium indices
	index.narrow = Math.floor(Math.random() * appSettings.rings);
	
	do {
		index.medium = Math.floor(Math.random() * appSettings.rings);
	} while(markData1.index.medium == markData1.index.narrow);
	
	do {
		index.wide = Math.floor(Math.random() * appSettings.rings);
	} while(markData1.index.wide == markData1.index.medium || markData1.index.wide == markData1.index.narrow);

	//Randomly set ring widths
	for(i = 0; i < index.all.length; ++i) {
		if(i == markData1.index.narrow) {
			index.all[i] = 0.06;
		}
		else if (i == markData1.index.medium) {
			index.all[i] = 2 * 0.215;
		}
		else if (i == markData1.index.wide) {
			index.all[i] = 2;
		}
		else {
			index.all[i] = 0;
			//Width is averaged according to sensitivity
			for(var replicate = 0; replicate<appSettings.sensitivity; ++replicate){
				index.all[i] += Math.random()*1.8 + 0.1;
			}
			index.all[i] /= appSettings.sensitivity;
		}
		//Keep track of maximum and minimum indices
		if(index.all[i] < indexMin) {
			indexMin = index.all[i];
		}
		else if (index.all[i] > indexMax) {
			indexMax = index.all[i];
		}	
	}
	

	for(i = 0; i < index.all.length; ++i) {
		if( index.all[i] < (1-(1-indexMin)/absoluteValueCutoff) ||
			index.all[i]-index.all[i-1] < (indexMin-indexMax)/firstDifferenceCutoff){
			newX = (i+5)*graphUnit;
			newY = 0;	
		
			if(absoluteValueCutoff>1) {
				newY = 10 - index.all[i]/(1-(1-indexMin)/absoluteValueCutoff)*10;
			}
			if(firstDifferenceCutoff > 1 && index.all[i] < index.all[i-1]) {
				newY = Math.max(newY, 10-((index.all[i] - index.all[i-1]) - (indexMin-indexMax)) / 
					((indexMin-indexMax)/firstDifferenceCutoff-(indexMin-indexMax))*10);
			}
		
			newMark = {x:newX, y:newY*graphUnit};
			
			markData1.userGraph.normal.push(newMark);
		
		}
		
	
		if(index.all[i] > masterBoneWideCutoff*indexMax) {
			newX = (5 + i)*graphUnit;
			markData1.userGraph.wide.push({x:newX});
		}

	}

	//Populate Core
	

	for(ring = 0; ring < appSettings.rings; ++ring){
		//mising rings; can't be first or last


		data.coreLength += Skel.ringWidth(index.all[ring], data.targetRingWidth);
		color.push(Skel.randomLatewood());
	}

	var tempFalses = 0;
	var tempAbsent = 0;
	var ring = 0;
	var newX = 0;
	var adjIndex;

	while(ring < appSettings.rings){

			
				newWidth = Skel.ringWidth(index.all[ring], data.targetRingWidth);
				if(markData1.coreStrip.ring.length > 0) {
				
					newX = markData1.coreStrip.ring[ring - 1].x + Math.floor(newWidth);
				
				}
				else {newX = Math.floor(newWidth);}

				markData1.coreStrip.ring.push({x:Math.floor(newX), width: Math.floor(newWidth), color:color[ring]});
				
			ring++;
	}
}	
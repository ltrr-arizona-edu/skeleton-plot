function appInit1(){

	var userGraph = document.getElementById("userGraph1");
	var coreStrip = document.getElementById("coreStrip");

	/*Define global variables*/
	//data for the marks to be rendered on canvases
	markData = {
		userGraph: { normal: [], //Members: x, y
					 wide: []   //Members: x
		},
		index: {all: [],
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


	populateRings();
	drawCoreStrip();
	renderGraphPaper1(userGraph);
	redraw1();
}

function drawCoreStrip() {
	var coreStrip =document.getElementById("coreStrip");
	var ctx = coreStrip.getContext("2d");
	var coreEdge1, coreEdge2;
	var i, txt, txtWidth;
	var adjRingWidth, adjRingX, prevMag;


	coreStrip.height = 40;
	coreStrip.width = 20 + data.coreLength;
	
	if(coreStrip.width >= 600) {appInit1();}
	coreStrip.style.left = Math.floor(0.5 * (600-coreStrip.width));

	coreEdge1 = 10; coreEdge2 = coreStrip.width-20;

	ctx.clearRect(0, 0, coreStrip.width, coreStrip.height);

	ctx.lineWidth = 1;
	ctx.rect(10.5,10.5,coreStrip.width - 20,20);
	ctx.strokeStyle="rgb(0,0,0)";
	ctx.stroke();
	ctx.fillStyle="rgb(255,255,41)";
	ctx.fillRect(11.5,11.5,coreStrip.width-22,18);


	for(i = 0; i < markData.coreStrip.ring.length; ++i) {
		adjRingX = markData.coreStrip.ring[i].x + 10;;
		adjRingWidth = markData.coreStrip.ring[i].width;

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

function renderGraphPaper1(canvas) {
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
		if((i/graphUnit)%5 == 0) {	//Draw dark green line
			ctx.strokeStyle = "rgb(000,204,051)"
		}
		else {	//Draw light green line
			ctx.strokeStyle = "rgb(102,255,102)";
		}
		ctx.stroke();
		ctx.closePath();
	}

	//Draw horizontal lines
	for (i = 0; i < height; i+=graphUnit) {
		ctx.beginPath();
		ctx.moveTo(graphUnit*5, i+.5);	//Leave room for margin
		ctx.lineTo(width, i+.5);
		if((i/graphUnit)%5 == 0) {	//Dark green lines
			ctx.strokeStyle = "rgb(000,204,051)"
		}
		else {	//Light green lines
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

	

	//Write Ring Numbers
	for (i=graphUnit*5; i<width; i+=10*graphUnit) {
		ctx.font = "italic bold 15px Times";
		txt = i/graphUnit - 5;
		txtWidth = ctx.measureText(txt).width;
		ctx.fillText(txt, i-txtWidth/2, 4*graphUnit + 5);
	}
		
}

function redraw1(){
	var userGraph = document.getElementById("userGraph1");
	var coreStrip = document.getElementById("coreStrip");
	var overlay = document.getElementById("overlay");
	var ctxU = userGraph.getContext("2d");	
	var ctxO = overlay.getContext("2d");
	var i, txt, txtWidth, x, y;

	ctxU.clearRect(0, 0, userGraph.width, userGraph.height);
	renderGraphPaper1(userGraph);


	//Make normal marks

	ctxU.lineWidth = 3;

	for(i = 0; i < markData.userGraph.normal.length; ++i) {
		ctxU.beginPath();
		ctxU.moveTo(markData.userGraph.normal[i].x-.5, Math.floor(userGraph.height - markData.userGraph.normal[i].y ) -.5);
		ctxU.lineTo(markData.userGraph.normal[i].x-.5, userGraph.height);
		ctxU.strokeStyle = "rgb(0,0,0)";
		ctxU.stroke();
		ctxU.closePath();
	}

	for(i = 0; i < markData.userGraph.wide.length; ++i) {
		ctxU.font = "bold 16px Times  ";
		txt = "b";
		txtWidth = ctxU.measureText(txt).width;
		ctxU.fillText(txt, markData.userGraph.wide[i].x - txtWidth/2, 6.5*graphUnit);
	}

	//Draw on Overlay

	ctxO.clearRect(0,0,overlay.width,overlay.height);

	markData.overlay.narrow.start.y = coreStrip.height - 10 + parseInt(coreStrip.style.top);
	markData.overlay.medium.start.y = coreStrip.height - 10 + parseInt(coreStrip.style.top);
	markData.overlay.wide.start.y = coreStrip.height - 10 + parseInt(coreStrip.style.top);


	markData.overlay.narrow.start.x = markData.coreStrip.ring[markData.index.narrow].x - .5*markData.coreStrip.ring[markData.index.narrow].width + parseInt(coreStrip.style.left) + 10;
	markData.overlay.medium.start.x = markData.coreStrip.ring[markData.index.medium].x - .5*markData.coreStrip.ring[markData.index.medium].width + parseInt(coreStrip.style.left) + 10;
	markData.overlay.wide.start.x = markData.coreStrip.ring[markData.index.wide].x - .5*markData.coreStrip.ring[markData.index.wide].width + parseInt(coreStrip.style.left) + 10;
	

	markData.overlay.narrow.end.y = graphUnit * 5 + 1 + parseInt(userGraph.style.top);
	markData.overlay.medium.end.y = graphUnit * 5 + 1 + parseInt(userGraph.style.top);
	markData.overlay.wide.end.y = graphUnit * 5 + 1 + parseInt(userGraph.style.top);
	

	for(i=0; i < markData.userGraph.normal.length; ++i) {
		if( markData.userGraph.normal[i].y > 70) {
			markData.overlay.narrow.end.x = markData.userGraph.normal[i].x + parseInt(userGraph.style.left);
		}
	}

	
	for(i=0; i < markData.userGraph.normal.length; ++i) {
		if( markData.index.medium > (markData.userGraph.normal[i].x)/graphUnit - 5 - 1 && markData.index.medium < (markData.userGraph.normal[i].x)/graphUnit - 5 + 1)  {
			markData.overlay.medium.end.x = markData.userGraph.normal[i].x + parseInt(userGraph.style.left);
		}
		
	}
	 
	markData.overlay.wide.end.x = markData.userGraph.wide[0].x + parseInt(userGraph.style.left);

	ctxO.lineWidth = 1;

	ctxO.beginPath();
	ctxO.moveTo(markData.overlay.narrow.start.x, markData.overlay.narrow.start.y);
	ctxO.lineTo(markData.overlay.narrow.end.x, markData.overlay.narrow.end.y);
	ctxO.strokeStyle = "rgb(0,0,255)";
	
	ctxO.stroke();
	ctxO.closePath();

	ctxO.beginPath();
	ctxO.moveTo(markData.overlay.medium.start.x, markData.overlay.medium.start.y);
	ctxO.lineTo(markData.overlay.medium.end.x, markData.overlay.medium.end.y);
	ctxO.strokeStyle = "rgb(255,0,0)";
	ctxO.stroke();
	ctxO.closePath();

	ctxO.beginPath();
	ctxO.moveTo(markData.overlay.wide.start.x, markData.overlay.wide.start.y);
	ctxO.lineTo(markData.overlay.wide.end.x, markData.overlay.wide.end.y);
	ctxO.strokeStyle = "rgb(0,255,0)";
	ctxO.stroke();
	ctxO.closePath();

}

function populateRings() {
	var i, masterYearStartSeed, coreStart, newMark, newX, newY, newWidth, year, falseYear;
	var color = [];
	var falses = 0; var absents = 0;
	var coreLength = 0;
	var index = markData.index;
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
	} while(markData.index.medium == markData.index.narrow);
	
	do {
		index.wide = Math.floor(Math.random() * appSettings.rings);
	} while(markData.index.wide == markData.index.medium || markData.index.wide == markData.index.narrow);

	//Randomly set ring widths
	for(i = 0; i < index.all.length; ++i) {
		if(i == markData.index.narrow) {
			index.all[i] = 0.06;
		}
		else if (i == markData.index.medium) {
			index.all[i] = 2 * 0.215;
		}
		else if (i == markData.index.wide) {
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
			
			markData.userGraph.normal.push(newMark);
		
		}
		
	
		if(index.all[i] > masterBoneWideCutoff*indexMax) {
			newX = (5 + i)*graphUnit;
			markData.userGraph.wide.push({x:newX});
		}

	}

	//Populate Core
	

	for(ring = 0; ring < appSettings.rings; ++ring){
		//mising rings; can't be first or last


		data.coreLength +=  Math.floor(index.all[ring]/2*data.targetRingWidth)+1 >=3 ? Math.floor(index.all[ring]/2*data.targetRingWidth)+1 : 3;
		
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

	while(ring < appSettings.rings){

			
				newWidth = Math.floor(index.all[ring]/2*data.targetRingWidth)+1;
				if(newWidth < 3) {newWidth = 3};
				if(markData.coreStrip.ring.length > 0) {
				
					newX = markData.coreStrip.ring[ring - 1].x + Math.floor(newWidth);
				
				}
				else {newX = Math.floor(newWidth);}

				markData.coreStrip.ring.push({x:Math.floor(newX), width: Math.floor(newWidth), color:color[ring]});
				
			ring++;
	}
}	
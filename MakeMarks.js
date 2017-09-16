function appInit2(){

	var userGraph = document.getElementById("userGraph2");
	graphUnit = 8;
	/*Define global variables*/
	//data for the marks to be rendered on canvases
	markData2 = {
		userGraph: { normal: [] //Members: x, y 
		}
	};
	
	//Corresponds to settings in control panel
	appSettings = {
	 graphMag: "Large",
	 rings: 11,
	};

	userGraph.height = graphUnit*15 + 1;
	userGraph.width = graphUnit*(appSettings.rings-1) + graphUnit*5 + 11;

	renderGraphPaper2(userGraph);

}

function handleClick(e) {
	var targ = e.target ? e.target : e.srcElement;

	if (e.offsetY >= targ.height / 3 && e.offsetX >= 5 && e.offsetX < targ.width-5) {
		addMark(e);	
		redraw2();
	}	
}

function addMark(e) {
	var targ = e.target ? e.target : e.srcElement;

	
	var newMark = {x:e.offsetX, y:e.offsetY};
	markData2.userGraph.normal.push(newMark);
}
		
function redraw2(){
	var userGraph = document.getElementById("userGraph2");
	var ctxU = userGraph.getContext("2d");
	var i, txt, txtWidth, x, y;

	ctxU.clearRect(0, 0, userGraph.width, userGraph.height);
	renderGraphPaper2(userGraph);


	//Make normal marks

	ctxU.lineWidth = 3;

	for(i = 0; i < markData2.userGraph.normal.length; ++i) {
		ctxU.beginPath();
		ctxU.moveTo(markData2.userGraph.normal[i].x-.5, markData2.userGraph.normal[i].y-.5);
		ctxU.lineTo(markData2.userGraph.normal[i].x-.5, userGraph.height);
		ctxU.strokeStyle = "rgb(0,0,0)";
		ctxU.stroke();
		ctxU.closePath();
	}

}		

//Render graphPaper background for userGraph and masterGraph
function renderGraphPaper2(canvas) {
	var height = canvas.height;
	var width = canvas.width;
	var mag = appSettings.graphMag;
	var ctx = canvas.getContext("2d");
	var i, txt, txtWidth, temp;


	ctx.beginPath();
	ctx.fillStyle="rgb(255,255,255)";
	ctx.fillRect(5.5, 0, width-11, height);
	
	ctx.closePath();
	

	//Draw graph squares
	ctx.lineWidth = 1;

	//Draw vertical lines
	for (i = 5; i < width-5; i+=graphUnit) {
		ctx.beginPath();
		ctx.moveTo(i+.5, 0);
		ctx.lineTo(i+.5, height);
		if(((i-5)/graphUnit)%5 == 0) {	//Draw dark green line
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
		ctx.moveTo(5, i+.5);	//Leave room for margin
		ctx.lineTo(width-5, i+.5);
		if((i/graphUnit)%5 == 0) {	//Dark green lines
			ctx.strokeStyle = "rgb(000,204,051)"
		}
		else {	//Light green lines
			ctx.strokeStyle = "rgb(102,255,102)";
		}
		ctx.stroke();
		ctx.closePath();
	}



	//Write Ring Numbers
	for (i=5; i<width; i+=10*graphUnit) {
		ctx.font = "italic bold 15px Times";
		txt = (i-5)/graphUnit;
		txtWidth = ctx.measureText(txt).width;
		ctx.fillStyle="rgb(0,0,0)";
		ctx.fillText(txt, i-txtWidth/2, 4*graphUnit + 5);
	}
		
	
}
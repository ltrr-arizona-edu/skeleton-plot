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

	Skel.sizeCanvas(userGraph, graphUnit*(appSettings.rings-1) + graphUnit*5 + 11, graphUnit*15 + 1);

	renderGraphPaper2(userGraph);

}

//Add a mark on tap in the lower 2/3 of the graph paper
function handleClick(e) {
	var targ = e.currentTarget;
	var pos = Skel.position(e);

	if (pos.y >= Skel.height(targ) / 3 && pos.x >= 5 && pos.x < Skel.width(targ)-5) {
		Skel.onTap(e, function(point) {
			addMark(point);
			redraw2();
		});
	}
}

function addMark(e) {
	var newMark = {x:e.offsetX, y:e.offsetY};

	//snap to grid
	newMark.x = Math.round((newMark.x+2)/graphUnit)*graphUnit -2;

	markData2.userGraph.normal.push(newMark);
}

function redraw2(){
	var userGraph = document.getElementById("userGraph2");
	var ctxU = userGraph.getContext("2d");
	var userHeight = Skel.height(userGraph);
	var i;

	ctxU.clearRect(0, 0, Skel.width(userGraph), userHeight);
	renderGraphPaper2(userGraph);


	//Make normal marks

	ctxU.lineWidth = 3;

	for(i = 0; i < markData2.userGraph.normal.length; ++i) {
		Skel.drawBar(ctxU, markData2.userGraph.normal[i].x-.5, markData2.userGraph.normal[i].y-.5, userHeight);
	}

}

//Render graphPaper background for userGraph
function renderGraphPaper2(canvas) {
	var height = Skel.height(canvas);
	var width = Skel.width(canvas);
	var ctx = canvas.getContext("2d");

	ctx.beginPath();
	ctx.fillStyle="rgb(255,255,255)";
	ctx.fillRect(5.5, 0, width-11, height);
	ctx.closePath();

	//5px margin each side
	Skel.drawGrid(ctx, 5, width-5, height, graphUnit);
	Skel.drawRingNumbers(ctx, 5, width, graphUnit, "italic bold 15px Times");
}

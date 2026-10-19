
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
	var i, newX, newWidth;
	var color = [];
	var index = [];


	index.length = appSettings.rings;

	for(i = 0; i < index.length; ++i) {
		index[i] = 0;
		//Width is averaged according to sensitivity
		for(var replicate = 0; replicate<appSettings.sensitivity; ++replicate){
			index[i] += Math.random()*2;
		}
		index[i] /= appSettings.sensitivity;
	}

	//Populate Core
	for(i = 0; i < appSettings.rings; ++i){
		data.coreLength += Skel.ringWidth(index[i], data.targetRingWidth);
		color.push(Skel.randomLatewood());
	}

	var ring = 0;
	newX = 0;
	while(ring < appSettings.rings){
		newWidth = Skel.ringWidth(index[ring], data.targetRingWidth);
		if(markData.coreStrip.ring.length > 0) {
			newX = markData.coreStrip.ring[ring-1].x + newWidth;
		}
		else {newX = newWidth;}

		markData.coreStrip.ring.push({x:newX, width: newWidth, color:color[ring]});
		ring++;
	}
}

function drawCoreStrip() {
	Skel.drawCoreStrip(document.getElementById("coreStrip"), markData.coreStrip.ring, data.coreLength, 1);
}

function startDrag(e) {
	Skel.dragHoriz(e, function(targ, left) {
		targ.style.left = left + "px";
	}, stopDrag);
}

//When released, keep at least some of the core visible
function stopDrag(targ) {
	if(parseInt(targ.style.left) + Skel.width(targ) < 50) {
		targ.style.left = 50 - Skel.width(targ) + "px";
	}
	if(parseInt(targ.style.left) > 550) {
		targ.style.left = "550px";
	}
}

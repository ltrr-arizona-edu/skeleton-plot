/*Shared drawing and input helpers for the skeleton plot pages.
  A classic script rather than an ES module, so pages keep working when opened from file://*/
var Skel = (function() {

	var LIGHT_GRID = "rgb(102,255,102)";
	var DARK_GRID = "rgb(000,204,051)";
	var BLACK = "rgb(0,0,0)";
	var LATEWOOD = {
		lightLatewood: "rgb(255,204,051)",
		mediumLatewood: "rgb(204,153,000)",
		darkLatewood: "rgb(153,102,000)"
	};
	var TAP_SLOP = 10;	//pixels a pointer may move and still count as a tap

	/*Canvas sizing*/

	//Size a canvas in CSS pixels, with enough device pixels behind it to stay sharp on high-DPI screens.
	//Drawing code keeps using CSS pixel coordinates. Like setting canvas.width, this clears the canvas.
	function sizeCanvas(canvas, width, height) {
		var ratio = window.devicePixelRatio || 1;
		canvas.logicalWidth = width;
		canvas.logicalHeight = height;
		canvas.width = Math.round(width * ratio);
		canvas.height = Math.round(height * ratio);
		canvas.style.width = width + "px";
		canvas.style.height = height + "px";
		canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
	}

	//Size a canvas from its HTML width/height attributes; safe to call again on restart
	function initCanvas(canvas) {
		sizeCanvas(canvas, width(canvas), height(canvas));
	}

	//Width and height in CSS pixels
	function width(canvas) {
		return canvas.logicalWidth !== undefined ? canvas.logicalWidth : canvas.width;
	}

	function height(canvas) {
		return canvas.logicalHeight !== undefined ? canvas.logicalHeight : canvas.height;
	}

	/*Graph paper*/

	//Light green lines every unit and dark green lines every 5 units, from x = left to x = right
	function drawGrid(ctx, left, right, height, unit) {
		var i;
		ctx.lineWidth = 1;

		for (i = left; i < right; i += unit) {
			line(ctx, i+.5, 0, i+.5, height, LIGHT_GRID);
		}
		for (i = 0; i < height; i += unit) {
			line(ctx, left, i+.5, right, i+.5, LIGHT_GRID);
		}
		for (i = left; i < right; i += unit*5) {
			line(ctx, i+.5, 0, i+.5, height, DARK_GRID);
		}
		for (i = 0; i < height; i += unit*5) {
			line(ctx, left, i+.5, right, i+.5, DARK_GRID);
		}
	}

	//Ring numbers every 10 units along the top of a skeleton plot
	function drawRingNumbers(ctx, left, right, unit, font) {
		var i;
		ctx.font = font;
		ctx.fillStyle = BLACK;
		for (i = left; i < right; i += 10*unit) {
			centredText(ctx, (i - left)/unit, i, 4*unit + 5);
		}
	}

	//Thick lines, decade year labels and the 1.0 index label of a master chronology graph
	function drawMasterAxes(ctx, width, unit, yearStart, font) {
		var i, year;

		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(unit*5, unit*10 + .5);
		ctx.lineTo(width, unit*10 + .5);
		ctx.moveTo(unit*5, unit*20 + .5);
		ctx.lineTo(width, unit*20 + .5);
		ctx.strokeStyle = BLACK;
		ctx.stroke();
		ctx.closePath();

		ctx.font = font;
		ctx.fillStyle = BLACK;
		for (i = unit*10; i < width; i += 10*unit) {
			year = yearStart + i/unit - 5;
			if(year % 100 != 0) {year = year % 100;}
			centredText(ctx, year, i, 12*unit);
		}

		ctx.font = "bold 18px Times";
		centredText(ctx, "1.0", 2.5*unit, 21*unit);
	}

	//Line plot of the master ring-width index, one point per unit starting at the 5 unit margin
	function drawIndexPlot(ctx, index, unit) {
		var i, x, y;
		ctx.lineWidth = 1;
		for (i = 1; i < index.length; ++i) {
			if(i == 1) {
				x = 5*unit;
				y = (2-index[i-1])*unit*10 + 10*unit;
			}
			ctx.beginPath();
			ctx.strokeStyle = BLACK;
			ctx.moveTo(x+.5, y+.5);
			x += unit;
			y = (2-index[i])*unit*10 + 10*unit;
			ctx.lineTo(x+.5, y+.5);
			ctx.stroke();
			ctx.closePath();
		}
	}

	/*Skeleton plot marks*/

	//Vertical mark in the current line width
	function drawBar(ctx, x, y1, y2) {
		line(ctx, x, y1, x, y2, BLACK);
	}

	//"b" for a big (wide) ring
	function drawWideMark(ctx, x, y, font) {
		ctx.font = font;
		ctx.fillStyle = BLACK;
		centredText(ctx, "b", x, y);
	}

	//Dashed vertical line and ">" for an absent ring
	function drawAbsentMark(ctx, x, height, unit, font) {
		ctx.lineWidth = 2;
		ctx.strokeStyle = BLACK;
		ctx.beginPath();
		ctx.moveTo(x, height - 1);
		ctx.lineTo(x, height - unit*2 - 1);
		ctx.stroke();
		ctx.moveTo(x, height - unit*4 - 1);
		ctx.lineTo(x, height - unit*6 - 1);
		ctx.stroke();
		ctx.moveTo(x, height - unit*8 - 1);
		ctx.lineTo(x, height - unit*10 - 1);
		ctx.stroke();
		ctx.closePath();

		ctx.font = font;
		ctx.fillStyle = BLACK;
		centredText(ctx, ">", x, unit + unit*.75);
	}

	//Dashed diagonal line and "<" for a false ring
	function drawFalseMark(ctx, x, height, unit, font) {
		ctx.lineWidth = 1;
		ctx.strokeStyle = BLACK;
		ctx.beginPath();
		ctx.moveTo(x + unit*.5, height - 1);
		ctx.lineTo(x - unit*.5, height - unit*2 - 1);
		ctx.stroke();
		ctx.moveTo(x + unit*.5, height - unit*4 - 1);
		ctx.lineTo(x - unit*.5, height - unit*6 - 1);
		ctx.stroke();
		ctx.moveTo(x + unit*.5, height - unit*8 - 1);
		ctx.lineTo(x - unit*.5, height - unit*10 - 1);
		ctx.stroke();
		ctx.closePath();

		ctx.font = font;
		ctx.fillStyle = BLACK;
		centredText(ctx, "<", x, unit + unit*.75);
	}

	/*Core strip*/

	//Width in pixels of a ring with the given index value (minimum 3)
	function ringWidth(value, targetRingWidth, divisor) {
		var width = Math.floor(value/2*targetRingWidth/(divisor || 1))+1;
		return width < 3 ? 3 : width;
	}

	//Pick a latewood colour: mostly medium, sometimes light or dark
	function randomLatewood() {
		var r = Math.random();
		if(r > 0.85) {
			return "darkLatewood";
		}
		else if(r < 0.15) {
			return "lightLatewood";
		}
		return "mediumLatewood";
	}

	//Size and draw a core strip. rings: [{x, width, color}], x being each ring's right edge.
	//Every 10th ring gets a dot and its number.
	function drawCoreStrip(canvas, rings, coreLength, mag) {
		var ctx = canvas.getContext("2d");
		var i, x, w;

		sizeCanvas(canvas, 20 + coreLength*mag, 40);

		ctx.lineWidth = 1;
		ctx.rect(10.5, 10.5, width(canvas) - 20, 20);
		ctx.strokeStyle = BLACK;
		ctx.stroke();
		ctx.fillStyle = "rgb(255,255,41)";
		ctx.fillRect(11.5, 11.5, width(canvas) - 22, 18);

		for(i = 0; i < rings.length; ++i) {
			x = rings[i].x*mag + 10;
			w = rings[i].width*mag;

			if(LATEWOOD[rings[i].color]) {
				ctx.fillStyle = LATEWOOD[rings[i].color];
			}
			ctx.beginPath();
			//Latewood is the right-hand quarter of the ring
			ctx.fillRect(Math.floor(x - w*0.25), 11, Math.floor(w*0.25)+1, 19);
			ctx.moveTo(x+.5, 10);
			ctx.lineTo(x+.5, 30);
			ctx.stroke();
			ctx.closePath();

			ctx.fillStyle = BLACK;
			if(i % 10 == 0) {
				ctx.beginPath();
				ctx.arc(x - w/2, 20, 2, 0, 2*Math.PI);
				ctx.fill();
				ctx.closePath();
				ctx.font = "bold 12px Times";
				centredText(ctx, i, x - w/2, 40);
			}
		}
	}

	/*Pointer input (mouse, touch and pen)*/

	//Drag an element horizontally. Call from its pointerdown handler.
	//onMove(element, left) gets the proposed CSS left; onEnd(element) runs on release.
	function dragHoriz(e, onMove, onEnd) {
		var targ = e.currentTarget;
		var startX = e.clientX;
		var startLeft = parseInt(targ.style.left) || 0;

		if(!isPrimary(e)) {return;}
		e.preventDefault();	//no text selection while dragging

		track(targ, e.pointerId, function(ev) {
			onMove(targ, startLeft + ev.clientX - startX);
		}, function() {
			if(onEnd) {onEnd(targ);}
		});
	}

	//Pointer position within the element (which must have no border), in CSS pixels
	function position(e) {
		var rect = e.currentTarget.getBoundingClientRect();
		return {x: e.clientX - rect.left, y: e.clientY - rect.top};
	}

	//Call fn({offsetX, offsetY, target}) with the pointerdown position once the pointer is
	//released without moving, so a swipe that scrolls the page doesn't count as a tap.
	function onTap(e, fn) {
		var targ = e.currentTarget;
		var pos = position(e);
		var point = {offsetX: pos.x, offsetY: pos.y, target: targ};
		var startX = e.clientX;
		var startY = e.clientY;

		if(!isPrimary(e)) {return;}

		track(targ, e.pointerId, null, function(ev, cancelled) {
			if(!cancelled && Math.abs(ev.clientX - startX) < TAP_SLOP && Math.abs(ev.clientY - startY) < TAP_SLOP) {
				fn(point);
			}
		});
	}

	//Follow one pointer until it is released or the browser takes it over (e.g. to scroll)
	function track(targ, pointerId, move, end) {
		function onMove(ev) {
			if(ev.pointerId == pointerId && move) {move(ev);}
		}
		function onUp(ev) {
			if(ev.pointerId == pointerId) {finish(ev, false);}
		}
		function onCancel(ev) {
			if(ev.pointerId == pointerId) {finish(ev, true);}
		}
		function finish(ev, cancelled) {
			targ.removeEventListener("pointermove", onMove);
			targ.removeEventListener("pointerup", onUp);
			targ.removeEventListener("pointercancel", onCancel);
			end(ev, cancelled);
		}

		targ.addEventListener("pointermove", onMove);
		targ.addEventListener("pointerup", onUp);
		targ.addEventListener("pointercancel", onCancel);
		try {
			targ.setPointerCapture(pointerId);	//keep receiving events when the pointer leaves the element
		}
		catch(err) {}
	}

	//Left mouse button, or the first finger/pen
	function isPrimary(e) {
		return e.isPrimary !== false && e.button === 0;
	}

	/*Helpers*/

	function line(ctx, x1, y1, x2, y2, color) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = color;
		ctx.stroke();
		ctx.closePath();
	}

	function centredText(ctx, txt, x, y) {
		ctx.fillText(txt, x - ctx.measureText(txt).width/2, y);
	}

	return {
		sizeCanvas: sizeCanvas,
		initCanvas: initCanvas,
		width: width,
		height: height,
		drawGrid: drawGrid,
		drawRingNumbers: drawRingNumbers,
		drawMasterAxes: drawMasterAxes,
		drawIndexPlot: drawIndexPlot,
		drawBar: drawBar,
		drawWideMark: drawWideMark,
		drawAbsentMark: drawAbsentMark,
		drawFalseMark: drawFalseMark,
		ringWidth: ringWidth,
		randomLatewood: randomLatewood,
		drawCoreStrip: drawCoreStrip,
		position: position,
		dragHoriz: dragHoriz,
		onTap: onTap
	};
})();

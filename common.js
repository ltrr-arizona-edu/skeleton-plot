/*Shared drawing and input helpers for the skeleton plot pages.
  A classic script rather than an ES module, so pages keep working when opened from file://*/
var Skel = (function() {

	var LIGHT_GRID = "rgb(102,255,102)";
	var DARK_GRID = "rgb(000,204,051)";
	var BLACK = "rgb(0,0,0)";
	var INK = "#403635";	//University of Arizona "Ash"
	var SANS = 'proxima-nova, calibri, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
	//Wood colours as [r, g, b]: pale earlywood, and latewood of three darknesses
	var EARLYWOOD = [240, 218, 166];
	var LATEWOOD = {
		lightLatewood: [170, 102, 48],
		mediumLatewood: [134, 70, 30],
		darkLatewood: [96, 46, 18]
	};
	var MAX_CANVAS = 32000;	//stay under browsers' maximum canvas dimension
	var TAP_SLOP = 10;	//pixels a pointer may move and still count as a tap

	/*Canvas sizing*/

	//Size a canvas in CSS pixels, with enough device pixels behind it to stay sharp on high-DPI screens.
	//Drawing code keeps using CSS pixel coordinates. Like setting canvas.width, this clears the canvas.
	function sizeCanvas(canvas, width, height) {
		var ratio = Math.min(window.devicePixelRatio || 1, MAX_CANVAS / Math.max(width, height));
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

	//Size and draw a core strip that looks like a sanded wood core, pith on the left.
	//rings: [{x, width, color, falseBoundary}] at magnification 1, x being the ring's outer boundary.
	//Within each ring pale earlywood darkens gradually into latewood, then the next ring starts
	//abruptly; a false ring's boundary is diffuse instead. Pencil dots mark every 10th ring:
	//one dot, two at multiples of 50, three at multiples of 100.
	function drawCoreStrip(canvas, rings, coreLength, mag) {
		var ctx = canvas.getContext("2d");
		var left = 10, top = 10, bottom = 30;
		var right = left + coreLength*mag;
		var i, x, w, prev, dots;

		sizeCanvas(canvas, 20 + coreLength*mag, 40);

		//Core resting on its mount, with a soft shadow
		ctx.save();
		ctx.shadowColor = "rgba(40,25,10,0.35)";
		ctx.shadowBlur = 3;
		ctx.shadowOffsetY = 1;
		ctx.fillStyle = rgba(EARLYWOOD, 1);
		roundRect(ctx, left, top, right - left, bottom - top, 3);
		ctx.fill();
		ctx.restore();

		ctx.save();
		roundRect(ctx, left, top, right - left, bottom - top, 3);
		ctx.clip();

		//Earlywood, varying a little from ring to ring
		prev = left;
		for(i = 0; i < rings.length; ++i) {
			x = rings[i].x*mag + left;
			ctx.fillStyle = rgba(lighten(EARLYWOOD, (hash(i + 1) - 0.5) * 0.08), 1);
			ctx.fillRect(prev, top, x - prev + 1, bottom - top);
			prev = x;
		}

		for(i = 0; i < rings.length; ++i) {
			drawLatewood(ctx, rings[i], mag, left, top, bottom);
		}

		drawGrain(ctx, left, top, right, bottom);

		//Shade the core as a cylinder: darker along its top and bottom edges
		var shading = ctx.createLinearGradient(0, top, 0, bottom);
		shading.addColorStop(0, "rgba(60,35,15,0.35)");
		shading.addColorStop(0.2, "rgba(60,35,15,0)");
		shading.addColorStop(0.35, "rgba(255,250,240,0.12)");
		shading.addColorStop(0.55, "rgba(255,250,240,0)");
		shading.addColorStop(0.85, "rgba(60,35,15,0.12)");
		shading.addColorStop(1, "rgba(60,35,15,0.4)");
		ctx.fillStyle = shading;
		ctx.fillRect(left, top, right - left, bottom - top);
		ctx.restore();

		ctx.lineWidth = 1;
		ctx.strokeStyle = "rgba(80,50,25,0.6)";
		roundRect(ctx, left + .5, top + .5, right - left - 1, bottom - top - 1, 2.5);
		ctx.stroke();

		//Pencil dots and ring numbers
		ctx.font = "bold 11px " + SANS;
		for(i = 0; i < rings.length; i += 10) {
			x = rings[i].x*mag + left;
			w = rings[i].width*mag;
			dots = (i > 0 && i % 100 == 0) ? 3 : (i > 0 && i % 50 == 0) ? 2 : 1;
			drawPencilDots(ctx, x - w/2, (top + bottom)/2, dots);
			ctx.fillStyle = INK;
			centredText(ctx, i, x - w/2, 39);
		}
	}

	//Latewood: fades in from the earlywood and ends sharply at the ring boundary.
	//Narrow rings are mostly latewood, so they read as thin dark lines.
	function drawLatewood(ctx, ring, mag, left, top, bottom) {
		var x = ring.x*mag + left;
		var w = ring.width*mag;
		var share = 0.22 + 0.3*Math.min(Math.max((20 - ring.width)/17, 0), 1);
		var lw = Math.max(w*share, 1.3);
		var fade = Math.max(Math.min(lw*0.55, (w - lw)*0.6), 0);
		var color = LATEWOOD[ring.color] || LATEWOOD.mediumLatewood;
		var start = x - lw - fade;
		var end = x;
		var g;

		if(ring.falseBoundary) {
			//A false ring has no sharp outer edge: the dark band fades out again
			end = x + lw*0.9;
			g = ctx.createLinearGradient(start, 0, end, 0);
			g.addColorStop(0, rgba(color, 0));
			g.addColorStop(fade/(end - start), rgba(color, 0.7));
			g.addColorStop((fade + lw*0.7)/(end - start), rgba(color, 0.8));
			g.addColorStop(1, rgba(color, 0));
		}
		else {
			g = ctx.createLinearGradient(start, 0, end, 0);
			g.addColorStop(0, rgba(color, 0));
			g.addColorStop(fade/(end - start), rgba(color, 0.8));
			g.addColorStop(1, rgba(color, 1));
		}
		ctx.fillStyle = g;
		ctx.fillRect(start, top, end - start, bottom - top);
	}

	//Fine grain running along the core: the rows of wood cells seen on a sanded surface
	function drawGrain(ctx, left, top, right, bottom) {
		var ratio = ctx.getTransform ? ctx.getTransform().d : 1;
		var tile = grainTile(Math.max(1, Math.round((bottom - top)*ratio)));

		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);	//work in device pixels, where the tile was made
		ctx.globalCompositeOperation = "multiply";
		ctx.fillStyle = ctx.createPattern(tile, "repeat-x");
		ctx.translate(0, Math.round(top*ratio));
		ctx.fillRect(left*ratio, 0, (right - left)*ratio, tile.height);
		ctx.restore();
	}

	//Greyscale streak texture, built from a fixed hash so it never calls Math.random
	var grainTiles = {};
	function grainTile(height) {
		var size = 512, x, y, i, v, streak, image, tile;

		if(grainTiles[height]) {return grainTiles[height];}
		tile = document.createElement("canvas");
		tile.width = size;
		tile.height = height;
		image = tile.getContext("2d").createImageData(size, height);
		for(y = 0; y < height; ++y) {
			streak = 0.6*hash(y*7 + 3) + 0.4*hash(Math.floor(y/2)*13 + 5);
			for(x = 0; x < size; ++x) {
				v = 0.55*streak + 0.25*hash(x*7919 + y*104729) + 0.2*smoothNoise(x/9 + y*31.7);
				i = (y*size + x)*4;
				image.data[i] = image.data[i+1] = image.data[i+2] = Math.round(255*(1 - 0.17*v));
				image.data[i+3] = 255;
			}
		}
		tile.getContext("2d").putImageData(image, 0, 0);
		grainTiles[height] = tile;
		return tile;
	}

	//Graphite dots stacked across the core
	function drawPencilDots(ctx, x, y, count) {
		var i;
		ctx.fillStyle = "rgba(30,30,35,0.9)";
		for(i = 0; i < count; ++i) {
			ctx.beginPath();
			ctx.arc(x, y + (i - (count - 1)/2)*4.5, 1.8, 0, 2*Math.PI);
			ctx.fill();
			ctx.closePath();
		}
	}

	/*Pointer input (mouse, touch and pen)*/

	//Drag an element horizontally. Call from its pointerdown handler.
	//onMove(element, left) gets the proposed CSS left; onEnd(element) runs on release.
	function dragHoriz(e, onMove, onEnd) {
		var targ = e.currentTarget;
		var startX = e.clientX;
		var startLeft = parseInt(targ.style.left) || 0;
		var scale = screenScale(targ);

		if(!isPrimary(e)) {return;}
		e.preventDefault();	//no text selection while dragging

		track(targ, e.pointerId, function(ev) {
			onMove(targ, startLeft + (ev.clientX - startX)/scale);
		}, function() {
			if(onEnd) {onEnd(targ);}
		});
	}

	//Pointer position within the element (which must have no border), in the element's own
	//CSS pixels, even when a fitWidget scale is shrinking it on screen
	function position(e) {
		var targ = e.currentTarget;
		var rect = targ.getBoundingClientRect();
		var scale = screenScale(targ);
		return {x: (e.clientX - rect.left)/scale, y: (e.clientY - rect.top)/scale};
	}

	//How much an element is shrunk on screen by CSS transforms (1 = not at all)
	function screenScale(el) {
		return el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
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

	/*Fitting fixed-size widgets on narrow screens*/

	//Scale a fixed-size widget down to fit its container, and keep it fitted as the window
	//resizes. Pointer helpers above allow for the scale. Call once per widget.
	function fitWidget(frame) {
		var holder = document.createElement("div");
		holder.className = "widget-fit";
		frame.parentNode.insertBefore(holder, frame);
		holder.appendChild(frame);

		function fit() {
			var scale = Math.min(1, holder.clientWidth / frame.offsetWidth);
			if(scale < 1) {
				frame.style.transform = "scale(" + scale + ")";
				frame.style.transformOrigin = "top left";
				holder.style.height = frame.offsetHeight*scale + "px";
			}
			else {
				frame.style.transform = "";
				holder.style.height = "";
			}
		}
		fit();
		window.addEventListener("resize", fit);
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

	function roundRect(ctx, x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	}

	function rgba(rgb, alpha) {
		return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")";
	}

	//Scale a colour towards white (amount > 0) or black (amount < 0)
	function lighten(rgb, amount) {
		return rgb.map(function(c) {
			return Math.round(amount > 0 ? c + (255 - c)*amount : c*(1 + amount));
		});
	}

	//Deterministic pseudo-random number in [0, 1) for an integer
	function hash(n) {
		n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
		n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
		n = n ^ (n >>> 16);
		return (n >>> 0) / 4294967296;
	}

	//Smoothly interpolated hash noise in [0, 1)
	function smoothNoise(t) {
		var i = Math.floor(t), f = t - i;
		f = f*f*(3 - 2*f);
		return hash(i)*(1 - f) + hash(i + 1)*f;
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
		fitWidget: fitWidget,
		dragHoriz: dragHoriz,
		onTap: onTap
	};
})();

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

// Clear canvas
function clearCanvas(ctx, color){
	/*
	if (color == undefined){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	} else {
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, 800, 800);
	}
	*/
	ctx.fillStyle = color || "white";
	ctx.fillRect(0, 0, window_width, window_height);
}

function clearCanvasSVG(ctx){
	while (ctx.lastChild){
		ctx.removeChild(ctx.lastChild);
	}
}

// Number Format 123,456,789
function numberFormat (n){
	return n.toFixed().replace(/(\d)(?=(\d{3})+(,|$))/g, '$1,');
}

function roundX (val, precision) {
  return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
/***** Coordinate System *****/
var Coor2d = function(x, y){
	this.x = x || 0;
	this.y = y || 0;
}

Coor2d.prototype.set = function(x, y){
	this.x = x;
	this.y = y;
}

Coor2d.prototype.distance = function(c){  //Coor2d
	return Math.sqrt(Math.pow(this.x - c.x, 2) + Math.pow(this.y - c.y, 2));
}

Coor2d.prototype.equal = function(c){  //Coor2d
	// if (this.x > c.x){
	// 	if (this.y > c.y)
	// 		return (this.x - c.x <= EPSILON) && (this.y - c.y <= EPSILON);
	// 	else
	// 		return (this.x - c.x <= EPSILON) && (c.y - this.y <= EPSILON);
	// }
	// else {
	// 	if (this.y > c.y)
	// 		return (c.x - this.x <= EPSILON) && (this.y - c.y <= EPSILON);
	// 	else
	// 		return (c.x - this.x <= EPSILON) && (c.y - this.y <= EPSILON);
	// }
	return this.distance(c) <= EPSILON;
}

Coor2d.prototype.copy = function(c){  //Coor2d
	this.x = c.x;
	this.y = c.y;
}

/***** Solar System *****/
var Planet = function(ID){
	this.id = ID;
	this.radius = GLOBAL_RADIUS;
	this.position = new Coor2d(0, 0);  //position
	this.parent = null;  //relate planet parent
	this.children = null;  //relate planet children
	this.angular_increments = 0;  //the angular increments for orbital velocity of motions
	this.angle = 0;  //currently angle
}

Planet.prototype.bind = function(parent){  //Planet
	this.parent = parent;
	parent.children = this;
}

Planet.prototype.setPosition = function(x, y){  //2d coor
	this.position.set(x, y);
}

Planet.prototype.getPosition = function(){
	return this.position;
}

Planet.prototype.setAnGularIncrements = function(angular){  //angular
	this.angular_increments = angular;
}

Planet.prototype.update = function(){
	if (this.parent == null)
		return;
	else{
		this.angle += this.angular_increments;
		//if (PIXEL_MODE)
		//	this.setPosition(Math.round(this.parent.position.x + this.radius * Math.sin(Math.radians(this.angle))), Math.round(this.parent.position.y + this.radius * Math.cos(Math.radians(this.angle))));
		//else
			this.setPosition(this.parent.position.x + this.radius * Math.sin(Math.radians(this.angle)), this.parent.position.y + this.radius * Math.cos(Math.radians(this.angle)));
	}
}

Planet.prototype.coordinateOffset = function(){
	this.position.x += Math.round(window_width / 2);
	//if (RELATIVE_MODE == RMRM)
	//	this.position.x -= Math.round(window_width / 4);
	this.position.y += Math.round(window_height / 2);
}

Planet.prototype.reset = function(){
	this.position.set(0, 0);
	this.angular_increments = 0;
	this.angle = 0;
}

//////////////////////////////

var PlanetSet = function(array){
	this.planets = array || [];
}

PlanetSet.prototype.set = function(array){
	this.planets = array;
}

PlanetSet.prototype.push = function(planet){
	this.planets.push(planet);
}

PlanetSet.prototype.size = function(){
	return this.planets.length;
}

PlanetSet.prototype.update = function(){
	for (var i = 0; i < this.size(); i++)
		this.planets[i].update();
}

PlanetSet.prototype.getPlanet = function(index){
	return this.planets[index];
}

PlanetSet.prototype.setAnGularIncrements = function(index, angular){
	this.planets[index].setAnGularIncrements(angular);
}

PlanetSet.prototype.coordinateOffset = function(){
	for (var i = 0; i < this.size(); i++)
		this.planets[i].coordinateOffset();
}

PlanetSet.prototype.reset = function(){
	for (var i = 0; i < this.size(); i++)
		this.planets[i].reset();
}

//////////////////////////////

var PlanetFactory = function(size, mode){
	this.size = size || 0;
	this.mode = mode || MRM;
	this.planetset = null;
}

PlanetFactory.prototype.set = function(size, mode){
	this.size = size;
	this.mode = mode;
}

PlanetFactory.prototype.createPlanet = function(){
	this.planetset = new PlanetSet();
	var p, lp;
	if (this.mode == MRM)
		this.size ++;
	for (var i = 0; i < this.size; i++){
		p = new Planet(i);
		if (i > 0){
			p.bind(lp);
		}
		this.planetset.push(p);
		lp = p;
	}
	if (this.mode == RMRM){
		this.planetset.getPlanet(0).bind(lp);
	}
	return this.planetset;
}

PlanetFactory.prototype.getPlanetset = function(){
	return this.planetset;
}

//////////////////////////////

var Orbit = function(planetset, zoom, color){
	this.planetset = planetset;
	this.path = [];
	this.zoom = zoom || 1;
	this.color = color || '#000000';
}

Orbit.prototype.set = function(planetset, zoom, color){
	this.planetset = planetset;
	this.zoom = zoom;
	this.color = color;
}

Orbit.prototype.init = function(){
	//  init all planets' position
	for (var i = 1; i < this.planetset.size(); i++){
		var p = this.planetset.getPlanet(i);
		p.setPosition(0, this.planetset.getPlanet(p.parent.id).getPosition().y + p.radius);
	}
	this.planetset.coordinateOffset();
}

Orbit.prototype.fitScreen = function(){
	//  scale
	var max = -1, xMax = -1, xMin = 9999, yMax = -1, yMin = 9999;
	var size = this.path.length;
	for (var i = 0; i < size; i++){
		var curX = Math.abs(this.path[i].x - 400);
		var curY = Math.abs(this.path[i].y - 400);
		if (curX > max)
			max = curX;
		if (curY > max)
			max = curY;
	}
	var scale = 1 / (max / 350);
	for (var i = 0; i < size; i++){
		this.path[i].x *= scale;
		this.path[i].y *= scale;
	}
}

Orbit.prototype.fitZoom = function(w, h){
	//  scale
	var xMax = -1, xMin = 9999, yMax = -1, yMin = 9999;
	var curX, curY;
	var size = this.path.length;
	for (var i = 0; i < size; i++){
		this.path[i].x *= this.zoom;
		this.path[i].y *= this.zoom;
	}

	//  mid align
	for (i = 0; i < size; i++){
		curX = this.path[i].x;
		curY = this.path[i].y;
		if (curX > xMax)
			xMax = curX;
		else if (curX < xMin)
			xMin = curX;
		if (curY > yMax)
			yMax = curY;
		else if (curY < yMin)
			yMin = curY;
	}
	var xMid = w / 2 - (xMax + xMin) / 2;
	var yMid = h / 2 - (yMax + yMin) / 2;
	for (var i = 0; i < size; i++){
		this.path[i].x += xMid;
		this.path[i].y += yMid;
	}
}

Orbit.prototype.calculate = function(w, h){
	this.init();
	var target = this.planetset.getPlanet(this.planetset.size()-1);
	var start = new Coor2d(target.getPosition().x, target.getPosition().y);
	//console.log(start);
	var cp = new Coor2d(start.x, start.y);  //current position
	var count = 0;
	if (ITERATIONS_LIMIT > 0){
		do{
			this.planetset.update();
			cp.copy(target.getPosition());
			this.path.push(new Coor2d(cp.x, cp.y));
			//console.log (cp);
			count++;
		} while(count < ITERATIONS_LIMIT);
	} else {
		do{
			this.planetset.update();
			cp.copy(target.getPosition());
			this.path.push(new Coor2d(cp.x, cp.y));
			//console.log (cp);
			count++;
		} while(count < 10 || !cp.equal(start));
		this.planetset.update();
		cp.copy(target.getPosition());
		this.path.push(new Coor2d(cp.x, cp.y));
		//console.log (cp);
		count++;
	}
	updateIterationText(count);
	this.fitScreen();
	this.fitZoom(w, h);
}

Orbit.prototype.reset = function(){
	this.path = [];
}

Orbit.prototype.getPath = function(){
	return this.path;
}

/***** Drawing system *****/

var Draw = function(orbit, planetset, width){
	this.orbit = orbit || null;
	this.planetset = planetset || null;
	this.orbit_display = true;
	this.planet_display = true;

	this.animating = false;
	this.animate_speed = 0;
	this.path = null;
	this.cur_path_index = -1;
	this.path_length = 0;

	this.it_count = 0;

	this.line_width = width || 1;
}

Draw.prototype.setOrbit = function(orbit){
	this.orbit = orbit;
}

Draw.prototype.setPlanetSet = function(planetset){
	this.planetset = planetset;
}

Draw.prototype.setWidth = function(width){
	this.line_width = width;
}

Draw.prototype.set = function(orbit, planetset, width){
	this.orbit = orbit;
	this.planetset = planetset;
	this.line_width = width;
}

Draw.prototype.reset = function(){
	this.orbit.reset();
	this.planetset.reset();
	
	this.animating = false;
	this.animate_speed = 0;
	this.path = null;
	this.cur_path_index = -1;
	this.path_length = 0;
	//this.line_width = 1;
}

Draw.prototype.drawOrbit = function(){
	var path = this.orbit.getPath();

	//clearCanvas();  ////////////////////////

	ctx.beginPath();
	ctx.strokeStyle = this.orbit.color;
	ctx.lineWidth = this.line_width;
	ctx.lineJoin = 'miter';
	ctx.moveTo(path[0].x, path[0].y);
	for (var i = 1, c; c = path[i]; i++)
		ctx.lineTo(c.x, c.y);
	ctx.stroke();
}

Draw.prototype.drawOrbitSVG = function(){
	var path = this.orbit.getPath();
	var ns = svg.namespaceURI;
	var svg_path = document.createElementNS(ns, "path");
	var d = "";
	svg_path.setAttribute("stroke", this.orbit.color);
	svg_path.setAttribute("fill", "none");
	svg_path.setAttribute("stroke-width", this.line_width);
	svg_path.setAttribute("stroke-linejoin", "miter");
	d += "M" + path[0].x + " " + path[0].y + " ";
	for (var i = 1, c; c = path[i]; i++)
		d += "L" + c.x + " " + c.y + " ";
	d += "Z";
	svg_path.setAttribute("d", d);
	svg.appendChild(svg_path);
	//console.log (d);
	image_data_list.push(svg_path);
}

Draw.prototype.drawOrbitAnimate = function(speed){
	if (this.animating)
		return;
	this.animate_speed = speed;
	this.path = this.orbit.getPath();
	this.cur_path_index = 1;
	this.path_length = this.path.length;
	this.animating = true;
	this.it_count = 1;
	clearCanvas();  ////////////////////////
}

Draw.prototype.update = function(){
	if (this.animating){
		var cnt = 0;
		while (cnt < this.animate_speed){
			ctx.beginPath();
			ctx.strokeStyle = this.orbit.color;
			ctx.lineWidth = this.line_width;
			ctx.moveTo(this.path[this.cur_path_index - 1].x, this.path[this.cur_path_index - 1].y);
			ctx.lineTo(this.path[this.cur_path_index].x, this.path[this.cur_path_index].y);
			ctx.stroke();
			this.cur_path_index ++;
			this.it_count++;
			updateIterationText(this.it_count);
			if (this.cur_path_index >= this.path_length){
				this.animating = false;
				break;
			}
			cnt ++;
		}	
	}
}

Draw.prototype.stop = function(){
	this.animating = false;
	clearCanvas();
	this.drawOrbit();
}

Draw.prototype.isAnimating = function(){
	return this.animating;
}

/***** Save Data *****/

var Data = function(id, str){  // rl_rm_angular_delta_number_zoom_color_width
	this.id = id;
	this.str = str;

	var parse = str.split("_");
	this.rl = Number(parse[0]);
	this.rm = parse[1];
	this.angular = parse[2];
	this.delta = parse[3];
	this.number = Number(parse[4]);
	this.zoom = Number(parse[5]);
	this.color = parse[6];
	this.width = Number(parse[7]);
}

/***** Data Set *****/

var DataSet = function(){
	this.count = 0;
	this.array = [];
}

DataSet.prototype.push = function(str){
	var data = new Data(this.count, str);
	this.count ++;
	return this.array.push(data);
}

DataSet.prototype.size = function(){
	return this.array.length;
}

DataSet.prototype.pop = function(){
	this.count --;
	return this.array.pop();
}

DataSet.prototype.clear = function(){
	this.count = 0;
	this.array = [];
}

DataSet.prototype.reDraw = function(){

}
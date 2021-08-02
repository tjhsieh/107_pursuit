/*************** Point ***************/
var Point = function(){
	this.x = 0;  //position
	this.y = 0;
	this.a = 0;  //angle
	this.a_inc = 0;  //angular increment
	this.r = 0;  //radius
	this.r_inc = 0;  //radius increment

	this.parent = null;
}

Point.prototype.setPosition = function(x, y){
	this.x = x;
	this.y = y;
}

Point.prototype.setAngle = function(a, a_inc){
	this.a = a;
	this.a_inc = a_inc;
}

Point.prototype.setRadius = function(r, r_inc){
	this.r = r;
	this.r_inc = r_inc;
}

Point.prototype.set = function(x, y, a, a_inc, r, r_inc){
	this.setPosition(x, y);
	this.setAngle(a, a_inc);
	this.setRadius(r, r_inc);
}

Point.prototype.clear = function(){
	this.setPosition(init_posX, init_posY);
}

Point.prototype.bind = function(point){
	this.parent = point;
}

Point.prototype.update = function(){
	this.x = this.parent.x + this.r * Math.cos(this.a / 180 * Math.PI * this.a_inc * speed);
    this.y = this.parent.y + this.r * Math.sin(this.a / 180 * Math.PI * this.a_inc * speed);
    this.a += this.a_inc;
    this.r += this.r_inc;
}

Point.prototype.checkEqual = function(point){
	if (this.x > point.x){
		if (this.y > point.y)
			return (this.x - point.x <= epsilon) && (this.y - point.y <= epsilon);
		else
			return (this.x - point.x <= epsilon) && (point.y - this.y <= epsilon);
	}
	else {
		if (this.y > point.y)
			return (point.x - this.x <= epsilon) && (this.y - point.y <= epsilon);
		else
			return (point.x - this.x <= epsilon) && (point.y - this.y <= epsilon);
	}
}

/*************** Circle ***************/
var Circle = function(svgContainer, radius, color){
	this.circle = svgContainer
		.append("circle")
		.attr("r", radius)
		.attr("fill", color);

	this.point = new Point();
	this.x = 0;
	this.y = 0;
}

Circle.prototype.setPosition = function(x, y){
	this.circle.attr("cx", x).attr("cy", y);
	this.x = x;
	this.y = y;
}

Circle.prototype.setPoint = function(x, y, a, a_inc, r, r_inc){
	this.point.set(x, y, a, a_inc, r, r_inc);
	this.setPosition(x, y);
}

Circle.prototype.clear = function(){
	this.point.clear();
	this.setPosition(init_posX, init_posY);
}

Circle.prototype.update = function(){
	this.point.update();
	this.setPosition(this.point.x, this.point.y);
	this.x = this.point.x;
	this.y = this.point.y;
}

Circle.prototype.show = function(){
	this.circle.style("opacity", 1);
}

Circle.prototype.hide = function(){
	this.circle.style("opacity", 0);
}

Circle.prototype.bind = function(circle){
	this.point.bind(circle.point);
}

/*************** Path ***************/
var Path = function(svgContainer, stroke_witdh, stroke_color){
	this.line = svgContainer
		.append("polyline")
		.attr("stroke-witdh", stroke_witdh)
		.attr("fill", "none")
		.attr("stroke", stroke_color);
	this.data = "";
}

Path.prototype.update = function(x, y){
	this.data += ""+x+","+y+" ";
	this.line.attr("points", this.data);
}

Path.prototype.show = function(){
	this.line.style("opacity", 1);
}

Path.prototype.hide = function(){
	this.line.style("opacity", 0);
}

Path.prototype.clear = function(){
	this.data = "";
	this.hide();
}
"use strict"

var gl;

var viewMatrix;
var projectionMatrix;

var program;
var sunProgram;

var pyramidIndexBuffer;

var vao;
var bunnyVao;

var uniformViewProjectionLocation;
var uniformViewMatrixLocation;

var pyramidIndicesCount; 
var bunnyVerticesCount; 

var uniformModelMatrixLocation;

var uniformLightPositionLocation;  

var sunIndexBuffer;
var sunVao;
var sunIndicesCount;

var uniformSunProjectionMatrixSunLocation;
var uniformSunViewMatrixSunLocation;
var uniformSunLigthPosition;



function render(timestamp, previousTimestamp) 
{
	var light = getLightPosition(); // vec3
	var rotation = getRotation();	// vec3	

	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(program);	

	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
	gl.drawElements(gl.TRIANGLES, pyramidIndicesCount, gl.UNSIGNED_SHORT, 0);

	gl.bindVertexArray(bunnyVao);
	gl.drawArrays(gl.TRIANGLES, 0, bunnyVerticesCount);

	var rotatedXMatrix = rotateX(rotation[0]);
    var rotatedYMatrix = rotateY(rotation[1]);
	var rotatedZMatrix = rotateZ(rotation[2]);
	
	var rotationMatrix = mat4(1.0);
	rotationMatrix = mult(rotationMatrix, rotatedXMatrix);
	rotationMatrix = mult(rotationMatrix, rotatedYMatrix);
	rotationMatrix = mult(rotationMatrix, rotatedZMatrix);

	var modelMatrix = mat4(1.0);
	var transformation = translate(0.0, -0.75, 0.0);
	modelMatrix= mult(modelMatrix, transformation);
	modelMatrix = mult(modelMatrix, rotationMatrix);
	var scalation = scalem(1.5, 1.5, 1.5);
	modelMatrix = mult(modelMatrix, scalation);

	gl.uniformMatrix4fv(uniformModelMatrixLocation, false, flatten(modelMatrix));
	gl.uniform3fv(uniformLightPositionLocation, light);

	gl.useProgram(sunProgram);
	gl.uniform3fv(uniformSunLigthPosition, light);

	gl.bindVertexArray(sunVao);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sunIndexBuffer);
	gl.drawElements(gl.TRIANGLES, sunIndicesCount, gl.UNSIGNED_SHORT, 0);

	window.requestAnimFrame(function(time) {		
		render(time, timestamp);
	});
}

function createGeometry()
{
	
	var vertices = [];
	vertices.push(vec3(-1.0, -0.25,  1.0));// 0
	vertices.push(vec3( 1.0, -0.25,  1.0));// 1
	vertices.push(vec3( 0.5, 0.25,  0.5)); // 2
	vertices.push(vec3(-0.5, 0.25,  0.5)); // 3
	vertices.push(vec3(-1.0, -0.25, -1.0));// 4
	vertices.push(vec3( 1.0, -0.25, -1.0));// 5
	vertices.push(vec3(0.5,  0.25, -0.5)); // 6
	vertices.push(vec3(-0.5,  0.25, -0.5));// 7

	pyramidIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

	const indices = [
		0, 1, 2,
		2, 3, 0,
		1, 5, 6,
		6, 2, 1,
		7, 6, 5,
		5, 4, 7,
		4, 0, 3,
		3, 7, 4,
		4, 5, 1,
		1, 0, 4,
		3, 2, 6, 
		6, 7, 3
	];

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	pyramidIndicesCount = indices.length;
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(0);
	
	var colors = [];
	for(var i = 0; i < 36; i++) {colors.push(vec3(0.5, 0.5, 0.5));}

	var vboColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboColor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(1);

	var normals = [];
	for(var i = 0; i < 6; i++) {normals.push(vec3(0.0, 0.0, 1.0));}  // front	
	for(var i = 0; i < 6; i++) {normals.push(vec3(0.0, 1.0, 0.0));}	 // right
	for(var i = 0; i < 6; i++) {normals.push(vec3(1.0, 0.0, 0.0));}  // back
	for(var i = 0; i < 6; i++) {normals.push(vec3(0.0, 0.0, -1.0));} // left	
	for(var i = 0; i < 6; i++) {normals.push(vec3(0.0, -1.0, 0.0));} // top 
	for(var i = 0; i < 6; i++) {normals.push(vec3(-1.0, 0.0, 0.0));} // bottom 

	var vboNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(2);
}

function loadModel()
{
	var meshData = loadMeshData();
	var positions = meshData.positions;
	var normals = meshData.normals;
	var colors = meshData.colors;
	var vertexCount = meshData.vertexCount;
	bunnyVerticesCount=vertexCount;
	
	bunnyVao = gl.createVertexArray();
	gl.bindVertexArray(bunnyVao);
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(0);

	var vboColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboColor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(1);

	var vboNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(2);

}

function createSun(){
	var vertices = [];
	var sectorCount = 288;
	var stackCount = 96;
	var x, y, z, xy;
	var radius = 0.3;
	var PI = Math.PI;
	var sectorStep = 2 * PI / sectorCount;	
	var stackStep = PI / stackCount;
	var sectorAngle, stackAngle;

	for(var i = 0; i <= stackCount; ++i) {
	    stackAngle = PI / 2 - i * stackStep;
	    xy = radius * Math.cos(stackAngle);
	    z = radius * Math.sin(stackAngle);


	    for(var j = 0; j <= sectorCount; ++j) {
	        sectorAngle = j * sectorStep;        

	        x = xy * Math.cos(sectorAngle);
	        y = xy * Math.sin(sectorAngle);
	        vertices.push(vec3(x, y, z));
	    }
	}
	var indices =[];
	var k1, k2;
	for(var i = 0; i < stackCount; ++i) {
	    k1 = i * (sectorCount + 1);
	    k2 = k1 + sectorCount + 1; 
	    for(var j = 0; j < sectorCount; ++j, ++k1, ++k2) {
	     
	        if(i != 0) {	
				indices.push(k1);
				indices.push(k2); 
				indices.push(k1 + 1);
	        }
	      
	        if(i != (stackCount-1)) {
				indices.push(k1 + 1);
				indices.push( k2);
				indices.push(k2 + 1);
	        }
	    }
	}

	sunIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sunIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	sunIndicesCount = indices.length;

	sunVao = gl.createVertexArray();
	gl.bindVertexArray(sunVao);
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(0);

}

window.onload = function init() {

	var canvas = document.getElementById('rendering-surface');	
	gl = WebGLUtils.setupWebGL( canvas );
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.0, 0.0, 0.0, 0.0);	

	program = initShaders(gl, "vertex-shader","fragment-shader");
	gl.useProgram(program);	

	createGeometry();
	loadModel();	

	projectionMatrix = mat4(1.0);
	projectionMatrix = perspective(90, canvas.width / canvas.height, 0.1, 100);	

	var eyePos = vec3(0, 2.0, 2.0);
	var lookAtPos = vec3(0.0, 0.0, 0.0);
	var upVector = vec3(0.0, 1.0, 0.0);
	viewMatrix = lookAt(eyePos, lookAtPos, upVector);

	uniformViewProjectionLocation = gl.getUniformLocation(program, "u_ViewProjection");
	uniformViewMatrixLocation = gl.getUniformLocation(program, "u_ViewMatrix");

	gl.uniformMatrix4fv(uniformViewProjectionLocation, false, flatten(projectionMatrix));
	gl.uniformMatrix4fv(uniformViewMatrixLocation, false, flatten(viewMatrix));

	uniformModelMatrixLocation = gl.getUniformLocation(program, "u_ModelMatrix");

	uniformLightPositionLocation = gl.getUniformLocation(program, "u_LightPos");

	sunProgram = initShaders(gl, "sun-vertex-shader", "sun-fragment-shader");

	gl.useProgram(sunProgram);
	createSun();

	uniformSunProjectionMatrixSunLocation = gl.getUniformLocation(sunProgram, "u_ProjectionMatrixSun");
	uniformSunViewMatrixSunLocation =  gl.getUniformLocation(sunProgram, "u_ViewMatrixSun");
	uniformSunLigthPosition = gl.getUniformLocation(sunProgram, "u_SunLightPosition");

	gl.uniformMatrix4fv(uniformSunProjectionMatrixSunLocation, false, flatten(projectionMatrix));
	gl.uniformMatrix4fv(uniformSunViewMatrixSunLocation, false, flatten(viewMatrix));

	render(0,0);
}
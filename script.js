
function main(){
    /*============== Creating a canvas ====================*/
    var canvas = document.getElementById('kanvas');
    gl = canvas.getContext('webgl');

    /*======== Defining and storing the geometry ===========*/
    var buffers = createBuffers()

    /*======== Defining texture ===========*/
    var texture = loadTexture()

    /*================ Shaders ====================*/
    
    var shader_program = createProgram()
    program_info = {
        program: shader_program,
        attributes:{
            attribut_location: gl.getAttribLocation(shader_program, "positions"), // Get the attribute location
            texture_location: gl.getAttribLocation(shader_program, "atexture") // Get the attribute location
        },
        uniforms: {
            usampler: gl.getUniformLocation(shader_program, "usampler")
        }
    }

   drawScene(buffers, program_info , canvas, texture)
}

function createBuffers(){
    
    var vertices = [
      -0.5,0.5,0.0,   0.0, 1.0,
      -0.5,-0.5,0.0,  0.0, 0.0,
      0.5,-0.5,0.0,   1.0, 0.0,
    ];
    
    // Create an empty buffer object to store vertex buffer
    var vertex_buffer = gl.createBuffer();

    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indices = [0,1,2];

    // Create an empty buffer object to store Index buffer
    var Index_Buffer = gl.createBuffer();

    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

    // Pass the vertex data to the buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    // Unbind the buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        vertex: vertex_buffer,
        index: {
            buffer: Index_Buffer,
            length: indices.length
        }
    }
}

function loadTexture(){
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('rose'));
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture
}

function createProgram(){
    // Vertex shader source code
    var vertCode =
    'attribute vec3 positions;' +
    'attribute vec2 atexture;' +
    'varying highp vec2 vtexture;' +
    'void main(void) {' +
        ' gl_Position = vec4(positions, 1.0);' +
        ' vtexture = atexture;' +
    '}';
    
    // Create a vertex shader object
    var vertShader = gl.createShader(gl.VERTEX_SHADER);

    // Attach vertex shader source code
    gl.shaderSource(vertShader, vertCode);

    // Compile the vertex shader
    gl.compileShader(vertShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(vertShader);
    }

    //fragment shader source code
    var fragCode =
    'precision mediump float;'+
    'varying highp vec2 vtexture;' +
    'uniform sampler2D usampler;' +
    'void main(void) {' +
        ' gl_FragColor = texture2D(usampler,vtexture);' +
    '}';
    
    // Create fragment shader object
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Attach fragment shader source code
    gl.shaderSource(fragShader, fragCode); 
    
    // Compile the fragmentt shader
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(fragShader);
    }

    // Create a shader program object to store
    // the combined shader program
    var shaderProgram = gl.createProgram();

    // Attach a vertex shader
    gl.attachShader(shaderProgram, vertShader);

    // Attach a fragment shader
    gl.attachShader(shaderProgram, fragShader);

    // Link both the programs
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(shaderProgram);
    }
    
    return shaderProgram
}
function drawScene(buffers, program_info, canvas,texture){
    /*======= Associating shaders to buffer objects =======*/

    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);

    // Bind index buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index.buffer);

    // Specify the texture to map onto the faces.

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0)
    
    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.uniform1i(program_info.uniforms.usampler, 0)
    

    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(program_info.attribut_location, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0); 

    // Enable the attribute
    gl.enableVertexAttribArray(program_info.attributes.attribut_location);

    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(program_info.attributes.texture_location, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT); 

    // Enable the attribute
    gl.enableVertexAttribArray(program_info.attributes.texture_location);

    /*=========Drawing the triangle===========*/

    // Clear the canvas
    gl.clearColor(0.5, 0.5, 0.5, 0.9);

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);

    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the view port
    gl.viewport(0,0,canvas.width,canvas.height);

    // Use the combined shader program object
    gl.useProgram(program_info.program);

    // Draw the triangle
    gl.drawElements(gl.TRIANGLES, buffers.index.length, gl.UNSIGNED_SHORT,0);
}
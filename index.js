/**
 * Vertex Shader Source Code
 * @type {string}
 */
const vertexShaderSource = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

/**
 * Fragment Shader Source Code 
 * @type {string}
 */
const fragmentShaderSource = `
  precision mediump float;

  uniform float uTime;
  uniform vec2 uPos;
  uniform vec2 uResolution;
  uniform vec3 uColor;

  void main() {
    vec2 normCoord = gl_FragCoord.xy / uResolution;
    // vec2 normCoord = uPos / uResolution;
    // gl_FragColor = vec4(normCoord, uTime, 1.0);
    if (uColor != vec3(0.0, 0.0, 0.0)) {
        gl_FragColor = vec4(uColor, 1.0);
    } else {
        gl_FragColor = vec4(normCoord, uTime, 1.0);
    }
  }
`


window.addEventListener("load", (_event) => {
    const canvas = /** @type {HTMLCanvasElement | null} canvas */ (document.getElementById('glCanvas'))
    if (!canvas) {
        console.error("Canvas not found")
        return
    }
    canvas.setAttribute("width", window.innerWidth.toString())
    canvas.setAttribute("height", window.innerHeight.toString())

    const gl = canvas.getContext('webgl')
    if (!gl) {
        console.error("gl context not found")
        return
    }
    
    // Create and link the program
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
    if (!vertexShader) {
        console.error("vertext shader could not compile")
        return
    }

    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)
    if (!fragmentShader) {
        console.error("fragmentt shader could not compile")
        return
    }

    const program = gl.createProgram()

    if (!program) {
        console.error("program could not be loaded")
        return
    }

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking failed:", gl.getProgramInfoLog(program))
        throw new Error("Program linking error")
    }

    gl.useProgram(program)

    // Define triangle vertices
    const vertices = new Float32Array([
        // triangle upper-left
        -1.0, 1.0,
        0.0, 1.0,
        -1.0, 0.0,
        // triangle lower-left
        -1.0, -1.0,
        0.0, -1.0,
        -1.0, 0.0,
        // triangle upper-right
        1.0, 0.0,  
        1.0, 1.0, 
        0.0, 1.0,
        // triangle lower-right
        1.0, 0.0,  
        1.0, -1.0, 
        0.0, -1.0,
    ])

    // Create a buffer and bind it
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    // Link the buffer to the shader's aPosition attribute
    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(aPosition)

    const uPosition = gl.getUniformLocation(program, 'uPos')
    gl.uniform2f(uPosition, 200.0, 100.0) 
    const uResolution = gl.getUniformLocation(program, 'uResolution')
    gl.uniform2f(uResolution, window.innerWidth, window.innerHeight)
    const uTime = gl.getUniformLocation(program, 'uTime')
    gl.uniform1f(uTime, Date.now())
    const uColor = gl.getUniformLocation(program, 'uColor')
    gl.uniform3f(uColor, 0.0, 0.0, 0.0)

    window.addEventListener("mousemove", (event) => {
        gl.uniform2f(uPosition, event.clientX, event.clientY)
    })

    function render() {
        if (!gl) {
            console.error("gl context not found")
            return
        }
        const time = (Math.sin(Date.now() / 1000.0) + 1 ) / 2
        gl.uniform1f(uTime, time)
        gl.clearColor(0.0, 0.0, 0.0, 1.0) // Black background
        gl.clear(gl.COLOR_BUFFER_BIT)

        //
        // console.log(time)

        // Draw the triangle
        // gl.drawArrays(gl.TRIANGLES, 0, 12)

        gl.uniform3f(uColor, 1.0, 0.0, 0.0)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        gl.uniform3f(uColor, 0.0, 1.0, 0.0)
        gl.drawArrays(gl.TRIANGLES, 3, 3)
        gl.uniform3f(uColor, 0.0, 0.0, 1.0)
        gl.drawArrays(gl.TRIANGLES, 6, 3)
        gl.uniform3f(uColor, 0.0, 0.0, 0.0)
        gl.drawArrays(gl.TRIANGLES, 9, 3)
        window.requestAnimationFrame(render)
    }

    render()
})

/**
* Returns a normalized object of width and height from an mouse event
* @param {MouseEvent} event
* @returns {{width: number, heigth: number}}
*/
function getGLNormalizedMousePos(event) {
    const w = ((event.clientX / window.innerWidth) * 2.0) - 1.0
    const h = (((window.innerHeight - event.clientY) / window.innerHeight) * 2.0) - 1.0
    return { width: w, heigth: h }
}

/**
* @param {WebGLRenderingContext} gl
* @param {string} source
* @param {number} type
*/
function compileShader(gl, source, type) {
    const shader = gl.createShader(type)
    if (!shader) {
        return null
    }

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation failed:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        throw new Error("Shader compilation error")
    }

    return shader
}


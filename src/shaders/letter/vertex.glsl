attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aVertexUV;
attribute lowp float aVertexSide;

uniform lowp vec3 uLetterColor;

uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;

uniform lowp float uSelected;
uniform lowp float uHighlighted;

varying lowp vec4 vColor;
varying mediump vec2 vTextureCoord;


void main(void) {

    gl_Position = uProjectionMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);

    lowp vec3 faceColor;

    if(uLetterColorR == 1.0){
        if(aVertexSide == 0.0){ //side of letter
        	faceColor = uLetterColor;
        }else{
        	faceColor = uLetterColor;
        }
    }
    else{
        if(aVertexSide == 0.0){ //side of letter
            faceColor = vec3(0,0.15,0.95);
        }else{
            faceColor = vec3(0,0.1,0.9);
        }
    }

    if(uHighlighted == 1.0){
        if(aVertexSide == 0.0){ //side of letter
            faceColor = vec3(0,0.05,0.6);
        }else{
            faceColor = vec3(0,0.05,0.5);
        }
    }

    if(uSelected == 1.0){
        if(aVertexSide == 0.0){ //side of letter
            faceColor = vec3(0.5,0.05,0.6);
        }else{
            faceColor = vec3(0.5,0.05,0.5);
        }
    }

    faceColor = faceColor + 0.0*aVertexNormal; //prevent aVertexNormal from being optimised away

    vColor = vec4(faceColor,1.0);

    vTextureCoord = aVertexUV;
}
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aVertexUV;
attribute lowp float aVertexSide;

uniform lowp float uLetterColorR;
uniform lowp float uLetterColorG;
uniform lowp float uLetterColorB;

uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;

uniform lowp float uSelected;
uniform lowp float uHighlighted;

varying lowp vec4 vColor;
varying mediump vec2 vTextureCoord;


void main(void) {

    gl_Position = uProjectionMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);

    lowp vec3 faceColor;

    if(aVertexSide == 0.0){ //side of letter
    	faceColor = vec3(uLetterColorR*0.9999,uLetterColorG*0.9999,uLetterColorB*0.9999);
    }else if(aVertexSide > 0.0){
    	faceColor = vec3(uLetterColorR,uLetterColorG,uLetterColorB);
    }else{
    	faceColor = vec3(uLetterColorR,uLetterColorG,uLetterColorB);
    }

    if(uHighlighted == 1.0){
        if(aVertexSide == 0.0){ //side of letter
            faceColor = vec3(0,0.05,0.6);
        }else if(aVertexSide > 0.0){
            faceColor = vec3(0,0.05,0.5);
        }else{
            faceColor = vec3(0,0.05,0.5);
        }
    }

    if(uSelected == 1.0){
        if(aVertexSide == 0.0){ //side of letter
            faceColor = vec3(0.5,0.05,0.6);
        }else if(aVertexSide > 0.0){
            faceColor = vec3(0.5,0.05,0.5);
        }else{
            faceColor = vec3(0.5,0.05,0.5);
        }
    }

    faceColor = faceColor + 0.0*aVertexNormal; //prevent aVertexNormal from being optimised away

    vColor = vec4(faceColor,1.0);

    vTextureCoord = aVertexUV;
}
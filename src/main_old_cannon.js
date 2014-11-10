require(['jquery','./scene/scene','./scene/cube','./scene/letter','./fps-counter', 'cannon','glMatrix'], function($,Scene,Cube,Letter,FpsCounter,Cannon,glM) {

// jQuery DOMReady handler - wait for html document to load
$(function() {






        var initGLContext = function(canvas) {

            gl = null;

            try {
                // Try to grab the standard context. If it fails, fallback to experimental.
                gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            }
            catch(e) {}


            window.gl = gl;


            return gl;

        };

        var getCanvas = function() {
            return  document.getElementById("canvas");   
        };

        var getContext = function() {
            return initGLContext(getCanvas());
        };

        var gl = getContext();

        if(!gl){
            console.error("Unable to initialize WebGL.");
            return; //die
        }




        var dimensionsProvider = function(){
            var canvas = getCanvas();
            return {width: canvas.clientWidth,
                height: canvas.clientHeight};
        };


        var scene = new Scene();

        var canvas = getCanvas();

        scene.viewportWidth = canvas.clientWidth;
        scene.viewportHeight = canvas.clientHeight;




        var world = new CANNON.World();
        world.gravity.set(0,-20.81,0); // m/s²
        world.broadphase = new CANNON.NaiveBroadphase();

        var groundMat = new CANNON.Material();



        // Create a plane
        var groundBody = new CANNON.Body({
            mass: 0, // mass == 0 makes the body static
            material: groundMat
        });
        var groundShape = new CANNON.Box(new CANNON.Vec3(30,0.01,30));
        groundBody.addShape(groundShape);

        groundBody.position.set(0,-5,0);


        world.add(groundBody);





        var positions = [
            {x:0, y:3, z: -10},
            {x:1, y:6, z: -10},   
            {x:-3.5, y:6, z: -10},   

            {x:-1.5, y:9, z: -10},
            {x:2, y:10, z: -10},   
            {x:-3, y:11, z: -10}, 

            {x:0, y:13, z: -10},
            {x:4, y:14, z: -10},   
            {x:-2, y:15, z: -10}, 

            {x:0, y:3, z: -12},
            {x:1, y:6, z: -12},   
            {x:-3.5, y:6, z: -12},   

            {x:-1.5, y:9, z: -12},
            {x:2, y:10, z: -12},   
            {x:-3, y:11, z: -12}, 

            {x:0, y:13, z: -12},
            {x:4, y:14, z: -12},   
            {x:-2, y:15, z: -12}, 


        ]; 



    var cubeMat = new CANNON.Material();

            var cube_ground = new CANNON.ContactMaterial(groundMat, cubeMat, { friction: 0.1, restitution: 0.4 });
            var cube_cube = new CANNON.ContactMaterial(cubeMat, cubeMat, { friction: 0.01, restitution: 0.3 });
            //var mat3_ground = new CANNON.ContactMaterial(groundMaterial, mat3, { friction: 0.0, restitution: 0.9 });

            world.addContactMaterial(cube_ground);
            world.addContactMaterial(cube_cube);


    var cubeCnt = 0;

    var genCube = function(){


            var pos = {x:0 + Math.random()*10-5,y: 14,z:-15 + Math.random()*10-5};
        

            var cube = new Letter('a');


            cube.setPosition(pos);

            var x = Math.random*Math.PI*2;
            var y = Math.random*Math.PI*2;
            var z = Math.random*Math.PI*2;

            var quat = glM.quat.create();

            glM.quat.setAxisAngle(quat,[Math.random(),Math.random(),Math.random()],Math.random()*Math.PI*2);
            glM.quat.normalize(quat,quat);

            cube.setQuaternion({x: quat[0], y: quat[1], z: quat[2], w: quat[3]});


            scene.add(cube);      



            var hull = cube.getConvexHull();

            var hullVerts = [];

            for(var h=0;h<hull.vertices.length/3;h++){

                var hx = hull.vertices[h*3];
                var hy = hull.vertices[h*3+1];
                var hz = hull.vertices[h*3+2];

                vert = new CANNON.Vec3(hx,hy,hz);
                hullVerts.push(vert);
            }

            console.log(hull);

            var shape = new CANNON.ConvexPolyhedron(hullVerts,hull.faces);
            var boxBody = new CANNON.Body({ mass: Math.random(10), material: cubeMat });
            boxBody.addShape(shape);
            boxBody.position.set(cube.position.x, cube.position.y, cube.position.z);
            boxBody.quaternion.copy(cube.quaternion);
            boxBody.__cube = cube;

            world.add(boxBody);
            cubeCnt++;
            if(cubeCnt > 200){
                clearInterval(timer);
            }

    };

    var timer = setInterval(genCube,1000);




        var drawScene = function(){

            gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
            gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

            gl.clearColor(0.3, 0.3, 0.3, 1.0);                      // Set clear color to black, fully opaque
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.

            scene.render(gl);


        };




        /** Set viewport handler */
        var resizeHandler = function(){

            var canvas = getCanvas();

            var width = canvas.clientWidth;

            var height = canvas. clientHeight;


            canvas.width = width;

            canvas.height = height;

            gl.viewport(0, 0, width, height);

            scene.viewportWidth = canvas.clientWidth;
            scene.viewportHeight = canvas.clientHeight;


            //drawScene();
                
        };



        resizeHandler();
        window.addEventListener('resize', resizeHandler);


        var fpsElement = $(".fps");

        var fpsCounter = new FpsCounter();


        var last = null;

        var error_occured = false;

        var animator = function(){
            if(error_occured){
                return;
            }

            window.requestAnimationFrame(animator);

            try{
                fpsCounter.update();


                

                var now = Date.now();

                if(last){
                    var dt = (now - last) / 1000; // seconds

                    try{
                        world.step(dt);
                    }catch(e){
                       //console.log(e);
                    }

                    for(var i=0; i!==world.bodies.length; i++){
                        var b = world.bodies[i],
                            p = b.position,
                            q = b.quaternion;
                            if(b.__cube){
                                var c = b.__cube;
                                c.setPosition(p);
                                c.setQuaternion(q);
                            }
                    }                


                }

                    last = now;
                


                drawScene();
            }catch(e){
                console.error(e);
                error_occured = true;
            }

        };

        setInterval(function(){
                        fpsElement.text(fpsCounter.getCountPerSecond());  
        },1000);


        animator();








});








});
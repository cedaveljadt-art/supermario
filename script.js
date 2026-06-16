kaboom({
    width: 1000,
    height: 500,
    font: "sinko",
    canvas:document.getElementById("canvas"),
    touchToMouse: true
})
function fullscreen(){
    var elem = document.getElementById("canvas");
    elem.focus()
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}
loadSprite("mario","sprites/mario.png", {
    sliceX: 26,
    sliceY: 1,
    anims: {
        idle:{from:8,to:8},
        run: { from: 9, to: 11, loop: true },
        jumpstart: { from: 12, to: 12 },
        jumpend: { from: 13, to: 13 } 
    }
})
loadSprite("shell","sprites/enemiesshell.png", {
    sliceX: 21,
    sliceY: 1,
    anims: {
        run: { from: 19, to: 20, loop: true },
    }
})
loadSprite("ground","sprites/ground-tiled.png");
loadSound("jump","sounds/jump.mp3")
loadSound("end","sounds/end.mp3")
loadSound("song","sounds/song.mp3")
lasttap=0
function isMobile() {
    try {
        const hasTouch = navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
        const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
            .test(navigator.userAgent);

        return hasTouch || isMobileUA;
    } catch (error) {
        return false;
    }
}
if (isMobile()){
    document.getElementById("fullscreen").style.display="none"
    document.getElementById("fullscreenbutton").style.display="flex"
    document.getElementById("devmode").style.display="none"
    document.getElementById("devmodebutton").style.display="flex"
}
function devmode(){
    debug.inspect=!debug.inspect
}
scene("start",()=>{
    onKeyPress("2",()=>{debug.inspect=!debug.inspect})
    add([
        rect(width(),height()),
        color(147, 131, 253)
    ])
    add([
        text("Press space to start",{size:55}),
        pos(width()/2,height()/2),
        origin("center")
    ])
    onKeyPress("space",()=>{
        go("game")
    })
    onClick(()=>{
        go("game")
    })
    onKeyPress("1",fullscreen)
})
started=false
scene("game",()=>{
    if(!started){
        song=play("song",{loop:true})
    }
    onKeyPress("1",fullscreen)
    onKeyPress("2",()=>{debug.inspect=!debug.inspect})
    bg=add([
        rect(width(),height()),
        color(147, 131, 253)
    ])
    ground = add([
        sprite("ground"),
        pos(0,height()-95),
        solid(),
        area(),
        scale(2)
    ])
    mario = add([
        sprite("mario"),
        pos(80,40),
        area({width:16,height:32,offset:vec2(16,0)}),
        solid(),
        body(),
        scale(2)
    ])
    mario.play("idle")
    function enemy(){
       e=add([
            sprite("shell"),
            pos(width(),height()-95),
            origin("botright"),
            move(LEFT,250),
            area({width:16,height:16,offset:vec2(-16,0)}),
            solid(),
            scale(2),
            "enemy"
       ])
       e.play("run")
        wait(rand(0.7,1.3),enemy)
    }
    enemy()
    running=false
    jumping=false
    gravity(3000)
    onKeyDown("space",jump)
    onKeyDown("up",jump)
    onKeyDown("w",jump)
    onMouseDown(jump)
    score=0
    mario.onCollide("enemy",()=>{
        song.stop()
        play("end")
        go("gameOver", score)
    })
    lblScore = add([
        text("Score: " + score, {size:30}),
        pos(40,40)
    ])
    onUpdate(()=>{
        for (const e of get("enemy")) {
            if (e.pos.x < -64) {
                destroy(e)
            }
        }
        console.log(get().length)
        score+=1
        lblScore.text = "Score: " + score
        if(mario.isGrounded() && !running){
            jumping=false
            running=true
            mario.play("run")
        }
    })
    function jump(){
        if(mario.isGrounded() && !jumping){
            running=false
            jumping=true
            mario.jump(1300)
            play("jump")
            mario.play("jumpstart")
            wait(0.3, () => {
                mario.play("jumpend")
            })
        }
    }

})
high = 0
scene("gameOver",(score)=>{
    high = Number(localStorage.getItem("high")) || 0
    started=false
    wait(3,()=>{
        song=play("song",{loop:true})
        started=true
    })
    onKeyPress("1",fullscreen)
    onKeyPress("2",()=>{debug.inspect=!debug.inspect})
    if(high< score){
        high = score
        localStorage.setItem("high", score);
    }
  
    add([
        rect(width(),height()),
        color(147, 131, 253)
    ])
    add([
        text("High Score: " + high,{size:50}),
        pos(width()/2,height()/2),
        origin("center")
    ])
    add([
        text("Score: " + score,{size:50}),
        pos(width()/2,height()/2-100),
        origin("center")
    ])
    add([
        text("Press space to try again",{size:50}),
        pos(width()/2,height()/2+100),
        origin("center")
    ])
    onKeyPress("space",()=>{
        go("game")
    })
    onClick(()=>{
        go("game")
    })
})
go("start")

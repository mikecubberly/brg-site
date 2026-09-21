(function(){
function spaceCanvas(id){
  var canvas=document.getElementById(id);
  if(!canvas)return;
  var ctx=canvas.getContext("2d");
  var par=canvas.parentElement;
  var W,H,ents=[],shots=[],plPos=[],frame=0,nxt=100;
  var motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  var frameId=null;
  function paused(){return motionQuery.matches||document.documentElement.dataset.motion==='paused';}
  function rand(a,b){return a+Math.random()*(b-a);}
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  function Star(){
    this.init=function(){this.x=rand(0,W);this.y=rand(0,H);this.r=rand(.3,1.8);this.a=rand(.06,.5);this.ts=rand(.004,.018);this.to=rand(0,Math.PI*2);this.dx=rand(-.05,.05);};
    this.update=function(){this.to+=this.ts;this.x+=this.dx;if(this.x<-4)this.x=W+4;if(this.x>W+4)this.x=-4;};
    this.draw=function(){var a=this.a*(.55+.45*Math.sin(this.to));ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle="rgba(120,132,185,"+a+")";ctx.fill();};
    this.init();
  }
  function Shoot(){
    this.go=function(){this.x=rand(W*.1,W*.9);this.y=rand(H*.04,H*.38);this.len=rand(90,230);this.ang=rand(Math.PI/7,Math.PI/3);this.spd=rand(7,15);this.life=0;this.max=rand(38,72);this.a=0;};
    this.update=function(){this.life++;var t=this.life/this.max;this.a=t<.15?t/.15:t>.68?1-(t-.68)/.32:1;this.x+=Math.cos(this.ang)*this.spd;this.y+=Math.sin(this.ang)*this.spd;return this.life<this.max;};
    this.draw=function(){var a=this.a*.72;var g=ctx.createLinearGradient(this.x,this.y,this.x-Math.cos(this.ang)*this.len,this.y-Math.sin(this.ang)*this.len);g.addColorStop(0,"rgba(91,107,255,"+a+")");g.addColorStop(.5,"rgba(160,172,226,"+(a*.35)+")");g.addColorStop(1,"rgba(255,255,255,0)");ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.x-Math.cos(this.ang)*this.len,this.y-Math.sin(this.ang)*this.len);ctx.strokeStyle=g;ctx.lineWidth=1.8;ctx.stroke();};
    this.go();
  }
  function Cloud(init){
    this.spawn=function(i){this.s=rand(.45,1.5);this.y=rand(H*.04,H*.88);this.x=i?rand(-300,W+300):W+380;this.spd=rand(.1,.3);this.a=rand(.04,.12);};
    this.update=function(){this.x-=this.spd;if(this.x<-420)this.spawn(false);};
    this.blob=function(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    this.draw=function(){ctx.fillStyle="rgba(190,200,235,"+this.a+")";var s=this.s;this.blob(this.x,this.y,68*s,25*s);this.blob(this.x+48*s,this.y-14*s,46*s,21*s);this.blob(this.x-36*s,this.y-9*s,40*s,18*s);this.blob(this.x+9*s,this.y-22*s,32*s,16*s);};
    this.spawn(init);
  }
  function Planet(kind){
    var self=this;
    this.spawn=function(){
      var tries=0,ok=false,r,ix,iy;
      while(!ok&&tries<40){r=rand(20,50);ix=rand(r*4,W-r*4);iy=rand(r*4,H-r*4);ok=true;
        for(var p=0;p<plPos.length;p++){var dx=ix-plPos[p].x,dy=iy-plPos[p].y;if(Math.sqrt(dx*dx+dy*dy)<r+plPos[p].r+90){ok=false;break;}}tries++;}
      var styles=[{r:46,h:36,s:58},{r:23,h:220,s:5},{r:34,h:185,s:65},{r:29,h:15,s:62}];
      var style=styles[kind];
      self.r=Math.min(r,style.r);self.ix=ix;self.iy=iy;self.x=ix;self.y=iy;self.a=.23;self.hue=style.h;self.sat=style.s;
      self.hasRing=kind===0;self.ringTilt=.36;self.tilt=[-.35,.2,.65,-.2][kind];self.phase=rand(0,Math.PI*2);self.period=rand(300,700);self.bands=7;
      // Surface details are generated once, so they never flicker between frames.
      self.details=[];
      for(var d=0;d<22;d++){var angle=rand(0,Math.PI*2),distance=Math.sqrt(Math.random())*.86;self.details.push({x:Math.cos(angle)*distance,y:Math.sin(angle)*distance,r:rand(.035,.16),angle:angle});}
      plPos.push({x:self.ix,y:self.iy,r:self.r});
    };
    this.update=function(){this.phase+=(Math.PI*2)/this.period;this.x=this.ix+Math.cos(this.phase)*7;this.y=this.iy+Math.sin(this.phase*.65)*5;};
    this.draw=function(){
      var x=this.x,y=this.y,r=this.r,hue=this.hue,sat=this.sat,a=this.a;
      ctx.save();ctx.translate(x,y);ctx.rotate(self.tilt);x=0;y=0;
      function ring(start,end){ctx.save();ctx.scale(1,self.ringTilt);ctx.beginPath();ctx.arc(0,0,r*1.72,start,end);ctx.strokeStyle="hsla(36,48%,70%,"+(a*.85)+")";ctx.lineWidth=r*.23;ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*1.96,start,end);ctx.strokeStyle="hsla(40,38%,84%,"+(a*.55)+")";ctx.lineWidth=r*.045;ctx.stroke();ctx.restore();}
      if(self.hasRing)ring(Math.PI,Math.PI*2);
      if(kind===0||kind===2){var atm=ctx.createRadialGradient(x,y,r*.85,x,y,r*1.35);atm.addColorStop(0,"hsla("+hue+","+sat+"%,70%,"+(a*.22)+")");atm.addColorStop(1,"hsla("+hue+","+sat+"%,70%,0)");ctx.beginPath();ctx.arc(x,y,r*1.35,0,Math.PI*2);ctx.fillStyle=atm;ctx.fill();}
      var sph=ctx.createRadialGradient(x-r*.32,y-r*.32,r*.08,x,y,r);sph.addColorStop(0,"hsla("+hue+","+(sat+8)+"%,92%,"+(a*1.5)+")");sph.addColorStop(.55,"hsla("+hue+","+sat+"%,78%,"+(a*1.2)+")");sph.addColorStop(1,"hsla("+(hue-10)+","+(sat-5)+"%,62%,"+a+")");ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=sph;ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
      if(kind===0){
        for(var i=0;i<self.bands;i++){var by=-r+(r*2/(self.bands+1))*(i+1);ctx.beginPath();ctx.moveTo(-r,by);ctx.bezierCurveTo(-r*.4,by+r*.16,r*.4,by-r*.12,r,by+r*.04);ctx.strokeStyle=i%2?"rgba(125,71,32,.24)":"rgba(247,215,149,.22)";ctx.lineWidth=r*(i%2?.13:.07);ctx.stroke();}
        ctx.beginPath();ctx.ellipse(r*.3,r*.28,r*.22,r*.1,-.1,0,Math.PI*2);ctx.fillStyle="rgba(163,89,47,.3)";ctx.fill();
      }else if(kind===1){
        self.details.forEach(function(d){var cx=d.x*r,cy=d.y*r,cr=d.r*r;ctx.beginPath();ctx.arc(cx,cy,cr,0,Math.PI*2);ctx.fillStyle="rgba(24,28,40,.24)";ctx.fill();ctx.beginPath();ctx.arc(cx,cy,cr,-.3,Math.PI*.8);ctx.strokeStyle="rgba(231,237,246,.27)";ctx.lineWidth=Math.max(.65,r*.025);ctx.stroke();});
      }else if(kind===2){
        self.details.slice(0,12).forEach(function(d){ctx.beginPath();ctx.moveTo(d.x*r,d.y*r);ctx.lineTo((d.x+.12)*r,(d.y+.18)*r);ctx.lineTo((d.x+.07)*r,(d.y+.32)*r);ctx.strokeStyle="rgba(49,139,168,.3)";ctx.lineWidth=r*.024;ctx.stroke();});
        ctx.beginPath();ctx.ellipse(0,-r*.86,r*.65,r*.22,0,0,Math.PI*2);ctx.fillStyle="rgba(229,253,255,.38)";ctx.fill();
      }else{
        self.details.forEach(function(d){ctx.beginPath();ctx.ellipse(d.x*r,d.y*r,d.r*r*1.7,d.r*r,d.angle,0,Math.PI*2);ctx.fillStyle="rgba(100,41,25,.22)";ctx.fill();});
        ctx.beginPath();ctx.moveTo(-r*.8,r*.05);ctx.bezierCurveTo(-r*.3,-r*.25,r*.1,r*.45,r*.8,r*.12);ctx.strokeStyle="rgba(76,33,27,.3)";ctx.lineWidth=r*.055;ctx.stroke();
      }
      var shadow=ctx.createLinearGradient(-r,0,r,0);shadow.addColorStop(0,"rgba(4,5,12,0)");shadow.addColorStop(.55,"rgba(4,5,12,.04)");shadow.addColorStop(1,"rgba(4,5,12,.38)");ctx.fillStyle=shadow;ctx.fillRect(-r,-r,r*2,r*2);
      ctx.restore();
      if(self.hasRing)ring(0,Math.PI);
      var spec=ctx.createRadialGradient(x-r*.4,y-r*.4,0,x-r*.4,y-r*.4,r*.42);spec.addColorStop(0,"rgba(255,255,255,"+(a*.55)+")");spec.addColorStop(1,"rgba(255,255,255,0)");ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=spec;ctx.fill();
      ctx.restore();
    };
    this.spawn();
  }
  function Rocket(init){
    this.spawn=function(i){this.sz=rand(12,34);this.ang=rand(-Math.PI/5,Math.PI/5)-Math.PI/2;var e=Math.floor(rand(0,4));if(e===0){this.x=rand(0,W);this.y=H+60;}else if(e===1){this.x=-60;this.y=rand(0,H);}else if(e===2){this.x=W+60;this.y=rand(0,H);}else{this.x=rand(0,W);this.y=-60;}if(i){this.x=rand(-60,W+60);this.y=rand(-60,H+60);}this.spd=rand(.5,1.3);this.a=rand(.1,.27);this.vx=Math.cos(this.ang)*this.spd;this.vy=Math.sin(this.ang)*this.spd;this.wander=rand(-.003,.003);this.fl=0;};
    this.off=function(){return this.x<-110||this.x>W+110||this.y<-110||this.y>H+110;};
    this.update=function(){this.ang+=this.wander;this.vx=Math.cos(this.ang)*this.spd;this.vy=Math.sin(this.ang)*this.spd;this.x+=this.vx;this.y+=this.vy;this.fl=Math.random();if(this.off())this.spawn(false);};
    this.draw=function(){
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.ang+Math.PI/2);var s=this.sz,a=this.a;
      var fg=ctx.createLinearGradient(0,s*.4,0,s*1.1);fg.addColorStop(0,"rgba(255,180,80,"+(a*(.5+this.fl*.5))+")");fg.addColorStop(.5,"rgba(255,100,40,"+(a*.28)+")");fg.addColorStop(1,"rgba(255,80,20,0)");ctx.beginPath();ctx.moveTo(-s*.18,s*.42);ctx.quadraticCurveTo(0,s*1.06+this.fl*s*.14,s*.18,s*.42);ctx.fillStyle=fg;ctx.fill();
      ctx.beginPath();ctx.moveTo(0,-s*.55);ctx.bezierCurveTo(s*.28,-s*.2,s*.28,s*.3,s*.2,s*.45);ctx.lineTo(-s*.2,s*.45);ctx.bezierCurveTo(-s*.28,s*.3,-s*.28,-s*.2,0,-s*.55);ctx.fillStyle="rgba(218,224,246,"+(a*1.3)+")";ctx.fill();
      ctx.beginPath();ctx.arc(0,0,s*.14,0,Math.PI*2);ctx.fillStyle="rgba(91,107,255,"+(a*.9)+")";ctx.fill();
      ctx.beginPath();ctx.arc(-s*.04,-s*.04,s*.06,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,"+(a*.55)+")";ctx.fill();
      ctx.fillStyle="rgba(158,168,208,"+a+")";ctx.beginPath();ctx.moveTo(-s*.2,s*.35);ctx.lineTo(-s*.42,s*.52);ctx.lineTo(-s*.2,s*.46);ctx.fill();ctx.beginPath();ctx.moveTo(s*.2,s*.35);ctx.lineTo(s*.42,s*.52);ctx.lineTo(s*.2,s*.46);ctx.fill();
      ctx.restore();
    };
    this.spawn(init);
  }
  function init(){resize();ents=[];plPos=[];for(var i=0;i<130;i++)ents.push(new Star());for(var i=0;i<6;i++)ents.push(new Cloud(true));for(var i=0;i<4;i++)ents.push(new Planet(i));for(var i=0;i<5;i++)ents.push(new Rocket(true));}
  function loop(){frameId=null;ctx.clearRect(0,0,W,H);if(!paused()){frame++;if(frame>=nxt){shots.push(new Shoot());nxt=frame+Math.floor(rand(160,450));}shots=shots.filter(function(s){return s.update();});}ents.forEach(function(e){if(!paused())e.update();e.draw();});if(!paused())shots.forEach(function(s){s.draw();});if(!paused()&&!document.hidden)frameId=requestAnimationFrame(loop);}
  function resumeMotion(){if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;loop();}
  window.addEventListener("resize",function(){init();resumeMotion();});
  motionQuery.addEventListener('change',resumeMotion);
  document.addEventListener('brg:motion-change',resumeMotion);
  document.addEventListener('visibilitychange',resumeMotion);
  init();loop();
}

spaceCanvas('space-canvas');
})();


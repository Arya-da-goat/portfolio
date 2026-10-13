const $=s=>document.querySelector(s);
const header=$('#header'),nav=$('#navLinks'),menuBtn=$('#menuBtn'),toast=$('#toast');
$('#year').textContent=new Date().getFullYear();
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('show'),2400)}
window.addEventListener('scroll',()=>{header.classList.toggle('scrolled',scrollY>24);let current='home';document.querySelectorAll('main section[id]').forEach(s=>{if(scrollY>=s.offsetTop-150)current=s.id});document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current))},{passive:true});
menuBtn.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'✕':'☰'});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰'}));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{$('#serviceSelect').value=a.dataset.service;setTimeout(()=>$('#message').focus({preventScroll:true}),300)}));
$('#copyEmail').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('eliteninja12347@gmail.com');notify('Email copied to clipboard!')}catch(e){const t=document.createElement('textarea');t.value='eliteninja12347@gmail.com';document.body.append(t);t.select();document.execCommand('copy');t.remove();notify('Email copied!')}});
$('#contactForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#senderName').value.trim();const service=$('#serviceSelect').value;const message=$('#message').value.trim();const subject=encodeURIComponent('Portfolio enquiry — '+service);const body=encodeURIComponent((name?'Name: '+name+'\n':'')+'Service: '+service+'\n\nProject details:\n'+message);window.location.href='mailto:eliteninja12347@gmail.com?subject='+subject+'&body='+body;notify('Opening your email app…')});
// Subtle pointer glow and tilt effects, disabled on touch devices.
const glow=$('#cursorGlow');
if(matchMedia('(pointer:fine)').matches){window.addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});
document.querySelectorAll('.tilt').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*4}deg) rotateY(${x*5}deg) translateY(-3px)`});card.addEventListener('pointerleave',()=>card.style.transform='')})}
// Lightweight animated star particles.
const canvas=$('#stars'),ctx=canvas.getContext('2d');let stars=[],w=0,h=0,dpr=1;
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);stars=Array.from({length:Math.min(100,Math.floor(w*h/13000))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.4+.25,v:Math.random()*.22+.04,a:Math.random()*.55+.15,phase:Math.random()*6.28}))}
let frame=0;function draw(){ctx.clearRect(0,0,w,h);frame+=.01;for(const s of stars){s.y-=s.v;if(s.y<-3){s.y=h+3;s.x=Math.random()*w}const alpha=s.a*(.65+.35*Math.sin(frame+s.phase));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(174,198,255,${alpha})`;ctx.fill()}requestAnimationFrame(draw)}
resize();addEventListener('resize',resize,{passive:true});draw();


// Interactive procedural planet: drag to rotate, pause, and reset.
(()=>{
 const canvas=document.querySelector('#planetCanvas');
 const stage=document.querySelector('#planetStage');
 const control=document.querySelector('#planetControl');
 const reset=document.querySelector('#planetReset');
 const coords=document.querySelector('#planetCoords');
 if(!canvas||!stage)return;
 const ctx=canvas.getContext('2d');
 let width=0,height=0,dpr=1,rotation=-.55,tilt=-.16,velocity=0,dragging=false,lastX=0,lastY=0,paused=false,lastTime=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const points=[];
 // Fibonacci sphere points form a crisp glowing land-like particle pattern.
 const count=950,golden=Math.PI*(3-Math.sqrt(5));
 for(let i=0;i<count;i++){const y=1-(i/(count-1))*2;const radius=Math.sqrt(1-y*y);const theta=golden*i;points.push({x:Math.cos(theta)*radius,y,z:Math.sin(theta)*radius,size:.35+Math.random()*.8,seed:Math.random()});}
 function resize(){const r=stage.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);width=Math.max(1,r.width);height=Math.max(1,r.height);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function draw(time=0){const dt=Math.min(32,time-(lastTime||time));lastTime=time;if(!dragging&&!paused&&!reduced)rotation+=.00042*dt+velocity;velocity*=.94;
  ctx.clearRect(0,0,width,height);const cx=width/2,cy=height*.49,R=Math.min(width,height)*.315;
  // atmospheric halo
  const halo=ctx.createRadialGradient(cx,cy,R*.65,cx,cy,R*1.48);halo.addColorStop(0,'rgba(36,109,255,0)');halo.addColorStop(.65,'rgba(36,109,255,.07)');halo.addColorStop(1,'rgba(36,109,255,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,R*1.5,0,Math.PI*2);ctx.fill();
  // shaded sphere base
  const sphere=ctx.createRadialGradient(cx-R*.35,cy-R*.4,R*.04,cx+R*.12,cy+R*.12,R*1.22);sphere.addColorStop(0,'#2867a8');sphere.addColorStop(.38,'#123a72');sphere.addColorStop(.76,'#09172e');sphere.addColorStop(1,'#030914');ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.clip();
  // rotating longitude and latitude arcs
  ctx.lineWidth=.65;
  for(let lon=0;lon<Math.PI;lon+=Math.PI/6){ctx.beginPath();for(let a=0;a<=Math.PI*2+.03;a+=.035){const x=Math.sin(a)*Math.sin(lon),z=Math.cos(a)*Math.sin(lon);const p=project(x,Math.cos(lon),z,cx,cy,R);if(a===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}ctx.strokeStyle='rgba(92,190,255,.19)';ctx.stroke()}
  for(let lat=-1.2;lat<=1.21;lat+=.4){ctx.beginPath();for(let a=0;a<=Math.PI*2+.03;a+=.035){const rr=Math.cos(lat),x=Math.cos(a)*rr,z=Math.sin(a)*rr;const p=project(x,Math.sin(lat),z,cx,cy,R);if(a===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}ctx.strokeStyle='rgba(105,180,255,.14)';ctx.stroke()}
  // points rotate in 3D and glow on the visible hemisphere
  for(const q of points){const x=q.x*Math.cos(rotation)-q.z*Math.sin(rotation),z=q.x*Math.sin(rotation)+q.z*Math.cos(rotation);const y=q.y*Math.cos(tilt)-z*Math.sin(tilt),zz=q.y*Math.sin(tilt)+z*Math.cos(tilt);if(zz<-.06)continue;const px=cx+x*R,py=cy+y*R;const alpha=.25+zz*.66;ctx.beginPath();ctx.arc(px,py,q.size*(.65+zz*.5),0,Math.PI*2);ctx.fillStyle=q.seed>.94?`rgba(110,242,255,${alpha})`:`rgba(114,181,255,${alpha*.78})`;ctx.fill();if(q.seed>.985){ctx.beginPath();ctx.arc(px,py,q.size*3.3,0,Math.PI*2);ctx.fillStyle=`rgba(110,242,255,${alpha*.12})`;ctx.fill()}}
  // limb highlight
  ctx.restore();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle='rgba(110,220,255,.72)';ctx.lineWidth=1.1;ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,R*1.015,R*.99,-.18,Math.PI*1.02,Math.PI*1.86);ctx.strokeStyle='rgba(174,145,255,.56)';ctx.lineWidth=1.5;ctx.stroke();
  if(coords)coords.textContent='ROT '+String(Math.round((((rotation%(Math.PI*2))+Math.PI*2)%(Math.PI*2))*180/Math.PI)).padStart(3,'0')+'°';
  requestAnimationFrame(draw);
 }
 function project(x,y,z,cx,cy,r){return{x:cx+x*r,y:cy+y*r,z}}
 canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing'});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;rotation+=dx*.009;tilt=Math.max(-.9,Math.min(.9,tilt+dy*.004));velocity=dx*.00015;lastX=e.clientX;lastY=e.clientY});
 function endDrag(){dragging=false;canvas.style.cursor='grab'}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 control?.addEventListener('click',()=>{paused=!paused;control.textContent=paused?'▶':'Ⅱ';control.setAttribute('aria-label',paused?'Resume planet rotation':'Pause planet rotation');});
 reset?.addEventListener('click',()=>{rotation=-.55;tilt=-.16;velocity=0;paused=false;if(control){control.textContent='Ⅱ';control.setAttribute('aria-label','Pause planet rotation')}if(coords)coords.textContent='ROT 000°';});
 new ResizeObserver(resize).observe(stage);resize();requestAnimationFrame(draw);
})();

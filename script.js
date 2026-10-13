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

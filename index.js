/* ==============================================
   AUDIO SETUP (Mobile Unblock Trick)
============================================== */
const bgMusic = new Audio('music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

const fireworkSoundPath = 'firework.mp3';
let audioUnlocked = false;

// ไอফোনে বা অ্যান্ড্রয়েডে অডিও ব্লক খোলার ট্রিক
function unlockAudio() {
    if (!audioUnlocked) {
        bgMusic.play().catch(e => console.log("Music play issue:", e));
        
        // Pre-warm fireworks sound for mobile browsers
        let dummy = new Audio(fireworkSoundPath);
        dummy.volume = 0; // সাইলেন্ট
        dummy.play().then(() => {
            dummy.pause();
            dummy.currentTime = 0;
        }).catch(e => {});
        
        audioUnlocked = true;
    }
}

/* ==============================================
   LOGIC & ANIMATIONS
============================================== */

let taps = 0;
function tapHeart() {
    unlockAudio(); // আনলক অডিও
    taps++;
    
    const heart = document.querySelector('.heart-container');
    const counter = document.getElementById('tap-counter');
    
    // Heart jump effect
    heart.style.transform = `scale(1.3) rotate(${Math.random() * 20 - 10}deg)`;
    setTimeout(() => heart.style.transform = 'scale(1)', 150);
    
    counter.innerText = `${taps}/5`;

    if (taps >= 5) {
        setTimeout(() => nextScreen(1, 2), 400);
    }
}

function nextScreen(currentId, nextId) {
    const current = document.getElementById(`screen-${currentId}`);
    const next = document.getElementById(`screen-${nextId}`);
    
    current.classList.remove('active');
    setTimeout(() => {
        current.classList.add('hidden');
        next.classList.remove('hidden');
        setTimeout(() => next.classList.add('active'), 50);
    }, 1000); 
}

let blownCandles = 0;
const totalCandles = 3;

function blowCandle(element) {
    if (element.classList.contains('blown')) return; 
    
    element.classList.add('blown');
    blownCandles++;

    if (blownCandles >= totalCandles) {
        setTimeout(() => {
            nextScreen(4, 5);
            startFireworks();
        }, 1500);
    }
}

/* ==============================================
   CANVAS PARTICLE ENGINE (Ambient + Fireworks)
============================================== */

const aCanvas = document.getElementById('ambient-canvas');
const aCtx = aCanvas.getContext('2d');
let aW, aH;
let particles = [];

function resizeAmbient() {
    aW = aCanvas.width = window.innerWidth;
    aH = aCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeAmbient);
resizeAmbient();

class Particle {
    constructor() {
        this.x = Math.random() * aW;
        this.y = Math.random() * aH;
        this.r = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5 - 0.5; 
        this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < 0) this.y = aH;
        if (this.x < 0) this.x = aW;
        if (this.x > aW) this.x = 0;
    }
    draw() {
        aCtx.beginPath();
        aCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        aCtx.fillStyle = `rgba(242, 199, 146, ${this.alpha})`;
        aCtx.fill();
    }
}

for (let i = 0; i < 70; i++) particles.push(new Particle()); // 70 for better mobile performance

function animateAmbient() {
    aCtx.clearRect(0, 0, aW, aH);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateAmbient);
}
animateAmbient();

// Fireworks Engine
const fCanvas = document.getElementById('fireworks-canvas');
const fCtx = fCanvas.getContext('2d');
let fW, fH;
let fireworks = [];
let fireworkParticles = [];
let isFireworksActive = false;

function resizeFireworks() {
    fW = fCanvas.width = window.innerWidth;
    fH = fCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFireworks);
resizeFireworks();

class Firework {
    constructor() {
        this.x = Math.random() * fW;
        this.y = fH;
        this.targetY = Math.random() * (fH / 2);
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -(Math.random() * 3 + 8);
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        if (this.vy >= 0 || this.y <= this.targetY) {
            this.explode();
            return true; // remove
        }
        return false;
    }
    draw() {
        fCtx.beginPath();
        fCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        fCtx.fillStyle = this.color;
        fCtx.fill();
    }
    explode() {
        let boomSound = new Audio(fireworkSoundPath);
        boomSound.volume = 0.3;
        boomSound.play().catch(e => {});

        for (let i = 0; i < 50; i++) { // 50 for smooth mobile render
            fireworkParticles.push(new FParticle(this.x, this.y, this.color));
        }
    }
}

class FParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    update() {
        this.vx *= 0.95; 
        this.vy *= 0.95;
        this.vy += 0.1;  
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        return this.alpha <= 0;
    }
    draw() {
        fCtx.save();
        fCtx.globalAlpha = this.alpha;
        fCtx.beginPath();
        fCtx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        fCtx.fillStyle = this.color;
        fCtx.fill();
        fCtx.restore();
    }
}

function animateFireworks() {
    if(!isFireworksActive) return;
    
    fCtx.globalCompositeOperation = 'destination-out';
    fCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    fCtx.fillRect(0, 0, fW, fH);
    fCtx.globalCompositeOperation = 'lighter';

    if (Math.random() < 0.06) fireworks.push(new Firework());

    for (let i = fireworks.length - 1; i >= 0; i--) {
        if (fireworks[i].update()) fireworks.splice(i, 1);
        else fireworks[i].draw();
    }

    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
        if (fireworkParticles[i].update()) fireworkParticles.splice(i, 1);
        else fireworkParticles[i].draw();
    }

    requestAnimationFrame(animateFireworks);
}

function startFireworks() {
    fCanvas.style.opacity = '1';
    isFireworksActive = true;
    animateFireworks();
}

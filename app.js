// GLOBAL STATE & LOGIC
const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const todayDate = new Date();
const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2,'0')}-${String(todayDate.getDate()).padStart(2,'0')}`;

let habits = JSON.parse(localStorage.getItem('synapse_habits_v3')) || [];
let stats = JSON.parse(localStorage.getItem('synapse_stats_v3')) || {
    streak: 0,
    bestStreak: 0,
    history: [],
    totalCompleted: 0
};
let profile = JSON.parse(localStorage.getItem('synapse_profile')) || { name: '', target: '', reminderTime: '' };

const lastLogin = localStorage.getItem('synapse_last_login');
if (lastLogin !== todayStr) {
    // New Day: Calculate if yesterday was complete, add to total completed
    let completedYesterday = habits.filter(h => h.completed).length;
    stats.totalCompleted += completedYesterday;
    
    // Reset checkboxes for today
    habits.forEach(h => h.completed = false);
    localStorage.setItem('synapse_last_login', todayStr);
    saveData();
}

function saveData() {
    localStorage.setItem('synapse_habits_v3', JSON.stringify(habits));
    localStorage.setItem('synapse_stats_v3', JSON.stringify(stats));
    localStorage.setItem('synapse_profile', JSON.stringify(profile));
}

function calculateDailyGoal() {
    if(habits.length === 0) return false;
    return habits.filter(h => h.completed).length > 0; 
}

function updateStreakLogic() {
    const metGoal = calculateDailyGoal();
    const historyIndex = stats.history.indexOf(todayStr);

    if (metGoal && historyIndex === -1) {
        stats.history.push(todayStr);
    } else if (!metGoal && historyIndex !== -1) {
        stats.history.splice(historyIndex, 1);
    }
    stats.history.sort();

    let currentStreak = 0;
    let checkDate = new Date(todayDate);
    while (true) {
        let checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
        if (stats.history.includes(checkStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            if (checkStr === todayStr && !metGoal) break;
            else break;
        }
    }
    
    let displayStreak = 0;
    let yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    let yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth()+1).padStart(2,'0')}-${String(yesterdayDate.getDate()).padStart(2,'0')}`;

    if (metGoal) {
        displayStreak = currentStreak;
    } else if (stats.history.includes(yesterdayStr)) {
        let tempStreak = 0;
        let tempDate = new Date(yesterdayDate);
        while(true) {
            let tempStr = `${tempDate.getFullYear()}-${String(tempDate.getMonth()+1).padStart(2,'0')}-${String(tempDate.getDate()).padStart(2,'0')}`;
            if(stats.history.includes(tempStr)) {
                tempStreak++;
                tempDate.setDate(tempDate.getDate() - 1);
            } else { break; }
        }
        displayStreak = tempStreak;
    } else {
        displayStreak = 0;
    }

    stats.streak = displayStreak;
    if(displayStreak > stats.bestStreak) {
        stats.bestStreak = displayStreak;
    }
    saveData();
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================
function checkAndRequestNotification() {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

function startNotificationService() {
    if (!profile.reminderTime || Notification.permission !== "granted") return;
    
    setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        // Check if it's the right minute and we haven't completed the goal yet
        if (currentTime === profile.reminderTime && now.getSeconds() < 10) {
            if(!calculateDailyGoal()) {
                new Notification("Synapse Reminder", {
                    body: "Time to complete your daily habits! Keep your streak alive. 🔥",
                    icon: "https://cdn-icons-png.flaticon.com/512/8136/8136069.png"
                });
            }
        }
    }, 10000); // Check every 10 seconds
}

// ==========================================
// INTERACTIVE ANIMATIONS MODULE
// ==========================================
document.addEventListener('click', (e) => {
    if(e.target.tagName === 'INPUT' && e.target.type === 'text') return;
    const numSparks = 6;
    for (let i = 0; i < numSparks; i++) {
        const spark = document.createElement('div');
        spark.classList.add('click-spark');
        spark.style.left = (e.clientX - 3) + 'px';
        spark.style.top = (e.clientY - 3) + 'px';
        spark.style.background = Math.random() > 0.5 ? 'var(--neon-cyan)' : 'var(--neon-magenta)';
        spark.style.boxShadow = `0 0 10px ${spark.style.background}`;
        document.body.appendChild(spark);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 40 + 20;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        setTimeout(() => {
            spark.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
            spark.style.opacity = '0';
        }, 10);
        setTimeout(() => spark.remove(), 600);
    }
});

function initStarfield() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-stars-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0'; canvas.style.left = '0';
    canvas.style.width = '100vw'; canvas.style.height = '100vh';
    canvas.style.zIndex = '-1'; canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let width, height; let stars = [];
    function resize() { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; }
    class Star {
        constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.size = Math.random() * 1.5; this.speedY = Math.random() * 0.5 + 0.1; this.opacity = Math.random(); this.twinkleDir = Math.random() > 0.5 ? 1 : -1; }
        update() { this.y += this.speedY; if (this.y > height) { this.y = 0; this.x = Math.random() * width; } this.opacity += 0.02 * this.twinkleDir; if (this.opacity > 1) { this.opacity = 1; this.twinkleDir = -1; } if (this.opacity < 0.2) { this.opacity = 0.2; this.twinkleDir = 1; } }
        draw() { ctx.fillStyle = `rgba(0, 243, 255, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
    }
    class ShootingStar {
        constructor() { this.reset(); }
        reset() { this.x = Math.random() * width; this.y = 0; this.len = Math.random() * 80 + 20; this.speedX = (Math.random() - 0.5) * 5; this.speedY = Math.random() * 10 + 5; this.active = false; this.wait = Math.random() * 300 + 100; }
        update() { if (!this.active) { this.wait--; if (this.wait <= 0) this.active = true; return; } this.x += this.speedX; this.y += this.speedY; if (this.y > height + this.len) this.reset(); }
        draw() { if (!this.active) return; ctx.strokeStyle = 'rgba(255, 0, 234, 0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x - this.speedX * (this.len/this.speedY), this.y - this.len); ctx.stroke(); }
    }
    function init() { resize(); window.addEventListener('resize', resize); for (let i = 0; i < 100; i++) stars.push(new Star()); for (let i = 0; i < 3; i++) stars.push(new ShootingStar()); animate(); }
    function animate() { ctx.clearRect(0, 0, width, height); stars.forEach(star => { star.update(); star.draw(); }); requestAnimationFrame(animate); }
    init();
}

document.addEventListener("DOMContentLoaded", () => {
    const dateEl = document.getElementById('currentDate');
    if(dateEl) dateEl.innerText = " | " + todayDate.toLocaleDateString('en-US', dateOptions);
    initStarfield();
    checkAndRequestNotification();
    startNotificationService();
});

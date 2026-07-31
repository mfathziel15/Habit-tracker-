// GLOBAL STATE & LOGIC (Shared across all pages)
const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// Standardize date to YYYY-MM-DD based on local time
const todayDate = new Date();
const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2,'0')}-${String(todayDate.getDate()).padStart(2,'0')}`;

// Load data from LocalStorage
let habits = JSON.parse(localStorage.getItem('synapse_habits_v2')) || [
    { name: "Morning Workout", completed: false },
    { name: "Read 20 pages", completed: false }
];
let stats = JSON.parse(localStorage.getItem('synapse_stats_v2')) || {
    streak: 0,
    history: [] // Array of 'YYYY-MM-DD' where goal was met
};

// Check if we entered a new day. If so, reset today's habits checkboxes, BUT keep the names.
const lastLogin = localStorage.getItem('synapse_last_login');
if (lastLogin !== todayStr) {
    habits.forEach(h => h.completed = false); // Reset checkboxes for the new day
    localStorage.setItem('synapse_last_login', todayStr);
    saveData();
}

function saveData() {
    localStorage.setItem('synapse_habits_v2', JSON.stringify(habits));
    localStorage.setItem('synapse_stats_v2', JSON.stringify(stats));
}

// Logic to calculate if today's goal is met (at least 1 habit completed)
function calculateDailyGoal() {
    if(habits.length === 0) return false;
    const completedCount = habits.filter(h => h.completed).length;
    // We consider the daily streak maintained if > 0 habits are done. (Duolingo style: do minimum 1 lesson)
    return completedCount > 0; 
}

// Logic to calculate and update streak
function updateStreakLogic() {
    const metGoal = calculateDailyGoal();
    const historyIndex = stats.history.indexOf(todayStr);

    // Add or remove today from history based on completion
    if (metGoal && historyIndex === -1) {
        stats.history.push(todayStr);
    } else if (!metGoal && historyIndex !== -1) {
        stats.history.splice(historyIndex, 1);
    }

    // Sort history to make checking easier
    stats.history.sort();

    // Recalculate streak counting backwards from today
    let currentStreak = 0;
    let checkDate = new Date(todayDate); // start from today

    while (true) {
        let checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
        
        if (stats.history.includes(checkStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1); // move to yesterday
        } else {
            // If today is missed, but yesterday was done, streak is 0 today, but we don't break logic.
            // Duolingo breaks streak if you miss a full day.
            if (checkStr === todayStr && !metGoal) {
                // Today is missed, but let's check yesterday. If yesterday was done, they still have a chance to save it today.
                // Wait, if today isn't done, current streak is just 0.
                break;
            } else {
                break;
            }
        }
    }
    
    // Edge case: If today isn't done, but yesterday was, we might want to show yesterday's streak?
    // Let's just strictly show current active streak ending today or yesterday.
    let displayStreak = 0;
    let yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    let yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth()+1).padStart(2,'0')}-${String(yesterdayDate.getDate()).padStart(2,'0')}`;

    if (metGoal) {
        displayStreak = currentStreak; // Active today
    } else if (stats.history.includes(yesterdayStr)) {
        // Today not done yet, but yesterday was. Calculate from yesterday.
        let tempStreak = 0;
        let tempDate = new Date(yesterdayDate);
        while(true) {
            let tempStr = `${tempDate.getFullYear()}-${String(tempDate.getMonth()+1).padStart(2,'0')}-${String(tempDate.getDate()).padStart(2,'0')}`;
            if(stats.history.includes(tempStr)) {
                tempStreak++;
                tempDate.setDate(tempDate.getDate() - 1);
            } else {
                break;
            }
        }
        displayStreak = tempStreak;
    } else {
        displayStreak = 0; // Missed yesterday and today
    }

    stats.streak = displayStreak;
    saveData();
}

// Ensure elements load
document.addEventListener("DOMContentLoaded", () => {
    // Set Current Date Header if exists
    const dateEl = document.getElementById('currentDate');
    if(dateEl) dateEl.innerText = " | " + todayDate.toLocaleDateString('en-US', dateOptions);
});

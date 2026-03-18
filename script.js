if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("Underworld Offline Mode: Active"))
        .catch((err) => console.log("Service Worker Failed:", err));
}




window.totalResetGame = function() {
    if (confirm("Are you sure you want to proceed? This permanently deletes all your progress")) {
        // Resetting the specific variables you use in your game
        gems = 0; 
        currentXP = 0;
        rating = 0;

        // Directly updating the IDs we established for your UI
        document.getElementById('gem-count-top').innerText = "0";
        document.getElementById('dan-stats-text').innerText = "0 / 2,000";
        
        const bar = document.getElementById('dan-bar-fill');
        if (bar) bar.style.width = "0%";

        localStorage.clear();
        alert("System Cleaned.");
        location.reload(); // This forces a fresh start
    }
};



// --- 1. INITIALIZE DATA ---
let playerStats = JSON.parse(localStorage.getItem('underworldStats')) || {
    voidEnergy: 50,
    gems: 0,
    smallCharges: 0,
    mediumCharges: 0,
    largeCharges: 0,
    currentLeague: "bronze",
    equippedWeapon: "Blade Tonfas",
    ownedWeapons: ["Blade Tonfas"],
    steelKey: 0, flameKey: 0, crystalKey: 0, fungalKey: 0, 
    hydraKey: 0, phantomKey: 0, plagueKey: 0, hoaxKey: 0, 
    famineKey: 0, bloodshedKey: 0, portalKey: 0, obeliskKey: 0,
    unlockedBosses: [],
    rating: 0,
    currentDan: 1,
    currentBelt: "bronze",
    raidCooldowns: {}
};

const raidData = {
    "Emergence": { cost: 50, gems: 250, key: "flame", boss: "volcano" },
    "Unwavered": { cost: 150, gems: 750, key: "crystal", boss: "megalith" },
    "Anamnesis": { cost: 9500, gems: 1800, key: "fungal", boss: "fungus" },
    "Frivolity": { cost: 12000, gems: 2000, key: "hydra", boss: "vortex" },
    "Depths": { cost: 18000, gems: 3600, key: "phantom", boss: "fatum" },
    "Cogitation": { cost: 48000, gems: 4400, key: "plague", boss: "arkhos" },
    "Proficiency": { cost: 88960, gems: 6865, key: "hoax", boss: "hoaxen" },
    "Praxis": { cost: 98900, gems: 8095, key: "famine", boss: "karcer" },
    "Coherence": { cost: 172890, gems: 12440, key: "bloodshed", boss: "drakaina" },
    "Trial of Resolve I": { cost: 2460080, gems: 25760, key: "portal", boss: "tenebris" },
    "Trial of Resolve II": { cost: 9990050, gems: 52310, key: "obelisk", boss: "stalker" }
};

const danThresholds = [
    { dan: 1, belt: "bronze", min: 0, max: 4000 },
    { dan: 2, belt: "bronze", min: 4000, max: 12000 },
    { dan: 3, belt: "bronze", min: 12000, max: 20000 },
    { dan: 4, belt: "bronze", min: 20000, max: 70000 },
    { dan: 5, belt: "bronze", min: 70000, max: 180000 },
    { dan: 6, belt: "bronze", min: 180000, max: 390000 },
    { dan: 7, belt: "bronze", min: 390000, max: 800000 },
    { dan: 8, belt: "bronze", min: 800000, max: 1600000 },
    { dan: 9, belt: "bronze", min: 1600000, max: 4500000 },
    { dan: 10, belt: "bronze", min: 4500000, max: 8500000 },
    { dan: 10, belt: "silver", min: 8500000, max: 12360000 },
    { dan: 10, belt: "gold", min: 12360000, max: 18720000 },
    { dan: 10, belt: "platinum", min: 18720000, max: 21560000 },
    { dan: 10, belt: "emerald", min: 21560000, max: 30120000 },
    { dan: 10, belt: "dragon", min: 30120000, max: 38970000 },
    { dan: 10, belt: "void", min: 38970000, max: 60000000 }
];

// --- 2. WEAPON DATABASE (Updated with League Tags) ---
const weaponData = [
     
    // --- BRONZE ---
    { name: "Blade Tonfas", img: "bdt.webp", league: "bronze", damage: 88, cost: 20 },
    { name: "Spiny Knuckles", img: "sk.webp", league: "bronze", damage: 180, cost: 35 },
    { name: "Lynx's Claws", img: "lc.webp", league: "bronze", damage: 310, cost: 80 },
    { name: "Silent Moon", img: "sm.webp", league: "bronze", damage: 210, cost: 50 },

    // --- SILVER ---
    { name: "Butcher's Knives", img: "bk.webp", league: "silver", damage: 350, cost: 450 },
    { name: "Striking Falcon", img: "sf.webp", league: "silver", damage: 300, cost: 360 },
    { name: "Vulture's Feather", img: "vf.webp", league: "silver", damage: 430, cost: 280 },
    { name: "Fate's End", img: "fatesend.PNG", league: "silver", damage: 110, cost: 100 },
    { name: "Composite Sword", img: "cs.jpg", league: "silver", damage: 670, cost: 500 },
    { name: "Blood Reaper", img: "br.jpg", league: "silver", damage: 650, cost:720 },
    { name: "Fireflies", img: "fireflies.jpg", league: "silver", damage: 570, cost: 400 },
    { name: "Monk's Katars", img: "mkatar.jpg", league: "silver", damage: 720, cost: 900 },

    // --- GOLD ---
    { name: "Ripping Kit", img: "rk.webp", league: "gold", damage: 1260, cost: 1500 },
    { name: "Song of Dawn", img: "sod.webp", league: "gold", damage: 3210, cost: 2600 },
    { name: "Ornamental Sabers", img: "os.webp", league: "gold", damage: 3000, cost: 1950 },
    { name: "Revival", img: "r.webp", league: "gold", damage: 2640, cost: 2050 },
    { name: "The Sting", img: "sting.jpg", league: "gold", damage: 3287, cost: 4050 },
    { name: "Blade of Timelessness", img: "bot.jpg", league: "gold", damage: 5100, cost: 6700 },
    { name: "Harrier Hooks", img: "harrierhooks.jpg", league: "gold", damage: 4400, cost: 5350 },
    { name: "Will of Many", img: "wom.jpg", league: "gold", damage: 4670, cost: 5950 },

    // --- PLATINUM ---
    { name: "Beast's Fury", img: "bf.webp", league: "platinum", damage: 9020, cost: 8200 },
    { name: "Shogun's Katana", img: "skt.webp", league: "platinum", damage: 9560, cost: 7960 },
    { name: "Plasma Rifle", img: "pr.webp", league: "platinum", damage: 10034, cost: 9050 },
    { name: "Key to Infinity", img: "kti.webp", league: "platinum", damage: 24650, cost: 19830 },
    { name: "Pray of the Lost", img: "pol.webp", league: "platinum", damage: 19570, cost: 14450 },
    { name: "Blizzard", img: "blizzard.jpg", league: "platinum", damage: 11270, cost: 13990 },
    { name: "Mind of Ice", img: "mindofice.jpg", league: "platinum", damage: 16560, cost: 11900 },
    { name: "Order's Oath", img: "ordersoath.jpg", league: "platinum", damage: 17250, cost: 10450 },

    // --- EMERALD ---
    { name: "Resonance of Laws", img: "rol.webp", league: "emerald", damage: 48098, cost: 37459 },
    { name: "Undying Watch", img: "uw.webp", league: "emerald", damage: 46790, cost: 31998 },
    { name: "Curse of Teramori", img: "ct.webp", league: "emerald", damage: 38410, cost: 26750 },
    { name: "Tracery of Fate", img: "tof.webp", league: "emerald", damage: 32620, cost: 25580 },
    { name: "World Slicer", img: "worldslicer.jpg", league: "emerald", damage: 47640, cost: 30500 },
    { name: "Dance of Static", img: "dos.jpg", league: "emerald", damage: 41470, cost: 30789 },
    { name: "Edge of Time", img: "edgeoftime.jpg", league: "emerald", damage: 31740, cost: 24580 },
    { name: "Jade of Hearts", img: "jade.webp", league: "emerald", damage: 39090, cost: 29650 },
    { name: "New Beginning", img: "nb.webp", league: "emerald", damage: 44850, cost: 32450 },

    // --- DRAGON ---
    { name: "Last Verses", img: "lv.webp", league: "dragon", damage: 94726, cost: 57850 },
    { name: "Magmium Sequencers", img: "ms.webp", league: "dragon", damage: 89560, cost: 49260 },
    { name: "Daisho", img: "daisho.jpg", league: "dragon", damage: 74379, cost: 44380 },
    { name: "Blazing Logic", img: "blazinglogic.jpg", league: "dragon", damage: 98004, cost: 59600 },
    { name: "Hand of Fire", img: "handoffire.jpg", league: "dragon", damage: 72280, cost: 52070 },
    { name: "Hand of Magmarion", img: "handofmagmarion.jpg", league: "dragon", damage: 76970, cost: 49095 },

    // --- VOID ---
    { name: "Chaos Pulse", img: "cp.webp", league: "void", damage: 180025, cost: 3765908 },
    { name: "Void Piercer", img: "vp.webp", league: "void", damage: 290210, cost: 2598000 },
    { name: "Battle of Laws", img: "battleoflaws.jpg", league: "void", damage: 429700, cost: 4270120 },
    { name: "Coral Prickles", img: "cp.jpg", league: "void", damage: 423720, cost: 3872120 },
    { name: "Void Blade", img: "voidblade.jpg", league: "void", damage: 273900, cost: 3451500 },
    { name: "Void Pearl", img: "vpearls.jpg", league: "void", damage: 363250, cost: 2977450 },
    { name: "Whispers of the Consumed", img: "woc.webp", league: "void", damage: 447250, cost: 4456720 }
];
	
	

// --- 3. UI SYNC & DAN SYSTEM ---
function updateDanSystem() {
    const rating = playerStats.rating || 0;
    const currentLevel = danThresholds.find(t => rating >= t.min && rating < t.max) || danThresholds[danThresholds.length - 1];

    playerStats.currentDan = currentLevel.dan;
    playerStats.currentBelt = currentLevel.belt;
    playerStats.currentLeague = currentLevel.belt;

    // Track Best Rating
    if (rating > (playerStats.bestRating || 0)) {
        playerStats.bestRating = rating;
    }

    const range = currentLevel.max - currentLevel.min;
    const progress = rating - currentLevel.min;
    const percent = Math.min(100, (progress / range) * 100);

    // --- MAIN SCREEN UPDATES ---
    const beltImg = document.getElementById('dan-belt-icon');
    const danBar = document.getElementById('dan-bar-fill');
    const danText = document.getElementById('dan-stats-text');
    const danLabel = document.getElementById('dan-display-text');

    if (beltImg) beltImg.src = `assets/beltsrating/belt_${currentLevel.belt}.jpg`;
    if (danBar) danBar.style.width = `${percent}%`;
    if (danText) danText.innerText = `${rating.toLocaleString()} / ${currentLevel.max.toLocaleString()}`;
    if (danLabel) danLabel.innerText = `DAN ${currentLevel.dan}`;

    // --- PROFILE TAB UPDATES (Matching your HTML IDs) ---
    const profDan = document.getElementById('dan-val');
    const profRating = document.getElementById('rating-val');
    const profBest = document.getElementById('best-rating-val');
    const profLeagueName = document.getElementById('league-name');
    const profLeagueBelt = document.getElementById('league-belt');

    if (profDan) profDan.innerText = currentLevel.dan;
    if (profRating) profRating.innerText = rating.toLocaleString();
    if (profBest) profBest.innerText = (playerStats.bestRating || rating).toLocaleString();
    if (profLeagueName) {
        profLeagueName.innerText = `${currentLevel.belt.toUpperCase()} LEAGUE`;
        profLeagueName.className = `league-glow ${currentLevel.belt}-text`; // Allows for belt-specific colors
    }
    if (profLeagueBelt) profLeagueBelt.src = `assets/beltsrating/belt_${currentLevel.belt}.jpg`;
}
// --- 4. NAVIGATION ---
function openRaids() { 
    hideAllScreens(); 
    document.getElementById("raids-tab").style.display = "block"; 
    showHUD(true); 
    updateRaidButtons(); 
}

function openUnderworld() { 
    hideAllScreens(); 
    document.getElementById("underworld-tab").style.display = "block"; 
    // If the "Profile" button is still showing here, we turn HUD OFF
    showHUD(false); 
    updateUnderworldUI(); 
}

function openShop() { 
    hideAllScreens(); 
    document.getElementById("shop-tab").style.display = "block"; 
    showHUD(true); 
    syncBankUI(); 
}

function openProfile() { 
    hideAllScreens(); 
    document.getElementById("profile-tab").style.display = "block"; 
    showHUD(false); 
    updateProfileWeapon(); 
    // IMPORTANT: Call this to make sure your Dan/Rating updates in the profile
    if (typeof updateDanSystem === "function") updateDanSystem(); 
}

function goHome() { 
    hideAllScreens(); 
    // Using 'flex' ensures your title and buttons center correctly on the main screen
    document.getElementById("main-screen").style.display = "flex"; 
    showHUD(false); 
    syncBankUI(); 
}

function hideAllScreens() { 
    // This list MUST match your HTML IDs exactly
    const screens = ["main-screen", "raids-tab", "underworld-tab", "shop-tab", "profile-tab"];
    screens.forEach(id => { 
        const el = document.getElementById(id); 
        if (el) el.style.display = "none"; 
    }); 
}

function showHUD(visible) { 
    document.querySelectorAll('.game-hud').forEach(h => { 
        h.style.display = visible ? 'flex' : 'none'; 
    }); 
    
    // Safety check: If 'Profile' button is a separate element not in the HUD, hide it here
    const profBtn = document.querySelector('.profile-btn'); 
    if (profBtn) profBtn.style.display = visible ? 'block' : 'none';
}
// --- 5. SHOP & WEAPONS ---
function buyEnergy(amount, cost) {
    // Force the check against the actual object property
    if (Number(playerStats.gems) >= Number(cost)) {
        playerStats.gems -= Number(cost);
        playerStats.voidEnergy += Number(amount);
        
        showGameNotice(`SUCCESS! +${amount} VOID ENERGY`, 'shop');
        syncBankUI(); 
    } else {
        // This MUST trigger if gems are 0
        showGameNotice("NOT ENOUGH GEMS!");
        console.log("Purchase failed. Current Gems:", playerStats.gems);
    }
}

function buyCharge(type, cost) {
    if (playerStats.gems >= cost) {
        playerStats.gems -= cost;
        // Correctly increments the specific charge type
        playerStats[type + 'Charges']++; 
        showGameNotice(`BOUGHT ${type.toUpperCase()} CHARGE!`, 'shop');
    } else {
        showGameNotice("NOT ENOUGH GEMS!");
    }
    syncBankUI(); // Updates the gem and charge count on screen
}


function openWeapons() {
    // This list must match the IDs you just created in index.html
    const leagues = ['bronze', 'silver', 'gold', 'platinum', 'emerald', 'dragon', 'void'];
    
    leagues.forEach(league => {
        const grid = document.getElementById(`${league}-weapons-grid`);
        if (grid) grid.innerHTML = ''; // Clears the boxes so they don't stack
    });

    weaponData.forEach(weapon => {
        const card = createWeaponCard(weapon);
        
        // This targets the ID based on the weapon's league property
        const targetGridId = `${weapon.league.toLowerCase()}-weapons-grid`;
        const targetGrid = document.getElementById(targetGridId);
        
        if (targetGrid) {
            targetGrid.appendChild(card);
        }
    });

    document.getElementById('weapons-overlay').style.display = 'flex';
}
function buyWeapon(name, cost) {
    if (playerStats.gems >= cost) {
        playerStats.gems -= cost; playerStats.ownedWeapons.push(name);
        equipWeapon(name); showGameNotice("BOUGHT AND EQUIPPED!"); openWeapons(); 
    } else { showGameNotice("NOT ENOUGH GEMS!"); }
}

function equipWeapon(name) {
    // Clean the name to ensure no hidden spaces break the match
    const cleanName = name.trim(); 
    playerStats.equippedWeapon = cleanName; 
    
    // Your existing save/sync calls
    updateProfileWeapon(); 
    saveProgress(); 
    syncBankUI(); 
    
    // Refresh the weapons menu so the buttons update immediately
    if(document.getElementById('weapons-overlay').style.display === 'flex') {
        openWeapons();
    }
}

function updateProfileWeapon() {
    const w = weaponData.find(x => x.name === playerStats.equippedWeapon);
    if (w) {
        const img = document.getElementById('profile-weapon-img');
        const dmgText = document.getElementById('profile-weapon-damage');
        const avgDmgVal = document.getElementById('avg-dmg-val'); // Matches your HTML ID

        if (img) img.src = `assets/weapons/${w.img}`;
        if (dmgText) dmgText.innerText = `Damage: ${w.damage}`;
        if (avgDmgVal) avgDmgVal.innerText = w.damage.toLocaleString(); // Syncs the Profile stat
    }
}

// --- 6. RAIDS & TIMERS ---
function formatTime(ms) {
    let totalSecs = Math.floor(ms / 1000);
    let hrs = Math.floor(totalSecs / 3600);
    let mins = Math.floor((totalSecs % 3600) / 60);
    let secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function completeRaid(raidName) {
    const raid = raidData[raidName];
    if (playerStats.voidEnergy >= raid.cost) {
        playerStats.voidEnergy -= raid.cost;
        playerStats.gems += raid.gems;
        playerStats[raid.key + "Key"] = (playerStats[raid.key + "Key"] || 0) + 1;
        
        // Unlock boss permanently
        if (!playerStats.unlockedBosses.includes(raid.boss)) {
            playerStats.unlockedBosses.push(raid.boss);
        }

        if (!playerStats.raidCooldowns) playerStats.raidCooldowns = {};
playerStats.raidCooldowns[raidName] = {
    endTime: Date.now() + (4 * 60 * 60 * 1000),
    isFinishUsed: false
};        
        saveProgress(); 
        syncBankUI(); 
        showRaidReward(raid.gems, raid.key); 
        updateRaidButtons();
        updateUnderworldUI(); // Trigger underworld update immediately
    } else { showGameNotice("NOT ENOUGH ENERGY"); }
}

function updateRaidButtons() {
    const now = Date.now();
    document.querySelectorAll('.complete-btn').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (!onclickAttr) return;
        
        const match = onclickAttr.match(/'([^']+)'/);
        if (match) {
            const raidName = match[1];
            const cooldownObj = playerStats.raidCooldowns[raidName];

            // 1. SAFE DATA EXTRACTION: Check if it's an object {endTime: X} or just a number
            let endTime = 0;
            if (cooldownObj && typeof cooldownObj === 'object') {
                endTime = cooldownObj.endTime;
            } else if (typeof cooldownObj === 'number') {
                endTime = cooldownObj;
            }

            // 2. LOGIC GATE: If time is in the future, show the timer
            if (endTime && endTime > now) {
                btn.disabled = true; 
                btn.style.backgroundColor = "#555"; 
                btn.innerText = formatTime(endTime - now);
            } else {
                // 3. RESET: If no cooldown or time passed, show "Complete"
                btn.disabled = false; 
                btn.style.backgroundColor = ""; 
                btn.innerText = "Complete";
            }
        }
    });
}

// Run timer update every second
setInterval(() => {
    if (document.getElementById("raids-tab").style.display === "block") {
        updateRaidButtons();
    }
}, 1000);

function showRaidReward(gemAmt, keyType) {
    const overlay = document.getElementById('raid-reward-overlay');
    const content = document.getElementById('reward-text-content');
    if (!overlay || !content) return;
    content.innerHTML = `<h1 style="color:#FFD700;">OBTAINED:</h1>
        <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin-bottom:15px;">
            <img src="assets/currencies/currency_gems.jpg" style="width:50px;"><span style="color:white; font-size:2rem;">${gemAmt.toLocaleString()}</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:center; gap:20px;">
            <img src="assets/key_icons/key_${keyType}.jpg" style="width:50px;"><span style="color:white; font-size:2rem;">1</span>
        </div>`;
    overlay.style.display = 'flex';
}

function closeRaidReward() { document.getElementById('raid-reward-overlay').style.display = 'none'; }

// --- 7. UNDERWORLD & BATTLE ---
const bossData = {
    "volcano": { 
        name: "Volcano", shield: 1757, ratingMin: 500000000000, ratingMax: 15000000000, sMin: 1, sMax: 2, mMin: 0, mMax: 0, lMin: 0, lMax: 0, key: "flame",
        power: { shield: 18687, rMult: 3, cMult: 2 } 
    },
    "megalith": { 
        name: "Megalith", shield: 5621, ratingMin: 1800, ratingMax: 3800, sMin: 2, sMax: 4, mMin: 0, mMax: 0, lMin: 0, lMax: 0, key: "crystal",
        power: { shield: 31081, rMult: 4, cMult: 2.5 } 
    },
    "fungus": { 
        name: "Fungus", shield: 10095, ratingMin: 4500, ratingMax: 11500, sMin: 2, sMax: 3, mMin: 0, mMax: 1, lMin: 0, lMax: 0, key: "fungal",
        power: { shield: 45074, rMult: 5, cMult: 3 }
    },
    "vortex": { 
        name: "Vortex", shield: 11071, ratingMin: 9000, ratingMax: 20000, sMin: 3, sMax: 5, mMin: 0, mMax: 2, lMin: 0, lMax: 0, key: "hydra",
        power: { shield: 79076, rMult: 5, cMult: 3 }
    },
    "fatum": { 
        name: "Fatum", shield: 8473, ratingMin: 14000, ratingMax: 22000, sMin: 4, sMax: 6, mMin: 1, mMax: 4, lMin: 0, lMax: 0, key: "phantom",
        power: { shield: 97008, rMult: 6, cMult: 4 }
    },
    "arkhos": { 
        name: "Arkhos", shield: 8893, ratingMin: 11000, ratingMax: 23000, sMin: 5, sMax: 6, mMin: 1, mMax: 4, lMin: 1, lMax: 2, key: "plague",
        power: { shield: 302043, rMult: 6, cMult: 4 }
    },
    "hoaxen": { 
        name: "Hoaxen", shield: 12639, ratingMin: 31000, ratingMax: 42000, sMin: 6, sMax: 8, mMin: 1, mMax: 12, lMin: 1, lMax: 2, key: "hoax",
        power: { shield: 1485370, rMult: 7, cMult: 5 }
    },
    "karcer": { 
        name: "Karcer", shield: 10473, ratingMin: 49000, ratingMax: 58000, sMin: 8, sMax: 10, mMin: 2, mMax: 6, lMin: 1, lMax: 2, key: "famine",
        power: { shield: 2595078, rMult: 7, cMult: 5 }
    },
    "drakaina": { 
        name: "Drakaina", shield: 12513, ratingMin: 55000, ratingMax: 69000, sMin: 9, sMax: 12, mMin: 5, mMax: 12, lMin: 2, lMax: 4, key: "bloodshed",
        power: { shield: 8934000, rMult: 8, cMult: 6 }
    },
    "tenebris": { 
        name: "Tenebris", shield: 14477, ratingMin: 120000, ratingMax: 290000, sMin: 25, sMax: 25, mMin: 20, mMax: 25, lMin: 15, lMax: 18, key: "portal",
        power: { shield: 12850890, rMult: 8, cMult: 6 }
    },
    "stalker": { 
        name: "Stalker", shield: 16911, ratingMin: 450000, ratingMax: 600000, sMin: 30, sMax: 30, mMin: 45, mMax: 50, lMin: 20, lMax: 25, key: "obelisk",
        power: { shield: 18367089, rMult: 10, cMult: 8 }
    }
};

let activeBattle = null;
const getLoot = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function syncBankUI() {
    const safeSetText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    const gemVal = (playerStats.gems || 0).toLocaleString();
    // Ensure 'gem-count-top' is in this list!
    ['shop-gem-count', 'gem-val', 'gem-count-top'].forEach(id => safeSetText(id, gemVal));
     
    const energyVal = (playerStats.voidEnergy || 0).toLocaleString();
    ['void-val', 'raid-void-val', 'void-vault-amount'].forEach(id => safeSetText(id, energyVal));

    ['small', 'medium', 'large'].forEach(type => {
        safeSetText(`${type}-count`, playerStats[type + 'Charges'] || 0);
    });

    const keyNames = ['steel', 'flame', 'crystal', 'fungal', 'hydra', 'phantom', 'plague', 'hoax', 'famine', 'bloodshed', 'portal', 'obelisk'];
    keyNames.forEach(key => {
        safeSetText(`${key}-count`, playerStats[`${key}Key`] || 0); 
    });

    updateDanSystem();
    // FORCE UNDERWORLD TO UPDATE EVERY TIME WE SYNC
    updateUnderworldUI(); 
    saveProgress();
	localStorage.setItem('underworldStats', JSON.stringify(playerStats));
}


function updateUnderworldUI() {
    const now = Date.now();
    const raidToBoss = { 
        "Emergence": "volcano", "Unwavered": "megalith", "Anamnesis": "fungus", 
        "Frivolity": "vortex", "Depths": "fatum", "Cogitation": "arkhos", 
        "Proficiency": "hoaxen", "Praxis": "karcer", "Coherence": "drakaina", 
        "Trial of Resolve I": "tenebris", "Trial of Resolve II": "stalker" 
    };

    Object.entries(raidToBoss).forEach(([raidName, bossId]) => {
        const btn = document.getElementById(`btn-${bossId}`);
        if (!btn) return;

        const cooldownObj = playerStats.raidCooldowns[raidName];
        // Check if cooldownObj is an object or just a number (for backward compatibility)
        const endTime = (typeof cooldownObj === 'object') ? cooldownObj.endTime : cooldownObj;
        const isUsed = (typeof cooldownObj === 'object') ? cooldownObj.isFinishUsed : false;
        
        const isOnCooldown = endTime && endTime > now;

        // The button only shows "FINISHING" if it's on cooldown AND hasn't been used yet
        if (isOnCooldown && !isUsed) {
            btn.innerText = "FINISHING";
            btn.style.backgroundColor = "#FFD700";
            btn.style.color = "black";
            btn.setAttribute("onclick", `openBattle('${bossId}')`);
            btn.disabled = false;
        } else {
            btn.innerText = "Not Complete";
            btn.style.backgroundColor = "#333";
            btn.style.color = "#777";
            btn.setAttribute("onclick", "showGameNotice('COMPLETE RAID FIRST')");
        }
    });
}

function openBattle(bossId) {
    const boss = bossData[bossId]; if (!boss) return;
    
    // Create a reverse map to find the Raid Name from the Boss ID
    const bossToRaid = { 
        "volcano": "Emergence", "megalith": "Unwavered", "fungus": "Anamnesis", 
        "vortex": "Frivolity", "fatum": "Depths", "arkhos": "Cogitation", 
        "hoaxen": "Proficiency", "karcer": "Praxis", "drakaina": "Coherence", 
        "tenebris": "Trial of Resolve I", "stalker": "Trial of Resolve II" 
    };
    
    const raidName = bossToRaid[bossId];
    const keyName = boss.key + "Key";
    const cooldownData = playerStats.raidCooldowns[raidName];

    // Check if finish was already used for THIS specific cooldown cycle
    if (cooldownData && cooldownData.isFinishUsed) {
        showGameNotice("FINISH ALREADY USED!", 'red-mode');
        return; 
    }

    if (playerStats[keyName] > 0) {
        // Mark the finish as used in the raidCooldowns object
        if (cooldownData) {
            playerStats.raidCooldowns[raidName].isFinishUsed = true;
        }

        playerStats[keyName]--;

        // --- POWER MODE LOGIC START ---
        const isPower = document.getElementById('powerModeToggle').checked;
        
        activeBattle = JSON.parse(JSON.stringify(boss));
        activeBattle.id = bossId; 
        activeBattle.isPowerMode = isPower; 

        // Set the shield: Use boss.power.shield if toggle is ON, otherwise use boss.shield
        activeBattle.shield = isPower ? boss.power.shield : boss.shield;
        activeBattle.currentShield = activeBattle.shield;
        // --- POWER MODE LOGIC END ---
        
        const bossImg = document.getElementById('boss-battle-img');
        if(bossImg) bossImg.src = `assets/boss_icons/boss_${bossId}.jpg`;
        
        document.getElementById('battle-overlay').style.display = 'flex';
        document.getElementById('battle-screen-content').style.display = 'block';
        document.getElementById('victory-screen').style.display = 'none';
        
        updateBattleUI(); 
        syncBankUI();
    } else { 
        showGameNotice(`YOU NEED 1 ${boss.key.toUpperCase()} KEY`); 
    }
}

function dealDamage(type) {
    // Check if a battle is actually happening
    if (!activeBattle) {
        console.error("No active battle found!");
        return;
    }

    let dmg = 0;
    
    if (type === 'weapon') {
        const w = weaponData.find(x => x.name === playerStats.equippedWeapon);
        dmg = w ? w.damage : 100;
    } else {
        // Logic for Charges
        const chargeKey = type + 'Charges'; // e.g., 'smallCharges'
        if (playerStats[chargeKey] > 0) {
            // Set damage values based on charge type
            dmg = type === 'small' ? 88 : (type === 'medium' ? 551 : 1051);
            playerStats[chargeKey]--;
        } else {
            showGameNotice(`OUT OF ${type.toUpperCase()} CHARGES!`);
            return; // Stops the function if no charges left
        }
    }

    // Apply the damage
    activeBattle.currentShield = Math.max(0, activeBattle.currentShield - dmg);
    
    // Update the UI
    updateBattleUI();
    syncBankUI();

    // Check for Victory
    if (activeBattle.currentShield <= 0) {
        processVictory();
    }
}

function updateBattleUI() {
    if (!activeBattle) return;
    const percent = (activeBattle.currentShield / activeBattle.shield) * 100;
    const bar = document.getElementById('shield-bar-fill');
    const txt = document.getElementById('shield-value-text');
    if (bar) bar.style.width = percent + "%";
    if (txt) txt.innerText = `${activeBattle.currentShield.toLocaleString()} / ${activeBattle.shield.toLocaleString()}`;
    ['small', 'medium', 'large'].forEach(t => {
        const el = document.getElementById(`${t}-count-ui`);
        if (el) el.innerText = playerStats[t + 'Charges'] || 0;
    });
}

function processVictory() {
    if (!activeBattle) return;
    document.getElementById('battle-screen-content').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'block';
    
    const b = bossData[activeBattle.id];
    
    // 1. Get Base Loot
    let rWon = getLoot(b.ratingMin, b.ratingMax);
    let sWon = getLoot(b.sMin, b.sMax);
    let mWon = getLoot(b.mMin, b.mMax);
    let lWon = getLoot(b.lMin, b.lMax);

    // 2. APPLY MULTIPLIERS IF IN POWER MODE
    if (activeBattle.isPowerMode) {
        rWon = Math.floor(rWon * b.power.rMult);
        sWon = Math.floor(sWon * b.power.cMult);
        mWon = Math.floor(mWon * b.power.cMult);
        lWon = Math.floor(lWon * b.power.cMult);
    }

    // 3. Add to Player Stats
    playerStats.rating += rWon; 
    playerStats.smallCharges += sWon; 
    playerStats.mediumCharges += mWon; 
    playerStats.largeCharges += lWon;

    // 4. Update Victory UI (Text turns red if Power Mode was used)
    const rewardColor = activeBattle.isPowerMode ? "#ff0000" : "#FFD700";
    
    document.getElementById('victory-rewards-list').innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; gap:15px; margin-bottom:20px;">
            <img src="assets/beltsrating/rating.jpg" style="width:50px;">
            <span style="color:${rewardColor}; font-size:2.5rem; text-shadow: ${activeBattle.isPowerMode ? '0 0 10px #ff0000' : 'none'};">
                +${rWon.toLocaleString()}
            </span>
        </div>
        
        <div style="display:flex; flex-direction:row; justify-content:center; align-items:center; gap:30px;">
            ${sWon > 0 ? `<div style="text-align:center;"><img src="assets/energies/charge_small.jpg" style="width:40px; display:block; margin:0 auto;"> +${sWon}</div>` : ''}
            ${mWon > 0 ? `<div style="text-align:center;"><img src="assets/energies/charge_medium.jpg" style="width:40px; display:block; margin:0 auto;"> +${mWon}</div>` : ''}
            ${lWon > 0 ? `<div style="text-align:center;"><img src="assets/energies/charge_large.jpg" style="width:40px; display:block; margin:0 auto;"> +${lWon}</div>` : ''}
        </div>`;
    
    syncBankUI();
}

function closeBattle() {
    document.getElementById('battle-overlay').style.display = 'none';
    activeBattle = null; 
    syncBankUI(); 
    updateUnderworldUI();
}

// --- UTILS ---
function showGameNotice(msg, type = 'error') {
    let n = document.getElementById('game-notice');
    if (!n) {
        n = document.createElement('div');
        n.id = 'game-notice';
        document.body.appendChild(n);
    }

    // Reset EVERYTHING first
    n.className = 'game-notification'; 
    n.innerText = msg;

    // Apply the specific color
    if (type === 'shop') {
        n.classList.add('shop-mode');
    } else {
        n.classList.add('red-mode');
    }

    // Show it
    n.classList.add('show');

    // Clean up after 2 seconds
    setTimeout(() => {
        n.classList.remove('show');
    }, 2000);
}
function saveProgress() { localStorage.setItem('underworldStats', JSON.stringify(playerStats)); }
function closeWeapons() { document.getElementById('weapons-overlay').style.display = 'none'; }
function resetAllCooldowns() { playerStats.raidCooldowns = {}; saveProgress(); updateRaidButtons(); }

window.onload = function() {
	
	if (!playerStats.ownedWeapons.includes("Fate's End")) {
        playerStats.ownedWeapons.push("Fate's End");
    }
    syncBankUI();
    updateRaidButtons();
    updateUnderworldUI();
};

function canPlayFinish(bossId) {
    const cooldownData = playerStats.raidCooldowns[bossId];
    // Only allow if boss is on cooldown AND finish hasn't been used yet
    if (cooldownData && cooldownData.isFinishUsed === false) {
        cooldownData.isFinishUsed = true; // Mark as used immediately
        return true;
    }
    showGameNotice("FINISH ALREADY USED FOR THIS COOLDOWN!");
    return false;
}

function createWeaponCard(weapon) {
    const isOwned = playerStats.ownedWeapons.includes(weapon.name);
    const isEquipped = playerStats.equippedWeapon === weapon.name;
    
    // --- HIERARCHY FIX START ---
    const leagueOrder = ['bronze', 'silver', 'gold', 'platinum', 'emerald', 'dragon', 'void'];
    const playerRankIndex = leagueOrder.indexOf(playerStats.currentBelt.toLowerCase());
    const weaponRankIndex = leagueOrder.indexOf(weapon.league.toLowerCase());
    const isEligible = playerRankIndex >= weaponRankIndex;
    // --- HIERARCHY FIX END ---

    const div = document.createElement('div');
    div.className = 'weapon-card';
    
    let btnHTML = "";

    if (isEquipped) {
        btnHTML = `<button class="buy-btn equipped-btn" disabled>EQUIPPED</button>`;
    } else if (isOwned) {
        btnHTML = `<button class="buy-btn" onclick="equipWeapon(\`${weapon.name}\`)">EQUIP</button>`;
    } else if (!isEligible) {
        btnHTML = `<button class="buy-btn not-eligible" disabled>NOT ELIGIBLE</button>`;
    } else {
        // ADDED: Gem icon right after the price
        btnHTML = `
            <button class="buy-btn" onclick="buyWeapon(\`${weapon.name}\`, ${weapon.cost})">
                BUY: ${weapon.cost.toLocaleString()} <img src="assets/currencies/currency_gems.jpg" class="btn-gem-icon">
            </button>`;
    }

    div.innerHTML = `
        <img src="assets/weapons/${weapon.img}" class="weapon-img" onerror="this.src='assets/weapons/fatesend.PNG'">
        <p class="damage-glow">Damage: ${weapon.damage}</p>
        <h3 class="gold-text">${weapon.name}</h3>
        ${btnHTML}
    `;
    return div;
}

function injectCurrency(type, amount) {
    const currency = type.toLowerCase();
    if (currency === 'gems') {
        playerStats.gems += amount;
    } else if (currency === 'void') {
        playerStats.voidEnergy += amount;
    }

    // Save using the CORRECT key
    localStorage.setItem('underworldStats', JSON.stringify(playerStats));
    
    // Use your existing sync function to update the screen
    syncBankUI(); 

    console.log(`Updated ${type}. Total Gems: ${playerStats.gems}`);
}


// 1. Create the button once
const resetBtn = document.createElement('button');
resetBtn.innerText = "RESET PROGRESS";
resetBtn.id = "profile-reset-btn"; 

resetBtn.style.cssText = `
    position: fixed;
    bottom: 25px;
    right: 25px;
    padding: 12px 20px;
    background-color: #ff0000;
    color: #ffffff;
    border: 2px solid #b30000;
    border-radius: 8px;
    font-weight: 900;
    cursor: pointer;
    z-index: 100000; 
    font-size: 14px;
    display: none;
    text-transform: uppercase;
    box-shadow: 0 0 20px rgba(0,0,0,0.8);
`;

resetBtn.onclick = function() {
    if (confirm("Are you sure you want to proceed? This will permanently delete all your progress.")) {
        totalResetGame();
    }
};

document.body.appendChild(resetBtn);

// 2. THE OBSERVER: Watches for the moment the overlay opens
const observer = new MutationObserver(() => {
    const overlay = document.getElementById('weapons-overlay');
    if (overlay) {
        // If the overlay's style is NOT 'none', show the button
        if (overlay.style.display !== 'none') {
            resetBtn.style.setProperty('display', 'block', 'important');
        } else {
            resetBtn.style.setProperty('display', 'none', 'important');
        }
    }
});

// Start watching the body for changes in attributes (like style="display: block")
observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['style', 'class']
});

// 3. Manual Fallback (Just in case)
setInterval(() => {
    const overlay = document.getElementById('weapons-overlay');
    if (overlay && overlay.style.display !== 'none' && resetBtn.style.display === 'none') {
        resetBtn.style.display = 'block';
    }
}, 500);


function togglePowerMode() {
    const toggle = document.getElementById('powerModeToggle');
    const isPower = toggle.checked;

    // 1. Save the choice so it doesn't reset on refresh
    localStorage.setItem('powerModeActive', isPower);

    // 2. Loop through every boss and update the shield text in the list
    Object.keys(bossData).forEach(bossId => {
        const boss = bossData[bossId];
        // Find the button first, then find the shield paragraph next to it
        const btn = document.getElementById(`btn-${bossId}`);
        if (btn) {
            const raidRow = btn.closest('.raid-row');
            const shieldText = raidRow.querySelector('.raid-info p');
            
            // Swap the number based on the toggle
            const displayShield = isPower ? boss.power.shield : boss.shield;
            shieldText.innerHTML = `Shield: ${displayShield.toLocaleString()} 🛡`;
            
            // Optional: Make the text red when in Power Mode
            shieldText.style.color = isPower ? "#ff4444" : "#fff";
        }
    });
}


// Run this when the page finishes loading
window.addEventListener('load', () => {
    const savedState = localStorage.getItem('powerModeActive') === 'true';
    const toggle = document.getElementById('powerModeToggle');
    
    if (toggle) {
        toggle.checked = savedState;
        // Trigger the function once to update all the shield numbers on the screen
        togglePowerMode();
    }
});

function adjustLayout() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', adjustLayout);
window.addEventListener('orientationchange', () => {
    // Small delay to let the browser catch up with the rotation
    setTimeout(adjustLayout, 100);
});
adjustLayout();


function checkOrientation() {
    if (window.innerHeight > window.innerWidth) {
        // Portrait mode - maybe pause game music or timers here
        console.log("Entering Portrait: Game Paused");
    } else {
        // Landscape mode - resume
        adjustLayout(); // Our previous layout fix
    }
}

window.addEventListener('orientationchange', checkOrientation);


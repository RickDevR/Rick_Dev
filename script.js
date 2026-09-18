import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { defaultProjects } from "./sites.js";

const firebaseConfig = {
    apiKey: "AIzaSyCbNcRMkMM5K2w4LM5VhHsRDu70zOGox1E",
    authDomain: "fake-6825f.firebaseapp.com",
    projectId: "fake-6825f",
    storageBucket: "fake-6825f.firebasestorage.app",
    messagingSenderId: "195741800470",
    appId: "1:195741800470:web:f508682df45c804fc27d37",
    measurementId: "G-0F6P507CKM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let projects = [];
let statsData = {};
let customProjects = [];
let soundEnabled = true;
let countdownInterval = null;

// Web Audio Sound Synthesizer
function playUiSound(type = 'click') {
    if (!soundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(920, now + 0.06);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            osc.start(now); osc.stop(now + 0.06);
        } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.setValueAtTime(780, now + 0.08);
            osc.frequency.setValueAtTime(1046.5, now + 0.16);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        }
    } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
    // --- MASTER CONFIG LISTENER (Firestore collection: site_config -> master_control) ---
    const masterConfigRef = doc(db, "site_config", "master_control");
    onSnapshot(masterConfigRef, (docSnap) => {
        if (docSnap.exists()) {
            const config = docSnap.data();
            
            // Website Lock Check
            const lockdownScreen = document.getElementById("websiteLockdownScreen");
            if (config.website_lock === true) {
                if (lockdownScreen) lockdownScreen.classList.add("active");
            } else {
                if (lockdownScreen) lockdownScreen.classList.remove("active");
            }

            // Maintenance Mode Check
            const maintBanner = document.getElementById("maintenanceBanner");
            if (config.maintenance_mode === true) {
                if (maintBanner) maintBanner.classList.add("show");
            } else {
                if (maintBanner) maintBanner.classList.remove("show");
            }

            // Announcement Banner Check
            const annBanner = document.getElementById("globalAnnouncementBanner");
            const annText = document.getElementById("announcementBannerText");
            if (config.announcement_text && config.announcement_text.trim() !== "") {
                if (annText) annText.textContent = config.announcement_text;
                if (annBanner) annBanner.classList.add("show");
            } else {
                if (annBanner) annBanner.classList.remove("show");
            }

            // Auto-Lock Countdown Timer Check
            if (config.countdown_target) {
                const targetTime = config.countdown_target;
                startGlobalCountdown(targetTime);
            }

            // Update Admin Toggles
            const lockToggle = document.getElementById("dbWebsiteLockToggle");
            const maintToggle = document.getElementById("dbMaintenanceToggle");
            const annInput = document.getElementById("dbAnnouncementInput");
            if (lockToggle) lockToggle.checked = !!config.website_lock;
            if (maintToggle) maintToggle.checked = !!config.maintenance_mode;
            if (annInput && document.activeElement !== annInput) annInput.value = config.announcement_text || "";
        }
    });

    function startGlobalCountdown(targetTimestamp) {
        if (countdownInterval) clearInterval(countdownInterval);
        const warningBanner = document.getElementById("countdownWarningBanner");
        const timerDisplay = document.getElementById("countdownTimerDisplay");

        countdownInterval = setInterval(() => {
            const now = Date.now();
            const distance = targetTimestamp - now;
            if (distance <= 0) {
                clearInterval(countdownInterval);
                if (warningBanner) warningBanner.classList.remove("show");
                // Auto lock website
                setDoc(masterConfigRef, { website_lock: true }, { merge: true });
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                if (timerDisplay) timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                if (warningBanner) warningBanner.classList.add("show");
            }
        }, 1000);
    }

    // --- DEVICE SELECTOR / AUTO-FIT ENGINE ---
    const devicePickerModal = document.getElementById("devicePickerModal");
    const savedDeviceMode = localStorage.getItem("rick_dev_device_mode");

    function applyDeviceMode(mode) {
        document.body.setAttribute("data-device-mode", mode);
        localStorage.setItem("rick_dev_device_mode", mode);
        if (devicePickerModal) devicePickerModal.classList.remove("active");
        playUiSound('success');
    }

    if (savedDeviceMode) {
        applyDeviceMode(savedDeviceMode);
    } else {
        const width = window.innerWidth;
        if (width < 600) applyDeviceMode("mobile");
        else if (width >= 600 && width <= 1024) applyDeviceMode("tablet");
        else applyDeviceMode("pc");
    }

    document.querySelectorAll(".device-select-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            applyDeviceMode(btn.getAttribute("data-mode"));
        });
    });

    const autoDetectBtn = document.getElementById("autoDetectDeviceBtn");
    if (autoDetectBtn) {
        autoDetectBtn.addEventListener("click", () => {
            const width = window.innerWidth;
            const mode = width < 600 ? "mobile" : (width <= 1024 ? "tablet" : "pc");
            applyDeviceMode(mode);
        });
    }

    function showToast(msg) {
        const toast = document.getElementById("activityToast");
        if (!toast) return;
        document.getElementById("toastMessage").textContent = msg;
        toast.classList.add("show");
        setTimeout(() => { toast.classList.remove("show"); }, 3000);
    }

    // --- COLOR THEME PICKER ---
    const colorDropdownWrapper = document.getElementById("colorDropdownWrapper");
    const colorPickerToggle = document.getElementById("colorPickerToggle");
    
    if (colorPickerToggle && colorDropdownWrapper) {
        colorPickerToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            colorDropdownWrapper.classList.toggle("active");
            playUiSound('click');
        });
        document.addEventListener("click", () => { colorDropdownWrapper.classList.remove("active"); });
    }

    document.querySelectorAll(".color-dot").forEach(dot => {
        dot.addEventListener("click", (e) => {
            e.stopPropagation();
            const color = dot.getAttribute("data-color");
            document.body.setAttribute("data-accent-color", color);
            localStorage.setItem("rick_dev_accent", color);
            if (colorDropdownWrapper) colorDropdownWrapper.classList.remove("active");
            playUiSound('success');
            showToast(`Theme color switched to ${color}!`);
        });
    });
    const savedAccent = localStorage.getItem("rick_dev_accent");
    if (savedAccent) document.body.setAttribute("data-accent-color", savedAccent);

    // Particle Background
    const canvas = document.getElementById("particleCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        class Particle {
            constructor(x, y) {
                this.x = x; this.y = y;
                this.size = Math.random() * 2 + 0.8;
                this.speedX = Math.random() * 0.8 - 0.4;
                this.speedY = Math.random() * 0.8 - 0.4;
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if (this.size > 0.1) this.size -= 0.01;
            }
            draw() {
                ctx.fillStyle = "rgba(99, 102, 241, 0.35)";
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }
        window.addEventListener("mousemove", (e) => { if (Math.random() > 0.8) particles.push(new Particle(e.clientX, e.clientY)); });
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, index) => {
                p.update(); p.draw();
                if (p.size <= 0.2) particles.splice(index, 1);
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // Core Elements
    const grid = document.getElementById("projectsGrid");
    const filterBar = document.getElementById("filterBar");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const statsCounter = document.getElementById("statsCounter");
    const footerStats = document.getElementById("footerStats");
    
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const surpriseBtn = document.getElementById("surpriseBtn");
    const audioToggleBtn = document.getElementById("audioToggleBtn");
    const audioIcon = document.getElementById("audioIcon");
    const favoritesFilterBtn = document.getElementById("favoritesFilterBtn");
    const favCountBadge = document.getElementById("favCountBadge");
    const focusModeBtn = document.getElementById("focusModeBtn");

    // Scratchpad
    const openScratchpadBtn = document.getElementById("openScratchpadBtn");
    const scratchpadDrawer = document.getElementById("scratchpadDrawer");
    const scratchpadTextarea = document.getElementById("scratchpadTextarea");
    if (scratchpadTextarea) scratchpadTextarea.value = localStorage.getItem("rick_dev_scratchpad") || "";
    if (openScratchpadBtn) openScratchpadBtn.addEventListener("click", () => { scratchpadDrawer.classList.toggle("active"); playUiSound('click'); });
    const closeScratchpadBtn = document.getElementById("closeScratchpadBtn");
    if (closeScratchpadBtn) closeScratchpadBtn.addEventListener("click", () => { scratchpadDrawer.classList.remove("active"); });
    const saveScratchpadBtn = document.getElementById("saveScratchpadBtn");
    if (saveScratchpadBtn) saveScratchpadBtn.addEventListener("click", () => {
        localStorage.setItem("rick_dev_scratchpad", scratchpadTextarea.value);
        playUiSound('success');
        showToast("Notes saved!");
        scratchpadDrawer.classList.remove("active");
    });

    if (focusModeBtn) focusModeBtn.addEventListener("click", () => {
        document.body.classList.toggle("focus-mode");
        playUiSound('click');
    });

    // --- PROJECTS DATABASE SYNC (Combines defaultProjects + Firestore custom projects) ---
    onSnapshot(collection(db, "projects_database"), (snapshot) => {
        customProjects = snapshot.docs.map(d => ({ id: d.id, isCustom: true, ...d.data() }));
        loadProjectsAndStats();
    });

    onSnapshot(collection(db, "project_stats"), (snapshot) => {
        statsData = {};
        snapshot.forEach(docSnap => { statsData[docSnap.id] = docSnap.data(); });
        loadProjectsAndStats();
    });

    function loadProjectsAndStats() {
        const combinedDefault = defaultProjects.map((p, index) => ({ dbKey: `proj_${index}`, isCustom: false, ...p }));
        const combinedCustom = customProjects.map(p => ({ dbKey: p.id, ...p }));
        const masterList = [...combinedDefault, ...combinedCustom];

        projects = masterList.map((p) => {
            const remoteStats = statsData[p.dbKey] || { likes: 0, dislikes: 0, visits: 0 };
            return { ...p, likes: remoteStats.likes || 0, dislikes: remoteStats.dislikes || 0, visits: remoteStats.visits || 0 };
        });

        updateFavoritesBadge();
        initApp();
    }

    function updateFavoritesBadge() {
        let count = 0;
        projects.forEach(p => { if (localStorage.getItem(`bookmarked_${p.dbKey}`) === "true") count++; });
        if (favCountBadge) favCountBadge.textContent = count;
    }

    let showingFavoritesOnly = false;
    let activeCategory = "All";
    let searchQuery = "";

    function initApp() {
        if (!filterBar) return;
        const categories = ["All", ...new Set(projects.map(p => p.category))];
        filterBar.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === activeCategory && !showingFavoritesOnly ? 'active' : ''}" data-category="${cat}">${cat}</button>
        `).join("");

        if (footerStats) footerStats.textContent = `Total Applications: ${projects.length} | Active Categories: ${categories.length - 1}`;
        if (projects.length > 0) {
            const top = [...projects].sort((a,b) => (b.likes || 0) - (a.likes || 0))[0];
            const spotTitle = document.getElementById("spotlightTitle");
            const spotDesc = document.getElementById("spotlightDesc");
            const spotBtn = document.getElementById("spotlightLaunchBtn");
            if (spotTitle) spotTitle.textContent = top.name;
            if (spotDesc) spotDesc.textContent = top.description;
            if (spotBtn) spotBtn.onclick = () => { playUiSound('click'); openModal(top); };
        }
        renderProjects();
    }

    if (favoritesFilterBtn) {
        favoritesFilterBtn.addEventListener("click", () => {
            playUiSound('click');
            showingFavoritesOnly = !showingFavoritesOnly;
            favoritesFilterBtn.style.background = showingFavoritesOnly ? "var(--primary)" : "";
            renderProjects();
        });
    }

    // Feedback
    const feedbackModal = document.getElementById("feedbackModal");
    const openFeedbackBtn = document.getElementById("openFeedbackBtn");
    const feedbackClose = document.getElementById("feedbackClose");
    const feedbackForm = document.getElementById("feedbackForm");

    if (openFeedbackBtn && feedbackModal) openFeedbackBtn.addEventListener("click", () => { playUiSound('click'); feedbackModal.classList.add("active"); });
    if (feedbackClose && feedbackModal) feedbackClose.addEventListener("click", () => { feedbackModal.classList.remove("active"); });
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await addDoc(collection(db, "user_feedback"), {
                category: document.getElementById("feedbackCategory").value,
                name: document.getElementById("feedbackName").value.trim() || "Anonymous",
                message: document.getElementById("feedbackMessage").value.trim(),
                timestamp: new Date().toLocaleString()
            });
            playUiSound('success');
            showToast("Feedback submitted successfully!");
            if (feedbackModal) feedbackModal.classList.remove("active");
            e.target.reset();
        });
    }

    // --- GOD-MODE WORLD CONTROL ROOM (CTRL + SHIFT + ALT + F2, Passcode: 2285) ---
    const adminModal = document.getElementById("adminModal");
    const adminClose = document.getElementById("adminClose");
    const adminLoginScreen = document.getElementById("adminLoginScreen");
    const adminHubScreen = document.getElementById("adminHubScreen");
    const adminSystemScreen = document.getElementById("adminSystemScreen");
    const adminWebsitesScreen = document.getElementById("adminWebsitesScreen");
    const adminFeedbackScreen = document.getElementById("adminFeedbackScreen");
    const adminAnalyticsScreen = document.getElementById("adminAnalyticsScreen");
    const adminPassInput = document.getElementById("adminPassInput");
    const adminLoginBtn = document.getElementById("adminLoginBtn");

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.altKey && e.key === "F2") {
            e.preventDefault();
            if (adminModal) {
                adminModal.classList.add("active");
                if (adminLoginScreen) adminLoginScreen.style.display = "flex";
                if (adminHubScreen) adminHubScreen.style.display = "none";
                if (adminSystemScreen) adminSystemScreen.style.display = "none";
                if (adminWebsitesScreen) adminWebsitesScreen.style.display = "none";
                if (adminFeedbackScreen) adminFeedbackScreen.style.display = "none";
                if (adminAnalyticsScreen) adminAnalyticsScreen.style.display = "none";
                if (adminPassInput) { adminPassInput.value = ""; adminPassInput.focus(); }
            }
        }
    });

    if (adminClose && adminModal) adminClose.addEventListener("click", () => { adminModal.classList.remove("active"); });
    if (adminLoginBtn && adminPassInput) {
        adminLoginBtn.addEventListener("click", () => {
            if (adminPassInput.value.trim() === "2285") {
                playUiSound('success');
                if (adminLoginScreen) adminLoginScreen.style.display = "none";
                if (adminHubScreen) adminHubScreen.style.display = "flex";
            } else {
                alert("Incorrect Passcode!");
                adminPassInput.value = "";
            }
        });
    }

    // Hub Sector Navigations
    const gotoSystem = document.getElementById("gotoSystemSector");
    const gotoWebsites = document.getElementById("gotoWebsitesSector");
    const gotoFeedback = document.getElementById("gotoFeedbackSector");
    const gotoAnalytics = document.getElementById("gotoAnalyticsSector");

    if (gotoSystem) gotoSystem.addEventListener("click", () => { if (adminHubScreen) adminHubScreen.style.display = "none"; if (adminSystemScreen) adminSystemScreen.style.display = "flex"; });
    if (gotoWebsites) gotoWebsites.addEventListener("click", () => { if (adminHubScreen) adminHubScreen.style.display = "none"; if (adminWebsitesScreen) adminWebsitesScreen.style.display = "flex"; loadAdminWebsitesManager(); });
    if (gotoFeedback) gotoFeedback.addEventListener("click", () => { if (adminHubScreen) adminHubScreen.style.display = "none"; if (adminFeedbackScreen) adminFeedbackScreen.style.display = "flex"; loadAdminFeedback(); });
    if (gotoAnalytics) gotoAnalytics.addEventListener("click", () => { if (adminHubScreen) adminHubScreen.style.display = "none"; if (adminAnalyticsScreen) adminAnalyticsScreen.style.display = "flex"; loadAdminAnalytics(); });

    // Back Buttons
    const backSystem = document.getElementById("backToHubFromSystem");
    const backWebsites = document.getElementById("backToHubFromWebsites");
    const backFeedback = document.getElementById("backToHubFromFeedback");
    const backAnalytics = document.getElementById("backToHubFromAnalytics");

    if (backSystem) backSystem.addEventListener("click", () => { if (adminSystemScreen) adminSystemScreen.style.display = "none"; if (adminHubScreen) adminHubScreen.style.display = "flex"; });
    if (backWebsites) backWebsites.addEventListener("click", () => { if (adminWebsitesScreen) adminWebsitesScreen.style.display = "none"; if (adminHubScreen) adminHubScreen.style.display = "flex"; });
    if (backFeedback) backFeedback.addEventListener("click", () => { if (adminFeedbackScreen) adminFeedbackScreen.style.display = "none"; if (adminHubScreen) adminHubScreen.style.display = "flex"; });
    if (backAnalytics) backAnalytics.addEventListener("click", () => { if (adminAnalyticsScreen) adminAnalyticsScreen.style.display = "none"; if (adminHubScreen) adminHubScreen.style.display = "flex"; });

    // System Sector Controls (`site_config`)
    const dbWebsiteLockToggle = document.getElementById("dbWebsiteLockToggle");
    const dbMaintenanceToggle = document.getElementById("dbMaintenanceToggle");
    const saveAnnouncementBtn = document.getElementById("saveAnnouncementBtn");
    const startCountdownBtn = document.getElementById("startCountdownBtn");

    if (dbWebsiteLockToggle) {
        dbWebsiteLockToggle.addEventListener("change", async () => {
            await setDoc(masterConfigRef, { website_lock: dbWebsiteLockToggle.checked }, { merge: true });
            playUiSound('success');
            showToast(`Website lock set to ${dbWebsiteLockToggle.checked}`);
        });
    }

    if (dbMaintenanceToggle) {
        dbMaintenanceToggle.addEventListener("change", async () => {
            await setDoc(masterConfigRef, { maintenance_mode: dbMaintenanceToggle.checked }, { merge: true });
            playUiSound('success');
            showToast(`Maintenance mode set to ${dbMaintenanceToggle.checked}`);
        });
    }

    if (saveAnnouncementBtn) {
        saveAnnouncementBtn.addEventListener("click", async () => {
            const text = document.getElementById("dbAnnouncementInput").value.trim();
            await setDoc(masterConfigRef, { announcement_text: text }, { merge: true });
            playUiSound('success');
            showToast("Announcement updated!");
        });
    }

    if (startCountdownBtn) {
        startCountdownBtn.addEventListener("click", async () => {
            const seconds = parseInt(document.getElementById("dbCountdownInput").value) || 300;
            const targetTime = Date.now() + (seconds * 1000);
            await setDoc(masterConfigRef, { countdown_target: targetTime }, { merge: true });
            playUiSound('success');
            showToast(`Countdown started for ${seconds} seconds!`);
        });
    }

    // Website Manager (`projects_database`)
    const addNewAppBtn = document.getElementById("addNewAppBtn");
    if (addNewAppBtn) {
        addNewAppBtn.addEventListener("click", async () => {
            const name = document.getElementById("newAppName").value.trim();
            const url = document.getElementById("newAppUrl").value.trim();
            const category = document.getElementById("newAppCategory").value.trim() || "Tools";
            const description = document.getElementById("newAppDesc").value.trim() || "Custom deployed app.";

            if (!name || !url) {
                alert("Please enter both Website Name and URL.");
                return;
            }

            await addDoc(collection(db, "projects_database"), { name, url, category, description, tech: ["HTML", "JS"] });
            playUiSound('success');
            showToast("Website successfully deployed to Firestore!");
            document.getElementById("newAppName").value = "";
            document.getElementById("newAppUrl").value = "";
            document.getElementById("newAppCategory").value = "";
            document.getElementById("newAppDesc").value = "";
        });
    }

    function loadAdminWebsitesManager() {
        const container = document.getElementById("adminWebsitesListContainer");
        if (!container) return;
        container.innerHTML = projects.map(proj => `
            <div class="admin-entry-card" style="align-items:center;">
                <div class="entry-info">
                    <div class="entry-top"><span>${proj.category}</span><span>📊 ${proj.visits || 0} visits</span></div>
                    <div class="entry-user">${proj.name}</div>
                    <div class="entry-msg"><a href="${proj.url}" target="_blank" style="color:var(--cyan);">${proj.url}</a></div>
                </div>
                ${proj.isCustom ? `<button class="delete-btn delete-custom-app" data-id="${proj.dbKey}"><i class="fa-solid fa-trash"></i></button>` : `<span style="font-size:0.7rem; color:var(--text-muted);">Default</span>`}
            </div>
        `).join("");

        document.querySelectorAll(".delete-custom-app").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (confirm("Delete this website from database?")) {
                    await deleteDoc(doc(db, "projects_database", btn.getAttribute("data-id")));
                    playUiSound('success');
                    showToast("Website removed!");
                }
            });
        });
    }

    // Feedback Manager (`user_feedback`)
    function loadAdminFeedback(filterCat = "All") {
        onSnapshot(collection(db, "user_feedback"), (snapshot) => {
            const list = document.getElementById("adminEntriesList");
            if (!list) return;
            const entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const filtered = filterCat === "All" ? entries : entries.filter(e => e.category === filterCat);

            list.innerHTML = filtered.length === 0 ? `<div style="text-align:center; padding:20px; color:var(--text-muted);">No feedback records found.</div>` : filtered.reverse().map(e => `
                <div class="admin-entry-card">
                    <div class="entry-info">
                        <div class="entry-top"><span style="color:var(--accent);">${e.category}</span><span>${e.timestamp}</span></div>
                        <div class="entry-user">${e.name}</div>
                        <div class="entry-msg">${e.message}</div>
                    </div>
                    <button class="delete-btn" data-id="${e.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join("");

            document.querySelectorAll("#adminEntriesList .delete-btn").forEach(btn => {
                btn.addEventListener("click", async () => { await deleteDoc(doc(db, "user_feedback", btn.getAttribute("data-id"))); loadAdminFeedback(filterCat); });
            });
        });
    }

    document.querySelectorAll(".filter-btn[data-feedback-cat]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".filter-btn[data-feedback-cat]").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            loadAdminFeedback(e.target.getAttribute("data-feedback-cat"));
        });
    });

    function loadAdminAnalytics() {
        const list = document.getElementById("adminAnalyticsList");
        if (!list) return;
        list.innerHTML = projects.map(proj => `
            <div class="admin-entry-card" style="flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between; width:100%; font-weight:700;">
                    <span>${proj.name}</span>
                    <span style="color:var(--cyan);">${proj.visits || 0} Visits | ❤️ ${proj.likes || 0} Likes</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; border-top:1px solid var(--card-border); padding-top:6px;">
                    <label style="font-size:0.75rem;">Override Likes:</label>
                    <input type="number" class="cms-input direct-likes-input" data-key="${proj.dbKey}" value="${proj.likes || 0}" style="width:80px; padding:4px; margin:0;">
                </div>
            </div>
        `).join("");

        document.querySelectorAll(".direct-likes-input").forEach(input => {
            input.addEventListener("change", async () => {
                const key = input.getAttribute("data-key");
                const val = parseInt(input.value) || 0;
                await setDoc(doc(db, "project_stats", key), { likes: val }, { merge: true });
                showToast("Likes overridden in Firestore!");
            });
        });
    }

    if (audioToggleBtn) {
        audioToggleBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            if (audioIcon) audioIcon.className = soundEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
            playUiSound('click');
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            playUiSound('click');
            document.body.classList.toggle("light-mode");
            if (themeIcon) themeIcon.className = document.body.classList.contains("light-mode") ? "fa-solid fa-sun" : "fa-solid fa-moon";
        });
    }

    if (filterBar) {
        filterBar.addEventListener("click", (e) => {
            if (e.target.classList.contains("filter-btn") && !e.target.hasAttribute("data-feedback-cat")) {
                playUiSound('click');
                document.querySelectorAll(".filter-bar .filter-btn").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                activeCategory = e.target.getAttribute("data-category");
                showingFavoritesOnly = false;
                renderProjects();
            }
        });
    }

    if (searchInput) searchInput.addEventListener("input", (e) => { searchQuery = e.target.value.toLowerCase().trim(); renderProjects(); });
    if (sortSelect) sortSelect.addEventListener("change", renderProjects);
    if (surpriseBtn) surpriseBtn.addEventListener("click", () => { playUiSound('click'); openModal(projects[Math.floor(Math.random() * projects.length)]); });

    function renderProjects() {
        if (!grid) return;
        let filtered = projects.filter(p => {
            const matchesFav = !showingFavoritesOnly || localStorage.getItem(`bookmarked_${p.dbKey}`) === "true";
            const matchesCat = activeCategory === "All" || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
            return matchesFav && matchesCat && matchesSearch;
        });

        const sortVal = sortSelect ? sortSelect.value : "default";
        if (sortVal === "likes" || sortVal === "default") filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        else if (sortVal === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortVal === "za") filtered.sort((a, b) => b.name.localeCompare(a.name));

        if (statsCounter) statsCounter.textContent = `Showing ${filtered.length} of ${projects.length} applications`;

        grid.innerHTML = filtered.map((project) => {
            const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(project.url)}&screenshot=true&meta=false&embed=screenshot.url`;
            const previewEl = `<img src="${screenshotUrl}" alt="${project.name}" class="card-media-preview" loading="lazy">`;
            const hasLiked = localStorage.getItem(`liked_${project.dbKey}`) === "true";
            const hasDisliked = localStorage.getItem(`disliked_${project.dbKey}`) === "true";
            const isBookmarked = localStorage.getItem(`bookmarked_${project.dbKey}`) === "true";

            return `
                <div class="project-card">
                    <button class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-bookmark-key="${project.dbKey}"><i class="fa-solid fa-bookmark"></i></button>
                    <div class="card-media-wrapper">${previewEl}</div>
                    <div class="card-content card-click-trigger" data-index="${projects.indexOf(project)}">
                        <div class="card-top-row">
                            <span class="card-tag">${project.category}</span>
                            <div class="card-tech-pills">${project.tech ? project.tech.map(t => `<span class="tech-pill">${t}</span>`).join("") : ""}</div>
                        </div>
                        <h3 class="card-title">${project.name}</h3>
                        <p class="card-desc">${project.description}</p>
                        <div class="card-bottom-row">
                            <button class="card-like-btn ${hasLiked ? 'liked' : ''}" data-project-key="${project.dbKey}"><i class="fa-solid fa-heart"></i> <span>${project.likes || 0}</span></button>
                            <button class="card-dislike-btn ${hasDisliked ? 'disliked' : ''}" data-project-key="${project.dbKey}"><i class="fa-solid fa-thumbs-down"></i> <span>${project.dislikes || 0}</span></button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        document.querySelectorAll(".card-bookmark-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                playUiSound('click');
                const dbKey = btn.getAttribute("data-bookmark-key");
                if (localStorage.getItem(`bookmarked_${dbKey}`) === "true") {
                    localStorage.removeItem(`bookmarked_${dbKey}`);
                    btn.classList.remove("bookmarked");
                } else {
                    localStorage.setItem(`bookmarked_${dbKey}`, "true");
                    btn.classList.add("bookmarked");
                }
                updateFavoritesBadge();
            });
        });

        document.querySelectorAll(".card-click-trigger").forEach(el => {
            el.addEventListener("click", () => { openModal(projects[el.getAttribute("data-index")]); });
        });
    }

    const modal = document.getElementById("projectModal");
    function openModal(project) {
        playUiSound('click');
        if (!modal) return;
        document.getElementById("modalTitle").textContent = project.name;
        document.getElementById("modalCategory").textContent = project.category;
        document.getElementById("modalDescription").textContent = project.description;
        document.getElementById("modalVisitBtn").href = project.url;
        document.getElementById("likeCount").textContent = project.likes || 0;
        document.getElementById("dislikeCount").textContent = project.dislikes || 0;
        document.getElementById("modalVisitsCount").textContent = project.visits || 0;

        const qrContainer = document.getElementById("qrcodeContainer");
        if (qrContainer) qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(project.url)}" alt="QR">`;
        const qrUrl = document.getElementById("qrAppUrlText");
        if (qrUrl) qrUrl.textContent = project.url;

        if (project.tutorial && Array.isArray(project.tutorial)) {
            const tutList = document.getElementById("modalTutorialList");
            if (tutList) tutList.innerHTML = project.tutorial.map((step, idx) => `
                <div class="tutorial-step"><span class="step-num">${idx + 1}</span><p>${step}</p></div>
            `).join("");
        }

        modal.classList.add("active");
    }

    const modalClose = document.getElementById("modalClose");
    if (modalClose && modal) modalClose.addEventListener("click", () => { modal.classList.remove("active"); });
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });
});
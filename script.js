import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
let usersMap = {}; 
let siteSpecificStatus = {}; // Tracks locked/maintenance per app
let soundEnabled = true;
let lockdownCountdownInterval = null;
let announcementInterval = null;
let maintenanceInterval = null;

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
    let myUsername = localStorage.getItem("rick_dev_username");
    const voterIdentityModal = document.getElementById("voterIdentityModal");
    const voterIdentityForm = document.getElementById("voterIdentityForm");
    const headerProfileBadge = document.getElementById("headerProfileBadge");
    const headerUsernameDisplay = document.getElementById("headerUsernameDisplay");
    const headerRoleBadgeContainer = document.getElementById("headerRoleBadgeContainer");

    if (!myUsername && voterIdentityModal) {
        voterIdentityModal.classList.add("active");
    }

    if (headerProfileBadge) {
        headerProfileBadge.addEventListener("click", () => {
            playUiSound('click');
            if (voterIdentityModal) {
                document.getElementById("usernameModalTitle").textContent = "Change Username";
                document.getElementById("voterNameInput").value = myUsername || "";
                voterIdentityModal.classList.add("active");
            }
        });
    }

    if (voterIdentityForm) {
        voterIdentityForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const rawVal = document.getElementById("voterNameInput").value.trim();
            if (!rawVal) return;

            const userRef = doc(db, "users", rawVal);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists() && myUsername !== rawVal) {
                alert("This username is already taken! Please choose another one.");
                return;
            }

            if (myUsername && myUsername !== rawVal) {
                localStorage.setItem("rick_dev_username", rawVal);
            } else if (!myUsername) {
                localStorage.setItem("rick_dev_username", rawVal);
            }

            myUsername = rawVal;
            if (voterIdentityModal) voterIdentityModal.classList.remove("active");
            playUiSound('success');
            showToast(`Username set to ${rawVal}!`);

            await setDoc(userRef, {
                username: rawVal,
                role: userSnap.exists() ? (userSnap.data().role || 'member') : 'member',
                lastActive: new Date().toLocaleString()
            }, { merge: true });

            updateHeaderDisplay();
        });
    }

    function updateHeaderDisplay() {
        if (!headerUsernameDisplay) return;
        headerUsernameDisplay.textContent = myUsername || "Guest";
        if (myUsername && usersMap[myUsername]) {
            headerRoleBadgeContainer.innerHTML = getRoleBadgeHtml(myUsername);
        } else {
            headerRoleBadgeContainer.innerHTML = `<span class="role-badge member"><i class="fa-solid fa-star"></i> Member</span>`;
        }
    }

    const floatingAdminBtn = document.getElementById("floatingAdminPanelBtn");

    onSnapshot(collection(db, "users"), (snapshot) => {
        usersMap = {};
        snapshot.forEach(d => {
            const data = d.data();
            usersMap[data.username] = data.role || 'member';
        });

        if (myUsername && usersMap[myUsername]) {
            const role = usersMap[myUsername];
            if (['creator', 'owner', 'admin'].includes(role)) {
                if (floatingAdminBtn) floatingAdminBtn.classList.add("show");
            } else {
                if (floatingAdminBtn) floatingAdminBtn.classList.remove("show");
            }
        } else {
            if (floatingAdminBtn) floatingAdminBtn.classList.remove("show");
        }

        updateHeaderDisplay();
        updateUserDirectoryUI();
    });

    function getRoleBadgeHtml(username) {
        const role = usersMap[username] || 'member';
        if (role === 'creator') return `<span class="role-badge creator"><i class="fa-solid fa-wand-magic-sparkles"></i> Creator</span>`;
        if (role === 'owner') return `<span class="role-badge owner"><i class="fa-solid fa-crown"></i> Owner</span>`;
        if (role === 'admin') return `<span class="role-badge admin"><i class="fa-solid fa-shield-halved"></i> Admin</span>`;
        if (role === 'moderator') return `<span class="role-badge moderator"><i class="fa-solid fa-gavel"></i> Moderator</span>`;
        return `<span class="role-badge member"><i class="fa-solid fa-star"></i> Member</span>`;
    }

    // --- MODULAR FIRESTORE DOCUMENTS LISTENERS (`site_config/*`) ---
    
    // 1. Master Lockdown Document
    onSnapshot(doc(db, "site_config", "master_lockdown"), (docSnap) => {
        const lockdownScreen = document.getElementById("websiteLockdownScreen");
        const lockdownReasonText = document.getElementById("lockdownReasonText");
        const lockdownTimerBox = document.getElementById("lockdownTimerBox");

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.locked === true) {
                if (lockdownReasonText) lockdownReasonText.textContent = data.reason || "Platform secured by administrator.";
                if (lockdownScreen) lockdownScreen.classList.add("active");
            } else {
                if (lockdownScreen) lockdownScreen.classList.remove("active");
                if (lockdownTimerBox) lockdownTimerBox.textContent = "";
            }

            if (data.targetTimestamp) {
                startMasterLockdownCountdown(data.targetTimestamp);
            }
        }
    });

    function startMasterLockdownCountdown(targetTimestamp) {
        if (lockdownCountdownInterval) clearInterval(lockdownCountdownInterval);
        const warningBanner = document.getElementById("countdownWarningBanner");
        const timerDisplay = document.getElementById("countdownTimerDisplay");

        lockdownCountdownInterval = setInterval(() => {
            const now = Date.now();
            const distance = targetTimestamp - now;
            if (distance <= 0) {
                clearInterval(lockdownCountdownInterval);
                if (warningBanner) warningBanner.classList.remove("show");
                setDoc(doc(db, "site_config", "master_lockdown"), { locked: true, targetTimestamp: null }, { merge: true });
            } else {
                const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((distance % (1000 * 60)) / 1000);
                if (timerDisplay) timerDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                if (warningBanner) warningBanner.classList.add("show");
            }
        }, 1000);
    }

    // 2. Maintenance Document
    onSnapshot(doc(db, "site_config", "maintenance"), (docSnap) => {
        const maintBanner = document.getElementById("maintenanceBanner");
        const maintBannerText = document.getElementById("maintenanceBannerText");
        const maintTimerBadge = document.getElementById("maintenanceTimerBadge");

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.active === true) {
                if (maintBannerText) maintBannerText.textContent = data.notice || "Platform undergoing updates.";
                if (maintBanner) maintBanner.classList.add("show");

                if (data.type === 'timed' && data.targetTimestamp) {
                    startMaintenanceDocCountdown(data.targetTimestamp);
                } else {
                    if (maintTimerBadge) maintTimerBadge.textContent = "(Permanent)";
                    if (maintenanceInterval) clearInterval(maintenanceInterval);
                }
            } else {
                if (maintBanner) maintBanner.classList.remove("show");
                if (maintenanceInterval) clearInterval(maintenanceInterval);
            }
        }
    });

    function startMaintenanceDocCountdown(targetTimestamp) {
        if (maintenanceInterval) clearInterval(maintenanceInterval);
        const maintTimerBadge = document.getElementById("maintenanceTimerBadge");
        const maintBanner = document.getElementById("maintenanceBanner");

        maintenanceInterval = setInterval(() => {
            const now = Date.now();
            const distance = targetTimestamp - now;
            if (distance <= 0) {
                clearInterval(maintenanceInterval);
                if (maintBanner) maintBanner.classList.remove("show");
                setDoc(doc(db, "site_config", "maintenance"), { active: false, targetTimestamp: null }, { merge: true });
            } else {
                const hrs = Math.floor(distance / (1000 * 60 * 60));
                const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((distance % (1000 * 60)) / 1000);
                if (maintTimerBadge) maintTimerBadge.textContent = `(Ends in ${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s)`;
            }
        }, 1000);
    }

    // 3. Announcement Document
    onSnapshot(doc(db, "site_config", "announcement"), (docSnap) => {
        const annBanner = document.getElementById("globalAnnouncementBanner");
        const annSenderBox = document.getElementById("announcementSenderBox");
        const annText = document.getElementById("announcementBannerText");
        const annTimerBadge = document.getElementById("announcementTimerBadge");

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.text && data.text.trim() !== "") {
                if (annText) annText.textContent = data.text;
                if (data.sender) {
                    if (annSenderBox) annSenderBox.innerHTML = `<strong>${data.sender}</strong> ${getRoleBadgeHtml(data.sender)}:`;
                }
                if (annBanner) annBanner.classList.add("show");

                if (data.type === 'timed' && data.targetTimestamp) {
                    startAnnouncementCountdown(data.targetTimestamp);
                } else {
                    if (annTimerBadge) annTimerBadge.textContent = "Permanent";
                    if (announcementInterval) clearInterval(announcementInterval);
                }
            } else {
                if (annBanner) annBanner.classList.remove("show");
                if (announcementInterval) clearInterval(announcementInterval);
            }
        }
    });

    function startAnnouncementCountdown(targetTimestamp) {
        if (announcementInterval) clearInterval(announcementInterval);
        const annTimerBadge = document.getElementById("announcementTimerBadge");
        const annBanner = document.getElementById("globalAnnouncementBanner");

        announcementInterval = setInterval(() => {
            const now = Date.now();
            const distance = targetTimestamp - now;
            if (distance <= 0) {
                clearInterval(announcementInterval);
                if (annBanner) annBanner.classList.remove("show");
                setDoc(doc(db, "site_config", "announcement"), { text: "" }, { merge: true });
            } else {
                const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((distance % (1000 * 60)) / 1000);
                if (annTimerBadge) annTimerBadge.textContent = `Expires in ${mins}m ${secs}s`;
            }
        }, 1000);
    }

    // 4. Per-Site Specific Locks Document Listener (`site_config/per_site_locks`)
    onSnapshot(doc(db, "site_config", "per_site_locks"), (docSnap) => {
        if (docSnap.exists()) {
            siteSpecificStatus = docSnap.data() || {};
        } else {
            siteSpecificStatus = {};
        }
        renderProjects();
    });

    // Device Selector & Theme Logic
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

    const feedbackModal = document.getElementById("feedbackModal");
    const openFeedbackBtn = document.getElementById("openFeedbackBtn");
    const feedbackClose = document.getElementById("feedbackClose");
    const feedbackForm = document.getElementById("feedbackForm");

    if (openFeedbackBtn && feedbackModal) openFeedbackBtn.addEventListener("click", () => { playUiSound('click'); feedbackModal.classList.add("active"); });
    if (feedbackClose && feedbackModal) feedbackClose.addEventListener("click", () => { feedbackModal.classList.remove("active"); });
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!myUsername) {
                if (voterIdentityModal) voterIdentityModal.classList.add("active");
                return;
            }
            await addDoc(collection(db, "user_feedback"), {
                category: document.getElementById("feedbackCategory").value,
                name: myUsername,
                message: document.getElementById("feedbackMessage").value.trim(),
                timestamp: new Date().toLocaleString()
            });
            playUiSound('success');
            showToast("Feedback submitted successfully!");
            if (feedbackModal) feedbackModal.classList.remove("active");
            e.target.reset();
        });
    }

    // --- WORLD CONTROL ROOM ---
    const adminModal = document.getElementById("adminModal");
    const adminClose = document.getElementById("adminClose");
    const adminLoginScreen = document.getElementById("adminLoginScreen");
    const adminHubScreen = document.getElementById("adminHubScreen");
    const adminSystemScreen = document.getElementById("adminSystemScreen");
    const adminWebsiteLocksScreen = document.getElementById("adminWebsiteLocksScreen");
    const adminWebsitesScreen = document.getElementById("adminWebsitesScreen");
    const adminFeedbackScreen = document.getElementById("adminFeedbackScreen");
    const adminPassInput = document.getElementById("adminPassInput");
    const adminLoginBtn = document.getElementById("adminLoginBtn");

    function openControlRoom() {
        if (!adminModal) return;
        const userRole = myUsername ? usersMap[myUsername] : 'member';
        const isAuthorized = ['creator', 'owner', 'admin'].includes(userRole);

        if (!isAuthorized) {
            alert("Access Denied! You do not have the Creator, Owner, or Admin role required.");
            return;
        }

        adminModal.classList.add("active");
        if (adminLoginScreen) adminLoginScreen.style.display = "none";
        if (adminHubScreen) adminHubScreen.style.display = "flex";
        if (adminSystemScreen) adminSystemScreen.style.display = "none";
        if (adminWebsiteLocksScreen) adminWebsiteLocksScreen.style.display = "none";
        if (adminWebsitesScreen) adminWebsitesScreen.style.display = "none";
        if (adminFeedbackScreen) adminFeedbackScreen.style.display = "none";
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "F2") {
            e.preventDefault();
            const userRole = myUsername ? usersMap[myUsername] : 'member';
            if (['creator', 'owner', 'admin'].includes(userRole)) {
                openControlRoom();
            } else {
                alert("F2 Shortcut locked: You lack Creator/Owner/Admin role permissions.");
            }
        }
    });

    if (floatingAdminBtn) {
        floatingAdminBtn.addEventListener("click", () => {
            playUiSound('click');
            openControlRoom();
        });
    }

    if (adminClose && adminModal) adminClose.addEventListener("click", () => { adminModal.classList.remove("active"); });
    if (adminLoginBtn && adminPassInput) {
        adminLoginBtn.addEventListener("click", async () => {
            const pass = adminPassInput.value.trim();
            const userRole = myUsername ? usersMap[myUsername] : 'member';

            if (pass === "2285" || ['creator', 'owner', 'admin'].includes(userRole)) {
                playUiSound('success');
                if (adminLoginScreen) adminLoginScreen.style.display = "none";
                if (adminHubScreen) adminHubScreen.style.display = "flex";
            } else {
                alert("Incorrect PIN! Access denied.");
                adminPassInput.value = "";
            }
        });
    }

    // Hub Navigations
    const gotoSystem = document.getElementById("gotoSystemSector");
    const gotoWebsiteLocks = document.getElementById("gotoWebsiteLocksSector");
    const gotoWebsites = document.getElementById("gotoWebsitesSector");
    const gotoFeedback = document.getElementById("gotoFeedbackSector");

    if (gotoSystem) gotoSystem.addEventListener("click", () => { if (adminHubScreen) adminHubScreen.style.display = "none"; if (adminSystemScreen) adminSystemScreen.style.display = "flex"; });
    if (gotoWebsiteLocks) gotoWebsiteLocks.addEventListener("click", () => { if (adminHubScreen) adminHubScreen.style.display = "none"; if (adminWebsiteLocksScreen) adminWebsiteLocksScreen.style.display = "flex"; loadPerSiteLocksManager(); });
    if (gotoWebsites) gotoWebsites.addEventListener("click", () => { if (adminHubScreen) adminHubScreen.style.display = "none"; if (adminWebsitesScreen) adminWebsitesScreen.style.display = "flex"; loadAdminWebsitesManager(); });
    if (gotoFeedback) gotoFeedback.addEventListener("click", () => { if (adminHubScreen) adminHubScreen.style.display = "none"; if (adminFeedbackScreen) adminFeedbackScreen.style.display = "flex"; loadAdminFeedback(); });

    // Back Buttons
    const backSystem = document.getElementById("backToHubFromSystem");
    const backLocks = document.getElementById("backToHubFromLocks");
    const backWebsites = document.getElementById("backToHubFromWebsites");
    const backFeedback = document.getElementById("backToHubFromFeedback");

    if (backSystem) backSystem.addEventListener("click", () => { if (adminSystemScreen) adminSystemScreen.style.display = "none"; if (adminHubScreen) adminHubScreen.style.display = "flex"; });
    if (backLocks) backLocks.addEventListener("click", () => { if (adminWebsiteLocksScreen) adminWebsiteLocksScreen.style.display = "none"; if (adminHubScreen) adminHubScreen.style.display = "flex"; });
    if (backWebsites) backWebsites.addEventListener("click", () => { if (adminWebsitesScreen) adminWebsitesScreen.style.display = "none"; if (adminHubScreen) adminHubScreen.style.display = "flex"; });
    if (backFeedback) backFeedback.addEventListener("click", () => { if (adminFeedbackScreen) adminFeedbackScreen.style.display = "none"; if (adminHubScreen) adminHubScreen.style.display = "flex"; });

    // Role Manager
    const saveUserRoleBtn = document.getElementById("saveUserRoleBtn");
    if (saveUserRoleBtn) {
        saveUserRoleBtn.addEventListener("click", async () => {
            const targetUser = document.getElementById("targetUsernameInput").value.trim();
            const targetRole = document.getElementById("targetRoleSelect").value;
            if (!targetUser) return alert("Please enter a username.");

            await setDoc(doc(db, "users", targetUser), { username: targetUser, role: targetRole }, { merge: true });
            playUiSound('success');
            showToast(`Granted '${targetRole}' tag to ${targetUser}!`);
            document.getElementById("targetUsernameInput").value = "";
        });
    }

    function updateUserDirectoryUI() {
        onSnapshot(collection(db, "users"), (snapshot) => {
            const container = document.getElementById("adminUserDirectoryList");
            const countBadge = document.getElementById("userDirectoryCount");
            if (!container) return;
            const users = snapshot.docs.map(d => d.data());
            if (countBadge) countBadge.textContent = users.length;

            container.innerHTML = users.length === 0 ? `<div style="color:var(--text-muted); font-size:0.8rem;">No registered users.</div>` : users.map(u => `
                <div class="admin-entry-card" style="align-items:center; padding:8px 12px;">
                    <div class="entry-info">
                        <div class="entry-user">${u.username} ${getRoleBadgeHtml(u.username)}</div>
                        <div class="entry-top"><span>Role: ${u.role || 'member'} | Active: ${u.lastActive || 'N/A'}</span></div>
                    </div>
                </div>
            `).join("");
        });
    }

    // Modular Document 1: site_config/master_lockdown
    const lockdownTypeSelect = document.getElementById("lockdownTypeSelect");
    const lockTimeVal = document.getElementById("lockTimeVal");
    const lockTimeUnit = document.getElementById("lockTimeUnit");
    const saveMasterLockBtn = document.getElementById("saveMasterLockBtn");
    const removeMasterLockBtn = document.getElementById("removeMasterLockBtn");

    if (lockdownTypeSelect) {
        lockdownTypeSelect.addEventListener("change", () => {
            const isTimed = lockdownTypeSelect.value === 'timed';
            if (lockTimeVal) lockTimeVal.style.display = isTimed ? "block" : "none";
            if (lockTimeUnit) lockTimeUnit.style.display = isTimed ? "block" : "none";
        });
    }

    if (saveMasterLockBtn) {
        saveMasterLockBtn.addEventListener("click", async () => {
            const type = lockdownTypeSelect.value;
            const reason = document.getElementById("lockReasonInput").value.trim() || "Platform secured by admin.";
            let targetTimestamp = null;

            if (type === 'timed') {
                const val = parseFloat(lockTimeVal.value) || 5;
                const unit = lockTimeUnit.value;
                let multiplier = 1000; 
                if (unit === 'minutes') multiplier = 60 * 1000;
                if (unit === 'hours') multiplier = 60 * 60 * 1000;
                targetTimestamp = Date.now() + (val * multiplier);
            }

            await setDoc(doc(db, "site_config", "master_lockdown"), {
                locked: type === 'instant',
                reason,
                targetTimestamp
            }, { merge: true });

            playUiSound('success');
            showToast(type === 'instant' ? "Global lockdown active!" : "Lockdown countdown scheduled!");
        });
    }

    if (removeMasterLockBtn) {
        removeMasterLockBtn.addEventListener("click", async () => {
            await setDoc(doc(db, "site_config", "master_lockdown"), { locked: false, targetTimestamp: null }, { merge: true });
            playUiSound('success');
            showToast("Global lockdown lifted!");
        });
    }

    // Modular Document 2: site_config/maintenance
    const maintTypeSelect = document.getElementById("maintTypeSelect");
    const maintTimeVal = document.getElementById("maintTimeVal");
    const maintTimeUnit = document.getElementById("maintTimeUnit");
    const saveMaintenanceDocBtn = document.getElementById("saveMaintenanceDocBtn");
    const removeMaintenanceDocBtn = document.getElementById("removeMaintenanceDocBtn");

    if (maintTypeSelect) {
        maintTypeSelect.addEventListener("change", () => {
            const isTimed = maintTypeSelect.value === 'timed';
            if (maintTimeVal) maintTimeVal.style.display = isTimed ? "block" : "none";
            if (maintTimeUnit) maintTimeUnit.style.display = isTimed ? "block" : "none";
        });
    }

    if (saveMaintenanceDocBtn) {
        saveMaintenanceDocBtn.addEventListener("click", async () => {
            const type = maintTypeSelect.value;
            const notice = document.getElementById("maintNoticeInput").value.trim() || "Platform under maintenance.";
            let targetTimestamp = null;

            if (type === 'timed') {
                const val = parseFloat(maintTimeVal.value) || 30;
                const unit = maintTimeUnit.value;
                let multiplier = 1000;
                if (unit === 'minutes') multiplier = 60 * 1000;
                if (unit === 'hours') multiplier = 60 * 60 * 1000;
                targetTimestamp = Date.now() + (val * multiplier);
            }

            await setDoc(doc(db, "site_config", "maintenance"), {
                active: true,
                type,
                notice,
                targetTimestamp
            }, { merge: true });

            playUiSound('success');
            showToast("Maintenance document saved!");
        });
    }

    if (removeMaintenanceDocBtn) {
        removeMaintenanceDocBtn.addEventListener("click", async () => {
            await setDoc(doc(db, "site_config", "maintenance"), { active: false, targetTimestamp: null }, { merge: true });
            playUiSound('success');
            showToast("Maintenance disabled!");
        });
    }

    // Modular Document 3: site_config/announcement
    const saveAnnouncementDocBtn = document.getElementById("saveAnnouncementDocBtn");
    const removeAnnouncementDocBtn = document.getElementById("removeAnnouncementDocBtn");

    if (saveAnnouncementDocBtn) {
        saveAnnouncementDocBtn.addEventListener("click", async () => {
            const text = document.getElementById("announcementInput").value.trim();
            await setDoc(doc(db, "site_config", "announcement"), {
                text,
                sender: myUsername || "Admin"
            }, { merge: true });
            playUiSound('success');
            showToast("Announcement document published!");
        });
    }

    if (removeAnnouncementDocBtn) {
        removeAnnouncementDocBtn.addEventListener("click", async () => {
            await setDoc(doc(db, "site_config", "announcement"), { text: "", sender: "" }, { merge: true });
            playUiSound('success');
            showToast("Announcement removed!");
        });
    }

    // Per-Site Specific Locks & Maintenance Manager UI
    function loadPerSiteLocksManager() {
        const container = document.getElementById("perSiteLocksContainer");
        if (!container) return;

        container.innerHTML = projects.map(proj => {
            const currentStatus = siteSpecificStatus[proj.dbKey] || { locked: false, maintenance: false };
            return `
                <div class="admin-entry-card" style="flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <strong>${proj.name}</strong>
                        <span style="font-size:0.7rem; color:var(--text-muted);">${proj.category}</span>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center; width:100%; flex-wrap:wrap;">
                        <label style="font-size:0.75rem;"><input type="checkbox" class="site-lock-chk" data-key="${proj.dbKey}" ${currentStatus.locked ? 'checked' : ''}> Lock Site</label>
                        <label style="font-size:0.75rem;"><input type="checkbox" class="site-maint-chk" data-key="${proj.dbKey}" ${currentStatus.maintenance ? 'checked' : ''}> Maintenance</label>
                        <input type="number" class="cms-input site-time-val" data-key="${proj.dbKey}" placeholder="Duration" value="${currentStatus.duration || 5}" style="width:70px; padding:2px; margin:0;">
                        <select class="sort-select cms-select site-time-unit" data-key="${proj.dbKey}" style="padding:2px 6px; font-size:0.75rem;">
                            <option value="seconds">Secs</option>
                            <option value="minutes" selected>Mins</option>
                            <option value="hours">Hours</option>
                        </select>
                        <button class="btn-primary save-site-status-btn" data-key="${proj.dbKey}" style="padding:4px 10px; font-size:0.75rem;"><i class="fa-solid fa-floppy-disk"></i> Apply</button>
                    </div>
                </div>
            `;
        }).join("");

        document.querySelectorAll(".save-site-status-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const key = btn.getAttribute("data-key");
                const card = btn.closest(".admin-entry-card");
                const locked = card.querySelector(".site-lock-chk").checked;
                const maintenance = card.querySelector(".site-maint-chk").checked;
                const duration = parseFloat(card.querySelector(".site-time-val").value) || 5;
                const unit = card.querySelector(".site-time-unit").value;

                let multiplier = 60 * 1000;
                if (unit === 'seconds') multiplier = 1000;
                if (unit === 'hours') multiplier = 60 * 60 * 1000;
                const targetTimestamp = Date.now() + (duration * multiplier);

                siteSpecificStatus[key] = {
                    locked,
                    maintenance,
                    duration,
                    targetTimestamp
                };

                await setDoc(doc(db, "site_config", "per_site_locks"), siteSpecificStatus, { merge: true });
                playUiSound('success');
                showToast(`Updated lock status for ${key}!`);
            });
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

    const addNewAppBtn = document.getElementById("addNewAppBtn");
    if (addNewAppBtn) {
        addNewAppBtn.addEventListener("click", async () => {
            const name = document.getElementById("newAppName").value.trim();
            const url = document.getElementById("newAppUrl").value.trim();
            const category = document.getElementById("newAppCategory").value.trim() || "Tools";
            const description = document.getElementById("newAppDesc").value.trim() || "Custom deployed app.";

            if (!name || !url) return alert("Please enter both Name and URL.");

            await addDoc(collection(db, "projects_database"), { name, url, category, description, tech: ["HTML", "JS"] });
            playUiSound('success');
            showToast("Website deployed to Firestore!");
            document.getElementById("newAppName").value = "";
            document.getElementById("newAppUrl").value = "";
            document.getElementById("newAppCategory").value = "";
            document.getElementById("newAppDesc").value = "";
        });
    }

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
                        <div class="entry-user">${e.name} ${getRoleBadgeHtml(e.name)}</div>
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
            const status = siteSpecificStatus[project.dbKey] || {};
            const isLocked = status.locked;
            const isMaint = status.maintenance;

            const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(project.url)}&screenshot=true&meta=false&embed=screenshot.url`;
            const previewEl = `<img src="${screenshotUrl}" alt="${project.name}" class="card-media-preview" loading="lazy">`;
            const hasLiked = localStorage.getItem(`liked_${project.dbKey}`) === "true";
            const hasDisliked = localStorage.getItem(`disliked_${project.dbKey}`) === "true";
            const isBookmarked = localStorage.getItem(`bookmarked_${project.dbKey}`) === "true";

            return `
                <div class="project-card" style="${isLocked ? 'opacity:0.5; pointer-events:none;' : ''}">
                    ${isLocked ? `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:20; background:rgba(239,68,68,0.9); color:white; padding:6px 14px; border-radius:20px; font-size:0.75rem; font-weight:800;"><i class="fa-solid fa-lock"></i> LOCKED</div>` : ''}
                    ${isMaint ? `<div style="position:absolute; top:10px; left:10px; z-index:20; background:rgba(245,158,11,0.9); color:white; padding:4px 10px; border-radius:12px; font-size:0.65rem; font-weight:800;"><i class="fa-solid fa-screwdriver-wrench"></i> MAINTENANCE</div>` : ''}
                    <button class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-bookmark-key="${project.dbKey}"><i class="fa-solid fa-bookmark"></i></button>
                    <div class="card-media-wrapper card-click-trigger" data-index="${projects.indexOf(project)}">${previewEl}</div>
                    <div class="card-content">
                        <div class="card-top-row">
                            <span class="card-tag">${project.category}</span>
                            <div class="card-tech-pills">${project.tech ? project.tech.map(t => `<span class="tech-pill">${t}</span>`).join("") : ""}</div>
                        </div>
                        <h3 class="card-title card-click-trigger" data-index="${projects.indexOf(project)}">${project.name}</h3>
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

        document.querySelectorAll(".card-like-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (!myUsername && voterIdentityModal) {
                    voterIdentityModal.classList.add("active");
                    return;
                }
                playUiSound('click');
                const key = btn.getAttribute("data-project-key");
                const currentProj = projects.find(p => p.dbKey === key);
                if (!currentProj) return;

                const hasLiked = localStorage.getItem(`liked_${key}`) === "true";
                let newLikes = currentProj.likes || 0;

                if (hasLiked) {
                    newLikes = Math.max(0, newLikes - 1);
                    localStorage.removeItem(`liked_${key}`);
                } else {
                    newLikes += 1;
                    localStorage.setItem(`liked_${key}`, "true");
                    await addDoc(collection(db, "like_logs"), {
                        userName: myUsername,
                        projectName: currentProj.name,
                        timestamp: new Date().toLocaleString()
                    });
                }

                await setDoc(doc(db, "project_stats", key), { likes: newLikes }, { merge: true });
                showToast("Like updated!");
            });
        });

        document.querySelectorAll(".card-dislike-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                playUiSound('click');
                const key = btn.getAttribute("data-project-key");
                const currentProj = projects.find(p => p.dbKey === key);
                if (!currentProj) return;

                const hasDisliked = localStorage.getItem(`disliked_${key}`) === "true";
                let newDislikes = currentProj.dislikes || 0;

                if (hasDisliked) {
                    newDislikes = Math.max(0, newDislikes - 1);
                    localStorage.removeItem(`disliked_${key}`);
                } else {
                    newDislikes += 1;
                    localStorage.setItem(`disliked_${key}`, "true");
                }

                await setDoc(doc(db, "project_stats", key), { dislikes: newDislikes }, { merge: true });
                showToast("Dislike recorded!");
            });
        });

        document.querySelectorAll(".card-click-trigger").forEach(el => {
            el.addEventListener("click", () => { openModal(projects[el.getAttribute("data-index")]); });
        });
    }

    const modal = document.getElementById("projectModal");
    let currentActiveProject = null;

    function openModal(project) {
        playUiSound('click');
        if (!modal) return;
        currentActiveProject = project;
        document.getElementById("modalTitle").textContent = project.name;
        document.getElementById("modalCategory").textContent = project.category;
        document.getElementById("modalDescription").textContent = project.description;
        document.getElementById("modalVisitBtn").href = project.url;
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

        loadProjectReviews(project.dbKey);
        modal.classList.add("active");
    }

    document.querySelectorAll(".modal-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".modal-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".modal-tab-pane").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            const targetTab = btn.getAttribute("data-tab");
            document.getElementById(targetTab).classList.add("active");
        });
    });

    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!myUsername) {
                if (voterIdentityModal) voterIdentityModal.classList.add("active");
                return;
            }
            if (!currentActiveProject) return;
            const rating = document.getElementById("reviewRating").value;
            const text = document.getElementById("reviewText").value.trim();

            const reviewId = `review_${Date.now()}`;
            await setDoc(doc(db, "website_reviews", reviewId), {
                projectKey: currentActiveProject.dbKey,
                name: myUsername,
                rating,
                text,
                timestamp: new Date().toLocaleString(),
                ownerId: myUsername
            });

            playUiSound('success');
            showToast("Review submitted successfully!");
            reviewForm.reset();
            loadProjectReviews(currentActiveProject.dbKey);
        });
    }

    function loadProjectReviews(dbKey) {
        onSnapshot(collection(db, "website_reviews"), (snapshot) => {
            const list = document.getElementById("projectReviewsList");
            if (!list) return;
            const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.projectKey === dbKey);
            const userRole = myUsername ? usersMap[myUsername] : 'member';
            const isStaff = ['creator', 'owner', 'admin'].includes(userRole);

            list.innerHTML = reviews.length === 0 ? `<div style="color:var(--text-muted); font-size:0.85rem;">No reviews yet. Be the first to leave one!</div>` : reviews.reverse().map(r => `
                <div class="admin-entry-card" style="align-items:center;">
                    <div class="entry-info">
                        <div class="entry-top"><span>${'⭐'.repeat(r.rating)} (${r.name} ${getRoleBadgeHtml(r.name)})</span><span>${r.timestamp}</span></div>
                        <div class="entry-msg">${r.text}</div>
                    </div>
                    ${r.name === myUsername || isStaff ? `<button class="delete-btn delete-review-btn" data-id="${r.id}"><i class="fa-solid fa-trash"></i></button>` : ``}
                </div>
            `).join("");

            document.querySelectorAll(".delete-review-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    await deleteDoc(doc(db, "website_reviews", btn.getAttribute("data-id")));
                    playUiSound('success');
                    showToast("Review deleted!");
                });
            });
        });
    }

    const modalClose = document.getElementById("modalClose");
    if (modalClose && modal) modalClose.addEventListener("click", () => { modal.classList.remove("active"); });
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });
});
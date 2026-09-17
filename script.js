import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, onSnapshot, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
let soundEnabled = true;

// --- FEATURE 4: Futuristic UI Sound Effects (Web Audio API Synthesizer) ---
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
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(660, now + 0.08);
            osc.frequency.setValueAtTime(880, now + 0.16);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
    // Optional Icon Setup
    const possibleIconNames = ["icon.png", "icon.jpg", "icon.jpeg", "icon.webp"];
    let detectedIconUrl = null;

    async function checkOptionalIcon() {
        for (const name of possibleIconNames) {
            try {
                const response = await fetch(name, { method: 'HEAD' });
                if (response.ok) { detectedIconUrl = name; break; }
            } catch (e) {}
        }
        if (detectedIconUrl) {
            document.getElementById("dynamicFavicon").href = detectedIconUrl;
            document.getElementById("loaderIconWrapper").innerHTML = `<img src="${detectedIconUrl}" alt="Icon">`;
            document.getElementById("badgeIconSlot").innerHTML = `<img src="${detectedIconUrl}" alt="Icon">`;
        }
    }
    checkOptionalIcon();

    // Cinematic Loader Sequence
    const loaderOverlay = document.getElementById("cinematicLoader");
    const loaderProgressFill = document.getElementById("loaderProgressFill");
    const loaderStatusText = document.getElementById("loaderStatusText");
    const loaderSubtitle = document.getElementById("loaderSubtitle");

    const loadingStages = [
        { text: "Loading websites from sites.js...", progress: 25 },
        { text: "Syncing Firestore stats & collections...", progress: 60 },
        { text: "Finalizing Rick_Dev experience...", progress: 100 }
    ];

    let currentStage = 0;
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += 4;
        if (progress <= 100) {
            loaderProgressFill.style.width = progress + "%";
            loaderStatusText.textContent = progress + "%";
            if (progress >= loadingStages[currentStage].progress && currentStage < loadingStages.length - 1) {
                currentStage++;
                loaderSubtitle.textContent = loadingStages[currentStage].text;
            }
        } else {
            clearInterval(loadInterval);
            setTimeout(() => { loaderOverlay.classList.add("hidden"); }, 500);
        }
    }, 30);

    const grid = document.getElementById("projectsGrid");
    const filterBar = document.getElementById("filterBar");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const statsCounter = document.getElementById("statsCounter");
    const footerStats = document.getElementById("footerStats");
    
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const surpriseBtn = document.getElementById("surpriseBtn");
    const exportBtn = document.getElementById("exportBtn");
    const audioToggleBtn = document.getElementById("audioToggleBtn");
    const audioIcon = document.getElementById("audioIcon");
    const favoritesFilterBtn = document.getElementById("favoritesFilterBtn");
    const favCountBadge = document.getElementById("favCountBadge");

    const spotlightBanner = document.getElementById("spotlightBanner");
    const spotlightTitle = document.getElementById("spotlightTitle");
    const spotlightDesc = document.getElementById("spotlightDesc");
    const spotlightLaunchBtn = document.getElementById("spotlightLaunchBtn");
    
    const modal = document.getElementById("projectModal");
    const modalClose = document.getElementById("modalClose");
    const modalTitle = document.getElementById("modalTitle");
    const modalCategory = document.getElementById("modalCategory");
    const modalDescription = document.getElementById("modalDescription");
    const modalTechStack = document.getElementById("modalTechStack");
    const modalExploreTime = document.getElementById("modalExploreTime");
    const modalVisitBtn = document.getElementById("modalVisitBtn");
    const modalCopyBtn = document.getElementById("modalCopyBtn");
    const modalBookmarkBtn = document.getElementById("modalBookmarkBtn");
    const bookmarkText = document.getElementById("bookmarkText");
    const modalLikeBtn = document.getElementById("modalLikeBtn");
    const modalDislikeBtn = document.getElementById("modalDislikeBtn");
    const likeCountSpan = document.getElementById("likeCount");
    const dislikeCountSpan = document.getElementById("dislikeCount");
    const liveStatusBadge = document.getElementById("liveStatusBadge");
    const modalVisitsCount = document.getElementById("modalVisitsCount");
    const modalLastUpdated = document.getElementById("modalLastUpdated");
    const modalVersionNotes = document.getElementById("modalVersionNotes");
    const modalTutorialList = document.getElementById("modalTutorialList");
    const qrcodeContainer = document.getElementById("qrcodeContainer");
    const qrAppUrlText = document.getElementById("qrAppUrlText");

    const modalTabBtns = document.querySelectorAll(".modal-tab-btn");
    const modalTabPanes = document.querySelectorAll(".modal-tab-pane");
    
    const mediaSlider = document.getElementById("mediaSlider");
    const sliderDots = document.getElementById("sliderDots");
    const prevSlideBtn = document.getElementById("prevSlide");
    const nextSlideBtn = document.getElementById("nextSlide");

    const feedbackModal = document.getElementById("feedbackModal");
    const openFeedbackBtn = document.getElementById("openFeedbackBtn");
    const feedbackClose = document.getElementById("feedbackClose");
    const feedbackForm = document.getElementById("feedbackForm");

    const voterIdentityModal = document.getElementById("voterIdentityModal");
    const voterIdentityClose = document.getElementById("voterIdentityClose");
    const voterIdentityForm = document.getElementById("voterIdentityForm");
    const voterNameInput = document.getElementById("voterNameInput");
    const voterModalTitle = document.getElementById("voterModalTitle");
    const dislikeSpecificFields = document.getElementById("dislikeSpecificFields");
    const dislikeReasonSelect = document.getElementById("dislikeReasonSelect");
    const dislikeReasonText = document.getElementById("dislikeReasonText");

    const adminModal = document.getElementById("adminModal");
    const adminClose = document.getElementById("adminClose");
    const adminLoginScreen = document.getElementById("adminLoginScreen");
    const adminHubScreen = document.getElementById("adminHubScreen");
    const adminAnalyticsScreen = document.getElementById("adminAnalyticsScreen");
    const adminVisitsScreen = document.getElementById("adminVisitsScreen");
    const adminLikesScreen = document.getElementById("adminLikesScreen");
    const adminFeedbackScreen = document.getElementById("adminFeedbackScreen");
    const adminDislikesScreen = document.getElementById("adminDislikesScreen");
    const adminWebsitesScreen = document.getElementById("adminWebsitesScreen");
    const adminPassInput = document.getElementById("adminPassInput");
    const adminLoginBtn = document.getElementById("adminLoginBtn");

    const gotoAnalyticsHub = document.getElementById("gotoAnalyticsHub");
    const gotoVisitsHub = document.getElementById("gotoVisitsHub");
    const gotoLikesHub = document.getElementById("gotoLikesHub");
    const gotoFeedbackHub = document.getElementById("gotoFeedbackHub");
    const gotoDislikesHub = document.getElementById("gotoDislikesHub");
    const gotoWebsitesHub = document.getElementById("gotoWebsitesHub");
    const backToHubFromAnalytics = document.getElementById("backToHubFromAnalytics");
    const backToHubFromVisits = document.getElementById("backToHubFromVisits");
    const backToHubFromLikes = document.getElementById("backToHubFromLikes");
    const backToHubFromFeedback = document.getElementById("backToHubFromFeedback");
    const backToHubFromDislikes = document.getElementById("backToHubFromDislikes");
    const backToHubFromWebsites = document.getElementById("backToHubFromWebsites");

    const adminAnalyticsList = document.getElementById("adminAnalyticsList");
    const adminVisitsList = document.getElementById("adminVisitsList");
    const adminLikesList = document.getElementById("adminLikesList");
    const adminEntriesList = document.getElementById("adminEntriesList");
    const adminDislikesList = document.getElementById("adminDislikesList");
    const adminWebsitesList = document.getElementById("adminWebsitesList");

    let currentSlideIndex = 0;
    let currentProjectMedia = [];
    let slideInterval = null;
    let activeCategory = "All";
    let searchQuery = "";
    let currentActiveProject = null;
    let showingFavoritesOnly = false;
    let allFeedbackEntries = [];
    let allDislikeEntries = [];
    let allLikeLogs = [];
    
    let pendingVoteAction = null;
    let pendingVoteProjectKey = null;

    // Audio Toggle (Feature 4)
    audioToggleBtn.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        audioIcon.className = soundEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
        audioToggleBtn.querySelector("span").textContent = soundEnabled ? "Sound: ON" : "Sound: OFF";
        playUiSound('click');
    });

    // Fetch Live Stats from Firestore
    const statsCol = collection(db, "project_stats");
    onSnapshot(statsCol, (snapshot) => {
        statsData = {};
        snapshot.forEach(docSnap => {
            statsData[docSnap.id] = docSnap.data();
        });
        mergeProjectsWithStats();
    });

    function mergeProjectsWithStats() {
        projects = defaultProjects.map((p, index) => {
            const key = `proj_${index}`;
            const remoteStats = statsData[key] || { likes: 0, dislikes: 0, visits: 0 };
            return {
                dbKey: key,
                ...p,
                likes: remoteStats.likes || 0,
                dislikes: remoteStats.dislikes || 0,
                visits: remoteStats.visits || 0
            };
        });
        updateFavoritesBadge();
        initApp();
    }

    function updateFavoritesBadge() {
        let count = 0;
        projects.forEach(p => {
            if (localStorage.getItem(`bookmarked_${p.dbKey}`) === "true") count++;
        });
        favCountBadge.textContent = count;
    }

    function initApp() {
        const categories = ["All", ...new Set(projects.map(p => p.category))];
        filterBar.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === activeCategory && !showingFavoritesOnly ? 'active' : ''}" data-category="${cat}">${cat}</button>
        `).join("");

        footerStats.textContent = `Total Applications: ${projects.length} | Active Categories: ${categories.length - 1}`;
        
        // Setup Featured Spotlight Hero (Feature 5)
        if (projects.length > 0) {
            const sortedByLikes = [...projects].sort((a,b) => (b.likes || 0) - (a.likes || 0));
            const spotlightProj = sortedByLikes[0];
            spotlightTitle.textContent = spotlightProj.name;
            spotlightDesc.textContent = spotlightProj.description;
            spotlightLaunchBtn.onclick = () => { playUiSound('click'); openModal(spotlightProj); };
        }

        renderProjects();
    }

    modalTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            playUiSound('click');
            modalTabBtns.forEach(b => b.classList.remove("active"));
            modalTabPanes.forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
        });
    });

    favoritesFilterBtn.addEventListener("click", () => {
        playUiSound('click');
        showingFavoritesOnly = !showingFavoritesOnly;
        favoritesFilterBtn.style.background = showingFavoritesOnly ? "var(--primary)" : "";
        favoritesFilterBtn.style.color = showingFavoritesOnly ? "white" : "";
        renderProjects();
    });

    if (!localStorage.getItem("hasVisitedBefore")) {
        setTimeout(() => {
            feedbackModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }, 1800);
        localStorage.setItem("hasVisitedBefore", "true");
    }

    openFeedbackBtn.addEventListener("click", () => { playUiSound('click'); feedbackModal.classList.add("active"); document.body.style.overflow = "hidden"; });
    feedbackClose.addEventListener("click", () => { feedbackModal.classList.remove("active"); document.body.style.overflow = "auto"; });

    feedbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const category = document.getElementById("feedbackCategory").value;
        const name = document.getElementById("feedbackName").value.trim() || "Anonymous";
        const message = document.getElementById("feedbackMessage").value.trim();

        try {
            await addDoc(collection(db, "feedback_submissions"), { category, name, message, timestamp: new Date().toLocaleString() });
            playUiSound('success');
            alert("Thank you! Your feedback or app idea was submitted successfully.");
            feedbackForm.reset();
            feedbackModal.classList.remove("active");
            document.body.style.overflow = "auto";
        } catch (err) { alert("Error: " + err.message); }
    });

    // --- ADMIN PANEL (Ctrl + Shift + Alt + F2) ---
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.altKey && e.key === "F2") {
            e.preventDefault();
            adminModal.classList.add("active");
            document.body.style.overflow = "hidden";
            adminLoginScreen.style.display = "flex";
            adminHubScreen.style.display = "none";
            adminAnalyticsScreen.style.display = "none";
            adminVisitsScreen.style.display = "none";
            adminLikesScreen.style.display = "none";
            adminFeedbackScreen.style.display = "none";
            adminDislikesScreen.style.display = "none";
            adminWebsitesScreen.style.display = "none";
            adminPassInput.value = "";
            adminPassInput.focus();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchInput.focus(); }
        if (e.key === "Escape") closeAllModals();
    });

    adminClose.addEventListener("click", () => { adminModal.classList.remove("active"); document.body.style.overflow = "auto"; });
    adminLoginBtn.addEventListener("click", verifyAdminCode);
    adminPassInput.addEventListener("keypress", (e) => { if (e.key === "Enter") verifyAdminCode(); });

    function verifyAdminCode() {
        if (adminPassInput.value.trim() === "2285") {
            playUiSound('success');
            adminLoginScreen.style.display = "none";
            adminHubScreen.style.display = "flex";
        } else { alert("Incorrect Rick_Dev Admin Passcode!"); adminPassInput.value = ""; }
    }

    gotoAnalyticsHub.addEventListener("click", () => { adminHubScreen.style.display = "none"; adminAnalyticsScreen.style.display = "flex"; loadAdminAnalytics(); });
    gotoVisitsHub.addEventListener("click", () => { adminHubScreen.style.display = "none"; adminVisitsScreen.style.display = "flex"; loadAdminVisits(); });
    gotoLikesHub.addEventListener("click", () => { adminHubScreen.style.display = "none"; adminLikesScreen.style.display = "flex"; loadAdminLikes(); });
    gotoFeedbackHub.addEventListener("click", () => { adminHubScreen.style.display = "none"; adminFeedbackScreen.style.display = "flex"; loadAdminFeedback(); });
    gotoDislikesHub.addEventListener("click", () => { adminHubScreen.style.display = "none"; adminDislikesScreen.style.display = "flex"; loadAdminDislikes(); });
    gotoWebsitesHub.addEventListener("click", () => { adminHubScreen.style.display = "none"; adminWebsitesScreen.style.display = "flex"; loadAdminWebsites(); });

    backToHubFromAnalytics.addEventListener("click", () => { adminAnalyticsScreen.style.display = "none"; adminHubScreen.style.display = "flex"; });
    backToHubFromVisits.addEventListener("click", () => { adminVisitsScreen.style.display = "none"; adminHubScreen.style.display = "flex"; });
    backToHubFromLikes.addEventListener("click", () => { adminLikesScreen.style.display = "none"; adminHubScreen.style.display = "flex"; });
    backToHubFromFeedback.addEventListener("click", () => { adminFeedbackScreen.style.display = "none"; adminHubScreen.style.display = "flex"; });
    backToHubFromDislikes.addEventListener("click", () => { adminDislikesScreen.style.display = "none"; adminHubScreen.style.display = "flex"; });
    backToHubFromWebsites.addEventListener("click", () => { adminWebsitesScreen.style.display = "none"; adminHubScreen.style.display = "flex"; });

    // Analytics Visualizer (Feature 6)
    function loadAdminAnalytics() {
        const totalVisits = projects.reduce((acc, p) => acc + (p.visits || 0), 0) || 1;
        const totalLikes = projects.reduce((acc, p) => acc + (p.likes || 0), 0) || 1;

        adminAnalyticsList.innerHTML = projects.map(proj => {
            const visitPct = Math.round(((proj.visits || 0) / totalVisits) * 100);
            const likePct = Math.round(((proj.likes || 0) / totalLikes) * 100);
            return `
                <div class="admin-entry-card" style="flex-direction:column; gap:8px;">
                    <div style="display:flex; justify-content:space-between; width:100%; font-weight:700;">
                        <span>${proj.name}</span>
                        <span style="color:var(--cyan); font-size:0.85rem;">${proj.visits || 0} Visits (${visitPct}%) | ❤️ ${proj.likes || 0} Likes (${likePct}%)</span>
                    </div>
                    <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden;">
                        <div style="height:100%; width:${visitPct}%; background:linear-gradient(135deg, var(--primary), var(--accent));"></div>
                    </div>
                </div>
            `;
        }).join("");
    }

    function loadAdminVisits() {
        adminVisitsList.innerHTML = projects.map(proj => `
            <div class="admin-entry-card">
                <div class="entry-info">
                    <div class="entry-top"><span class="entry-cat" style="background:rgba(56,189,248,0.2); color:#38bdf8;">📊 Traffic</span><span class="entry-date">${proj.visits || 0} Visits</span></div>
                    <div class="entry-user" style="font-size:1.15rem;">${proj.name}</div>
                    <div class="entry-msg"><a href="${proj.url}" target="_blank" style="color:var(--cyan);">${proj.url}</a></div>
                </div>
            </div>
        `).join("");
    }

    function loadAdminLikes() {
        onSnapshot(collection(db, "like_logs"), (snapshot) => {
            allLikeLogs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            if (allLikeLogs.length === 0) { adminLikesList.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px;">No like records found yet.</div>`; return; }
            adminLikesList.innerHTML = allLikeLogs.reverse().map(log => `
                <div class="admin-entry-card">
                    <div class="entry-info">
                        <div class="entry-top"><span class="entry-cat" style="background:rgba(244,63,94,0.2); color:#f43f5e;">❤️ Liked</span><span class="entry-date">${log.timestamp || 'Recent'}</span></div>
                        <div class="entry-user">User: <strong>${log.userName}</strong></div>
                        <div class="entry-msg">Project: <strong>${log.projectName}</strong></div>
                    </div>
                    <button class="delete-btn" data-like-log-id="${log.id}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `).join("");

            document.querySelectorAll(".delete-btn[data-like-log-id]").forEach(btn => {
                btn.addEventListener("click", async () => {
                    await deleteDoc(doc(db, "like_logs", btn.getAttribute("data-like-log-id")));
                    loadAdminLikes();
                });
            });
        });
    }

    function loadAdminFeedback() {
        onSnapshot(collection(db, "feedback_submissions"), (snapshot) => {
            allFeedbackEntries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            renderAdminFeedbackEntries("All");
        });
    }

    function renderAdminFeedbackEntries(filterCat) {
        const filtered = filterCat === "All" ? allFeedbackEntries : allFeedbackEntries.filter(e => e.category === filterCat);
        if (filtered.length === 0) { adminEntriesList.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px;">No feedback entries found.</div>`; return; }
        adminEntriesList.innerHTML = filtered.reverse().map(entry => `
            <div class="admin-entry-card">
                <div class="entry-info">
                    <div class="entry-top"><span class="entry-cat">${entry.category}</span><span class="entry-date">${entry.timestamp || 'Recent'}</span></div>
                    <div class="entry-user"><i class="fa-solid fa-user-circle"></i> ${entry.name}</div>
                    <div class="entry-msg">${entry.message}</div>
                </div>
                <button class="delete-btn" data-feedback-id="${entry.id}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `).join("");

        document.querySelectorAll(".delete-btn[data-feedback-id]").forEach(btn => {
            btn.addEventListener("click", async () => {
                await deleteDoc(doc(db, "feedback_submissions", btn.getAttribute("data-feedback-id")));
                loadAdminFeedback();
            });
        });
    }

    document.querySelectorAll(".admin-filter-tabs .filter-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".admin-filter-tabs .filter-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            renderAdminFeedbackEntries(e.target.getAttribute("data-admin-filter"));
        });
    });

    function loadAdminDislikes() {
        onSnapshot(collection(db, "dislike_logs"), (snapshot) => {
            allDislikeEntries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            if (allDislikeEntries.length === 0) { adminDislikesList.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px;">No dislike reports logged.</div>`; return; }
            adminDislikesList.innerHTML = allDislikeEntries.reverse().map(entry => `
                <div class="admin-entry-card">
                    <div class="entry-info">
                        <div class="entry-top"><span class="entry-cat" style="background:rgba(239,68,68,0.2); color:#ef4444;">👎 Dislike</span><span class="entry-date">${entry.timestamp || 'Recent'}</span></div>
                        <div class="entry-user">User: <strong>${entry.userName || 'Anonymous'}</strong> | Project: <strong>${entry.projectName || 'Unknown'}</strong></div>
                        <div class="entry-msg"><strong>Reason:</strong> ${entry.reason}</div>
                    </div>
                    <button class="delete-btn" data-dislike-id="${entry.id}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `).join("");

            document.querySelectorAll(".delete-btn[data-dislike-id]").forEach(btn => {
                btn.addEventListener("click", async () => {
                    await deleteDoc(doc(db, "dislike_logs", btn.getAttribute("data-dislike-id")));
                    loadAdminDislikes();
                });
            });
        });
    }

    function loadAdminWebsites() {
        adminWebsitesList.innerHTML = projects.map(proj => `
            <div class="admin-entry-card" style="flex-direction:column; gap:10px;">
                <div class="entry-info" style="width:100%;">
                    <div class="entry-top"><span class="entry-cat">${proj.category}</span><span class="entry-date">📊 ${proj.visits || 0} visits</span></div>
                    <div class="entry-user" style="font-size:1.1rem; margin-top:4px;">${proj.name}</div>
                    <div class="entry-msg" style="margin-bottom:6px;"><a href="${proj.url}" target="_blank" style="color:var(--cyan);">${proj.url}</a></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; border-top:1px solid var(--card-border); padding-top:10px; gap:10px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Edit Likes:</label>
                        <input type="number" class="cms-input direct-likes-input" data-project-key="${proj.dbKey}" value="${proj.likes || 0}" style="width:80px; padding:6px 10px; margin:0;">
                    </div>
                </div>
            </div>
        `).join("");

        document.querySelectorAll(".direct-likes-input").forEach(input => {
            input.addEventListener("change", async (e) => {
                const key = input.getAttribute("data-project-key");
                const newLikesVal = parseInt(input.value) || 0;
                await setDoc(doc(db, "project_stats", key), { likes: newLikesVal }, { merge: true });
                const target = projects.find(p => p.dbKey === key);
                if (target) target.likes = newLikesVal;
                renderProjects();
            });
        });
    }

    // Reset All Stats Master Button
    document.getElementById("resetAllLikesBtn").addEventListener("click", async () => {
        if (confirm("Are you sure you want to reset ALL likes, dislikes, and visit metrics to 0?")) {
            for (const proj of projects) {
                await setDoc(doc(db, "project_stats", proj.dbKey), { likes: 0, dislikes: 0, visits: 0 });
                localStorage.removeItem(`liked_${proj.dbKey}`);
                localStorage.removeItem(`disliked_${proj.dbKey}`);
            }
            alert("All metrics successfully reset to 0!");
            loadAdminWebsites();
        }
    });

    themeToggle.addEventListener("click", () => {
        playUiSound('click');
        document.body.classList.toggle("light-mode");
        document.body.classList.toggle("dark-mode");
        themeIcon.className = document.body.classList.contains("light-mode") ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });

    filterBar.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-btn")) {
            playUiSound('click');
            document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.getAttribute("data-category");
            showingFavoritesOnly = false;
            favoritesFilterBtn.style.background = "";
            favoritesFilterBtn.style.color = "";
            renderProjects();
        }
    });

    searchInput.addEventListener("input", (e) => { searchQuery = e.target.value.toLowerCase().trim(); renderProjects(); });
    sortSelect.addEventListener("change", renderProjects);

    surpriseBtn.addEventListener("click", () => {
        playUiSound('click');
        if (projects.length === 0) return;
        openModal(projects[Math.floor(Math.random() * projects.length)]);
    });

    exportBtn.addEventListener("click", () => {
        playUiSound('click');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "rick_dev_portfolio_projects.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    function renderProjects() {
        let filtered = projects.filter(p => {
            const matchesFav = !showingFavoritesOnly || localStorage.getItem(`bookmarked_${p.dbKey}`) === "true";
            const matchesCat = activeCategory === "All" || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery) || (p.tech && p.tech.some(t => t.toLowerCase().includes(searchQuery)));
            return matchesFav && matchesCat && matchesSearch;
        });

        const sortVal = sortSelect.value;
        if (sortVal === "likes" || sortVal === "default") {
            filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        } else if (sortVal === "az") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortVal === "za") {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        }

        statsCounter.textContent = `Showing ${filtered.length} of ${projects.length} luxury applications`;

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">No matching applications found.</div>`;
            return;
        }

        grid.innerHTML = filtered.map((project) => {
            let previewEl = '';
            if (project.media && project.media.length > 0) {
                const firstMedia = project.media[0];
                if (firstMedia.type === "video") {
                    previewEl = `<video src="${firstMedia.src}" class="card-media-preview" muted autoplay loop playsinline></video>`;
                } else {
                    previewEl = `<img src="${firstMedia.src}" alt="${project.name}" class="card-media-preview" loading="lazy">`;
                }
            } else {
                const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(project.url)}&screenshot=true&meta=false&embed=screenshot.url`;
                previewEl = `<img src="${screenshotUrl}" alt="${project.name}" class="card-media-preview" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'">`;
            }

            const techPillsHtml = project.tech ? project.tech.map(t => `<span class="tech-pill">${t}</span>`).join("") : "";
            const hasLiked = localStorage.getItem(`liked_${project.dbKey}`) === "true";
            const hasDisliked = localStorage.getItem(`disliked_${project.dbKey}`) === "true";
            const isBookmarked = localStorage.getItem(`bookmarked_${project.dbKey}`) === "true";

            return `
                <div class="project-card">
                    <button class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-bookmark-key="${project.dbKey}" title="Save to Favorites">
                        <i class="fa-solid fa-bookmark"></i>
                    </button>
                    <div class="card-media-wrapper">${previewEl}</div>
                    <div class="card-content card-click-trigger" data-index="${projects.indexOf(project)}" style="cursor: pointer;">
                        <div class="card-top-row">
                            <span class="card-tag">${project.category}</span>
                            <div class="card-tech-pills">${techPillsHtml}</div>
                        </div>
                        <h3 class="card-title">${project.name}</h3>
                        <p class="card-desc">${project.description}</p>
                        
                        <div class="card-bottom-row">
                            <button class="card-like-btn ${hasLiked ? 'liked' : ''}" data-project-key="${project.dbKey}">
                                <i class="fa-solid fa-heart"></i> <span class="card-like-count">${project.likes || 0}</span>
                            </button>
                            <button class="card-dislike-btn ${hasDisliked ? 'disliked' : ''}" data-project-key="${project.dbKey}">
                                <i class="fa-solid fa-thumbs-down"></i> <span class="card-dislike-count">${project.dislikes || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // Bookmark Toggle on Card (Feature 3)
        document.querySelectorAll(".card-bookmark-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                playUiSound('click');
                const dbKey = btn.getAttribute("data-bookmark-key");
                const currentStatus = localStorage.getItem(`bookmarked_${dbKey}`) === "true";
                if (currentStatus) {
                    localStorage.removeItem(`bookmarked_${dbKey}`);
                    btn.classList.remove("bookmarked");
                } else {
                    localStorage.setItem(`bookmarked_${dbKey}`, "true");
                    btn.classList.add("bookmarked");
                }
                updateFavoritesBadge();
                if (showingFavoritesOnly) renderProjects();
            });
        });

        document.querySelectorAll(".card-click-trigger").forEach(el => {
            el.addEventListener("click", () => { openModal(projects[el.getAttribute("data-index")]); });
        });

        // Like Click
        document.querySelectorAll(".card-like-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const dbKey = btn.getAttribute("data-project-key");
                const targetProj = projects.find(p => p.dbKey === dbKey);
                const isLiked = localStorage.getItem(`liked_${dbKey}`) === "true";

                if (isLiked) {
                    playUiSound('click');
                    targetProj.likes = Math.max(0, (targetProj.likes || 1) - 1);
                    localStorage.removeItem(`liked_${dbKey}`);
                    btn.classList.remove("liked");
                    setDoc(doc(db, "project_stats", dbKey), { likes: targetProj.likes }, { merge: true });
                    btn.querySelector(".card-like-count").textContent = targetProj.likes;
                    renderProjects();
                } else {
                    const savedUserName = localStorage.getItem("rick_dev_voter_name");
                    if (savedUserName) {
                        executeLikeVote(dbKey, targetProj, savedUserName);
                    } else {
                        pendingVoteAction = 'like';
                        pendingVoteProjectKey = dbKey;
                        voterModalTitle.textContent = `Who's Liking "${targetProj.name}"?`;
                        dislikeSpecificFields.style.display = "none";
                        voterIdentityModal.classList.add("active");
                        voterNameInput.focus();
                    }
                }
            });
        });

        // Dislike Click
        document.querySelectorAll(".card-dislike-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const dbKey = btn.getAttribute("data-project-key");
                const targetProj = projects.find(p => p.dbKey === dbKey);
                const isDisliked = localStorage.getItem(`disliked_${dbKey}`) === "true";

                if (isDisliked) {
                    playUiSound('click');
                    targetProj.dislikes = Math.max(0, (targetProj.dislikes || 1) - 1);
                    localStorage.removeItem(`disliked_${dbKey}`);
                    btn.classList.remove("disliked");
                    setDoc(doc(db, "project_stats", dbKey), { dislikes: targetProj.dislikes }, { merge: true });
                    btn.querySelector(".card-dislike-count").textContent = targetProj.dislikes;
                    renderProjects();
                } else {
                    const savedUserName = localStorage.getItem("rick_dev_voter_name");
                    if (savedUserName) {
                        executeDislikeVote(dbKey, targetProj, savedUserName, "Bug / Error", "");
                    } else {
                        pendingVoteAction = 'dislike';
                        pendingVoteProjectKey = dbKey;
                        voterModalTitle.textContent = `Feedback on "${targetProj.name}"?`;
                        dislikeSpecificFields.style.display = "block";
                        voterIdentityModal.classList.add("active");
                        voterNameInput.focus();
                    }
                }
            });
        });
    }

    async function executeLikeVote(dbKey, targetProj, userName) {
        playUiSound('success');
        targetProj.likes = (targetProj.likes || 0) + 1;
        localStorage.setItem(`liked_${dbKey}`, "true");
        await setDoc(doc(db, "project_stats", dbKey), { likes: targetProj.likes }, { merge: true });

        await addDoc(collection(db, "like_logs"), {
            projectKey: dbKey, projectName: targetProj.name, userName, timestamp: new Date().toLocaleString()
        });

        if (localStorage.getItem(`disliked_${dbKey}`) === "true") {
            targetProj.dislikes = Math.max(0, (targetProj.dislikes || 1) - 1);
            localStorage.removeItem(`disliked_${dbKey}`);
            await setDoc(doc(db, "project_stats", dbKey), { dislikes: targetProj.dislikes }, { merge: true });
        }
        renderProjects();
        if (modal.classList.contains("active")) openModal(targetProj);
    }

    async function executeDislikeVote(dbKey, targetProj, userName, reason, details) {
        playUiSound('click');
        targetProj.dislikes = (targetProj.dislikes || 0) + 1;
        localStorage.setItem(`disliked_${dbKey}`, "true");
        await setDoc(doc(db, "project_stats", dbKey), { dislikes: targetProj.dislikes }, { merge: true });

        await addDoc(collection(db, "dislike_logs"), {
            projectKey: dbKey, projectName: targetProj.name, userName, reason, details, timestamp: new Date().toLocaleString()
        });

        if (localStorage.getItem(`liked_${dbKey}`) === "true") {
            targetProj.likes = Math.max(0, (targetProj.likes || 1) - 1);
            localStorage.removeItem(`liked_${dbKey}`);
            await setDoc(doc(db, "project_stats", dbKey), { likes: targetProj.likes }, { merge: true });
        }
        renderProjects();
        if (modal.classList.contains("active")) openModal(targetProj);
    }

    voterIdentityForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!pendingVoteProjectKey || !pendingVoteAction) return;

        const dbKey = pendingVoteProjectKey;
        const targetProj = projects.find(p => p.dbKey === dbKey);
        const userName = voterNameInput.value.trim() || "Anonymous";

        localStorage.setItem("rick_dev_voter_name", userName);

        if (pendingVoteAction === 'like') {
            executeLikeVote(dbKey, targetProj, userName);
        } else if (pendingVoteAction === 'dislike') {
            const reason = dislikeReasonSelect.value;
            const details = dislikeReasonText.value.trim();
            executeDislikeVote(dbKey, targetProj, userName, reason, details);
        }

        voterIdentityForm.reset();
        voterIdentityModal.classList.remove("active");
        pendingVoteProjectKey = null;
        pendingVoteAction = null;
    });

    voterIdentityClose.addEventListener("click", () => {
        voterIdentityModal.classList.remove("active");
        pendingVoteProjectKey = null;
        pendingVoteAction = null;
    });

    function openModal(project) {
        playUiSound('click');
        currentActiveProject = project;
        modalTitle.textContent = project.name;
        modalCategory.textContent = project.category;
        modalDescription.textContent = project.description;
        modalVisitBtn.href = project.url;
        modalExploreTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${project.exploreTime || 'Est. 2 min explore'}`;
        likeCountSpan.textContent = project.likes || 0;
        dislikeCountSpan.textContent = project.dislikes || 0;
        modalVisitsCount.textContent = project.visits || 0;
        modalLastUpdated.textContent = `Last Updated: ${project.lastUpdated || 'September 17, 2026'} (${project.version || 'v1.0.0'})`;
        modalVersionNotes.textContent = `Active production build stable. All real-time modules operating at peak efficiency.`;

        // Render QR Code (Feature 1)
        qrcodeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(project.url)}" alt="App QR Code" style="display:block; border-radius:8px;">`;
        qrAppUrlText.textContent = project.url;

        // Bookmark Modal Button State
        const isBookmarked = localStorage.getItem(`bookmarked_${project.dbKey}`) === "true";
        bookmarkText.textContent = isBookmarked ? "Saved" : "Save";
        modalBookmarkBtn.style.background = isBookmarked ? "var(--accent)" : "";

        // Render multiple tutorial steps
        if (project.tutorial && Array.isArray(project.tutorial)) {
            modalTutorialList.innerHTML = project.tutorial.map((step, idx) => `
                <div class="tutorial-step">
                    <span class="step-num">${idx + 1}</span>
                    <p>${step}</p>
                </div>
            `).join("");
        } else {
            modalTutorialList.innerHTML = `<div class="tutorial-step"><span class="step-num">1</span><p>Launch application and enjoy the interactive platform.</p></div>`;
        }

        if (project.dbKey) {
            const newVisits = (project.visits || 0) + 1;
            setDoc(doc(db, "project_stats", project.dbKey), { visits: newVisits }, { merge: true });
        }

        const hasLiked = localStorage.getItem(`liked_${project.dbKey}`) === "true";
        const hasDisliked = localStorage.getItem(`disliked_${project.dbKey}`) === "true";
        
        if (hasLiked) modalLikeBtn.classList.add("liked"); else modalLikeBtn.classList.remove("liked");
        if (hasDisliked) modalDislikeBtn.classList.add("disliked"); else modalDislikeBtn.classList.remove("disliked");

        modalTechStack.innerHTML = project.tech ? project.tech.map(t => `<span class="modal-tech-pill">${t}</span>`).join("") : "";
        liveStatusBadge.innerHTML = `<span class="pulse-dot"></span> Online & Active`;

        if (project.media && project.media.length > 0) {
            currentProjectMedia = project.media;
        } else {
            const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(project.url)}&screenshot=true&meta=false&embed=screenshot.url`;
            currentProjectMedia = [{ type: "image", src: screenshotUrl }];
        }

        currentSlideIndex = 0;
        updateSlider();
        startAutoSlide();
        
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    modalBookmarkBtn.addEventListener("click", () => {
        if (!currentActiveProject) return;
        playUiSound('click');
        const dbKey = currentActiveProject.dbKey;
        const currentStatus = localStorage.getItem(`bookmarked_${dbKey}`) === "true";
        if (currentStatus) {
            localStorage.removeItem(`bookmarked_${dbKey}`);
            bookmarkText.textContent = "Save";
            modalBookmarkBtn.style.background = "";
        } else {
            localStorage.setItem(`bookmarked_${dbKey}`, "true");
            bookmarkText.textContent = "Saved";
            modalBookmarkBtn.style.background = "var(--accent)";
        }
        updateFavoritesBadge();
        renderProjects();
    });

    function closeAllModals() {
        playUiSound('click');
        modal.classList.remove("active");
        feedbackModal.classList.remove("active");
        adminModal.classList.remove("active");
        voterIdentityModal.classList.remove("active");
        document.body.style.overflow = "auto";
        stopAutoSlide();
    }

    modalClose.addEventListener("click", closeAllModals);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeAllModals(); });

    modalCopyBtn.addEventListener("click", () => {
        playUiSound('success');
        navigator.clipboard.writeText(modalVisitBtn.href);
        const originalText = modalCopyBtn.innerHTML;
        modalCopyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => { modalCopyBtn.innerHTML = originalText; }, 2000);
    });

    modalLikeBtn.addEventListener("click", () => {
        if (currentActiveProject && currentActiveProject.dbKey) {
            const dbKey = currentActiveProject.dbKey;
            const isLiked = localStorage.getItem(`liked_${dbKey}`) === "true";

            if (isLiked) {
                playUiSound('click');
                currentActiveProject.likes = Math.max(0, (currentActiveProject.likes || 1) - 1);
                localStorage.removeItem(`liked_${dbKey}`);
                modalLikeBtn.classList.remove("liked");
                likeCountSpan.textContent = currentActiveProject.likes;
                setDoc(doc(db, "project_stats", dbKey), { likes: currentActiveProject.likes }, { merge: true });
                renderProjects();
            } else {
                const savedUserName = localStorage.getItem("rick_dev_voter_name");
                if (savedUserName) {
                    executeLikeVote(dbKey, currentActiveProject, savedUserName);
                    likeCountSpan.textContent = currentActiveProject.likes;
                } else {
                    pendingVoteAction = 'like';
                    pendingVoteProjectKey = dbKey;
                    voterModalTitle.textContent = `Who's Liking "${currentActiveProject.name}"?`;
                    dislikeSpecificFields.style.display = "none";
                    voterIdentityModal.classList.add("active");
                    voterNameInput.focus();
                }
            }
        }
    });

    modalDislikeBtn.addEventListener("click", () => {
        if (currentActiveProject && currentActiveProject.dbKey) {
            const dbKey = currentActiveProject.dbKey;
            const isDisliked = localStorage.getItem(`disliked_${dbKey}`) === "true";

            if (isDisliked) {
                playUiSound('click');
                currentActiveProject.dislikes = Math.max(0, (currentActiveProject.dislikes || 1) - 1);
                localStorage.removeItem(`disliked_${dbKey}`);
                modalDislikeBtn.classList.remove("disliked");
                dislikeCountSpan.textContent = currentActiveProject.dislikes;
                setDoc(doc(db, "project_stats", dbKey), { dislikes: currentActiveProject.dislikes }, { merge: true });
                renderProjects();
            } else {
                const savedUserName = localStorage.getItem("rick_dev_voter_name");
                if (savedUserName) {
                    executeDislikeVote(dbKey, currentActiveProject, savedUserName, "Bug / Error", "");
                    dislikeCountSpan.textContent = currentActiveProject.dislikes;
                } else {
                    pendingVoteAction = 'dislike';
                    pendingVoteProjectKey = dbKey;
                    voterModalTitle.textContent = `Feedback on "${currentActiveProject.name}"?`;
                    dislikeSpecificFields.style.display = "block";
                    voterIdentityModal.classList.add("active");
                    voterNameInput.focus();
                }
            }
        }
    });

    function updateSlider() {
        mediaSlider.innerHTML = currentProjectMedia.map((media, i) => {
            const isActive = i === currentSlideIndex ? "active" : "";
            if (media.type === "video") {
                return `<div class="slide-item ${isActive}"><video src="${media.src}" autoplay loop muted playsinline></video></div>`;
            } else {
                return `<div class="slide-item ${isActive}"><img src="${media.src}" alt="Project preview"></div>`;
            }
        }).join("");

        sliderDots.innerHTML = currentProjectMedia.map((_, i) => `
            <span class="dot ${i === currentSlideIndex ? 'active' : ''}" data-slide="${i}"></span>
        `).join("");

        document.querySelectorAll(".dot").forEach(dot => {
            dot.addEventListener("click", () => {
                playUiSound('click');
                currentSlideIndex = parseInt(dot.getAttribute("data-slide"));
                updateSlider();
                resetAutoSlide();
            });
        });
    }

    function nextSlide() { currentSlideIndex = (currentSlideIndex + 1) % currentProjectMedia.length; updateSlider(); }
    function prevSlide() { currentSlideIndex = (currentSlideIndex - 1 + currentProjectMedia.length) % currentProjectMedia.length; updateSlider(); }

    nextSlideBtn.addEventListener("click", () => { playUiSound('click'); nextSlide(); resetAutoSlide(); });
    prevSlideBtn.addEventListener("click", () => { playUiSound('click'); prevSlide(); resetAutoSlide(); });

    function startAutoSlide() { if (currentProjectMedia.length > 1) slideInterval = setInterval(nextSlide, 4500); }
    function stopAutoSlide() { clearInterval(slideInterval); }
    function resetAutoSlide() { stopAutoSlide(); startAutoSlide(); }
});
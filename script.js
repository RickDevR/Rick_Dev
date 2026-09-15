import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue, remove, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAIRH-6mmznVMfGIegHF7ckQXq30MFDDBw",
    authDomain: "hockey-840dd.firebaseapp.com",
    databaseURL: "https://hockey-840dd-default-rtdb.firebaseio.com",
    projectId: "hockey-840dd",
    storageBucket: "hockey-840dd.firebasestorage.app",
    messagingSenderId: "454222626197",
    appId: "1:454222626197:web:6df5eea83d3bbae0df0a9c",
    measurementId: "G-BBNC63SFHZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const defaultProjects = [
    {
        name: "Pos System",
        url: "https://rickdevr.github.io/Pos/",
        category: "Entertainment",
        description: "An immersive audio streaming and podcast platform crafted by Rick_Dev, designed to deliver high fidelity audio episodes, seamless stream caching, and a pristine user interface for content enthusiasts seeking state-of-the-art web audio playback.",
        tech: ["HTML", "CSS", "JS", "Audio API"],
        exploreTime: "Est. 3 min explore",
        lastUpdated: "September 14, 2026",
        version: "v2.5.0",
        tutorial: "1. Click Launch Application to open the podcast console.\n2. Select your preferred episode from the active playlist.\n3. Adjust volume and enjoy lossless audio streaming.",
        visits: 0,
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Task challenge",
        url: "https://rickdevr.github.io/Task/",
        category: "Games",
        description: "A fast-paced interactive mini-challenge game engineered by Rick_Dev. Test your reflexes and cognitive speed against tight time limits with dynamic scoring, streak counters, and celebratory visual fireworks.",
        tech: ["HTML", "Tailwind", "JS"],
        exploreTime: "Est. 2 min explore",
        lastUpdated: "September 12, 2026",
        version: "v1.8.2",
        tutorial: "1. Click Launch Application to start the game challenge.\n2. Complete tasks before the timer countdown reaches zero.\n3. Rack up points to claim top leaderboard ranking.",
        visits: 0,
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Secret coding language decode and Ecode",
        url: "https://rickdevr.github.io/Secretcoder/",
        category: "Tools",
        description: "A high-security cipher encryption and decryption utility built by Rick_Dev. Transform plain text into secure customized hidden cryptographic messages effortlessly with instantaneous real-time translation algorithms.",
        tech: ["JavaScript", "Crypto"],
        exploreTime: "Est. 1 min explore",
        lastUpdated: "September 10, 2026",
        version: "v3.1.0",
        tutorial: "1. Enter your plain text into the encoder box.\n2. Select your encryption key parameters.\n3. Copy the secure encoded output instantly.",
        visits: 0,
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Test your friends trust level",
        url: "https://rickdevr.github.io/Test-trust-level/",
        category: "Projects",
        description: "An entertaining compatibility and trust diagnostic web application by Rick_Dev. Evaluate relationship dynamics, calculate bond metrics, and enjoy playful interactive quizzes with friends across shared sessions.",
        tech: ["HTML", "CSS", "JS"],
        exploreTime: "Est. 2 min explore",
        lastUpdated: "September 15, 2026",
        version: "v2.0.1",
        tutorial: "1. Launch the trust diagnostic quiz.\n2. Answer the interactive relationship scenarios.\n3. Review your final calculated bond percentage.",
        visits: 0,
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Satisfying squishy sound",
        url: "https://rickdevr.github.io/squishy/",
        category: "Projects",
        description: "A relaxing tactile and auditory sensory toy crafted by Rick_Dev. Experience satisfying physics deformations and soothing sound design optimized for stress relief and mindful digital relaxation.",
        tech: ["HTML", "Canvas", "Audio"],
        exploreTime: "Est. 1 min explore",
        lastUpdated: "September 08, 2026",
        version: "v1.1.0",
        tutorial: "1. Click Launch Application.\n2. Tap or drag across the screen to deform the squishy physics object.\n3. Enjoy relaxing tactile sound feedback.",
        visits: 0,
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Duck clicker",
        url: "https://rickdevr.github.io/Duck-clicker/",
        category: "Games",
        description: "An addictive progression clicker game designed by Rick_Dev. Accumulate virtual ducks, unlock powerful automated multipliers, and achieve ultimate supremacy on the live database leaderboard.",
        tech: ["HTML", "JS", "LocalStorage"],
        exploreTime: "Est. 4 min explore",
        lastUpdated: "September 14, 2026",
        version: "v4.0.0",
        tutorial: "1. Click the giant virtual duck to earn currency.\n2. Purchase automated farm upgrades in the shop menu.\n3. Check your standing on the database leaderboard.",
        visits: 0,
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "If you wanna learn how to type on keyboard Faster and without looking then this website's for you",
        url: "https://rickdevr.github.io/Learn-keyboard-typing/",
        category: "Tools",
        description: "A professional touch-typing mastery academy developed by Rick_Dev. Build muscle memory, eliminate keyboard glancing, and accelerate words-per-minute speed through guided finger drills and live accuracy metrics.",
        tech: ["HTML", "CSS", "DOM Events"],
        exploreTime: "Est. 3 min explore",
        lastUpdated: "September 11, 2026",
        version: "v2.2.0",
        tutorial: "1. Open the touch-typing academy.\n2. Follow the on-screen finger positioning guides.\n3. Complete daily practice drills to increase WPM speed.",
        visits: 0,
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "DJ Bored",
        url: "https://rickdevr.github.io/DJ-board-today-s-Tuesday/",
        category: "Tools",
        description: "A virtual audio mixing studio and DJ console engineered by Rick_Dev. Mix tracks, trigger custom sound effects, and experiment with real-time digital signal processing loops and professional frequency controls.",
        tech: ["HTML", "JS", "Audio"],
        exploreTime: "Est. 4 min explore",
        lastUpdated: "September 15, 2026",
        version: "v3.5.0",
        tutorial: "1. Launch the DJ studio console.\n2. Trigger sample pads and adjust loop filters in real time.\n3. Mix your custom sound effects seamlessly.",
        visits: 0,
        likes: 0,
        dislikes: 0,
        media: []
    }
];

let projects = [];

document.addEventListener("DOMContentLoaded", () => {
    // --- OPTIONAL ICON & CINEMATIC LOADER ---
    const possibleIconNames = ["icon.png", "icon.jpg", "icon.jpeg", "icon.webp"];
    let detectedIconUrl = null;

    async function checkOptionalIcon() {
        for (const name of possibleIconNames) {
            try {
                const response = await fetch(name, { method: 'HEAD' });
                if (response.ok) {
                    detectedIconUrl = name;
                    break;
                }
            } catch (e) {}
        }

        if (detectedIconUrl) {
            document.getElementById("dynamicFavicon").href = detectedIconUrl;
            
            const iconWrapper = document.getElementById("loaderIconWrapper");
            iconWrapper.innerHTML = `<img src="${detectedIconUrl}" alt="Rick_Dev Icon">`;

            const badgeSlot = document.getElementById("badgeIconSlot");
            badgeSlot.innerHTML = `<img src="${detectedIconUrl}" alt="Icon">`;
        }
    }
    checkOptionalIcon();

    // Cinematic Loader Sequence
    const loaderOverlay = document.getElementById("cinematicLoader");
    const loaderProgressFill = document.getElementById("loaderProgressFill");
    const loaderStatusText = document.getElementById("loaderStatusText");
    const loaderSubtitle = document.getElementById("loaderSubtitle");

    const loadingStages = [
        { text: "Establishing secure connection to Rick_Dev vault...", progress: 20 },
        { text: "Fetching website static optical previews & metrics...", progress: 45 },
        { text: "Syncing Firebase database clusters & visit logs...", progress: 75 },
        { text: "Finalizing Rick_Dev cinematic portfolio...", progress: 100 }
    ];

    let currentStage = 0;
    let progress = 0;

    const loadInterval = setInterval(() => {
        progress += 2;
        if (progress <= 100) {
            loaderProgressFill.style.width = progress + "%";
            loaderStatusText.textContent = progress + "%";

            if (progress >= loadingStages[currentStage].progress && currentStage < loadingStages.length - 1) {
                currentStage++;
                loaderSubtitle.textContent = loadingStages[currentStage].text;
            }
        } else {
            clearInterval(loadInterval);
            setTimeout(() => {
                loaderOverlay.classList.add("hidden");
            }, 700);
        }
    }, 40);

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
    
    const modal = document.getElementById("projectModal");
    const modalClose = document.getElementById("modalClose");
    const modalTitle = document.getElementById("modalTitle");
    const modalCategory = document.getElementById("modalCategory");
    const modalDescription = document.getElementById("modalDescription");
    const modalTechStack = document.getElementById("modalTechStack");
    const modalExploreTime = document.getElementById("modalExploreTime");
    const modalVisitBtn = document.getElementById("modalVisitBtn");
    const modalCopyBtn = document.getElementById("modalCopyBtn");
    const modalLikeBtn = document.getElementById("modalLikeBtn");
    const modalDislikeBtn = document.getElementById("modalDislikeBtn");
    const likeCountSpan = document.getElementById("likeCount");
    const dislikeCountSpan = document.getElementById("dislikeCount");
    const liveStatusBadge = document.getElementById("liveStatusBadge");
    const modalVisitsCount = document.getElementById("modalVisitsCount");
    const modalLastUpdated = document.getElementById("modalLastUpdated");
    const modalVersionNotes = document.getElementById("modalVersionNotes");
    const modalTutorialList = document.getElementById("modalTutorialList");

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
    const adminVisitsScreen = document.getElementById("adminVisitsScreen");
    const adminLikesScreen = document.getElementById("adminLikesScreen");
    const adminFeedbackScreen = document.getElementById("adminFeedbackScreen");
    const adminDislikesScreen = document.getElementById("adminDislikesScreen");
    const adminWebsitesScreen = document.getElementById("adminWebsitesScreen");
    const adminPassInput = document.getElementById("adminPassInput");
    const adminLoginBtn = document.getElementById("adminLoginBtn");

    const gotoVisitsHub = document.getElementById("gotoVisitsHub");
    const gotoLikesHub = document.getElementById("gotoLikesHub");
    const gotoFeedbackHub = document.getElementById("gotoFeedbackHub");
    const gotoDislikesHub = document.getElementById("gotoDislikesHub");
    const gotoWebsitesHub = document.getElementById("gotoWebsitesHub");
    const backToHubFromVisits = document.getElementById("backToHubFromVisits");
    const backToHubFromLikes = document.getElementById("backToHubFromLikes");
    const backToHubFromFeedback = document.getElementById("backToHubFromFeedback");
    const backToHubFromDislikes = document.getElementById("backToHubFromDislikes");
    const backToHubFromWebsites = document.getElementById("backToHubFromWebsites");

    const adminVisitsList = document.getElementById("adminVisitsList");
    const adminLikesList = document.getElementById("adminLikesList");
    const adminEntriesList = document.getElementById("adminEntriesList");
    const adminDislikesList = document.getElementById("adminDislikesList");
    const adminWebsitesList = document.getElementById("adminWebsitesList");
    const openAddWebsiteBtn = document.getElementById("openAddWebsiteBtn");
    const resetAllLikesBtn = document.getElementById("resetAllLikesBtn");
    const addWebsiteFormWrapper = document.getElementById("addWebsiteFormWrapper");
    const addWebsiteForm = document.getElementById("addWebsiteForm");
    const cancelAddWebBtn = document.getElementById("cancelAddWebBtn");
    const newWebMediaFile = document.getElementById("newWebMediaFile");

    let currentSlideIndex = 0;
    let currentProjectMedia = [];
    let slideInterval = null;
    let activeCategory = "All";
    let searchQuery = "";
    let currentActiveProject = null;
    let allFeedbackEntries = [];
    let allDislikeEntries = [];
    let allLikeLogs = [];
    
    let pendingVoteAction = null;
    let pendingVoteProjectKey = null;

    // --- LOAD PROJECTS FROM FIREBASE ---
    const projectsRef = ref(db, "portfolio_projects");
    onValue(projectsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            projects = Object.keys(data).map(key => ({ dbKey: key, ...data[key] }));
        } else {
            defaultProjects.forEach(p => {
                const newRef = push(projectsRef);
                set(newRef, p);
            });
            projects = defaultProjects;
        }
        initApp();
    });

    function initApp() {
        const categories = ["All", ...new Set(projects.map(p => p.category))];
        filterBar.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>
        `).join("");

        footerStats.textContent = `Total Applications: ${projects.length} | Active Categories: ${categories.length - 1}`;
        renderProjects();
    }

    // Modal Tabs Navigation
    modalTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            modalTabBtns.forEach(b => b.classList.remove("active"));
            modalTabPanes.forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
        });
    });

    // --- FIRST VISIT POPUP ---
    if (!localStorage.getItem("hasVisitedBefore")) {
        setTimeout(() => {
            feedbackModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }, 1800);
        localStorage.setItem("hasVisitedBefore", "true");
    }

    openFeedbackBtn.addEventListener("click", () => {
        feedbackModal.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    feedbackClose.addEventListener("click", () => {
        feedbackModal.classList.remove("active");
        document.body.style.overflow = "auto";
    });

    feedbackForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const category = document.getElementById("feedbackCategory").value;
        const name = document.getElementById("feedbackName").value.trim() || "Anonymous";
        const message = document.getElementById("feedbackMessage").value.trim();

        const feedbackRef = ref(db, "feedback_submissions");
        const newEntryRef = push(feedbackRef);
        set(newEntryRef, {
            category,
            name,
            message,
            timestamp: new Date().toLocaleString()
        }).then(() => {
            alert("Thank you! Your feedback or app idea was submitted successfully to Rick_Dev.");
            feedbackForm.reset();
            feedbackModal.classList.remove("active");
            document.body.style.overflow = "auto";
        }).catch((err) => {
            alert("Error: " + err.message);
        });
    });

    // --- SECURE DUAL-LAYER ADMIN PANEL: CTRL + SHIFT + ALT + F2 ---
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.altKey && e.key === "F2") {
            e.preventDefault();
            adminModal.classList.add("active");
            document.body.style.overflow = "hidden";
            adminLoginScreen.style.display = "flex";
            adminHubScreen.style.display = "none";
            adminVisitsScreen.style.display = "none";
            adminLikesScreen.style.display = "none";
            adminFeedbackScreen.style.display = "none";
            adminDislikesScreen.style.display = "none";
            adminWebsitesScreen.style.display = "none";
            adminPassInput.value = "";
            adminPassInput.focus();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        if (e.key === "Escape") {
            closeAllModals();
        }
        if (modal.classList.contains("active")) {
            if (e.key === "ArrowRight") { nextSlide(); resetAutoSlide(); }
            if (e.key === "ArrowLeft") { prevSlide(); resetAutoSlide(); }
        }
    });

    adminClose.addEventListener("click", () => {
        adminModal.classList.remove("active");
        document.body.style.overflow = "auto";
    });

    adminLoginBtn.addEventListener("click", verifyAdminCode);
    adminPassInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") verifyAdminCode();
    });

    function verifyAdminCode() {
        if (adminPassInput.value.trim() === "2285") {
            adminLoginScreen.style.display = "none";
            adminHubScreen.style.display = "flex";
        } else {
            alert("Incorrect Rick_Dev Admin Passcode!");
            adminPassInput.value = "";
        }
    }

    gotoVisitsHub.addEventListener("click", () => {
        adminHubScreen.style.display = "none";
        adminVisitsScreen.style.display = "flex";
        loadAdminVisits();
    });

    gotoLikesHub.addEventListener("click", () => {
        adminHubScreen.style.display = "none";
        adminLikesScreen.style.display = "flex";
        loadAdminLikes();
    });

    gotoFeedbackHub.addEventListener("click", () => {
        adminHubScreen.style.display = "none";
        adminFeedbackScreen.style.display = "flex";
        loadAdminFeedback();
    });

    gotoDislikesHub.addEventListener("click", () => {
        adminHubScreen.style.display = "none";
        adminDislikesScreen.style.display = "flex";
        loadAdminDislikes();
    });

    gotoWebsitesHub.addEventListener("click", () => {
        adminHubScreen.style.display = "none";
        adminWebsitesScreen.style.display = "flex";
        loadAdminWebsites();
    });

    backToHubFromVisits.addEventListener("click", () => {
        adminVisitsScreen.style.display = "none";
        adminHubScreen.style.display = "flex";
    });

    backToHubFromLikes.addEventListener("click", () => {
        adminLikesScreen.style.display = "none";
        adminHubScreen.style.display = "flex";
    });

    backToHubFromFeedback.addEventListener("click", () => {
        adminFeedbackScreen.style.display = "none";
        adminHubScreen.style.display = "flex";
    });

    backToHubFromDislikes.addEventListener("click", () => {
        adminDislikesScreen.style.display = "none";
        adminHubScreen.style.display = "flex";
    });

    backToHubFromWebsites.addEventListener("click", () => {
        adminWebsitesScreen.style.display = "none";
        adminHubScreen.style.display = "flex";
        addWebsiteFormWrapper.style.display = "none";
    });

    function loadAdminVisits() {
        adminVisitsList.innerHTML = projects.map(proj => `
            <div class="admin-entry-card">
                <div class="entry-info">
                    <div class="entry-top">
                        <span class="entry-cat" style="background:rgba(56,189,248,0.2); color:#38bdf8;">📊 Traffic Metric</span>
                        <span class="entry-date">${proj.visits || 0} Total Visits</span>
                    </div>
                    <div class="entry-user" style="font-size:1.15rem;">${proj.name}</div>
                    <div class="entry-msg"><a href="${proj.url}" target="_blank" style="color:var(--cyan);">${proj.url}</a></div>
                </div>
            </div>
        `).join("");
    }

    function loadAdminLikes() {
        const likesRef = ref(db, "like_logs");
        onValue(likesRef, (snapshot) => {
            const data = snapshot.val();
            allLikeLogs = [];
            if (data) {
                Object.keys(data).forEach(key => {
                    allLikeLogs.push({ id: key, ...data[key] });
                });
            }

            if (allLikeLogs.length === 0) {
                adminLikesList.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px;">No like records found yet.</div>`;
                return;
            }

            adminLikesList.innerHTML = allLikeLogs.reverse().map(log => `
                <div class="admin-entry-card">
                    <div class="entry-info">
                        <div class="entry-top">
                            <span class="entry-cat" style="background:rgba(244,63,94,0.2); color:#f43f5e;">❤️ Liked Project</span>
                            <span class="entry-date">${log.timestamp || 'Recent'}</span>
                        </div>
                        <div class="entry-user">User: <strong>${log.userName}</strong></div>
                        <div class="entry-msg">Project: <strong>${log.projectName}</strong></div>
                    </div>
                    <button class="delete-btn" data-like-log-id="${log.id}" title="Remove Record">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `).join("");

            document.querySelectorAll(".delete-btn[data-like-log-id]").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-like-log-id");
                    if (confirm("Delete this like record?")) {
                        remove(ref(db, `like_logs/${id}`)).then(() => loadAdminLikes());
                    }
                });
            });
        });
    }

    function loadAdminFeedback() {
        const feedbackRef = ref(db, "feedback_submissions");
        onValue(feedbackRef, (snapshot) => {
            const data = snapshot.val();
            allFeedbackEntries = [];
            if (data) {
                Object.keys(data).forEach(key => {
                    allFeedbackEntries.push({ id: key, ...data[key] });
                });
            }
            renderAdminFeedbackEntries("All");
        });
    }

    function renderAdminFeedbackEntries(filterCat) {
        const filtered = filterCat === "All" ? allFeedbackEntries : allFeedbackEntries.filter(e => e.category === filterCat);
        
        if (filtered.length === 0) {
            adminEntriesList.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px;">No feedback entries found.</div>`;
            return;
        }

        adminEntriesList.innerHTML = filtered.reverse().map(entry => `
            <div class="admin-entry-card">
                <div class="entry-info">
                    <div class="entry-top">
                        <span class="entry-cat">${entry.category}</span>
                        <span class="entry-date">${entry.timestamp || 'Recent'}</span>
                    </div>
                    <div class="entry-user"><i class="fa-solid fa-user-circle"></i> ${entry.name}</div>
                    <div class="entry-msg">${entry.message}</div>
                </div>
                <button class="delete-btn" data-feedback-id="${entry.id}" title="Delete Feedback">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join("");

        document.querySelectorAll(".delete-btn[data-feedback-id]").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-feedback-id");
                if (confirm("Delete this feedback item?")) {
                    remove(ref(db, `feedback_submissions/${id}`)).then(() => loadAdminFeedback());
                }
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
        const dislikesRef = ref(db, "dislike_logs");
        onValue(dislikesRef, (snapshot) => {
            const data = snapshot.val();
            allDislikeEntries = [];
            if (data) {
                Object.keys(data).forEach(key => {
                    allDislikeEntries.push({ id: key, ...data[key] });
                });
            }

            if (allDislikeEntries.length === 0) {
                adminDislikesList.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px;">No dislike reports logged.</div>`;
                return;
            }

            adminDislikesList.innerHTML = allDislikeEntries.reverse().map(entry => `
                <div class="admin-entry-card">
                    <div class="entry-info">
                        <div class="entry-top">
                            <span class="entry-cat" style="background:rgba(239,68,68,0.2); color:#ef4444;">👎 Dislike Report</span>
                            <span class="entry-date">${entry.timestamp || 'Recent'}</span>
                        </div>
                        <div class="entry-user">User: <strong>${entry.userName || 'Anonymous'}</strong> | Project: <strong>${entry.projectName || 'Unknown'}</strong></div>
                        <div class="entry-msg"><strong>Reason:</strong> ${entry.reason}</div>
                        ${entry.details ? `<div class="entry-msg" style="margin-top:4px;"><em>Details: "${entry.details}"</em></div>` : ''}
                    </div>
                    <button class="delete-btn" data-dislike-id="${entry.id}" title="Remove Report">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `).join("");

            document.querySelectorAll(".delete-btn[data-dislike-id]").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-dislike-id");
                    if (confirm("Delete this dislike log?")) {
                        remove(ref(db, `dislike_logs/${id}`)).then(() => loadAdminDislikes());
                    }
                });
            });
        });
    }

    // --- RESET ALL STATS MASTER BUTTON ---
    resetAllLikesBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset ALL likes, dislikes, and visit metrics to 0 for every website?")) {
            projects.forEach(proj => {
                set(ref(db, `portfolio_projects/${proj.dbKey}/likes`), 0);
                set(ref(db, `portfolio_projects/${proj.dbKey}/dislikes`), 0);
                set(ref(db, `portfolio_projects/${proj.dbKey}/visits`), 0);
                localStorage.removeItem(`liked_${proj.dbKey}`);
                localStorage.removeItem(`disliked_${proj.dbKey}`);
            });
            alert("All stats and metrics have been successfully reset to 0 by Rick_Dev!");
            loadAdminWebsites();
        }
    });

    openAddWebsiteBtn.addEventListener("click", () => {
        addWebsiteFormWrapper.style.display = "block";
        document.getElementById("newWebName").focus();
    });

    cancelAddWebBtn.addEventListener("click", () => {
        addWebsiteFormWrapper.style.display = "none";
        addWebsiteForm.reset();
    });

    addWebsiteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("newWebName").value.trim();
        const category = document.getElementById("newWebCategory").value;
        const url = document.getElementById("newWebUrl").value.trim();
        const description = document.getElementById("newWebDesc").value.trim();
        const techInput = document.getElementById("newWebTech").value.trim();

        const tech = techInput ? techInput.split(",").map(t => t.trim()) : ["HTML", "JS"];
        let media = [];

        const file = newWebMediaFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                const base64String = uploadEvent.target.result;
                const type = file.type.startsWith('video') ? 'video' : 'image';
                media.push({ type, src: base64String });
                saveNewProjectToDB(name, url, category, description, tech, media);
            };
            reader.readAsDataURL(file);
        } else {
            saveNewProjectToDB(name, url, category, description, tech, media);
        }
    });

    function saveNewProjectToDB(name, url, category, description, tech, media) {
        const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const newProject = {
            name,
            url,
            category,
            description,
            tech,
            exploreTime: "Est. 2 min explore",
            lastUpdated: currentDate,
            version: "v1.0.0",
            tutorial: "1. Launch the application from the portfolio card.\n2. Interact with the core interface features.\n3. Enjoy your experience!",
            visits: 0,
            likes: 0,
            dislikes: 0,
            media
        };

        const projectsRef = ref(db, "portfolio_projects");
        const newProjRef = push(projectsRef);
        set(newProjRef, newProject).then(() => {
            alert("New luxury application added to Rick_Dev portfolio successfully!");
            addWebsiteForm.reset();
            addWebsiteFormWrapper.style.display = "none";
            loadAdminWebsites();
        }).catch(err => {
            alert("Error: " + err.message);
        });
    }

    function loadAdminWebsites() {
        adminWebsitesList.innerHTML = projects.map(proj => `
            <div class="admin-entry-card">
                <div class="entry-info">
                    <div class="entry-top">
                        <span class="entry-cat">${proj.category}</span>
                        <span class="entry-date">📊 ${proj.visits || 0} visits | ❤️ ${proj.likes || 0}</span>
                    </div>
                    <div class="entry-user" style="font-size:1.1rem;">${proj.name}</div>
                    <div class="entry-msg" style="margin-bottom:6px;"><a href="${proj.url}" target="_blank" style="color:var(--cyan);">${proj.url}</a></div>
                    <div class="entry-msg">${proj.description}</div>
                </div>
                <button class="delete-btn" data-project-key="${proj.dbKey}" title="Delete Website">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join("");

        document.querySelectorAll(".delete-btn[data-project-key]").forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-project-key");
                if (confirm("Delete this website from Rick_Dev portfolio?")) {
                    remove(ref(db, `portfolio_projects/${key}`)).then(() => loadAdminWebsites());
                }
            });
        });
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        document.body.classList.toggle("dark-mode");
        themeIcon.className = document.body.classList.contains("light-mode") ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });

    filterBar.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-btn")) {
            document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.getAttribute("data-category");
            renderProjects();
        }
    });

    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderProjects();
    });

    sortSelect.addEventListener("change", renderProjects);

    surpriseBtn.addEventListener("click", () => {
        if (projects.length === 0) return;
        const randomIndex = Math.floor(Math.random() * projects.length);
        openModal(projects[randomIndex]);
    });

    exportBtn.addEventListener("click", () => {
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
            const matchesCat = activeCategory === "All" || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery) || (p.tech && p.tech.some(t => t.toLowerCase().includes(searchQuery)));
            return matchesCat && matchesSearch;
        });

        if (sortSelect.value === "az") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortSelect.value === "za") {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        }

        statsCounter.textContent = `Showing ${filtered.length} of ${projects.length} luxury applications`;

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">No matching luxury applications found.</div>`;
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

            return `
                <div class="project-card">
                    <div class="card-media-wrapper">
                        ${previewEl}
                    </div>
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

        document.querySelectorAll(".card-click-trigger").forEach(el => {
            el.addEventListener("click", () => {
                const projectIndex = el.getAttribute("data-index");
                openModal(projects[projectIndex]);
            });
        });

        // Like Click
        document.querySelectorAll(".card-like-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const dbKey = btn.getAttribute("data-project-key");
                const targetProj = projects.find(p => p.dbKey === dbKey);
                const isLiked = localStorage.getItem(`liked_${dbKey}`) === "true";

                if (isLiked) {
                    targetProj.likes = Math.max(0, (targetProj.likes || 1) - 1);
                    localStorage.removeItem(`liked_${dbKey}`);
                    btn.classList.remove("liked");
                    set(ref(db, `portfolio_projects/${dbKey}/likes`), targetProj.likes);
                    btn.querySelector(".card-like-count").textContent = targetProj.likes;
                } else {
                    pendingVoteAction = 'like';
                    pendingVoteProjectKey = dbKey;
                    voterModalTitle.textContent = `Who's Liking "${targetProj.name}"?`;
                    dislikeSpecificFields.style.display = "none";
                    voterIdentityModal.classList.add("active");
                    voterNameInput.focus();
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
                    targetProj.dislikes = Math.max(0, (targetProj.dislikes || 1) - 1);
                    localStorage.removeItem(`disliked_${dbKey}`);
                    btn.classList.remove("disliked");
                    set(ref(db, `portfolio_projects/${dbKey}/dislikes`), targetProj.dislikes);
                    btn.querySelector(".card-dislike-count").textContent = targetProj.dislikes;
                } else {
                    pendingVoteAction = 'dislike';
                    pendingVoteProjectKey = dbKey;
                    voterModalTitle.textContent = `Feedback on "${targetProj.name}"?`;
                    dislikeSpecificFields.style.display = "block";
                    voterIdentityModal.classList.add("active");
                    voterNameInput.focus();
                }
            });
        });
    }

    // Voter Identity Form Submission
    voterIdentityForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!pendingVoteProjectKey || !pendingVoteAction) return;

        const dbKey = pendingVoteProjectKey;
        const targetProj = projects.find(p => p.dbKey === dbKey);
        const userName = voterNameInput.value.trim() || "Anonymous";

        if (pendingVoteAction === 'like') {
            targetProj.likes = (targetProj.likes || 0) + 1;
            localStorage.setItem(`liked_${dbKey}`, "true");
            set(ref(db, `portfolio_projects/${dbKey}/likes`), targetProj.likes);

            push(ref(db, "like_logs"), {
                projectKey: dbKey,
                projectName: targetProj.name,
                userName,
                timestamp: new Date().toLocaleString()
            });

            if (localStorage.getItem(`disliked_${dbKey}`) === "true") {
                targetProj.dislikes = Math.max(0, (targetProj.dislikes || 1) - 1);
                localStorage.removeItem(`disliked_${dbKey}`);
                set(ref(db, `portfolio_projects/${dbKey}/dislikes`), targetProj.dislikes);
            }
        } else if (pendingVoteAction === 'dislike') {
            targetProj.dislikes = (targetProj.dislikes || 0) + 1;
            localStorage.setItem(`disliked_${dbKey}`, "true");
            set(ref(db, `portfolio_projects/${dbKey}/dislikes`), targetProj.dislikes);

            const reason = dislikeReasonSelect.value;
            const details = dislikeReasonText.value.trim();

            push(ref(db, "dislike_logs"), {
                projectKey: dbKey,
                projectName: targetProj.name,
                userName,
                reason,
                details,
                timestamp: new Date().toLocaleString()
            });

            if (localStorage.getItem(`liked_${dbKey}`) === "true") {
                targetProj.likes = Math.max(0, (targetProj.likes || 1) - 1);
                localStorage.removeItem(`liked_${dbKey}`);
                set(ref(db, `portfolio_projects/${dbKey}/likes`), targetProj.likes);
            }
        }

        voterIdentityForm.reset();
        voterIdentityModal.classList.remove("active");
        pendingVoteProjectKey = null;
        pendingVoteAction = null;
        renderProjects();
        if (modal.classList.contains("active")) openModal(targetProj);
    });

    voterIdentityClose.addEventListener("click", () => {
        voterIdentityModal.classList.remove("active");
        pendingVoteProjectKey = null;
        pendingVoteAction = null;
    });

    function openModal(project) {
        currentActiveProject = project;
        modalTitle.textContent = project.name;
        modalCategory.textContent = project.category;
        modalDescription.textContent = project.description;
        modalVisitBtn.href = project.url;
        modalExploreTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${project.exploreTime || 'Est. 2 min explore'}`;
        likeCountSpan.textContent = project.likes || 0;
        dislikeCountSpan.textContent = project.dislikes || 0;
        modalVisitsCount.textContent = project.visits || 0;
        modalLastUpdated.textContent = `Last Updated: ${project.lastUpdated || 'September 15, 2026'} (${project.version || 'v1.0.0'})`;
        modalVersionNotes.textContent = `Active production build stable on Firebase. All real-time modules operating at peak efficiency.`;

        // Render Tutorial Steps
        if (project.tutorial) {
            const steps = project.tutorial.split("\n");
            modalTutorialList.innerHTML = steps.map((step, idx) => `
                <div class="tutorial-step">
                    <span class="step-num">${idx + 1}</span>
                    <p>${step.replace(/^\d+\.\s*/, '')}</p>
                </div>
            `).join("");
        } else {
            modalTutorialList.innerHTML = `<div class="tutorial-step"><span class="step-num">1</span><p>Launch application and enjoy the interactive platform.</p></div>`;
        }

        // Increment Visit Count in Firebase Transaction
        if (project.dbKey) {
            const visitRef = ref(db, `portfolio_projects/${project.dbKey}/visits`);
            runTransaction(visitRef, (currentVisits) => {
                return (currentVisits || 0) + 1;
            });
        }

        const hasLiked = localStorage.getItem(`liked_${project.dbKey}`) === "true";
        const hasDisliked = localStorage.getItem(`disliked_${project.dbKey}`) === "true";
        
        if (hasLiked) modalLikeBtn.classList.add("liked");
        else modalLikeBtn.classList.remove("liked");

        if (hasDisliked) modalDislikeBtn.classList.add("disliked");
        else modalDislikeBtn.classList.remove("disliked");

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

    function closeAllModals() {
        modal.classList.remove("active");
        feedbackModal.classList.remove("active");
        adminModal.classList.remove("active");
        voterIdentityModal.classList.remove("active");
        document.body.style.overflow = "auto";
        stopAutoSlide();
    }

    modalClose.addEventListener("click", closeAllModals);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeAllModals();
    });

    modalCopyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(modalVisitBtn.href);
        const originalText = modalCopyBtn.innerHTML;
        modalCopyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => { modalCopyBtn.innerHTML = originalText; }, 2000);
    });

    // Modal Like Toggle
    modalLikeBtn.addEventListener("click", () => {
        if (currentActiveProject && currentActiveProject.dbKey) {
            const dbKey = currentActiveProject.dbKey;
            const isLiked = localStorage.getItem(`liked_${dbKey}`) === "true";

            if (isLiked) {
                currentActiveProject.likes = Math.max(0, (currentActiveProject.likes || 1) - 1);
                localStorage.removeItem(`liked_${dbKey}`);
                modalLikeBtn.classList.remove("liked");
                likeCountSpan.textContent = currentActiveProject.likes;
                set(ref(db, `portfolio_projects/${dbKey}/likes`), currentActiveProject.likes);
                renderProjects();
            } else {
                pendingVoteAction = 'like';
                pendingVoteProjectKey = dbKey;
                voterModalTitle.textContent = `Who's Liking "${currentActiveProject.name}"?`;
                dislikeSpecificFields.style.display = "none";
                voterIdentityModal.classList.add("active");
                voterNameInput.focus();
            }
        }
    });

    // Modal Dislike Toggle
    modalDislikeBtn.addEventListener("click", () => {
        if (currentActiveProject && currentActiveProject.dbKey) {
            const dbKey = currentActiveProject.dbKey;
            const isDisliked = localStorage.getItem(`disliked_${dbKey}`) === "true";

            if (isDisliked) {
                currentActiveProject.dislikes = Math.max(0, (currentActiveProject.dislikes || 1) - 1);
                localStorage.removeItem(`disliked_${dbKey}`);
                modalDislikeBtn.classList.remove("disliked");
                dislikeCountSpan.textContent = currentActiveProject.dislikes;
                set(ref(db, `portfolio_projects/${dbKey}/dislikes`), currentActiveProject.dislikes);
                renderProjects();
            } else {
                pendingVoteAction = 'dislike';
                pendingVoteProjectKey = dbKey;
                voterModalTitle.textContent = `Feedback on "${currentActiveProject.name}"?`;
                dislikeSpecificFields.style.display = "block";
                voterIdentityModal.classList.add("active");
                voterNameInput.focus();
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
                currentSlideIndex = parseInt(dot.getAttribute("data-slide"));
                updateSlider();
                resetAutoSlide();
            });
        });
    }

    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % currentProjectMedia.length;
        updateSlider();
    }

    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + currentProjectMedia.length) % currentProjectMedia.length;
        updateSlider();
    }

    nextSlideBtn.addEventListener("click", () => {
        nextSlide();
        resetAutoSlide();
    });

    prevSlideBtn.addEventListener("click", () => {
        prevSlide();
        resetAutoSlide();
    });

    function startAutoSlide() {
        if (currentProjectMedia.length > 1) {
            slideInterval = setInterval(nextSlide, 4500);
        }
    }

    function stopAutoSlide() {
        clearInterval(slideInterval);
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }
});
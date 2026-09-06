import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
        name: "Yitz Pitz Cast",
        url: "https://rickdevr.github.io/Yitz-pitz-cast/",
        category: "Entertainment",
        description: "Catch up on episodes and audio content and listen to the latest streams.",
        tech: ["HTML", "CSS", "JS", "Audio API"],
        exploreTime: "Est. 3 min explore",
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Task challenge",
        url: "https://rickdevr.github.io/Task/",
        category: "Games",
        description: "Test your speed and complete interactive mini-challenges under tight time limits.",
        tech: ["HTML", "Tailwind", "JS"],
        exploreTime: "Est. 2 min explore",
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Secret coding language decode and Ecode",
        url: "https://rickdevr.github.io/Secretcoder/",
        category: "Tools",
        description: "Encrypt and decrypt hidden messages using a secure custom secret cipher.",
        tech: ["JavaScript", "Crypto"],
        exploreTime: "Est. 1 min explore",
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Test your friends trust level",
        url: "https://rickdevr.github.io/Test-trust-level/",
        category: "Projects",
        description: "In this website you can see the trust level between you and your friend, including love levels and fun features.",
        tech: ["HTML", "CSS", "JS"],
        exploreTime: "Est. 2 min explore",
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Satisfying squishy sound",
        url: "https://rickdevr.github.io/squishy/",
        category: "Projects",
        description: "Relaxing interactive audio-visual toy featuring satisfying squishy physics.",
        tech: ["HTML", "Canvas", "Audio"],
        exploreTime: "Est. 1 min explore",
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "Duck clicker",
        url: "https://rickdevr.github.io/Duck-clicker/",
        category: "Games",
        description: "A fun, addictive clicker game featuring lovable ducks, upgrades, and rewards.",
        tech: ["HTML", "JS", "LocalStorage"],
        exploreTime: "Est. 4 min explore",
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "If you wanna learn how to type on keyboard Faster and without looking then this website's for you",
        url: "https://rickdevr.github.io/Learn-keyboard-typing/",
        category: "Tools",
        description: "This website teaches you how to learn typing without looking on your keyboard faster and easier.",
        tech: ["HTML", "CSS", "DOM Events"],
        exploreTime: "Est. 3 min explore",
        likes: 0,
        dislikes: 0,
        media: []
    },
    {
        name: "DJ Bored",
        url: "https://rickdevr.github.io/DJ-board-today-s-Tuesday/",
        category: "Tools",
        description: "Here you could remix Audios by using a DJ board.",
        tech: ["HTML", "JS", "Audio"],
        exploreTime: "Est. 4 min explore",
        likes: 0,
        dislikes: 0,
        media: []
    }
];

let projects = [];

document.addEventListener("DOMContentLoaded", () => {
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
    
    const mediaSlider = document.getElementById("mediaSlider");
    const sliderDots = document.getElementById("sliderDots");
    const prevSlideBtn = document.getElementById("prevSlide");
    const nextSlideBtn = document.getElementById("nextSlide");

    const feedbackModal = document.getElementById("feedbackModal");
    const openFeedbackBtn = document.getElementById("openFeedbackBtn");
    const feedbackClose = document.getElementById("feedbackClose");
    const feedbackForm = document.getElementById("feedbackForm");

    const dislikeReasonModal = document.getElementById("dislikeReasonModal");
    const dislikeReasonClose = document.getElementById("dislikeReasonClose");
    const dislikeReasonForm = document.getElementById("dislikeReasonForm");
    const dislikeReasonSelect = document.getElementById("dislikeReasonSelect");
    const dislikeReasonText = document.getElementById("dislikeReasonText");

    const adminModal = document.getElementById("adminModal");
    const adminClose = document.getElementById("adminClose");
    const adminLoginScreen = document.getElementById("adminLoginScreen");
    const adminHubScreen = document.getElementById("adminHubScreen");
    const adminFeedbackScreen = document.getElementById("adminFeedbackScreen");
    const adminDislikesScreen = document.getElementById("adminDislikesScreen");
    const adminWebsitesScreen = document.getElementById("adminWebsitesScreen");
    const adminPassInput = document.getElementById("adminPassInput");
    const adminLoginBtn = document.getElementById("adminLoginBtn");

    const gotoFeedbackHub = document.getElementById("gotoFeedbackHub");
    const gotoDislikesHub = document.getElementById("gotoDislikesHub");
    const gotoWebsitesHub = document.getElementById("gotoWebsitesHub");
    const backToHubFromFeedback = document.getElementById("backToHubFromFeedback");
    const backToHubFromDislikes = document.getElementById("backToHubFromDislikes");
    const backToHubFromWebsites = document.getElementById("backToHubFromWebsites");

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
    let pendingDislikeProjectKey = null;

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

        footerStats.textContent = `Total Projects: ${projects.length} | Active Categories: ${categories.length - 1}`;
        renderProjects();
    }

    // --- FIRST VISIT POPUP ---
    if (!localStorage.getItem("hasVisitedBefore")) {
        setTimeout(() => {
            feedbackModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }, 1200);
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
            alert("Thank you! Your feedback or app idea was submitted successfully.");
            feedbackForm.reset();
            feedbackModal.classList.remove("active");
            document.body.style.overflow = "auto";
        }).catch((err) => {
            alert("Error: " + err.message);
        });
    });

    // --- HIDDEN ADMIN CMS PANEL (F2 -> 2285) ---
    document.addEventListener("keydown", (e) => {
        if (e.key === "F2") {
            e.preventDefault();
            adminModal.classList.add("active");
            document.body.style.overflow = "hidden";
            adminLoginScreen.style.display = "block";
            adminHubScreen.style.display = "none";
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
            adminHubScreen.style.display = "block";
        } else {
            alert("Incorrect Admin Passcode!");
            adminPassInput.value = "";
        }
    }

    gotoFeedbackHub.addEventListener("click", () => {
        adminHubScreen.style.display = "none";
        adminFeedbackScreen.style.display = "block";
        loadAdminFeedback();
    });

    gotoDislikesHub.addEventListener("click", () => {
        adminHubScreen.style.display = "none";
        adminDislikesScreen.style.display = "block";
        loadAdminDislikes();
    });

    gotoWebsitesHub.addEventListener("click", () => {
        adminHubScreen.style.display = "none";
        adminWebsitesScreen.style.display = "block";
        loadAdminWebsites();
    });

    backToHubFromFeedback.addEventListener("click", () => {
        adminFeedbackScreen.style.display = "none";
        adminHubScreen.style.display = "block";
    });

    backToHubFromDislikes.addEventListener("click", () => {
        adminDislikesScreen.style.display = "none";
        adminHubScreen.style.display = "block";
    });

    backToHubFromWebsites.addEventListener("click", () => {
        adminWebsitesScreen.style.display = "none";
        adminHubScreen.style.display = "block";
        addWebsiteFormWrapper.style.display = "none";
    });

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
                        <div class="entry-user">Project: <strong>${entry.projectName || 'Unknown'}</strong></div>
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

    // --- RESET ALL LIKES MASTER BUTTON ---
    resetAllLikesBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset ALL likes and dislikes to 0 for every website?")) {
            projects.forEach(proj => {
                set(ref(db, `portfolio_projects/${proj.dbKey}/likes`), 0);
                set(ref(db, `portfolio_projects/${proj.dbKey}/dislikes`), 0);
                localStorage.removeItem(`liked_${proj.dbKey}`);
                localStorage.removeItem(`disliked_${proj.dbKey}`);
            });
            alert("All likes and dislikes have been successfully reset to 0!");
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
        const newProject = {
            name,
            url,
            category,
            description,
            tech,
            exploreTime: "Est. 2 min explore",
            likes: 0,
            dislikes: 0,
            media
        };

        const projectsRef = ref(db, "portfolio_projects");
        const newProjRef = push(projectsRef);
        set(newProjRef, newProject).then(() => {
            alert("Website added to portfolio database successfully!");
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
                        <span class="entry-date">❤️ ${proj.likes || 0} | 👎 ${proj.dislikes || 0}</span>
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
                if (confirm("Delete this website from portfolio?")) {
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
        downloadAnchor.setAttribute("download", "portfolio_projects.json");
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

        statsCounter.textContent = `Showing ${filtered.length} of ${projects.length} projects`;

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">No matching projects found.</div>`;
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
                previewEl = `<iframe src="${project.url}" class="fallback-preview" loading="lazy" tabindex="-1"></iframe>`;
            }

            const techPillsHtml = project.tech ? project.tech.map(t => `<span class="tech-pill">${t}</span>`).join("") : "";
            const hasLiked = localStorage.getItem(`liked_${project.dbKey}`) === "true";
            const hasDisliked = localStorage.getItem(`disliked_${project.dbKey}`) === "true";

            return `
                <div class="project-card">
                    <div class="card-media-wrapper card-click-trigger" data-index="${projects.indexOf(project)}">
                        ${previewEl}
                    </div>
                    <div class="card-content">
                        <div class="card-top-row">
                            <span class="card-tag">${project.category}</span>
                            <div class="card-tech-pills">${techPillsHtml}</div>
                        </div>
                        <h3 class="card-title card-click-trigger" data-index="${projects.indexOf(project)}">${project.name}</h3>
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

        // Like / Unlike Toggle
        document.querySelectorAll(".card-like-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const dbKey = btn.getAttribute("data-project-key");
                const targetProj = projects.find(p => p.dbKey === dbKey);
                const isLiked = localStorage.getItem(`liked_${dbKey}`) === "true";

                if (targetProj) {
                    if (isLiked) {
                        targetProj.likes = Math.max(0, (targetProj.likes || 1) - 1);
                        localStorage.removeItem(`liked_${dbKey}`);
                        btn.classList.remove("liked");
                    } else {
                        targetProj.likes = (targetProj.likes || 0) + 1;
                        localStorage.setItem(`liked_${dbKey}`, "true");
                        btn.classList.add("liked");
                        
                        // Remove dislike if active
                        if (localStorage.getItem(`disliked_${dbKey}`) === "true") {
                            targetProj.dislikes = Math.max(0, (targetProj.dislikes || 1) - 1);
                            localStorage.removeItem(`disliked_${dbKey}`);
                            set(ref(db, `portfolio_projects/${dbKey}/dislikes`), targetProj.dislikes);
                        }
                    }
                    
                    set(ref(db, `portfolio_projects/${dbKey}/likes`), targetProj.likes);
                    btn.querySelector(".card-like-count").textContent = targetProj.likes;
                }
            });
        });

        // Dislike / Remove Dislike Toggle
        document.querySelectorAll(".card-dislike-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const dbKey = btn.getAttribute("data-project-key");
                const targetProj = projects.find(p => p.dbKey === dbKey);
                const isDisliked = localStorage.getItem(`disliked_${dbKey}`) === "true";

                if (targetProj) {
                    if (isDisliked) {
                        targetProj.dislikes = Math.max(0, (targetProj.dislikes || 1) - 1);
                        localStorage.removeItem(`disliked_${dbKey}`);
                        btn.classList.remove("disliked");
                        set(ref(db, `portfolio_projects/${dbKey}/dislikes`), targetProj.dislikes);
                        btn.querySelector(".card-dislike-count").textContent = targetProj.dislikes;
                    } else {
                        pendingDislikeProjectKey = dbKey;
                        dislikeReasonModal.classList.add("active");
                    }
                }
            });
        });
    }

    // Submit Dislike Reason Form
    dislikeReasonForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!pendingDislikeProjectKey) return;

        const dbKey = pendingDislikeProjectKey;
        const targetProj = projects.find(p => p.dbKey === dbKey);
        const reason = dislikeReasonSelect.value;
        const details = dislikeReasonText.value.trim();

        if (targetProj) {
            targetProj.dislikes = (targetProj.dislikes || 0) + 1;
            localStorage.setItem(`disliked_${dbKey}`, "true");
            set(ref(db, `portfolio_projects/${dbKey}/dislikes`), targetProj.dislikes);

            // Remove like if active
            if (localStorage.getItem(`liked_${dbKey}`) === "true") {
                targetProj.likes = Math.max(0, (targetProj.likes || 1) - 1);
                localStorage.removeItem(`liked_${dbKey}`);
                set(ref(db, `portfolio_projects/${dbKey}/likes`), targetProj.likes);
            }

            // Log dislike reason to database
            const dislikeLogsRef = ref(db, "dislike_logs");
            push(dislikeLogsRef, {
                projectKey: dbKey,
                projectName: targetProj.name,
                reason,
                details,
                timestamp: new Date().toLocaleString()
            });

            dislikeReasonForm.reset();
            dislikeReasonModal.classList.remove("active");
            pendingDislikeProjectKey = null;
            renderProjects();
            if (modal.classList.contains("active")) openModal(targetProj);
        }
    });

    dislikeReasonClose.addEventListener("click", () => {
        dislikeReasonModal.classList.remove("active");
        pendingDislikeProjectKey = null;
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
            currentProjectMedia = [{ type: "iframe", src: project.url }];
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
        dislikeReasonModal.classList.remove("active");
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
            } else {
                currentActiveProject.likes = (currentActiveProject.likes || 0) + 1;
                localStorage.setItem(`liked_${dbKey}`, "true");
                modalLikeBtn.classList.add("liked");

                if (localStorage.getItem(`disliked_${dbKey}`) === "true") {
                    currentActiveProject.dislikes = Math.max(0, (currentActiveProject.dislikes || 1) - 1);
                    localStorage.removeItem(`disliked_${dbKey}`);
                    modalDislikeBtn.classList.remove("disliked");
                    set(ref(db, `portfolio_projects/${dbKey}/dislikes`), currentActiveProject.dislikes);
                    dislikeCountSpan.textContent = currentActiveProject.dislikes;
                }
            }

            likeCountSpan.textContent = currentActiveProject.likes;
            set(ref(db, `portfolio_projects/${dbKey}/likes`), currentActiveProject.likes);
            renderProjects();
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
                pendingDislikeProjectKey = dbKey;
                dislikeReasonModal.classList.add("active");
            }
        }
    });

    function updateSlider() {
        mediaSlider.innerHTML = currentProjectMedia.map((media, i) => {
            const isActive = i === currentSlideIndex ? "active" : "";
            if (media.type === "video") {
                return `<div class="slide-item ${isActive}"><video src="${media.src}" autoplay loop muted playsinline></video></div>`;
            } else if (media.type === "iframe") {
                return `<div class="slide-item ${isActive}"><iframe src="${media.src}" style="width:100%;height:100%;border:none;"></iframe></div>`;
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
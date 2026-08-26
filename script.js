// ==========================================
// CONFIGURATION: ADD OR EDIT YOUR WEBSITES HERE
// ==========================================
const projects = [
    {
        name: "Yitz Pitz Cast",
        url: "https://rickdevr.github.io/Yitz-pitz-cast/",
        category: "Entertainment",
        description: "Catch up on episodes and audio content and listen to the latest streams.",
        tech: ["HTML", "CSS", "JS", "Audio API"],
        exploreTime: "Est. 3 min explore",
        likes: 12,
        media: [
            { type: "video", src: "POS.mp4" },
            { type: "video", src: "yitz-preview.mp4" }
        ]
    },
    {
        name: "Task challenge",
        url: "https://rickdevr.github.io/Task/",
        category: "Games",
        description: "Test your speed and complete interactive mini-challenges under tight time limits.",
        tech: ["HTML", "Tailwind", "JS"],
        exploreTime: "Est. 2 min explore",
        likes: 8,
        media: []
    },
    {
        name: "Secret coding language decode and Ecode",
        url: "https://rickdevr.github.io/Secretcoder/",
        category: "Tools",
        description: "Encrypt and decrypt hidden messages using a secure custom secret cipher.",
        tech: ["JavaScript", "Crypto"],
        exploreTime: "Est. 1 min explore",
        likes: 15,
        media: []
    },
    {
        name: "Test your friends trust level",
        url: "https://rickdevr.github.io/Test-trust-level/",
        category: "Projects",
        description: "In this website you can see the trust level between you and your friend, including love levels and fun features.",
        tech: ["HTML", "CSS", "JS"],
        exploreTime: "Est. 2 min explore",
        likes: 19,
        media: []
    },
    {
        name: "Satisfying squishy sound",
        url: "https://rickdevr.github.io/squishy/",
        category: "Projects",
        description: "Relaxing interactive audio-visual toy featuring satisfying squishy physics.",
        tech: ["HTML", "Canvas", "Audio"],
        exploreTime: "Est. 1 min explore",
        likes: 24,
        media: [
            { type: "image", src: "Squishy.png" }
        ]
    },
    {
        name: "Duck clicker",
        url: "https://rickdevr.github.io/Duck-clicker/",
        category: "Games",
        description: "A fun, addictive clicker game featuring lovable ducks, upgrades, and rewards.",
        tech: ["HTML", "JS", "LocalStorage"],
        exploreTime: "Est. 4 min explore",
        likes: 31,
        media: []
    },
    {
        name: "If you wanna learn how to type on keyboard Faster and without looking then this website's for you",
        url: "https://rickdevr.github.io/Learn-keyboard-typing/",
        category: "Tools",
        description: "This website teaches you how to learn typing without looking on your keyboard faster and easier.",
        tech: ["HTML", "CSS", "DOM Events"],
        exploreTime: "Est. 3 min explore",
        likes: 22,
        media: [
            { type: "image", src: "Key.png" }
        ]
    },
    {
        name: "DJ Bored",
        url: "https://rickdevr.github.io/DJ-board-today-s-Tuesday/",
        category: "Tools",
        description: "Here you could remix Audios by using a DJ board.",
        tech: ["HTML", "JS", "Audio"],
        exploreTime: "Est. 4 min explore",
        likes: 500000000,
        media: []
    }
];

// ==========================================
// APP LOGIC & FEATURES IMPLEMENTATION
// ==========================================
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
    const likeCountSpan = document.getElementById("likeCount");
    const liveStatusBadge = document.getElementById("liveStatusBadge");
    
    const mediaSlider = document.getElementById("mediaSlider");
    const sliderDots = document.getElementById("sliderDots");
    const prevSlideBtn = document.getElementById("prevSlide");
    const nextSlideBtn = document.getElementById("nextSlide");

    let currentSlideIndex = 0;
    let currentProjectMedia = [];
    let slideInterval = null;
    let activeCategory = "All";
    let searchQuery = "";
    let currentActiveProject = null;

    projects.forEach((p, i) => {
        const savedLikes = localStorage.getItem(`project_likes_${i}`);
        if (savedLikes !== null) p.likes = parseInt(savedLikes);
    });

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("light-mode")) {
            themeIcon.className = "fa-solid fa-sun";
        } else {
            themeIcon.className = "fa-solid fa-moon";
        }
    });

    const categories = ["All", ...new Set(projects.map(p => p.category))];
    filterBar.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join("");

    footerStats.textContent = `Total Projects: ${projects.length} | Active Categories: ${categories.length - 1}`;

    function renderProjects() {
        let filtered = projects.filter(p => {
            const matchesCat = activeCategory === "All" || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery) || p.tech.some(t => t.toLowerCase().includes(searchQuery));
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

        grid.innerHTML = filtered.map((project, index) => {
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

            return `
                <div class="project-card" data-index="${projects.indexOf(project)}" style="animation-delay: ${index * 0.05}s">
                    <div class="card-media-wrapper">
                        ${previewEl}
                    </div>
                    <div class="card-content">
                        <div class="card-top-row">
                            <span class="card-tag">${project.category}</span>
                            <div class="card-tech-pills">${techPillsHtml}</div>
                        </div>
                        <h3 class="card-title">${project.name}</h3>
                        <p class="card-desc">${project.description}</p>
                    </div>
                </div>
            `;
        }).join("");

        document.querySelectorAll(".project-card").forEach(card => {
            card.addEventListener("click", () => {
                const projectIndex = card.getAttribute("data-index");
                openModal(projects[projectIndex]);
            });
        });
    }

    renderProjects();

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

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        if (e.key === "Escape") closeModal();
        if (modal.classList.contains("active")) {
            if (e.key === "ArrowRight") { nextSlide(); resetAutoSlide(); }
            if (e.key === "ArrowLeft") { prevSlide(); resetAutoSlide(); }
        }
    });

    function openModal(project) {
        currentActiveProject = project;
        modalTitle.textContent = project.name;
        modalCategory.textContent = project.category;
        modalDescription.textContent = project.description;
        modalVisitBtn.href = project.url;
        modalExploreTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${project.exploreTime || 'Est. 2 min explore'}`;
        likeCountSpan.textContent = project.likes;

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

    function closeModal() {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
        stopAutoSlide();
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    modalCopyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(modalVisitBtn.href);
        const originalText = modalCopyBtn.innerHTML;
        modalCopyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => { modalCopyBtn.innerHTML = originalText; }, 2000);
    });

    modalLikeBtn.addEventListener("click", () => {
        if (currentActiveProject) {
            currentActiveProject.likes++;
            likeCountSpan.textContent = currentActiveProject.likes;
            const originalIndex = projects.indexOf(currentActiveProject);
            localStorage.setItem(`project_likes_${originalIndex}`, currentActiveProject.likes);
            
            modalLikeBtn.style.transform = "scale(1.15)";
            setTimeout(() => { modalLikeBtn.style.transform = "scale(1)"; }, 200);
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
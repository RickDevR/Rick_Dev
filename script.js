// ==========================================
// CONFIGURATION: ADD OR EDIT YOUR WEBSITES HERE
// ==========================================
const projects = [
    {
        name: "Yitz Pitz Cast",
        url: "https://rickdevr.github.io/Yitz-pitz-cast/",
        category: "Entertainment",
        description: "Catch up on episodes and audio content and listen to the latest streams.",
        media: [
            { type: "video", src: "POS.mp4" }
        ]
    },
    {
        name: "Task challenge",
        url: "https://rickdevr.github.io/Task/",
        category: "Games",
        description: "Test your speed and complete interactive mini-challenges under tight time limits.",
        media: [
            { type: "image", src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    {
        name: "Secret coding language decode and Ecode",
        url: "https://rickdevr.github.io/Secretcoder/",
        category: "Tools",
        description: "Encrypt and decrypt hidden messages using a secure custom secret cipher.",
        media: [
            { type: "image", src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    {
        name: " Test your friends trust level add more",
        url: "https://rickdevr.github.io/Test-trust-level/",
        category: "Projects",
        description: " In this website you can see the trough level of you and your friend and more other stuff this sea trust level love level",
        media: [
            { type: "image", src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    {
        name: "Satisfying squishy sound",
        url: "https://rickdevr.github.io/squishy/",
        category: "Projects",
        description: "Relaxing interactive audio-visual toy featuring satisfying squishy physics.",
        media: [
            { type: "image", src: "Squishy.png" }
        ]
    },
    {
        name: "Duck clicker",
        url: "https://rickdevr.github.io/Duck-clicker/",
        category: "Games",
        description: "A fun, addictive clicker game featuring lovable ducks, upgrades, and rewards.",
        media: [
            { type: "image", src: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    {
        name: "If you wanna learn how to type on keyboard Faster and without looking then this website's for you",
        url: "https://rickdevr.github.io/Learn-keyboard-typing/",
        category: "Tools",
        description: "This website teaches you how to learn typing without looking on your keyboard faster and easier",
        media: [
            { type: "image", src: "Key.png" }
        ]
    }
];

// ==========================================
// APP LOGIC & RENDERING
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("projectsGrid");
    const filterBar = document.getElementById("filterBar");
    
    const modal = document.getElementById("projectModal");
    const modalClose = document.getElementById("modalClose");
    const modalTitle = document.getElementById("modalTitle");
    const modalCategory = document.getElementById("modalCategory");
    const modalDescription = document.getElementById("modalDescription");
    const modalVisitBtn = document.getElementById("modalVisitBtn");
    
    const mediaSlider = document.getElementById("mediaSlider");
    const sliderDots = document.getElementById("sliderDots");
    const prevSlideBtn = document.getElementById("prevSlide");
    const nextSlideBtn = document.getElementById("nextSlide");

    let currentSlideIndex = 0;
    let currentProjectMedia = [];
    let slideInterval = null;

    // 1. Build Category Filter Buttons
    const categories = ["All", ...new Set(projects.map(p => p.category))];
    filterBar.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join("");

    // 2. Render Projects Grid
    function renderProjects(filter = "All") {
        const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter);
        
        grid.innerHTML = filtered.map((project, index) => {
            const firstMedia = project.media[0] || { type: "image", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" };
            
            let previewEl = '';
            if (firstMedia.type === "video") {
                previewEl = `<video src="${firstMedia.src}" class="card-media-preview" muted autoplay loop playsinline></video>`;
            } else {
                previewEl = `<img src="${firstMedia.src}" alt="${project.name}" class="card-media-preview" loading="lazy">`;
            }

            return `
                <div class="project-card" data-index="${projects.indexOf(project)}" style="animation-delay: ${index * 0.08}s">
                    ${previewEl}
                    <div class="card-content">
                        <span class="card-tag">${project.category}</span>
                        <h3 class="card-title">${project.name}</h3>
                        <p class="card-desc">${project.description}</p>
                    </div>
                </div>
            `;
        }).join("");

        // Attach Click Listeners to Cards
        document.querySelectorAll(".project-card").forEach(card => {
            card.addEventListener("click", () => {
                const projectIndex = card.getAttribute("data-index");
                openModal(projects[projectIndex]);
            });
        });
    }

    renderProjects();

    // Filter Button Click Events
    filterBar.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-btn")) {
            document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            renderProjects(e.target.getAttribute("data-category"));
        }
    });

    // 3. Modal & Slider Controls
    function openModal(project) {
        modalTitle.textContent = project.name;
        modalCategory.textContent = project.category;
        modalDescription.textContent = project.description;
        modalVisitBtn.href = project.url;
        
        currentProjectMedia = project.media;
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
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
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

        // Dot clicks
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
            slideInterval = setInterval(nextSlide, 4000);
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
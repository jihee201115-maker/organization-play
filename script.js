document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-links li');
    const pageTitle = document.getElementById('page-title');
    const profileContainer = document.getElementById('profile-container');
    const addProfileBtn = document.getElementById('add-profile-btn');
    const modal = document.getElementById('profile-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const profileForm = document.getElementById('profile-form');
    const modalTitle = document.getElementById('modal-title');

    // State
    let currentCategory = 'category1'; // Default category
    let profiles = JSON.parse(localStorage.getItem('joyn_profiles')) || [];

    // Category Info
    const categoryInfo = {
        'category1': { title: '조직원 프로필 관리', placeholder: '조직원의 정보를 입력하세요.' },
        'category2': { title: '외부인 프로필 관리', placeholder: '외부 관계자의 정보를 입력하세요.' }
    };

    // Initialize
    renderProfiles();

    // Event Listeners
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked
            link.classList.add('active');
            
            // Update current category
            currentCategory = link.dataset.tab;
            
            // Update Header
            pageTitle.textContent = categoryInfo[currentCategory].title;
            
            // Re-render
            renderProfiles();
        });
    });

    addProfileBtn.addEventListener('click', () => {
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile();
    });

    // Functions
    function renderProfiles() {
        profileContainer.innerHTML = '';
        
        const filteredProfiles = profiles.filter(p => p.category === currentCategory);

        if (filteredProfiles.length === 0) {
            profileContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem;">
                    <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>등록된 프로필이 없습니다.</p>
                </div>
            `;
            return;
        }

        filteredProfiles.forEach(profile => {
            const card = document.createElement('div');
            card.className = 'profile-card';
            card.innerHTML = `
                <div class="card-header">
                    <div class="profile-img-container">
                        ${profile.image ? `<img src="${profile.image}" alt="${profile.name}">` : `<div class="profile-img-placeholder"><i class="fa-solid fa-user"></i></div>`}
                    </div>
                    <div class="card-info">
                        <h3>${profile.name}</h3>
                        <div class="card-role">${profile.role}</div>
                    </div>
                </div>
                <div class="card-desc">${profile.description}</div>
                <div class="card-actions">
                    <button class="icon-btn edit-btn" onclick="editProfile('${profile.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="icon-btn delete-btn" onclick="deleteProfile('${profile.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            profileContainer.appendChild(card);
        });
    }

    // Expose functions to window for onclick events
    window.editProfile = (id) => {
        const profile = profiles.find(p => p.id === id);
        if (profile) {
            openModal(profile);
        }
    };

    window.deleteProfile = (id) => {
        if (confirm('정말로 이 프로필을 삭제하시겠습니까?')) {
            profiles = profiles.filter(p => p.id !== id);
            saveToLocalStorage();
            renderProfiles();
        }
    };

    function openModal(profile = null) {
        modal.classList.add('active');
        if (profile) { // Edit mode
            modalTitle.textContent = '프로필 수정';
            document.getElementById('profile-id').value = profile.id;
            document.getElementById('profile-name').value = profile.name;
            document.getElementById('profile-role').value = profile.role;
            document.getElementById('profile-desc').value = profile.description;
            document.getElementById('profile-image').value = profile.image || '';
            document.getElementById('profile-category').value = profile.category;
        } else { // Create mode
            modalTitle.textContent = '프로필 추가';
            profileForm.reset();
            document.getElementById('profile-id').value = '';
            document.getElementById('profile-category').value = currentCategory;
        }
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    function saveProfile() {
        const id = document.getElementById('profile-id').value;
        const name = document.getElementById('profile-name').value;
        const role = document.getElementById('profile-role').value;
        const description = document.getElementById('profile-desc').value;
        const image = document.getElementById('profile-image').value;
        const category = document.getElementById('profile-category').value;

        if (id) { // Update existing
            const index = profiles.findIndex(p => p.id === id);
            if (index !== -1) {
                profiles[index] = { ...profiles[index], name, role, description, image, category };
            }
        } else { // Create new
            const newProfile = {
                id: Date.now().toString(),
                name,
                role,
                description,
                image,
                category
            };
            profiles.push(newProfile);
        }

        saveToLocalStorage();
        renderProfiles();
        closeModal();
    }

    function saveToLocalStorage() {
        localStorage.setItem('joyn_profiles', JSON.stringify(profiles));
    }
});

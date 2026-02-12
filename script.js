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
    let currentRelated = []; // Array to store related characters for current modal

    // Category Info
    const categoryInfo = {
        'category1': { title: '블랙리프 프로필 관리', placeholder: '블랙리프 멤버의 정보를 입력하세요.' },
        'category2': { title: '그랜드 프로필 관리', placeholder: '그랜드 멤버의 정보를 입력하세요.' }
    };

    // Initialize
    // document.body.setAttribute('data-theme', 'dark'); // Removed hardcoded default
    applyTheme(); // Use applyTheme to handle initial theme loading
    renderProfiles();

    // Expose renderProfiles to window for auth.js
    window.renderProfiles = renderProfiles;

    // Event Listeners
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked
            link.classList.add('active');

            // Update current category
            currentCategory = link.dataset.tab;

            // Update theme based on category
            applyTheme();

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

    // Related Characters Handler
    const addRelBtn = document.getElementById('add-rel-btn');
    const relNameInput = document.getElementById('rel-name');
    const relDescInput = document.getElementById('rel-desc');
    const relatedList = document.getElementById('related-list');

    addRelBtn.addEventListener('click', () => {
        const name = relNameInput.value.trim();
        const desc = relDescInput.value.trim();

        if (name) {
            currentRelated.push({ name, desc });
            renderRelatedList();
            relNameInput.value = '';
            relDescInput.value = '';
            relNameInput.focus();
        }
    });

    function renderRelatedList() {
        relatedList.innerHTML = '';
        currentRelated.forEach((rel, index) => {
            const item = document.createElement('div');
            item.className = 'rel-tag';
            item.style.cssText = 'background: var(--input-bg); padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--glass-border); color: var(--text-primary);';
            item.innerHTML = `
                <span><strong>${rel.name}</strong>${rel.desc ? ` (${rel.desc})` : ''}</span>
                <i class="fa-solid fa-times" onclick="removeRelated(${index})" style="cursor: pointer; color: var(--text-secondary);"></i>
            `;
            relatedList.appendChild(item);
        });
    }

    window.removeRelated = (index) => {
        currentRelated.splice(index, 1);
        renderRelatedList();
    };

    // File Upload Handler
    const fileInput = document.getElementById('profile-image-file');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = imagePreview.querySelector('img');
    const fileNameDisplay = document.getElementById('file-name');
    const hiddenImageInput = document.getElementById('profile-image');

    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024 * 3) { // 3MB Text
                alert('이미지 크기는 3MB 이하여야 합니다.');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const base64String = event.target.result;
                previewImg.src = base64String;
                imagePreview.style.display = 'block';
                hiddenImageInput.value = base64String;
                fileNameDisplay.textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
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

            // Check if user is logged in via auth.js
            const isLoggedIn = window.currentUser !== null && window.currentUser !== undefined;
            const actionsDisplay = isLoggedIn ? 'flex' : 'none';

            card.innerHTML = `
                <div class="card-header" onclick="toggleCard('${profile.id}')" style="cursor: pointer; transition: background 0.2s;">
                    <div class="profile-img-container">
                        ${profile.image ? `<img src="${profile.image}" alt="${profile.name}">` : `<div class="profile-img-placeholder"><i class="fa-solid fa-user"></i></div>`}
                    </div>
                    <div class="card-info">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <h3>${profile.name}</h3>
                            <i id="icon-${profile.id}" class="fa-solid fa-chevron-down" style="font-size: 0.8rem; color: var(--text-secondary); transition: transform 0.3s;"></i>
                        </div>
                        <div class="card-role">${profile.role}</div>
                    </div>
                </div>

                <div id="content-${profile.id}" class="card-expandable" style="display: none; padding-top: 1rem; border-top: 1px solid var(--glass-border); margin-top: 1rem;">
                    
                    <!-- Design Layout Implementation -->
                    <div class="profile-design-layout" style="font-family: 'Noto Sans KR', sans-serif;">
                        
                        <!-- 1. Header Section -->
                        <div style="margin-bottom: 2rem;">
                            <div style="display: flex; align-items: flex-end; gap: 1rem; margin-bottom: 0.5rem;">
                                <h1 style="font-size: 2.5rem; font-weight: 900; color: var(--accent-color); line-height: 1; margin: 0; text-transform: uppercase;">${profile.name}</h1>
                                <span style="background: var(--accent-color); color: #fff; padding: 0.2rem 0.6rem; font-size: 0.9rem; font-weight: bold;">${profile.catchphrase || 'CATCHPHRASE'}</span>
                            </div>
                            
                            <!-- Quote Section -->
                            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                                <i class="fa-solid fa-quote-left" style="font-size: 3rem; color: var(--accent-color);"></i>
                                <div>
                                    <p style="font-size: 1.1rem; font-style: italic; color: var(--text-primary); margin: 0; line-height: 1.6;">
                                        ${profile.quote || '한마디가 들어갑니다.<br>두 줄 까지 적을 수 있지롱.'}
                                    </p>
                                    <div style="border-bottom: 1px dashed var(--accent-color); margin-top: 0.5rem; width: 100%;"></div>
                                    <div style="border-bottom: 1px dashed var(--accent-color); margin-top: 0.3rem; width: 100%;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- 2. Info Table -->
                        <div class="info-table" style="border: 2px solid var(--text-primary); background: var(--bg-color);">
                            
                            <!-- Header Row -->
                            <div style="background: var(--accent-color); color: #fff; padding: 0.5rem; font-weight: bold; border-bottom: 1px solid var(--text-primary);">캐릭터 정보</div>
                            
                            <!-- Name Row -->
                            <div style="display: grid; grid-template-columns: 120px 1fr; border-bottom: 1px solid var(--text-primary);">
                                <div style="background: var(--sidebar-bg); padding: 0.5rem; font-weight: bold; border-right: 1px solid var(--text-primary); display: flex; align-items: center; justify-content: center;">캐릭터 이름</div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
                                    <div style="padding: 0.5rem; text-align: center; border-right: 1px solid var(--text-primary); color: var(--accent-color); font-weight: bold;">${profile.name}</div>
                                    <div style="padding: 0.5rem; text-align: center; border-right: 1px solid var(--text-primary); color: var(--text-secondary);">${profile.name} (Eng)</div> <!-- Placeholder -->
                                    <div style="padding: 0.5rem; text-align: center; color: var(--text-secondary);">${profile.name} (Jpn)</div> <!-- Placeholder -->
                                </div>
                            </div>

                            <!-- Basic Info Header -->
                            <div style="background: var(--accent-color); color: #fff; padding: 0.5rem; font-weight: bold; border-bottom: 1px solid var(--text-primary);">기본 정보</div>

                            <!-- Basic Info Grid -->
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid var(--text-primary);">
                                <!-- Row 1 -->
                                <div style="display: flex; border-right: 1px solid var(--text-primary); border-bottom: 1px dashed var(--text-secondary);">
                                    <div style="width: 60px; background: var(--sidebar-bg); padding: 0.5rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">출신</div>
                                    <div style="flex: 1; padding: 0.5rem; text-align: center;">${profile.origin || '-'}</div>
                                </div>
                                <div style="display: flex; border-right: 1px solid var(--text-primary); border-bottom: 1px dashed var(--text-secondary);">
                                    <div style="width: 60px; background: var(--sidebar-bg); padding: 0.5rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">나이</div>
                                    <div style="flex: 1; padding: 0.5rem; text-align: center;">${profile.age || '-'}</div>
                                </div>
                                <div style="display: flex; border-bottom: 1px dashed var(--text-secondary);">
                                    <div style="width: 60px; background: var(--sidebar-bg); padding: 0.5rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">신장</div>
                                    <div style="flex: 1; padding: 0.5rem; text-align: center;">${profile.height || '-'}</div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid var(--text-primary);">
                                <!-- Row 2 -->
                                <div style="display: flex; border-right: 1px solid var(--text-primary);">
                                    <div style="width: 60px; background: var(--sidebar-bg); padding: 0.5rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">생일</div>
                                    <div style="flex: 1; padding: 0.5rem; text-align: center;">${profile.birthday || '-'}</div>
                                </div>
                                <div style="display: flex; border-right: 1px solid var(--text-primary);">
                                    <div style="width: 60px; background: var(--sidebar-bg); padding: 0.5rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">소속</div>
                                    <div style="flex: 1; padding: 0.5rem; text-align: center;">${profile.category === 'category1' ? '블랙리프' : '그랜드'}</div>
                                </div>
                                <div style="display: flex;">
                                    <div style="width: 60px; background: var(--sidebar-bg); padding: 0.5rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">체중</div>
                                    <div style="flex: 1; padding: 0.5rem; text-align: center;">${profile.weight || '-'}</div>
                                </div>
                            </div>

                            <!-- Appearance Header -->
                            <div style="background: var(--accent-color); color: #fff; padding: 0.5rem; font-weight: bold; border-bottom: 1px solid var(--text-primary);">외관 특징 / 설명</div>
                            <div style="padding: 1rem; border-bottom: 1px solid var(--text-primary); line-height: 1.6;">
                                ${profile.description ? profile.description.replace(/\n/g, '<br>') : '-'}
                            </div>

                            <!-- Personality Header -->
                            <div style="background: var(--accent-color); color: #fff; padding: 0.5rem; font-weight: bold; border-bottom: 1px solid var(--text-primary);">성격</div>
                            <div style="border-bottom: 1px solid var(--text-primary);">
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; background: var(--sidebar-bg); border-bottom: 1px dashed var(--text-secondary);">
                                    ${profile.personality ? profile.personality.split(',').map(p => `<div style="padding: 0.5rem; border-right: 1px dashed var(--text-secondary);">${p.trim()}</div>`).join('') : '<div style="padding: 0.5rem;">Unknown</div>'}
                                </div>
                                <div style="padding: 1rem; line-height: 1.6;">
                                    ${profile.story ? `<strong>요약:</strong> ${profile.story.substring(0, 100)}... (더보기)` : '성격에 대한 요약 설명이 없습니다.'}
                                </div>
                            </div>

                            <!-- Likes/Dislikes -->
                            <div style="display: grid; grid-template-columns: 100px 1fr; border-bottom: 1px solid var(--text-primary);">
                                <div style="background: var(--sidebar-bg); padding: 0.5rem; text-align: center; font-weight: bold; border-right: 1px solid var(--text-primary); display: flex; align-items: center; justify-content: center;">좋아하는 것</div>
                                <div style="padding: 0.5rem; display: flex; align-items: center;">${profile.likes || '-'}</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 100px 1fr;">
                                <div style="background: var(--sidebar-bg); padding: 0.5rem; text-align: center; font-weight: bold; border-right: 1px solid var(--text-primary); display: flex; align-items: center; justify-content: center;">싫어하는 것</div>
                                <div style="padding: 0.5rem; display: flex; align-items: center;">${profile.dislikes || '-'}</div>
                            </div>

                        </div>

                        <!-- Story Full -->
                        ${profile.story ? `
                        <div style="margin-top: 2rem;">
                            <h3 style="color: var(--accent-color); border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">서사 (STORY)</h3>
                            <div style="line-height: 1.8; color: var(--text-primary); white-space: pre-wrap;">${profile.story}</div>
                        </div>` : ''}

                         <!-- Related Characters -->
                        ${profile.related && profile.related.length > 0 ? `
                        <div style="margin-top: 2rem;">
                            <h3 style="color: var(--accent-color); border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">관련 인물 (RELATIONSHIPS)</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                                ${profile.related.map(r => `
                                    <div style="border: 1px solid var(--glass-border); padding: 1rem; border-radius: 8px; background: var(--sidebar-bg);">
                                        <strong style="color: var(--accent-color); font-size: 1.1rem;">${r.name}</strong>
                                        <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">${r.desc}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>` : ''}

                    </div>

                    <div class="card-actions" style="display: ${actionsDisplay}; margin-top: 2rem; justify-content: flex-end;">
                        <button class="icon-btn edit-btn" onclick="editProfile('${profile.id}')" title="수정">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="icon-btn delete-btn" onclick="deleteProfile('${profile.id}')" title="삭제">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            profileContainer.appendChild(card);
        });
    }

    // Expose functions to window for onclick events
    window.toggleCard = (id) => {
        const content = document.getElementById(`content-${id}`);
        const icon = document.getElementById(`icon-${id}`);

        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.style.transform = 'rotate(180deg)';
        } else {
            content.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
        }
    };
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
        // Check authentication before opening modal
        if (!profile && window.checkAuth && !window.checkAuth()) {
            return;
        }


        // Reset file upload UI
        document.getElementById('profile-image-file').value = '';
        document.getElementById('file-name').textContent = '선택된 파일 없음';

        modal.classList.add('active');
        if (profile) { // Edit mode
            modalTitle.textContent = '프로필 수정';
            document.getElementById('profile-id').value = profile.id;
            document.getElementById('profile-name').value = profile.name;
            document.getElementById('profile-role').value = profile.role;
            document.getElementById('profile-desc').value = profile.description;
            document.getElementById('profile-image').value = profile.image || '';
            document.getElementById('profile-category').value = profile.category;

            // New fields
            document.getElementById('profile-origin').value = profile.origin || '';
            document.getElementById('profile-personality').value = profile.personality || '';
            document.getElementById('profile-likes').value = profile.likes || '';
            document.getElementById('profile-dislikes').value = profile.dislikes || '';

            document.getElementById('profile-catchphrase').value = profile.catchphrase || '';
            document.getElementById('profile-quote').value = profile.quote || '';

            document.getElementById('profile-age').value = profile.age || '';
            document.getElementById('profile-birthday').value = profile.birthday || '';
            document.getElementById('profile-height').value = profile.height || '';
            document.getElementById('profile-weight').value = profile.weight || '';
            document.getElementById('profile-physique').value = profile.physique || '';

            document.getElementById('profile-story').value = profile.story || '';

            // Related Characters
            currentRelated = profile.related ? [...profile.related] : [];
            renderRelatedList();

            // Update preview if image exists
            if (profile.image) {
                document.getElementById('image-preview').style.display = 'block';
                document.getElementById('image-preview').querySelector('img').src = profile.image;
            } else {
                document.getElementById('image-preview').style.display = 'none';
            }

        } else { // Create mode
            modalTitle.textContent = '프로필 추가';
            profileForm.reset();
            document.getElementById('profile-id').value = '';
            document.getElementById('profile-category').value = currentCategory;
            document.getElementById('image-preview').style.display = 'none';

            currentRelated = [];
            renderRelatedList();
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

        // New fields
        const origin = document.getElementById('profile-origin').value;
        const personality = document.getElementById('profile-personality').value;
        const likes = document.getElementById('profile-likes').value;
        const dislikes = document.getElementById('profile-dislikes').value;

        const catchphrase = document.getElementById('profile-catchphrase').value;
        const quote = document.getElementById('profile-quote').value;

        const story = document.getElementById('profile-story').value;

        const age = document.getElementById('profile-age').value;
        const birthday = document.getElementById('profile-birthday').value;
        const height = document.getElementById('profile-height').value;
        const weight = document.getElementById('profile-weight').value;
        const physique = document.getElementById('profile-physique').value;

        const profileData = {
            id: id || Date.now().toString(),
            name,
            role,
            description,
            image,
            category,
            origin,
            personality,
            likes,
            dislikes,
            catchphrase,
            quote,
            age,
            birthday,
            height,
            weight,
            physique,
            story,
            related: currentRelated
        };

        if (id) { // Update existing
            const index = profiles.findIndex(p => p.id === id);
            if (index !== -1) {
                profiles[index] = { ...profiles[index], ...profileData };
            }
        } else { // Create new
            profiles.push(profileData);
        }

        saveToLocalStorage();
        renderProfiles();
        closeModal();
    }

    function saveToLocalStorage() {
        localStorage.setItem('joyn_profiles', JSON.stringify(profiles));
    }

    // Theme Management
    function applyTheme() {
        const customThemes = JSON.parse(localStorage.getItem('joyn_themes')) || {};
        const themeSettings = customThemes[currentCategory];

        // Reset inline styles first
        document.body.style.removeProperty('--bg-color');
        document.body.style.removeProperty('--sidebar-bg');
        document.body.style.removeProperty('--accent-color');
        // Reset text color adjustments
        document.body.style.removeProperty('--text-primary');
        document.body.style.removeProperty('--text-secondary');

        // Apply base theme
        if (currentCategory === 'category1') { // BlackLeaf
            document.body.setAttribute('data-theme', 'dark');
        } else { // Grand
            document.body.setAttribute('data-theme', 'light');
        }

        // Apply custom settings if exists
        if (themeSettings) {
            if (themeSettings.bg) document.body.style.setProperty('--bg-color', themeSettings.bg);
            if (themeSettings.sidebar) document.body.style.setProperty('--sidebar-bg', themeSettings.sidebar);
            if (themeSettings.accent) document.body.style.setProperty('--accent-color', themeSettings.accent);
        }
    }

    const themeModal = document.getElementById('theme-modal');
    const themeBgInput = document.getElementById('theme-bg');
    const themeSidebarInput = document.getElementById('theme-sidebar');
    const themeAccentInput = document.getElementById('theme-accent');

    window.openThemeModal = () => {
        themeModal.classList.add('active');

        // Get current computed styles or saved styles
        const computedStyle = getComputedStyle(document.body);

        // Helper to rgb to hex
        const rgbToHex = (rgb) => {
            if (!rgb) return '#000000';
            if (rgb.startsWith('#')) return rgb;
            const rgbValues = rgb.match(/\d+/g);
            if (!rgbValues) return '#000000';
            return '#' + rgbValues.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
        };

        themeBgInput.value = rgbToHex(computedStyle.getPropertyValue('--bg-color').trim());
        themeSidebarInput.value = rgbToHex(computedStyle.getPropertyValue('--sidebar-bg').trim());
        themeAccentInput.value = rgbToHex(computedStyle.getPropertyValue('--accent-color').trim());
    };

    window.closeThemeModal = () => {
        themeModal.classList.remove('active');
        applyTheme(); // Revert unsaved changes
    };

    window.saveTheme = () => {
        const customThemes = JSON.parse(localStorage.getItem('joyn_themes')) || {};

        customThemes[currentCategory] = {
            bg: themeBgInput.value,
            sidebar: themeSidebarInput.value,
            accent: themeAccentInput.value
        };

        localStorage.setItem('joyn_themes', JSON.stringify(customThemes));
        themeModal.classList.remove('active');
        // Changes are already applied via listeners, just keep them
    };

    window.resetTheme = () => {
        const customThemes = JSON.parse(localStorage.getItem('joyn_themes')) || {};
        delete customThemes[currentCategory];
        localStorage.setItem('joyn_themes', JSON.stringify(customThemes));

        applyTheme();

        // Update inputs
        const computedStyle = getComputedStyle(document.body);
        // We need to wait for DOM update or just re-read? applyTheme removes inline styles so computed style is back to css defaults.
        setTimeout(() => {
            // ... helper rgbToHex ...
            const rgbToHex = (rgb) => {
                if (!rgb) return '#000000';
                if (rgb.startsWith('#')) return rgb;
                const rgbValues = rgb.match(/\d+/g);
                if (!rgbValues) return '#000000';
                return '#' + rgbValues.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
            };
            themeBgInput.value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--bg-color').trim());
            themeSidebarInput.value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--sidebar-bg').trim());
            themeAccentInput.value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--accent-color').trim());
        }, 50);
    };

    // Live Preview
    themeBgInput.addEventListener('input', (e) => {
        document.body.style.setProperty('--bg-color', e.target.value);
    });
    themeSidebarInput.addEventListener('input', (e) => {
        document.body.style.setProperty('--sidebar-bg', e.target.value);
    });
    themeAccentInput.addEventListener('input', (e) => {
        document.body.style.setProperty('--accent-color', e.target.value);
    });

});

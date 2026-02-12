document.addEventListener('DOMContentLoaded', () => {
    // 1. Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');

    if (!profileId) {
        window.location.href = 'main.html';
        return;
    }

    let currentProfile = null;
    let isLoaded = false;

    // 2. Load Data (Speed Optimized)
    // 💡 Try local first for instant view
    const localData = localStorage.getItem('joyn_profiles');
    if (localData) {
        const localProfiles = JSON.parse(localData);
        const cached = localProfiles.find(p => String(p.id) === String(profileId));
        if (cached) {
            currentProfile = cached;
            renderProfileDetail(cached);
            console.log('⚡ Cached profile loaded');
            isLoaded = true;
        }
    }

    // Now fetch from Server to ensure accuracy
    if (window.db) {
        window.db.collection('profiles').doc(profileId).get().then((doc) => {
            if (doc.exists) {
                currentProfile = doc.data();
                renderProfileDetail(currentProfile); // Overwrite/Refresh with server data
                isLoaded = true;
                console.log('🔄 Profile synchronized from server');
            } else if (!isLoaded) {
                handleNotFoundError();
            }
        }).catch((error) => {
            console.error('❌ Data load error:', error);
            if (!isLoaded) handleNotFoundError();
        });
    } else if (!isLoaded) {
        handleNotFoundError();
    }

    // Safety timeout
    setTimeout(() => {
        if (!isLoaded) handleNotFoundError();
    }, 5000);

    function handleNotFoundError() {
        const container = document.getElementById('profile-detail-view');
        if (!container) return;
        container.innerHTML = `
            <div style="text-align: center; padding: 5rem;">
                <h2 style="font-size: 2.5rem; color: var(--accent-color);">앗! 캐릭터를 찾을 수 없습니다.</h2>
                <p style="margin: 2rem 0; font-size: 1.2rem;">해당 캐릭터의 데이터가 존재하지 않거나, 서버 연결에 문제가 있습니다.</p>
                <a href="index.html" style="display: inline-block; padding: 1rem 2rem; background: var(--accent-color); color: white; border-radius: 50px; text-decoration: none; font-weight: bold;">메인 페이지로 돌아가기</a>
            </div>
        `;
    }

    function renderProfileDetail(profile) {
        const container = document.getElementById('profile-detail-view');
        if (!container) return;

        // 3. Set Theme
        if (profile.category === 'category1') {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
        }

        // Apply Individual Theme Colors if they exist, otherwise use Category Theme
        const customThemes = JSON.parse(localStorage.getItem('joyn_themes')) || {};
        const categoryTheme = customThemes[profile.category];

        const bg = profile.themeBg || (categoryTheme ? categoryTheme.bg : null);
        const sidebar = profile.themeSidebar || (categoryTheme ? categoryTheme.sidebar : null);
        const accent = profile.themeAccent || (categoryTheme ? categoryTheme.accent : null);

        if (bg) document.body.style.setProperty('--bg-color', bg);
        if (sidebar) document.body.style.setProperty('--sidebar-bg', sidebar);
        if (accent) {
            document.body.style.setProperty('--accent-color', accent);
            // Also update ambient glow color
            document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(accent));
        }

        // 4. Render Detail View
        // (container is already defined above)
        // Add Ambient Glows
        if (!document.querySelector('.ambient-glow')) {
            const glow1 = document.createElement('div');
            glow1.className = 'ambient-glow glow-1';
            const glow2 = document.createElement('div');
            glow2.className = 'ambient-glow glow-2';
            document.body.prepend(glow1, glow2);
        }

        // 4. Render Detail View
        container.innerHTML = `
        <div class="glass-card">
            <div class="detail-header">
                <div class="detail-img-wrapper">
                    <img src="${profile.image || 'https://via.placeholder.com/600x800'}" alt="${profile.name}" class="detail-img">
                    <div class="detail-img-overlay"></div>
                </div>
                
                <div class="header-content">
                    <div class="detail-name-row">
                        <h1 class="detail-name">${profile.name}</h1>
                        <span class="detail-role-badge">${profile.role}</span>
                    </div>
                    
                    <p class="catchphrase-text">
                        <i class="fa-solid fa-hashtag"></i> ${profile.catchphrase || 'CATCHPHRASE'}
                    </p>
                    
                    <div class="quote-box">
                        <i class="fa-solid fa-quote-right"></i>
                        <p class="quote-text">
                            "${profile.quote || '기록된 한마디가 없습니다.'}"
                        </p>
                    </div>
                </div>
            </div>

            <div class="section-title">Physical & Origin</div>
            <div class="info-grid">
                <div class="info-card">
                    <i class="fa-solid fa-earth-asia"></i>
                    <span class="label">출신</span>
                    <span class="value">${profile.origin || '미상'}</span>
                </div>
                <div class="info-card">
                    <i class="fa-solid fa-calendar-day"></i>
                    <span class="label">나이</span>
                    <span class="value">${profile.age || '미상'}</span>
                </div>
                <div class="info-card">
                    <i class="fa-solid fa-cake-candles"></i>
                    <span class="label">생일</span>
                    <span class="value">${profile.birthday || '미상'}</span>
                </div>
                <div class="info-card">
                    <i class="fa-solid fa-ruler-vertical"></i>
                    <span class="label">신장</span>
                    <span class="value">${profile.height || '-'}</span>
                </div>
                <div class="info-card">
                    <i class="fa-solid fa-weight-hanging"></i>
                    <span class="label">체중</span>
                    <span class="value">${profile.weight || '-'}</span>
                </div>
                <div class="info-card">
                    <i class="fa-solid fa-child"></i>
                    <span class="label">체격</span>
                    <span class="value">${profile.physique || '미상'}</span>
                </div>
            </div>

            <div class="section-title">Traits & Preferences</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <span class="info-card .label" style="display:block; margin-bottom: 1rem; color: var(--accent-color); font-weight: 700; font-size: 0.9rem;">
                        <i class="fa-solid fa-heart" style="display:inline; margin-right: 0.5rem;"></i> PERSONALITY
                    </span>
                    <div class="trait-pills">
                        ${profile.personality ? profile.personality.split(',').map(p => `<span class="trait-pill">${p.trim()}</span>`).join('') : '<span class="trait-pill">미상</span>'}
                    </div>
                </div>
                <div>
                    <span class="info-card .label" style="display:block; margin-bottom: 1rem; color: var(--accent-color); font-weight: 700; font-size: 0.9rem;">
                        <i class="fa-solid fa-fingerprint" style="display:inline; margin-right: 0.5rem;"></i> SPECIAL FEATURES
                    </span>
                    <p style="line-height: 1.6; color: var(--text-primary); font-size: 1.05rem;">
                        ${profile.description || '상세 특징이 없습니다.'}
                    </p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                <div class="info-card">
                    <span class="label">LIKES</span>
                    <span class="value" style="color: var(--accent-color);">${profile.likes || '-'}</span>
                </div>
                <div class="info-card">
                    <span class="label">DISLIKES</span>
                    <span class="value" style="color: #ef4444;">${profile.dislikes || '-'}</span>
                </div>
            </div>

            <div class="section-title">Character Story</div>
            <div class="story-container">
                <i class="fa-solid fa-book-open" style="position: absolute; top: 2rem; right: 2rem; font-size: 3rem; opacity: 0.05; color: var(--accent-color);"></i>
                ${profile.story || '기록된 서사가 없습니다.'}
            </div>

            ${profile.related && profile.related.length > 0 ? `
            <div class="section-title">Relationships</div>
            <div class="rel-grid">
                ${profile.related.map(r => `
                    <div class="rel-card">
                        <span class="rel-name">${r.name}</span>
                        <p class="rel-desc">${r.desc}</p>
                    </div>
                `).join('')}
            </div>` : ''}

            <div style="text-align: center; margin-top: 6rem;">
                <a href="main.html?category=${profile.category}" class="back-btn" style="position: static; display: inline-flex; padding: 1.2rem 3rem;">
                    목록으로 돌아가기
                </a>
            </div>
        </div>
    `;
        // 5. Theme Management (Detailed)
        const themeModal = document.getElementById('theme-modal');
        const themeBgInput = document.getElementById('theme-bg');
        const themeSidebarInput = document.getElementById('theme-sidebar');
        const themeAccentInput = document.getElementById('theme-accent');

        window.openThemeModal = () => {
            themeModal.classList.add('active');
            const computedStyle = getComputedStyle(document.body);
            const rgbToHex = (rgb) => {
                if (!rgb || rgb.startsWith('#')) return rgb || '#000000';
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
            location.reload(); // Revert unsaved preview
        };

        window.saveTheme = () => {
            const updatedData = {
                themeBg: themeBgInput.value,
                themeSidebar: themeSidebarInput.value,
                themeAccent: themeAccentInput.value
            };

            if (window.db) {
                const saveBtn = document.querySelector('#theme-modal .save-btn');
                saveBtn.disabled = true;
                saveBtn.textContent = '저장 중...';

                window.db.collection('profiles').doc(profile.id).update(updatedData)
                    .then(() => {
                        console.log('✅ Individual theme saved to server');
                        themeModal.classList.remove('active');
                        location.reload();
                    })
                    .catch(err => {
                        console.error('Save error:', err);
                        alert('저장 실패: ' + err.message);
                        saveBtn.disabled = false;
                        saveBtn.textContent = '저장';
                    });
            } else {
                alert('서버 연결을 확인할 수 없습니다.');
            }
        };

        window.resetTheme = () => {
            if (confirm('이 캐릭터의 개별 테마를 삭제하고 조직 기본 테마로 되돌릴까요?')) {
                const resetData = {
                    themeBg: firebase.firestore.FieldValue.delete(),
                    themeSidebar: firebase.firestore.FieldValue.delete(),
                    themeAccent: firebase.firestore.FieldValue.delete()
                };

                window.db.collection('profiles').doc(profile.id).update(resetData)
                    .then(() => {
                        location.reload();
                    });
            }
        };

        // Live Preview
        themeBgInput.addEventListener('input', (e) => document.body.style.setProperty('--bg-color', e.target.value));
        themeSidebarInput.addEventListener('input', (e) => document.body.style.setProperty('--sidebar-bg', e.target.value));
        themeAccentInput.addEventListener('input', (e) => document.body.style.setProperty('--accent-color', e.target.value));
    }

    function hexToRgb(hex) {
        if (!hex) return "0, 0, 0";
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }
});

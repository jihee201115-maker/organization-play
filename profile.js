document.addEventListener('DOMContentLoaded', () => {
    // 1. Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');

    if (!profileId) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Load Data
    const profilesData = localStorage.getItem('joyn_profiles');
    if (!profilesData) {
        console.error('❌ 로컬 스토리지에 프로필 데이터가 없습니다.');
        window.location.href = 'index.html';
        return;
    }

    const profiles = JSON.parse(profilesData);
    // matching with loose equality and String conversion for safety
    const profile = profiles.find(p => String(p.id) === String(profileId));

    const container = document.getElementById('profile-detail-view');
    if (!container) {
        console.error('❌ 상세보기를 위한 컨테이너(#profile-detail-view)를 찾을 수 없습니다.');
        return;
    }

    if (!profile) {
        console.warn(`⚠️ ID [${profileId}] 에 해당하는 캐릭터를 찾을 수 없습니다.`);
        container.innerHTML = `
            <div style="text-align: center; padding: 5rem;">
                <h2>캐릭터를 찾을 수 없습니다.</h2>
                <a href="index.html" style="color: var(--accent-color);">목록으로 돌아가기</a>
            </div>
        `;
        return;
    }

    // 3. Set Theme
    const customThemes = JSON.parse(localStorage.getItem('joyn_themes')) || {};
    const themeSettings = customThemes[profile.category];
    if (profile.category === 'category1') {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
    }
    if (themeSettings) {
        if (themeSettings.bg) document.body.style.setProperty('--bg-color', themeSettings.bg);
        if (themeSettings.sidebar) document.body.style.setProperty('--sidebar-bg', themeSettings.sidebar);
        if (themeSettings.accent) document.body.style.setProperty('--accent-color', themeSettings.accent);
    }

    // 4. Render Detail View
    // (container is already defined above)
    container.innerHTML = `
        <div class="detail-header">
            <img src="${profile.image || 'https://via.placeholder.com/250'}" alt="${profile.name}" class="detail-img">
            <h1 style="font-size: 3.5rem; font-weight: 900; color: var(--accent-color); margin: 0; text-transform: uppercase; letter-spacing: -2px;">${profile.name}</h1>
            <span style="background: var(--accent-color); color: #fff; padding: 0.3rem 1rem; font-size: 1.1rem; font-weight: bold; margin-top: 1rem;">${profile.catchphrase || 'CATCHPHRASE'}</span>
            
            <div style="display: flex; gap: 1rem; margin-top: 2.5rem; justify-content: center; max-width: 600px;">
                <i class="fa-solid fa-quote-left" style="font-size: 3rem; color: var(--accent-color); opacity: 0.5;"></i>
                <div>
                    <p style="font-size: 1.4rem; font-style: italic; color: var(--text-primary); margin: 0; line-height: 1.6;">
                        ${profile.quote || '한마디가 들어갑니다.'}
                    </p>
                    <div style="border-bottom: 2px dashed var(--accent-color); margin-top: 0.8rem; width: 100%;"></div>
                </div>
            </div>
        </div>

        <div class="page-section">
            <!-- Info Table (Design #2) -->
            <div style="border: 2px solid var(--text-primary); background: var(--bg-color); overflow: hidden; border-radius: 4px;">
                <div style="background: var(--accent-color); color: #fff; padding: 0.8rem 1.5rem; font-weight: bold; border-bottom: 2px solid var(--text-primary); font-size: 1.2rem;">CHARACTER PROFILE</div>
                
                <div style="display: grid; grid-template-columns: 180px 1fr; border-bottom: 1px solid var(--text-primary);">
                    <div style="background: var(--sidebar-bg); padding: 1rem; font-weight: bold; border-right: 1px solid var(--text-primary); display: flex; align-items: center; justify-content: center;">NAME</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
                        <div style="padding: 1rem; text-align: center; border-right: 1px solid var(--text-primary); color: var(--accent-color); font-weight: 900; font-size: 1.2rem;">${profile.name}</div>
                        <div style="padding: 1rem; text-align: center; border-right: 1px solid var(--text-primary); color: var(--text-secondary); opacity: 0.7;">${profile.name} (Eng)</div>
                        <div style="padding: 1rem; text-align: center; color: var(--text-secondary); opacity: 0.7;">${profile.name} (Jpn)</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid var(--text-primary);">
                    <div style="display: flex; border-right: 1px solid var(--text-primary);">
                        <div style="width: 80px; background: var(--sidebar-bg); padding: 1rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">출신</div>
                        <div style="flex: 1; padding: 1rem; text-align: center;">${profile.origin || '-'}</div>
                    </div>
                    <div style="display: flex; border-right: 1px solid var(--text-primary);">
                        <div style="width: 80px; background: var(--sidebar-bg); padding: 1rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">나이</div>
                        <div style="flex: 1; padding: 1rem; text-align: center;">${profile.age || '-'}</div>
                    </div>
                    <div style="display: flex;">
                        <div style="width: 80px; background: var(--sidebar-bg); padding: 1rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">신장</div>
                        <div style="flex: 1; padding: 1rem; text-align: center;">${profile.height || '-'}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 2px solid var(--text-primary);">
                    <div style="display: flex; border-right: 1px solid var(--text-primary);">
                        <div style="width: 80px; background: var(--sidebar-bg); padding: 1rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">생일</div>
                        <div style="flex: 1; padding: 1rem; text-align: center;">${profile.birthday || '-'}</div>
                    </div>
                    <div style="display: flex; border-right: 1px solid var(--text-primary);">
                        <div style="width: 80px; background: var(--sidebar-bg); padding: 1rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">소속</div>
                        <div style="flex: 1; padding: 1rem; text-align: center;">${profile.category === 'category1' ? '블랙리프' : '그랜드'}</div>
                    </div>
                    <div style="display: flex;">
                        <div style="width: 80px; background: var(--sidebar-bg); padding: 1rem; text-align: center; font-weight: bold; border-right: 1px dashed var(--text-secondary);">체중</div>
                        <div style="flex: 1; padding: 1rem; text-align: center;">${profile.weight || '-'}</div>
                    </div>
                </div>

                <div style="background: var(--accent-color); color: #fff; padding: 0.8rem 1.5rem; font-weight: bold; border-bottom: 2px solid var(--text-primary);">APPEARANCE & DESCRIPTION</div>
                <div style="padding: 2rem; border-bottom: 2px solid var(--text-primary); line-height: 1.8; font-size: 1.1rem; background: rgba(0,0,0,0.02);">
                    ${profile.description ? profile.description.replace(/\n/g, '<br>') : '설명이 없습니다.'}
                </div>

                <div style="background: var(--accent-color); color: #fff; padding: 0.8rem 1.5rem; font-weight: bold; border-bottom: 2px solid var(--text-primary);">PERSONALITY</div>
                <div style="border-bottom: 2px solid var(--text-primary);">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; background: var(--sidebar-bg); border-bottom: 1px dashed var(--text-secondary);">
                        ${profile.personality ? profile.personality.split(',').map(p => `<div style="padding: 1rem; border-right: 1px dashed var(--text-secondary); font-weight: 500;">${p.trim()}</div>`).join('') : '<div style="padding: 1rem;">-</div>'}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 180px 1fr; border-bottom: 1px solid var(--text-primary);">
                    <div style="background: var(--sidebar-bg); padding: 1rem; text-align: center; font-weight: bold; border-right: 1px solid var(--text-primary);">LIKES</div>
                    <div style="padding: 1rem; display: flex; align-items: center; color: var(--accent-color); font-weight: 500;">${profile.likes || '-'}</div>
                </div>
                <div style="display: grid; grid-template-columns: 180px 1fr;">
                    <div style="background: var(--sidebar-bg); padding: 1rem; text-align: center; font-weight: bold; border-right: 1px solid var(--text-primary);">DISLIKES</div>
                    <div style="padding: 1rem; display: flex; align-items: center; color: #ef4444; font-weight: 500;">${profile.dislikes || '-'}</div>
                </div>
            </div>
        </div>

        <div class="page-section">
            <h2 style="color: var(--accent-color); border-bottom: 4px solid var(--accent-color); padding-bottom: 0.5rem; margin-bottom: 2rem; font-size: 2rem;">STORY</h2>
            <div style="line-height: 2; color: var(--text-primary); white-space: pre-wrap; font-size: 1.15rem; background: var(--sidebar-bg); padding: 2.5rem; border-radius: 12px;">${profile.story || '나의 이야기가 아직 기록되지 않았습니다.'}</div>
        </div>

        ${profile.related && profile.related.length > 0 ? `
        <div class="page-section" style="margin-bottom: 5rem;">
            <h2 style="color: var(--accent-color); border-bottom: 4px solid var(--accent-color); padding-bottom: 0.5rem; margin-bottom: 2rem; font-size: 2rem;">RELATIONSHIPS</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                ${profile.related.map(r => `
                    <div style="border: 1px solid var(--glass-border); padding: 2rem; border-radius: 16px; background: var(--sidebar-bg); transition: var(--transition);">
                        <strong style="color: var(--accent-color); font-size: 1.3rem; display: block; margin-bottom: 0.8rem;">${r.name}</strong>
                        <p style="margin: 0; font-size: 1rem; line-height: 1.6; color: var(--text-secondary);">${r.desc}</p>
                    </div>
                `).join('')}
            </div>
        </div>` : ''}

        <div style="text-align: center; padding: 4rem 0;">
            <a href="index.html" style="padding: 1rem 3rem; background: var(--accent-color); color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.2rem; transition: var(--transition);">
                다른 캐릭터 더 보기
            </a>
        </div>
    `;
});

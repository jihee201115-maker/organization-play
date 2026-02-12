// 인증 관련 JavaScript
let currentUser = null;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 로그인 상태 확인
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            window.currentUser = user; // Expose to window for script.js
            updateUIForAuth(user);

            // Re-render profiles to show/hide action buttons
            if (window.renderProfiles) {
                window.renderProfiles();
            }
        });
    } else {
        console.error('❌ Firebase auth is not initialized');
    }
});

function updateUIForAuth(user) {
    const authSection = document.getElementById('auth-section');
    const addProfileBtn = document.getElementById('add-profile-btn');

    if (!authSection || !addProfileBtn) {
        console.warn('⚠️ Auth UI elements not found');
        return;
    }

    if (user) {
        // 로그인 상태
        const displayName = user.displayName || user.email.split('@')[0];
        authSection.innerHTML = `
            <div class="user-info">
                <span>안녕하세요, <strong>${displayName}</strong>님</span>
                <button onclick="logout()" class="logout-btn">로그아웃</button>
            </div>
        `;
        addProfileBtn.style.display = 'flex';
        // 편집/삭제 버튼 표시
        document.querySelectorAll('.card-actions').forEach(el => el.style.display = 'flex');
    } else {
        // 로그아웃 상태
        authSection.innerHTML = `
            <button onclick="showLoginModal()" class="login-btn">로그인 / 회원가입</button>
        `;
        addProfileBtn.style.display = 'none';
        // 편집/삭제 버튼 숨김
        document.querySelectorAll('.card-actions').forEach(el => el.style.display = 'none');
    }
}

// 로그인 모달 표시
function showLoginModal() {
    const modal = document.getElementById('auth-modal');
    // Clear inputs when opening
    document.getElementById('auth-name').value = '';
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    modal.classList.add('active');
}

// 로그인 모달 닫기
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('active');
}

// 회원가입
async function signup() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;

    if (!name) {
        showMessage('이름을 입력해주세요!', 'error');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 이름 저장 (updateProfile)
        await user.updateProfile({
            displayName: name
        });

        // 새로고침하여 UI 반영
        window.location.reload();

        closeAuthModal();
        showMessage(`환영합니다, ${name}님!`, 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// 로그인
async function login() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        closeAuthModal();
        showMessage('로그인되었습니다!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// 로그아웃
async function logout() {
    try {
        await auth.signOut();
        showMessage('로그아웃되었습니다.', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// 메시지 표시
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 로그인 확인 함수
function checkAuth() {
    if (!currentUser) {
        showMessage('로그인이 필요합니다.', 'error');
        showLoginModal();
        return false;
    }
    return true;
}

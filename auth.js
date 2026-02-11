// 인증 관련 JavaScript
let currentUser = null;

// 로그인 상태 확인
auth.onAuthStateChanged((user) => {
    currentUser = user;
    window.currentUser = user; // Expose to window for script.js
    updateUIForAuth(user);

    // Re-render profiles to show/hide action buttons
    if (window.renderProfiles) {
        window.renderProfiles();
    }
});

function updateUIForAuth(user) {
    const authSection = document.getElementById('auth-section');
    const addProfileBtn = document.getElementById('add-profile-btn');

    if (user) {
        // 로그인 상태
        authSection.innerHTML = `
            <div class="user-info">
                <span>${user.email}</span>
                <button onclick="logout()" class="logout-btn">로그아웃</button>
            </div>
        `;
        addProfileBtn.style.display = 'flex';
        // 편집/삭제 버튼 표시
        document.querySelectorAll('.card-actions').forEach(el => el.style.display = 'flex');
    } else {
        // 로그아웃 상태
        authSection.innerHTML = `
            <button onclick="showLoginModal()" class="login-btn">로그인</button>
        `;
        addProfileBtn.style.display = 'none';
        // 편집/삭제 버튼 숨김
        document.querySelectorAll('.card-actions').forEach(el => el.style.display = 'none');
    }
}

// 로그인 모달 표시
function showLoginModal() {
    const modal = document.getElementById('auth-modal');
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

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        closeAuthModal();
        showMessage('회원가입이 완료되었습니다!', 'success');
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

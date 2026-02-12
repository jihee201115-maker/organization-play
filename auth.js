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

    // Everyone can add/edit now, so keep these visible always
    addProfileBtn.style.display = 'flex';
    document.querySelectorAll('.card-actions').forEach(el => el.style.display = 'flex');

    if (user) {
        // 로그인 상태
        let displayName = user.displayName;
        if (!displayName) {
            displayName = user.email ? user.email.split('@')[0] : '사용자';
        }

        authSection.innerHTML = `
            <div class="user-info">
                <span>안녕하세요, <strong>${displayName}</strong>님</span>
                <button onclick="logout()" class="logout-btn">로그아웃</button>
            </div>
        `;
    } else {
        // 로그아웃 상태
        authSection.innerHTML = `
            <button onclick="showLoginModal()" class="login-btn">로그인 / 회원가입</button>
        `;
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

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('올바른 이메일 주소를 입력해주세요. (예: user@gmail.com)', 'error');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 이름 저장 (updateProfile)
        await user.updateProfile({
            displayName: name
        });

        // Firebase 사용자 정보 갱신
        await user.reload();

        // UI 즉시 업데이트 (새로고침 전에 사용자에게 피드백)
        closeAuthModal();
        showMessage(`환영합니다, ${name}님!`, 'success');

        // 잠시 후 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        handleAuthError(error);
    }
}

// 에러 처리 함수
function handleAuthError(error) {
    console.error(error);
    let message = error.message;

    // Firebase 에러 코드를 한국어로 변환
    if (error.code === 'auth/invalid-email') {
        message = '이메일 형식이 올바르지 않습니다.';
    } else if (error.code === 'auth/user-not-found') {
        message = '등록되지 않은 이메일입니다.';
    } else if (error.code === 'auth/wrong-password') {
        message = '비밀번호가 일치하지 않습니다.';
    } else if (error.code === 'auth/email-already-in-use') {
        message = '이미 가입된 이메일입니다.';
    } else if (error.code === 'auth/weak-password') {
        message = '비밀번호는 6자리 이상이어야 합니다.';
    }

    showMessage(message, 'error');
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
        handleAuthError(error);
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

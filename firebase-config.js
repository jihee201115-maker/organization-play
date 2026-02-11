// Firebase 설정 파일
// ⚠️ 중요: Firebase Console에서 프로젝트를 생성하고 아래 설정을 업데이트하세요
// 가이드: FIREBASE_SETUP.md 파일을 참고하세요
// https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "AIzaSyDEMO_KEY_REPLACE_WITH_YOUR_ACTUAL_KEY",
    authDomain: "organization-play.firebaseapp.com",
    projectId: "organization-play",
    storageBucket: "organization-play.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// Firebase 초기화
try {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Firebase 설정이 필요합니다. FIREBASE_SETUP.md 파일을 참고하여 Firebase 프로젝트를 생성하고 firebase-config.js 파일을 업데이트하세요.');
}


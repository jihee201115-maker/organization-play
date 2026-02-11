// Firebase 설정 파일
// Firebase Console에서 가져온 실제 설정
// https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "AIzaSyCDYgtRusiXOewvtOtY-XebQiYvJq_eAWc",
    authDomain: "organization-play.firebaseapp.com",
    projectId: "organization-play",
    storageBucket: "organization-play.firebasestorage.app",
    messagingSenderId: "600290268137",
    appId: "1:600290268137:web:8ed8382927c4a6c93df178",
    measurementId: "G-9HL9J5RFE6"
};

// Firebase 초기화
try {
    firebase.initializeApp(firebaseConfig);
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}


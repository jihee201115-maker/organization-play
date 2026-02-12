# Firebase 설정 가이드

## 1단계: Firebase 프로젝트 생성

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: "organization-play" (또는 원하는 이름)
4. Google 애널리틱스는 선택사항 (필요없으면 비활성화)
5. 프로젝트 생성 완료

## 2단계: 웹 앱 추가

1. 프로젝트 개요 페이지에서 웹 아이콘(</>) 클릭
2. 앱 닉네임: "Organization Play Site"
3. Firebase 호스팅 설정은 체크 안 함 (GitHub Pages 사용)
4. "앱 등록" 클릭

## 3단계: Firebase 설정 복사

웹 앱을 등록하면 Firebase SDK 설정 코드가 표시됩니다.
아래와 같은 형식의 코드를 복사하세요:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

이 설정을 `firebase-config.js` 파일에 붙여넣으세요.

## 4단계: Authentication 활성화

1. 왼쪽 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭 선택
4. "이메일/비밀번호" 클릭하여 활성화
5. "사용 설정" 토글을 켜고 "저장"

## 5단계: Firestore 설정 (선택사항)

현재는 localStorage를 사용하지만, 나중에 클라우드 저장소로 업그레이드하려면:

1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "테스트 모드에서 시작" 선택 (나중에 보안 규칙 설정 가능)
4. 위치 선택: asia-northeast3 (서울)
5. "사용 설정" 클릭

## 완료!

설정이 완료되면 사이트에서 회원가입/로그인이 가능합니다.

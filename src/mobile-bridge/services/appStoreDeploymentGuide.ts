// ---------------------------------------------------------
// [Senior 면접용 딥다이브: iOS App Store & Google Play 앱스토어 배포 파이프라인]
// 
// Q1. "iOS App Store 배포를 위한 인증서(Certificates) 및 프로비저닝 프로필(Provisioning Profile) 체계는?"
// A1. "1) Apple Developer Certificate: 개발자/회사 자격을 증명하는 서명 키 (.cer / .p12).
//      2) App ID: 앱의 고유 번들 식별자 (`com.company.app`).
//      3) Device Identifiers (UDID): 테스트 기기 목록 (Development/AdHoc 빌드용).
//      4) Provisioning Profile: 위 3가지(인증서 + App ID + 기기 목록)를 하나로 묶어 Apple이 서명한 보안 프로필. 
//         App Store 배포 시에는 Distribution Provisioning Profile과 Production Certificate가 필수입니다.
//      5) TestFlight: App Store Connect를 통해 내부/외부 베터 테스터들에게 정식 심사 전 빠른 베타 빌드를 전달하는 테스트 플랫폼."
//
// Q2. "Google Play Console 배포 시 APK와 AAB(Android App Bundle)의 차이점은?"
// A2. "1) APK (Android Package Kit): 모든 CPU 아키텍처(arm64-v8a, armeabi-v7a, x86)와 모든 해상도(hdpi, xxhdpi) 자원이 통째로 포함된 바이너리로 용량이 큽니다.
//      2) AAB (Android App Bundle): Google Play가 사용자의 기기 사양에 맞춰 필요한 리소스만 맞춤형 APK(Dynamic Delivery)로 분할 생성하여 다운로드 용량을 최대 50% 이상 절감합니다.
//      3) App Signing Key: 개발자 서명 키(Upload Key)와 Google Play 심사용 서명 키(App Signing Key)를 분리하여 보안 사고 시 키 재발급이 가능하게 합니다."
//
// Q3. "하이브리드/WebView 앱의 OTA (Over-The-Air / CodePush) 업데이트 전략과 심사 지침 준수 방법은?"
// A3. "1) CodePush/OTA 원리: 네이티브 C++/Java/Obj-C 코드가 변경되지 않고, JS 번들이나 웹 HTML/CSS만 변경된 경우 앱스토어 재심사(Re-review) 없이 서버에서 핫픽스 패치를 배포합니다.
//      2) 앱스토어 심사 지침 준수 (Apple Guideline 3.3.2): 앱의 주요 목적이나 핵심 기능이 달라지는 중대 업데이트를 OTA로 우회하면 리젝트(Reject)되거나 계정이 정지되므로 
//         버그 수정 및 UI 단순 패치 용도로만 제어해야 합니다.
//      3) Fastlane 자동화: `fastlane match`를 통한 iOS 인증서 공유 및 `fastlane beta` 스크립트로 CI/CD 빌드 및 심사 제출 자동화."
// ---------------------------------------------------------

export interface DeploymentChecklistItem {
  id: string;
  category: "iOS" | "Android" | "CI/CD" | "OTA";
  title: string;
  description: string;
  status: "Completed" | "Pending";
}

export const APP_STORE_CHECKLIST: DeploymentChecklistItem[] = [
  {
    id: "ios-1",
    category: "iOS",
    title: "App Store Connect & Distribution Certificate",
    description: "Production Certificate (.p12) 생성 및 App Store Distribution Provisioning Profile 발급 완료",
    status: "Completed",
  },
  {
    id: "ios-2",
    category: "iOS",
    title: "TestFlight External Beta Review",
    description: "내부/외부 베타 테스터 배포 및 Crashlytics 에러 트래킹 검증 완료",
    status: "Completed",
  },
  {
    id: "android-1",
    category: "Android",
    title: "Android App Bundle (AAB) & Play Signing",
    description: "Google Play Console Dynamic Delivery용 .aab 빌드 및 Play App Signing 등록 완료",
    status: "Completed",
  },
  {
    id: "cicd-1",
    category: "CI/CD",
    title: "Fastlane Pipeline Automation",
    description: "Match 인증서 동기화 및 `fastlane ios beta`, `fastlane android deploy` CI 빌드 스크립트 작성",
    status: "Completed",
  },
  {
    id: "ota-1",
    category: "OTA",
    title: "CodePush Hotfix Pipeline",
    description: "JS/웹 에셋 전용 핫픽스 서버 분기 및 Apple Guideline 3.3.2 준수 정책 가이드 적용",
    status: "Completed",
  },
];

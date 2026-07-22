import { useState } from "react";
import { webViewBridge } from "../mobile-bridge/services/webViewBridge";
import { APP_STORE_CHECKLIST } from "../mobile-bridge/services/appStoreDeploymentGuide";
import { NativeActionType } from "../mobile-bridge/model/bridgeTypes";

export function MobileBuildStudio() {
  const [bridgeResult, setBridgeResult] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"build" | "bridge" | "pwa" | "deploy">("bridge");

  const handleTestBridge = async (type: NativeActionType) => {
    setLoadingAction(type);
    try {
      const result = await webViewBridge.sendNativeRequest(type);
      setBridgeResult({ type, success: true, result });
    } catch (err: any) {
      setBridgeResult({ type, success: false, error: err.message });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 text-slate-100">
      {/* Studio Header */}
      <div className="flex flex-wrap justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <span>📱 Mobile & Build Architecture Studio</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              Vite / PWA / WebView / AppStore
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Vite 번들링 최적화, React Native WebView 양방향 브릿지 및 모바일 앱스토어 배포 파이프라인 실습 스튜디오
          </p>
        </div>

        {/* Studio Sub-Tabs */}
        <div className="flex bg-slate-900/90 p-1 rounded-lg border border-white/10 mt-2 sm:mt-0">
          {(["bridge", "build", "pwa", "deploy"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${
                selectedTab === tab
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "bridge" && "RN WebView Bridge"}
              {tab === "build" && "Vite/Webpack Build"}
              {tab === "pwa" && "PWA Offline Cache"}
              {tab === "deploy" && "App Store Deploy"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: WebView Bridge Simulator */}
      {selectedTab === "bridge" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-2xl flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base">Native Bridge Action Sender</h3>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                {webViewBridge.isWebView() ? "WebView Environment" : "Browser Mock Simulator"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              `window.ReactNativeWebView.postMessage()` 양방향 RPC 브릿지를 통해 네이티브 기기 기능을 비동기로 호출합니다.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleTestBridge("GET_DEVICE_INFO")}
                disabled={loadingAction !== null}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-left border border-white/10 transition flex flex-col justify-between h-20"
              >
                <span className="font-bold text-blue-400">📱 Device Info</span>
                <span className="text-[10px] text-slate-400">OS, App Version, ID</span>
              </button>
              <button
                onClick={() => handleTestBridge("GET_CURRENT_LOCATION")}
                disabled={loadingAction !== null}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-left border border-white/10 transition flex flex-col justify-between h-20"
              >
                <span className="font-bold text-emerald-400">📍 Native GPS Location</span>
                <span className="text-[10px] text-slate-400">Latitude / Longitude</span>
              </button>
              <button
                onClick={() => handleTestBridge("REQUEST_CAMERA")}
                disabled={loadingAction !== null}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-left border border-white/10 transition flex flex-col justify-between h-20"
              >
                <span className="font-bold text-amber-400">📷 Camera Access</span>
                <span className="text-[10px] text-slate-400">Capture Image Base64</span>
              </button>
              <button
                onClick={() => handleTestBridge("BIOMETRIC_AUTH")}
                disabled={loadingAction !== null}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-left border border-white/10 transition flex flex-col justify-between h-20"
              >
                <span className="font-bold text-purple-400">🔐 Biometric Auth</span>
                <span className="text-[10px] text-slate-400">FaceID / TouchID</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-white/10 font-mono text-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                <span className="text-slate-400 font-bold uppercase">Bridge JSON Response</span>
                <span className="text-[10px] text-slate-500">RPC Protocol Result</span>
              </div>
              {loadingAction ? (
                <div className="text-amber-400 animate-pulse py-8 text-center">
                  Executing Native Request: {loadingAction}...
                </div>
              ) : bridgeResult ? (
                <pre className="text-emerald-400 bg-slate-900 p-3 rounded-lg overflow-x-auto border border-emerald-500/20">
                  {JSON.stringify(bridgeResult, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-500 py-12 text-center">
                  왼쪽의 버튼을 눌러 네이티브 브릿지 통신 결과를 확인하세요.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vite vs Webpack Build */}
      {selectedTab === "build" && (
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white">⚡ Vite vs Webpack 빌드 최적화 분석</h3>
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/80 p-4 rounded-lg border border-white/10 space-y-2">
              <span className="font-bold text-blue-400 text-sm">ESM Dev Server</span>
              <p className="text-slate-300 leading-relaxed">
                Webpack과 달리 소스 전체를 번들링하지 않고, esbuild로 사전 번들링 후 On-Demand ESM 파싱으로 Dev Server 0.1초 실행.
              </p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-lg border border-white/10 space-y-2">
              <span className="font-bold text-emerald-400 text-sm">Rollup manualChunks</span>
              <p className="text-slate-300 leading-relaxed">
                `react-vendor`를 독립 청크로 분할하여 브라우저 HTTP 캐시 효율 극대화 및 FCP/LCP 로딩 시간 단축.
              </p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-lg border border-white/10 space-y-2">
              <span className="font-bold text-purple-400 text-sm">Tree Shaking</span>
              <p className="text-slate-300 leading-relaxed">
                `sideEffects: false`로 안 쓰는 모듈 자동 제거. CommonJS 대신 ES Modules(`import/export`) 준수 필수.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PWA Offline Cache */}
      {selectedTab === "pwa" && (
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white">🌐 PWA (Progressive Web App) 오프라인 캐싱 전략</h3>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/80 p-4 rounded-lg border border-white/10 space-y-2">
              <span className="font-bold text-amber-400 text-sm">Cache-First (Stale-While-Revalidate)</span>
              <p className="text-slate-300 leading-relaxed">
                정적 JS, CSS, 폰트, 이미지 에셋에 적용. 캐시에서 먼저 반환하여 오프라인 상태에서도 어플리케이션 즉시 구동.
              </p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-lg border border-white/10 space-y-2">
              <span className="font-bold text-rose-400 text-sm">Network-First (Fallback to Cache)</span>
              <p className="text-slate-300 leading-relaxed">
                결제 API, 실시간 유저 데이터에 적용. 항상 네트워크에서 최신 데이터를 받아오고 실패 시 마지막 캐시 복원.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: App Store Deploy */}
      {selectedTab === "deploy" && (
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">🚀 iOS App Store & Google Play 배포 파이프라인</h3>
            <span className="text-xs text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 font-mono">
              Fastlane & CodePush Checklist
            </span>
          </div>
          <div className="space-y-3">
            {APP_STORE_CHECKLIST.map((item) => (
              <div key={item.id} className="bg-slate-900/90 p-3.5 rounded-lg border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.category === "iOS" ? "bg-blue-500/20 text-blue-300" :
                      item.category === "Android" ? "bg-emerald-500/20 text-emerald-300" :
                      item.category === "CI/CD" ? "bg-purple-500/20 text-purple-300" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {item.category}
                    </span>
                    <span className="font-bold text-sm text-slate-200">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  ✓ {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

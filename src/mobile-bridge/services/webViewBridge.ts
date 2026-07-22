import { BridgeMessage, BridgeResponse, NativeActionType } from "../model/bridgeTypes";

// ---------------------------------------------------------
// [Senior 면접용 딥다이브: 모바일 웹, PWA & React Native WebView 하이브리드 아키텍처]
// 
// Q1. "React Native WebView와 Web 간 보안 및 타입 안전성을 확보한 브릿지(Bridge) 설계 방법은?"
// A1. "1) 단방향 postMessage의 비동기 호출 문제 해결:
//         - `window.ReactNativeWebView.postMessage(JSON.stringify(msg))` 방식은 기본적으로 비동기 이벤트 전달입니다.
//         - 웹에서 `const res = await callNative('REQUEST_CAMERA')`처럼 사용할 수 있도록 고유한 `id` (UUID/Timestamp)를 생성하고 
//           Map 객체(Pending Requests)에 Promise의 resolve/reject를 보관합니다.
//         - 네이티브(RN/iOS/Android)가 처리 후 `window.dispatchEvent(new CustomEvent('nativeMessage', { detail: response }))`를 주입하면 
//           해당 `id`를 찾아 Promise를 마저 resolve시키는 비동기 RPC(Remote Procedure Call) 패턴을 구축합니다.
//      2) 보안 처리:
//         - XSS 공격 방지를 위해 허용된 ActionType(White-list)만 수신하고, 메세지 payload 크기를 제한합니다."
//
// Q2. "모바일 웹 및 PWA(Progressive Web App) 오프라인 지원과 캐싱 전략(Cache Strategy)은?"
// A2. "1) Cache-First (Stale-While-Revalidate): 이미지, 폰트, 정적 JS/CSS 번들에 적용하여 네트워크가 끊겨도 오프라인 실행 가능.
//      2) Network-First (with Cache Fallback): 결제, 유저 실시간 데이터에 적용하여 네트워크 연결 시 항상 최신 상태 유지.
//      3) Web App Manifest (`manifest.json`): `standalone` 디스플레이 모드, 홈 화면에 추가(A2HS), 앱 아이콘 및 테마 색상 정의."
// ---------------------------------------------------------

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    webkit?: {
      messageHandlers?: {
        nativeBridge?: {
          postMessage: (message: any) => void;
        };
      };
    };
  }
}

export class MobileWebViewBridge {
  private pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void; timeout: ReturnType<typeof setTimeout> }>();

  constructor() {
    if (typeof window !== "undefined") {
      // 네이티브에서 주입하는 커스텀 이벤트 리스너 수신
      window.addEventListener("nativeMessage", this.handleNativeResponse as EventListener);
      // fallback message event
      window.addEventListener("message", this.handleWindowMessage);
    }
  }

  public isWebView(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.ReactNativeWebView || window.webkit?.messageHandlers?.nativeBridge);
  }

  public async sendNativeRequest<TData = any>(type: NativeActionType, payload?: any): Promise<TData> {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const message: BridgeMessage = { id, type, payload };

    return new Promise((resolve, reject) => {
      // 5초 타임아웃 처리
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Native Bridge Timeout for action: ${type}`));
        }
      }, 5000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      if (this.isWebView()) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        } else if (window.webkit?.messageHandlers?.nativeBridge) {
          window.webkit.messageHandlers.nativeBridge.postMessage(message);
        }
      } else {
        // 모의(Mock) 네이티브 응답 처리 (웹 브라우저 테스트용)
        setTimeout(() => this.mockNativeResponse(message), 300);
      }
    });
  }

  private handleNativeResponse = (event: CustomEvent<BridgeResponse>) => {
    const { id, success, data, error } = event.detail;
    const pending = this.pendingRequests.get(id);

    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(id);
      if (success) {
        pending.resolve(data);
      } else {
        pending.reject(new Error(error || "Native bridge error"));
      }
    }
  };

  private handleWindowMessage = (event: MessageEvent) => {
    try {
      const response: BridgeResponse = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (response && response.id && this.pendingRequests.has(response.id)) {
        const customEvent = new CustomEvent("nativeMessage", { detail: response });
        window.dispatchEvent(customEvent);
      }
    } catch {
      // Non-JSON messages ignore
    }
  };

  // 모의 네이티브 응답 핸들러 (브라우저 환경 시뮬레이터)
  private mockNativeResponse(msg: BridgeMessage) {
    let data: any = null;
    switch (msg.type) {
      case "GET_DEVICE_INFO":
        data = { platform: "iOS", appVersion: "2.4.0", osVersion: "17.4", deviceId: "iPhone-15-Pro-Sim" };
        break;
      case "GET_CURRENT_LOCATION":
        data = { latitude: 37.5665, longitude: 126.978, accuracy: 5 };
        break;
      case "REQUEST_CAMERA":
        data = { imageUri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" };
        break;
      case "BIOMETRIC_AUTH":
        data = { authenticated: true, method: "FaceID" };
        break;
      default:
        data = { status: "OK" };
    }

    const response: BridgeResponse = {
      id: msg.id,
      type: msg.type,
      success: true,
      data,
    };

    const customEvent = new CustomEvent("nativeMessage", { detail: response });
    window.dispatchEvent(customEvent);
  }
}

export const webViewBridge = new MobileWebViewBridge();

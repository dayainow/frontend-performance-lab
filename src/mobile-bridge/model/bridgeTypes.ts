export type NativeActionType = 
  | "GET_DEVICE_INFO"
  | "REQUEST_CAMERA"
  | "GET_CURRENT_LOCATION"
  | "BIOMETRIC_AUTH"
  | "STORE_SECURE_TOKEN"
  | "SHOW_NATIVE_TOAST";

export interface BridgeMessage<T = any> {
  id: string;
  type: NativeActionType;
  payload?: T;
}

export interface BridgeResponse<T = any> {
  id: string;
  type: NativeActionType;
  success: boolean;
  data?: T;
  error?: string;
}

export interface DeviceInfoPayload {
  platform: "iOS" | "Android" | "Web";
  appVersion: string;
  osVersion: string;
  deviceId: string;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
}

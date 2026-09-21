export type UserRole = 'admin' | 'workshop' | 'sales';

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface HurufTimbulInput {
  text: string;
  heightCm: number;
  widthCm?: number;
  depthCm: number; // tebal kaki (default 3-5cm)
  material: string; // 'stainless_304' | 'stainless_201' | 'galvanis' | 'akrilik'
  lighting: 'none' | 'backlight' | 'frontlit';
  floorLevel: number; // 1, 2, 3, 4+
  marginPercent: number; // default 35-40%
}

export interface NeonBoxInput {
  shape: 'box' | 'round' | 'custom';
  lengthCm: number;
  heightCm: number;
  faces: 1 | 2;
  visualMaterial: 'flexy_backlite' | 'akrilik_cutting' | 'akrilik_uv';
  floorLevel: number;
  marginPercent: number;
}

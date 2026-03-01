"use client";

import React, { useEffect, useRef } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface GrainientProps {
  timeSpeed?: number;
  colorBalance?: number;
  blendMode?: "normal" | "multiply" | "screen" | "overlay";
  responsive?: boolean;
  breakpoints?: {
    small: { maxWidth: number; zoom: number; warpStrength: number; grainAmount: number };
    medium: { maxWidth: number; zoom: number; warpStrength: number; grainAmount: number };
    large: { maxWidth: number; zoom: number; warpStrength: number; grainAmount: number };
    portraitZoomMultiplier: number;
  };
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  style?: React.CSSProperties;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const colorToRgb = (color: string): [number, number, number] => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return [r, g, b];
  }
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]) / 255, parseInt(rgbMatch[2]) / 255, parseInt(rgbMatch[3]) / 255];
  }
  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
  }
  return [1, 1, 1];
};

// ============================================================================
// SHADERS
// ============================================================================

const vertex = /* glsl */ `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform int uBlendMode;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

out vec4 fragColor;

#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a){ float s=sin(a),c=cos(a); return mat2(c,-s,s,c); }

vec2 hash(vec2 p){
  p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));
  return fract(sin(p)*43758.5453);
}

float noise(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
  float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);
  return 0.5+0.5*n;
}

vec3 blendMode(vec3 base, vec3 blend, int mode){
  if(mode==1) return base * blend;
  if(mode==2) return 1.0 - (1.0-base)*(1.0-blend);
  if(mode==3){ vec3 lt=2.0*base*blend; vec3 gt=1.0-2.0*(1.0-base)*(1.0-blend); return mix(lt,gt,step(0.5,base)); }
  return blend;
}

void mainImage(out vec4 o, vec2 C){
  float t = iTime * uTimeSpeed;
  vec2 uv = C / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;

  vec2 tuv = uv - 0.5 + uCenterOffset;
  tuv /= max(uZoom, 0.001);

  float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) * uNoiseScale);
  tuv.y *= 1.0 / ratio;
  tuv *= Rot(radians((degree - 0.5) * uRotationAmount + 180.0));
  tuv.y *= ratio;

  float frequency = uWarpFrequency;
  float ws = max(uWarpStrength, 0.001);
  float amplitude = uWarpAmplitude / ws;
  float warpTime = t * uWarpSpeed;
  tuv.x += sin(tuv.y * frequency + warpTime) / amplitude;
  tuv.y += sin(tuv.x * (frequency * 1.5) + warpTime) / (amplitude * 0.5);

  vec3 col1 = uColor1;
  vec3 col2 = uColor2;
  vec3 col3 = uColor3;
  float bal = uColorBalance;
  float soft = max(uBlendSoftness, 0.0);

  mat2 blendRot = Rot(radians(uBlendAngle));
  float blendCoord = (tuv * blendRot).x;

  float edge0 = -0.3 - bal - soft;
  float edge1 = 0.2 - bal + soft;
  float v0 = 0.5 - bal + soft;
  float v1 = -0.3 - bal - soft;

  vec3 layer1 = mix(col3, col2, S(edge0, edge1, blendCoord));
  vec3 layer2 = mix(col2, col1, S(edge0, edge1, blendCoord));
  float blendWeight = S(v0, v1, tuv.y);
  vec3 finalCol = blendMode(layer1, layer2, uBlendMode);
  finalCol = mix(layer1, finalCol, blendWeight);

  vec2 grainUv = uv * max(uGrainScale, 0.001);
  if(uGrainAnimated > 0.5) { grainUv += vec2(iTime * 0.05); }
  float grainNoise = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
  finalCol += (grainNoise - 0.5) * uGrainAmount;

  finalCol = (finalCol - 0.5) * uContrast + 0.5;
  float luma = dot(finalCol, vec3(0.2126, 0.7152, 0.0722));
  finalCol = mix(vec3(luma), finalCol, uSaturation);
  finalCol = pow(max(finalCol, 0.0), vec3(1.0 / max(uGamma, 0.001)));
  finalCol = clamp(finalCol, 0.0, 1.0);
  o = vec4(finalCol, 1.0);
}

void main(){
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  fragColor = o;
}`;

// ============================================================================
// COMPONENT
// ============================================================================

export default function Grainient({
  timeSpeed = 0.25,
  colorBalance = 0.0,
  blendMode = "normal",
  responsive = true,
  breakpoints = {
    small:  { maxWidth: 480,   zoom: 0.75, warpStrength: 0.8, grainAmount: 0.12 },
    medium: { maxWidth: 900,   zoom: 0.85, warpStrength: 0.9, grainAmount: 0.11 },
    large:  { maxWidth: 99999, zoom: 0.90, warpStrength: 1.0, grainAmount: 0.10 },
    portraitZoomMultiplier: 0.92,
  },
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.1,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  color1 = "#F2D4CE",
  color2 = "#E8B4C8",
  color3 = "#F7E8E0",
  style,
  className,
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    container.appendChild(canvas);

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });

    if (!gl) {
      canvas.remove();
      container.style.background = `radial-gradient(120% 120% at 50% 50%, ${color1} 0%, ${color2} 55%, ${color3} 100%)`;
      return;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info || "Shader compile failed");
      }
      return shader;
    };

    const link = (vs: WebGLShader, fs: WebGLShader) => {
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(prog);
        gl.deleteProgram(prog);
        throw new Error(info || "Program link failed");
      }
      return prog;
    };

    let program: WebGLProgram | null = null;
    let vao: WebGLVertexArrayObject | null = null;
    let buffer: WebGLBuffer | null = null;

    try {
      const vs = compile(gl.VERTEX_SHADER, vertex);
      const fs = compile(gl.FRAGMENT_SHADER, fragment);
      program = link(vs, fs);
      gl.deleteShader(vs);
      gl.deleteShader(fs);

      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    } catch (e) {
      console.error("Grainient shader error:", e);
      if (program) gl.deleteProgram(program);
      if (vao) gl.deleteVertexArray(vao);
      if (buffer) gl.deleteBuffer(buffer);
      canvas.remove();
      container.style.background = `radial-gradient(120% 120% at 50% 50%, ${color1} 0%, ${color2} 55%, ${color3} 100%)`;
      return;
    }

    const u = {
      iTime:          gl.getUniformLocation(program!, "iTime"),
      iResolution:    gl.getUniformLocation(program!, "iResolution"),
      uTimeSpeed:     gl.getUniformLocation(program!, "uTimeSpeed"),
      uColorBalance:  gl.getUniformLocation(program!, "uColorBalance"),
      uWarpStrength:  gl.getUniformLocation(program!, "uWarpStrength"),
      uWarpFrequency: gl.getUniformLocation(program!, "uWarpFrequency"),
      uWarpSpeed:     gl.getUniformLocation(program!, "uWarpSpeed"),
      uWarpAmplitude: gl.getUniformLocation(program!, "uWarpAmplitude"),
      uBlendAngle:    gl.getUniformLocation(program!, "uBlendAngle"),
      uBlendSoftness: gl.getUniformLocation(program!, "uBlendSoftness"),
      uBlendMode:     gl.getUniformLocation(program!, "uBlendMode"),
      uRotationAmount:gl.getUniformLocation(program!, "uRotationAmount"),
      uNoiseScale:    gl.getUniformLocation(program!, "uNoiseScale"),
      uGrainAmount:   gl.getUniformLocation(program!, "uGrainAmount"),
      uGrainScale:    gl.getUniformLocation(program!, "uGrainScale"),
      uGrainAnimated: gl.getUniformLocation(program!, "uGrainAnimated"),
      uContrast:      gl.getUniformLocation(program!, "uContrast"),
      uGamma:         gl.getUniformLocation(program!, "uGamma"),
      uSaturation:    gl.getUniformLocation(program!, "uSaturation"),
      uCenterOffset:  gl.getUniformLocation(program!, "uCenterOffset"),
      uZoom:          gl.getUniformLocation(program!, "uZoom"),
      uColor1:        gl.getUniformLocation(program!, "uColor1"),
      uColor2:        gl.getUniformLocation(program!, "uColor2"),
      uColor3:        gl.getUniformLocation(program!, "uColor3"),
    };

    const getResponsiveValues = (w: number, h: number) => {
      if (!responsive) return { zoom, warpStrength, grainAmount };
      const isPortrait = h > w;
      const bp =
        w <= breakpoints.small.maxWidth  ? breakpoints.small  :
        w <= breakpoints.medium.maxWidth ? breakpoints.medium : breakpoints.large;
      return {
        zoom: bp.zoom * (isPortrait ? breakpoints.portraitZoomMultiplier : 1),
        warpStrength: bp.warpStrength,
        grainAmount: bp.grainAmount,
      };
    };

    const setUniforms = (w = 1000, h = 600) => {
      if (!program) return;
      gl.useProgram(program);
      const resp = getResponsiveValues(w, h);
      gl.uniform1f(u.uTimeSpeed,      timeSpeed);
      gl.uniform1f(u.uColorBalance,   colorBalance);
      gl.uniform1f(u.uWarpStrength,   resp.warpStrength);
      gl.uniform1f(u.uWarpFrequency,  warpFrequency);
      gl.uniform1f(u.uWarpSpeed,      warpSpeed);
      gl.uniform1f(u.uWarpAmplitude,  warpAmplitude);
      gl.uniform1f(u.uBlendAngle,     blendAngle);
      gl.uniform1f(u.uBlendSoftness,  blendSoftness);
      gl.uniform1i(u.uBlendMode,
        blendMode === "multiply" ? 1 : blendMode === "screen" ? 2 : blendMode === "overlay" ? 3 : 0);
      gl.uniform1f(u.uRotationAmount, rotationAmount);
      gl.uniform1f(u.uNoiseScale,     noiseScale);
      gl.uniform1f(u.uGrainAmount,    resp.grainAmount);
      gl.uniform1f(u.uGrainScale,     grainScale);
      gl.uniform1f(u.uGrainAnimated,  grainAnimated ? 1.0 : 0.0);
      gl.uniform1f(u.uContrast,       contrast);
      gl.uniform1f(u.uGamma,          gamma);
      gl.uniform1f(u.uSaturation,     saturation);
      gl.uniform2f(u.uCenterOffset,   centerX, centerY);
      gl.uniform1f(u.uZoom,           resp.zoom);
      const c1 = colorToRgb(color1), c2 = colorToRgb(color2), c3 = colorToRgb(color3);
      gl.uniform3f(u.uColor1, c1[0], c1[1], c1[2]);
      gl.uniform3f(u.uColor2, c2[0], c2[1], c2[2]);
      gl.uniform3f(u.uColor3, c3[0], c3[1], c3[2]);
    };

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform2f(u.iResolution, canvas.width, canvas.height);
      setUniforms(w, h);
    };

    const renderFrame = (timeSec: number) => {
      if (!program) return;
      gl.useProgram(program);
      gl.uniform1f(u.iTime, timeSec);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    };

    const ro = new ResizeObserver(() => updateSize());
    ro.observe(container);
    updateSize();

    let rafId = 0;
    const startTime = performance.now();
    const loop = (now: number) => {
      renderFrame((now - startTime) * 0.001);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (container.contains(canvas)) container.removeChild(canvas);
      if (program) gl.deleteProgram(program);
      if (vao)     gl.deleteVertexArray(vao);
      if (buffer)  gl.deleteBuffer(buffer);
    };
  }, [
    timeSpeed, colorBalance, blendMode, responsive, breakpoints,
    warpStrength, warpFrequency, warpSpeed, warpAmplitude,
    blendAngle, blendSoftness, rotationAmount, noiseScale,
    grainAmount, grainScale, grainAnimated,
    contrast, gamma, saturation, centerX, centerY, zoom,
    color1, color2, color3,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "inherit",
        ...style,
      }}
    />
  );
}

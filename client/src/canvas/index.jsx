import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Shirt from './Shirt';

// Simple inline spinner that does not require drei Html
const Spinner = () => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(2,2,4,0.8)',
    zIndex: 5,
    gap: 12,
  }}>
    <div style={{
      width: 36, height: 36,
      border: '3px solid rgba(99,102,241,0.3)',
      borderTop: '3px solid #6366f1',
      borderRadius: '50%',
      animation: 'spin3d 0.9s linear infinite',
    }} />
    <span style={{
      color: '#6366f1', fontFamily: 'monospace',
      fontSize: 9, textTransform: 'uppercase',
      letterSpacing: '0.3em', fontWeight: 'bold',
    }}>Loading Model…</span>
    <style>{`@keyframes spin3d { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// React Error Boundary — catches WebGL crashes gracefully
class CanvasErrorBoundary extends React.Component {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(err) { console.error('3D Viewer Error:', err); }
  reset = () => this.setState({ crashed: false });
  render() {
    if (this.state.crashed) return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#020204', gap: 16,
      }}>
        <span style={{ fontSize: 36 }}>⚠️</span>
        <p style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          3D Viewer Error
        </p>
        <button onClick={this.reset} style={{
          padding: '8px 24px', background: '#4f46e5', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer',
          fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          Reload Viewer
        </button>
      </div>
    );
    return this.props.children;
  }
}

// Inner canvas separated so key can force full remount
const InnerCanvas = ({ baseType, aiTexture, overlayTexture, initialPartColors }) => (
  <Canvas
    shadows
    camera={{ position: [0, 0, 4], fov: 35 }}
    gl={{
      preserveDrawingBuffer: true,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    }}
    style={{ width: '100%', height: '100%' }}
  >
    {/* Lighting — no HDR file needed, just direct lights */}
    <ambientLight intensity={0.8} />
    <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
    <directionalLight position={[-5, 3, -3]} intensity={0.4} color="#a5b4fc" />
    <pointLight position={[0, -3, 3]} intensity={0.3} color="#818cf8" />

    <Suspense fallback={null}>
      <Shirt
        baseType={baseType}
        aiTexture={aiTexture}
        overlayTexture={overlayTexture}
        initialPartColors={initialPartColors}
      />
    </Suspense>

    <OrbitControls
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      enableZoom
      minDistance={0.5}
      maxDistance={8}
      enablePan
    />
  </Canvas>
);

const CanvasModel = ({ baseType, aiTexture, overlayTexture, initialPartColors }) => {
  const [canvasKey, setCanvasKey] = useState(`${baseType}-0`);
  const [loading, setLoading] = useState(false);
  const prevType = useRef(baseType);

  useEffect(() => {
    if (prevType.current === baseType) return;
    prevType.current = baseType;
    setLoading(true);
    // Small delay so old WebGL context is fully freed before new one starts
    const t = setTimeout(() => {
      setCanvasKey(`${baseType}-${Date.now()}`);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [baseType]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && <Spinner />}
      <CanvasErrorBoundary key={canvasKey}>
        <InnerCanvas
          key={canvasKey}
          baseType={baseType}
          aiTexture={aiTexture}
          overlayTexture={overlayTexture}
          initialPartColors={initialPartColors}
        />
      </CanvasErrorBoundary>
    </div>
  );
};

export default CanvasModel;

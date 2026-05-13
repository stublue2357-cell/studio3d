import React, { useRef } from 'react'
import { easing } from 'maath';
import { useFrame } from '@react-three/fiber';
import { Decal, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SHIRT COMPONENT (3D VISUALIZATION LAYER)
 * -----------------------------------------
 * Renders any .glb model from /public, auto-scales + centers it,
 * supports per-part color selection & decal application.
 */
const Shirt = ({ baseType, aiTexture, overlayTexture, initialPartColors = {} }) => {
  // ── Model Path Resolution ──────────────────────────────────────────────────
  const [modelPath, setModelPath] = React.useState('shirt_baked.glb');

  React.useEffect(() => {
    if (!baseType) return;
    const fileName = baseType.toLowerCase().replace(/[\s-]/g, '_') + '.glb';
    fetch(fileName, { method: 'HEAD' })
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        setModelPath(res.ok && !ct.includes('text/html') ? fileName : 'shirt_baked.glb');
      })
      .catch(() => setModelPath('shirt_baked.glb'));
  }, [baseType]);

  // ── Scene Load ────────────────────────────────────────────────────────────
  const { scene } = useGLTF(modelPath);

  // ── Auto-Scale & Center ───────────────────────────────────────────────────
  // Returns a normalised clone so the original scene is not mutated between renders
  const { normalizedScene, meshes } = React.useMemo(() => {
    if (!scene) return { normalizedScene: null, meshes: [] };

    // Clone so each mount gets its own copy
    const cloned = scene.clone(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale  = 1.8 / maxDim;

    cloned.scale.set(scale, scale, scale);
    cloned.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    cloned.updateMatrixWorld(true);

    // Collect meshes AFTER transform
    const extracted = [];
    cloned.traverse(child => { 
      if (child.isMesh) {
        // Clone materials so coloring one part doesn't color the whole model
        if (Array.isArray(child.material)) {
          child.material = child.material.map(m => m.clone());
        } else if (child.material) {
          child.material = child.material.clone();
        }
        extracted.push(child); 
      } 
    });

    return { normalizedScene: cloned, meshes: extracted };
  }, [scene, modelPath]); // re-run when model changes

  // ── Interaction State ─────────────────────────────────────────────────────
  // Use a ref for activeMesh so onClick can always read the latest value
  const activeMeshRef = useRef(null);
  const [activeMesh,  setActiveMesh]  = React.useState(null);
  const [hoveredMesh, setHoveredMesh] = React.useState(null);
  const [partColors,  setPartColors]  = React.useState(initialPartColors || {});

  // Sync ref with state
  React.useEffect(() => { activeMeshRef.current = activeMesh; }, [activeMesh]);

  // Reset selection when model changes
  React.useEffect(() => {
    setActiveMesh(null);
    activeMeshRef.current = null;
    // Don't reset partColors here if it's supposed to be restored, but for new models we should
    // We'll rely on AIStudio to clear it when baseType changes.
  }, [modelPath]);

  // Dispatch part colors to parent whenever they change
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('PART_COLORS_UPDATED', { detail: partColors }));
  }, [partColors]);

  // ── Color Sync from DesignEditor ──────────────────────────────────────────
  React.useEffect(() => {
    const handleColorSync = (e) => {
      const newColor = e.detail;
      const current  = activeMeshRef.current;
      if (current) {
        // Only colour the selected part
        setPartColors(prev => ({ ...prev, [current]: newColor }));
      } else {
        // Colour every part
        setPartColors(prev => {
          const updated = { ...prev };
          meshes.forEach(m => { updated[m.name || m.uuid] = newColor; });
          return updated;
        });
      }
    };
    window.addEventListener('FABRIC_COLOR_SYNC', handleColorSync);
    return () => window.removeEventListener('FABRIC_COLOR_SYNC', handleColorSync);
  }, [meshes]);

  // ── Texture Loading ────────────────────────────────────────────────────────
  const [aiTex,      setAiTex]      = React.useState(null);
  const [overlayTex, setOverlayTex] = React.useState(null);

  React.useEffect(() => {
    if (aiTexture) {
      new THREE.TextureLoader().load(aiTexture, tex => { tex.anisotropy = 16; setAiTex(tex); });
    } else { setAiTex(null); }
  }, [aiTexture]);

  React.useEffect(() => {
    if (overlayTexture) {
      new THREE.TextureLoader().load(overlayTexture, tex => { tex.anisotropy = 16; setOverlayTex(tex); });
    } else { setOverlayTex(null); }
  }, [overlayTexture]);

  // ── Per-Frame Material Updates ────────────────────────────────────────────
  useFrame((state, delta) => {
    meshes.forEach(mesh => {
      const meshId = mesh.name || mesh.uuid;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      materials.forEach(mat => {
        if (!mat) return;

        // Only change colour if a colour has been explicitly set for this part
        if (mat.color && partColors[meshId]) {
          easing.dampC(mat.color, partColors[meshId], 0.25, delta);
        }

        // Emissive glow for selection / hover
        if (mat.emissive) {
          if (meshId === activeMesh) {
            easing.dampC(mat.emissive, '#4f46e5', 0.25, delta);
            mat.emissiveIntensity = 1.5;
          } else if (meshId === hoveredMesh && !activeMesh) {
            easing.dampC(mat.emissive, '#1e1b4b', 0.25, delta);
            mat.emissiveIntensity = 0.4;
          } else {
            easing.dampC(mat.emissive, '#000000', 0.25, delta);
            mat.emissiveIntensity = 0;
          }
        }
      });
    });
  });

  // ── Render ────────────────────────────────────────────────────────────────
  if (!normalizedScene) return null;

  return (
    <group onPointerMissed={() => {
      setActiveMesh(null);
      activeMeshRef.current = null;
      window.dispatchEvent(new CustomEvent('3D_PART_SELECTED', { detail: null }));
    }}>
      {meshes.map((mesh, index) => {
        const meshId = mesh.name || mesh.uuid;
        const isActive = meshId === activeMesh;

        return (
          <mesh
            key={`${modelPath}-${meshId}-${index}`}
            castShadow
            receiveShadow
            geometry={mesh.geometry}
            material={mesh.material}
            position={mesh.getWorldPosition(new THREE.Vector3())}
            quaternion={mesh.getWorldQuaternion(new THREE.Quaternion())}
            scale={mesh.getWorldScale(new THREE.Vector3())}
            material-roughness={0.8}
            material-metalness={0.1}
            dispose={null}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredMesh(meshId); }}
            onPointerOut={(e)  => { e.stopPropagation(); setHoveredMesh(null); }}
            onClick={(e) => {
              e.stopPropagation();
              const prev = activeMeshRef.current;
              const next = prev === meshId ? null : meshId;
              activeMeshRef.current = next;
              setActiveMesh(next);
              window.dispatchEvent(new CustomEvent('3D_PART_SELECTED', { detail: next ? meshId : null }));
            }}
          >
            {/* Removed fixed AI-generated texture decal to allow full control via the 2D canvas overlay */}
            {/* Canvas overlay decal */}
            {(index === 0 || isActive) && overlayTex && (
              <Decal
                position={[0, 0.04, 0.151]}
                rotation={[0, 0, 0]}
                scale={[0.4, 0.4, 0.4]}
                map={overlayTex}
                depthTest={false}
                depthWrite={true}
              />
            )}
          </mesh>
        );
      })}
    </group>
  );
};

export default Shirt;

import React from 'react'
import { easing } from 'maath';
import { useFrame } from '@react-three/fiber';
import { Decal, useGLTF, useTexture } from '@react-three/drei';

/**
 * SHIRT COMPONENT (3D VISUALIZATION LAYER)
 * -----------------------------------------
 * This component is responsible for rendering the 3D Apparel model.
 * It uses 'React Three Fiber' (R3F) which is a React renderer for Three.js.
 * 
 * Key Technologies Used:
 * 1. @react-three/fiber: Provides the core 3D hooks like useFrame.
 * 2. @react-three/drei: Provides helper components like <Decal /> and hooks like useGLTF.
 * 3. maath: Used for smooth mathematical transitions (easing).
 */
const Shirt = ({ baseType, aiTexture, overlayTexture }) => {
  const [modelPath, setModelPath] = React.useState('/public/shirt_baked.glb');

  // Check if the custom .glb file exists for this specific baseType
  React.useEffect(() => {
    if (!baseType) return;
    const desiredFile = '/' + baseType.toLowerCase().replace(/[\s-]/g, '_') + '.glb';
    
    fetch(desiredFile, { method: 'HEAD' })
      .then(res => {
        const contentType = res.headers.get('content-type');
        // Prevent Vite from serving index.html (text/html) for missing 404 files
        if (res.ok && contentType && !contentType.includes('text/html')) {
          setModelPath(desiredFile);
        } else {
          setModelPath('/shirt_baked.glb'); // Fallback to default
        }
      })
      .catch(() => setModelPath('/shirt_baked.glb'));
  }, [baseType]);

  const { scene } = useGLTF(modelPath);
  
  // Extract all meshes dynamically instead of hardcoding node names
  const meshes = React.useMemo(() => {
    const extracted = [];
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) extracted.push(child);
      });
    }
    return extracted;
  }, [scene]);

  const [partColors, setPartColors] = React.useState({});
  const [activeMesh, setActiveMesh] = React.useState(null);
  const [hoveredMesh, setHoveredMesh] = React.useState(null);

  // Listen for real-time color signals from the Editor
  React.useEffect(() => {
    const handleColorSync = (e) => {
      const newColor = e.detail;
      if (activeMesh) {
        // Apply color ONLY to the selected part
        setPartColors(prev => ({ ...prev, [activeMesh]: newColor }));
      } else {
        // Apply to ALL parts if nothing is selected
        setPartColors(prev => {
          const updated = { ...prev };
          meshes.forEach(m => updated[m.name || m.uuid] = newColor);
          return updated;
        });
      }
    };
    window.addEventListener('FABRIC_COLOR_SYNC', handleColorSync);
    return () => window.removeEventListener('FABRIC_COLOR_SYNC', handleColorSync);
  }, [activeMesh, meshes]);

  const fallbackTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  
  // Custom hook usage requires checking if texture exists, or we pass fallback
  const aiTex = useTexture(aiTexture || fallbackTexture);
  const overlayTex = useTexture(overlayTexture || fallbackTexture);

  useFrame((state, delta) => {
    meshes.forEach((mesh) => {
      // Safely handle both single materials and arrays of materials
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      
      materials.forEach(mat => {
        if (mat && mat.color) {
          const meshId = mesh.name || mesh.uuid;
          const targetColor = partColors[meshId] || '#ffffff';
          easing.dampC(mat.color, targetColor, 0.25, delta);
          
          if (mat.emissive) {
            if (meshId === activeMesh) {
              easing.dampC(mat.emissive, '#1e1b4b', 0.25, delta); // Deep glow for active
            } else if (meshId === hoveredMesh && !activeMesh) {
              easing.dampC(mat.emissive, '#111827', 0.25, delta); // Slight glow for hover
            } else {
              easing.dampC(mat.emissive, '#000000', 0.25, delta); // Normal
            }
          }
        }
      });
    });
  });

  return (
    <group 
      onPointerMissed={() => setActiveMesh(null)}
      position={scene?.position}
      rotation={scene?.rotation}
      scale={scene?.scale}
    >
      {meshes.map((mesh, index) => {
        const meshId = mesh.name || mesh.uuid;
        return (
          <mesh
            key={`${modelPath}-${meshId}`}
            castShadow
            geometry={mesh.geometry}
            material={mesh.material}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
            material-roughness={1}
            dispose={null}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredMesh(meshId); }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredMesh(null); }}
            onClick={(e) => { 
              e.stopPropagation(); 
              setActiveMesh(prev => prev === meshId ? null : meshId); 
            }}
          >
            {/* Apply decals to the primary mesh (index 0) or the currently selected mesh */}
            {(index === 0 || activeMesh === meshId) && aiTexture && (
                <Decal 
                    position={[0, 0.04, 0.15]}
                    rotation={[0, 0, 0]}
                    scale={[0.4, 0.4, 0.4]}
                    map={aiTex}
                    anisotropy={16}
                    depthTest={false}
                    depthWrite={true}
                />
            )}

            {(index === 0 || activeMesh === meshId) && overlayTexture && (
                <Decal 
                    position={[0, 0.04, 0.151]} // Slightly in front to prevent z-fighting
                    rotation={[0, 0, 0]}
                    scale={[0.4, 0.4, 0.4]}
                    map={overlayTex}
                    anisotropy={16}
                    depthTest={false}
                    depthWrite={true}
                />
            )}
          </mesh>
        );
      })}
    </group>
  )
}

export default Shirt;

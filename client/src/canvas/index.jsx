import { Canvas } from '@react-three/fiber';
import { Environment, Center, ContactShadows, OrbitControls } from '@react-three/drei';
import Shirt from './Shirt';

import React from 'react';

const CanvasModel = ({ baseType, aiTexture, overlayTexture }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 10], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
      className="w-full h-full transition-all ease-in"
    >
      <ambientLight intensity={0.5} />
      <Environment preset="city" />

      <React.Suspense fallback={null}>
        <Center>
          <Shirt baseType={baseType} aiTexture={aiTexture} overlayTexture={overlayTexture} />
        </Center>
      </React.Suspense>

      <OrbitControls 
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        enableZoom={true}
        minDistance={0.5}
        maxDistance={2}
      />
      
      <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.25} />
    </Canvas>
  );
};

export default CanvasModel;
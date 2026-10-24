import { useFrame, useThree } from '@react-three/fiber';
import CameraControls from 'camera-controls';
import { useEffect, useMemo } from 'react';
import { Box3, Matrix4, Quaternion, Raycaster, Sphere, Spherical, Vector2, Vector3, Vector4 } from 'three';

// camera-controls riceve solo le classi di three.js che usa, così il resto resta fuori dal pacchetto.
CameraControls.install({
  THREE: { Box3, Matrix4, Quaternion, Raycaster, Sphere, Spherical, Vector2, Vector3, Vector4 },
});

interface Props {
  onReady: (controls: CameraControls) => void;
  minDistance: number;
  maxDistance: number;
  smoothTime: number;
}

/** Controlli della telecamera (rotazione, zoom, voli) collegati al canvas di React Three Fiber. */
export function Controls({ onReady, minDistance, maxDistance, smoothTime }: Props) {
  const camera = useThree((s) => s.camera);
  const element = useThree((s) => s.gl.domElement);
  const controls = useMemo(() => new CameraControls(camera, element), [camera, element]);

  useEffect(() => {
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.smoothTime = smoothTime;
  }, [controls, minDistance, maxDistance, smoothTime]);

  useEffect(() => {
    onReady(controls);
    return () => controls.dispose();
  }, [controls, onReady]);

  useFrame((_, delta) => {
    controls.update(delta);
  }, -1);

  return null;
}

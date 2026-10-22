import { useFrame, useThree } from '@react-three/fiber';
import CameraControls from 'camera-controls';
import { useEffect, useMemo } from 'react';
import { Box3, Matrix4, Quaternion, Raycaster, Sphere, Spherical, Vector2, Vector3, Vector4 } from 'three';

// camera-controls riceve solo le classi di three.js che usa, così il resto resta fuori dal pacchetto.
CameraControls.install({
  THREE: { Box3, Matrix4, Quaternion, Raycaster, Sphere, Spherical, Vector2, Vector3, Vector4 },
});

interface Props {
  onPronti: (controlli: CameraControls) => void;
  minDistance: number;
  maxDistance: number;
  smoothTime: number;
}

/** Controlli della telecamera (rotazione, zoom, voli) collegati al canvas di React Three Fiber. */
export function Controlli({ onPronti, minDistance, maxDistance, smoothTime }: Props) {
  const camera = useThree((s) => s.camera);
  const elemento = useThree((s) => s.gl.domElement);
  const controlli = useMemo(() => new CameraControls(camera, elemento), [camera, elemento]);

  useEffect(() => {
    controlli.minDistance = minDistance;
    controlli.maxDistance = maxDistance;
    controlli.smoothTime = smoothTime;
  }, [controlli, minDistance, maxDistance, smoothTime]);

  useEffect(() => {
    onPronti(controlli);
    return () => controlli.dispose();
  }, [controlli, onPronti]);

  useFrame((_, delta) => {
    controlli.update(delta);
  }, -1);

  return null;
}

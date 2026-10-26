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

// Il punto guardato non può uscire da questo spazio attorno al corpo: spostandolo, il corpo resta sempre in vista.
const BOUNDARY = new Box3(new Vector3(-0.45, -0.1, -0.2), new Vector3(0.45, 1.75, 0.4));

/**
 * Controlli della telecamera collegati al canvas di React Three Fiber: trascinare ruota, rotellina
 * e pizzico avvicinano, tasto destro, Maiusc + trascinamento o due dita spostano il corpo.
 */
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
    controls.setBoundary(BOUNDARY);
    controls.mouseButtons.right = CameraControls.ACTION.TRUCK;
    controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY_TRUCK;
    // Con Maiusc premuto il tasto sinistro sposta invece di ruotare: serve a chi usa un trackpad.
    const onKey = (e: KeyboardEvent) => {
      controls.mouseButtons.left = e.shiftKey ? CameraControls.ACTION.TRUCK : CameraControls.ACTION.ROTATE;
    };
    const onBlur = () => {
      controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
    };
    addEventListener('keydown', onKey);
    addEventListener('keyup', onKey);
    addEventListener('blur', onBlur);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('keyup', onKey);
      removeEventListener('blur', onBlur);
    };
  }, [controls]);

  useEffect(() => {
    onReady(controls);
    return () => controls.dispose();
  }, [controls, onReady]);

  useFrame((_, delta) => {
    controls.update(delta);
  }, -1);

  return null;
}

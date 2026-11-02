import { describe, expect, it } from 'vitest';
import {
  BEAT_LEFT_ATRIUM,
  BEAT_NONE,
  BEAT_RIGHT_ATRIUM,
  BEAT_VENTRICLES,
  heartbeatPart,
  isHeartWall,
} from './heartbeat';

describe('parti del cuore che batte', () => {
  it('distingue i due atri dai ventricoli', () => {
    expect(heartbeatPart('cuore', 'Wall of left atrium')).toBe(BEAT_LEFT_ATRIUM);
    expect(heartbeatPart('cuore', 'Wall of right atrium')).toBe(BEAT_RIGHT_ATRIUM);
    expect(heartbeatPart('cuore', 'Wall of ventricle')).toBe(BEAT_VENTRICLES);
  });

  it('fa seguire i ventricoli a muscoli papillari e valvole', () => {
    expect(heartbeatPart('cuore', 'Anterior papillary muscle of right ventricle')).toBe(BEAT_VENTRICLES);
    expect(heartbeatPart('cuore', 'Anterior leaflet of mitral valve')).toBe(BEAT_VENTRICLES);
    expect(heartbeatPart('cuore', 'Right posterior cusp of aortic valve')).toBe(BEAT_VENTRICLES);
  });

  it('lascia ferme le strutture fuori dal cuore', () => {
    expect(heartbeatPart('polmoni', 'Superior lobe of left lung')).toBe(BEAT_NONE);
    expect(heartbeatPart('FJ3259', 'Left femur')).toBe(BEAT_NONE);
  });

  it('prende il centro delle camere solo dalle pareti', () => {
    expect(isHeartWall('Wall of ventricle')).toBe(true);
    expect(isHeartWall('Septal papillary muscle of right ventricle')).toBe(false);
  });
});

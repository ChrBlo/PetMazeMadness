import { atom } from 'jotai';
import { Accelerometer, Gyroscope } from 'expo-sensors';

interface SensorData {
  x: number;
  y: number;
  z: number;
}

export const accelDataAtom = atom<SensorData>({ x: 0, y: 0, z: 0 });
export const gyroDataAtom = atom<SensorData>({ x: 0, y: 0, z: 0 });

let accelSubscription: any = null;
let gyroSubscription: any = null;
let accelRefCount = 0;
let gyroRefCount = 0;

export const subscribeAccelAtom = atom(
  null,
  (get, set) => {
    accelRefCount++;
    if (accelRefCount === 1) {
      // First subscriber - start sensor
      accelSubscription = Accelerometer.addListener((data) => {
        set(accelDataAtom, data);
      });
      Accelerometer.setUpdateInterval(16);
    }
    
    // Return unsubscribe function
    return () => {
      accelRefCount--;
      if (accelRefCount === 0 && accelSubscription) {
        // Last subscriber - stop sensor
        accelSubscription.remove();
        accelSubscription = null;
      }
    };
  }
);

export const subscribeGyroAtom = atom(
  null,
  (get, set) => {
    gyroRefCount++;
    if (gyroRefCount === 1) {
      gyroSubscription = Gyroscope.addListener((data) => {
        set(gyroDataAtom, data);
      });
      Gyroscope.setUpdateInterval(16);
    }
    
    return () => {
      gyroRefCount--;
      if (gyroRefCount === 0 && gyroSubscription) {
        gyroSubscription.remove();
        gyroSubscription = null;
      }
    };
  }
);
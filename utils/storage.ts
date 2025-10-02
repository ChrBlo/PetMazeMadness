// @ts-ignore
import store from 'react-native-simple-store';

export const storage = {
  getItem: async (key: string): Promise<any> => {
    return await store.get(key);
  },
  
  setItem: async (key: string, value: any): Promise<void> => {
    await store.save(key, value);
  },
  
  removeItem: async (key: string): Promise<void> => {
    await store.delete(key);
  }
};
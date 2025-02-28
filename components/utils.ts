import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { Event } from './types';

const saveEventsToLocalStorage = async (events: Event[]) => {
  const data = JSON.stringify(events);

  if (Platform.OS === 'web') {
    localStorage.setItem('events', data);
  } else {
    await AsyncStorage.setItem('events', data);
  }
};

const getEventsFromLocalStorage = async (): Promise<Event[]> => {
  if (Platform.OS === 'web') {
    const events = localStorage.getItem('events');
    return events ? JSON.parse(events) : [];
  } else {
    const events = await AsyncStorage.getItem('events');
    return events ? JSON.parse(events) : [];
  }
};

const generateSimpleId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export { saveEventsToLocalStorage, getEventsFromLocalStorage, generateSimpleId };

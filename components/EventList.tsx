import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import EventCard from './EventCard';
import { deleteEvent, loadEvents, selectEvents } from './redux/eventSlice';
import { Event } from './types';
import { getEventsFromLocalStorage, saveEventsToLocalStorage } from './utils';

const EventList: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const events: Event[] = useSelector(selectEvents);

  const handleDelete = async (id: string) => {
    dispatch(deleteEvent(id));

    const events = await getEventsFromLocalStorage();
    const updatedEvents = events.filter((event: Event) => event.id !== id);
    saveEventsToLocalStorage(updatedEvents);
  };

  const handleEditEvent = (event: Event) => {
    navigation.navigate('EditEvent', { event });
  };

  const getStoredEvents = async () => {
    let storedEvents: string | null;

    if (Platform.OS === 'web') {
      storedEvents = localStorage.getItem('events');
    } else {
      storedEvents = await AsyncStorage.getItem('events');
    }
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents);
      dispatch(loadEvents(parsedEvents));
    }
  };

  useEffect(() => {
    getStoredEvents();
  }, [dispatch]);

  return (
    <View className="max-w-md w-[90vw]">
      {events.length > 0 ? (
        events.map((event) => (
          <EventCard
            key={event.id}
            {...event}
            onEdit={() => handleEditEvent(event)}
            onDelete={() => handleDelete(event.id)}
          />
        ))
      ) : (
        <View className="flex-1 items-center justify-center bg-white p-6">
          <Text className="mt-4 text-lg font-semibold text-gray-600">No events created so far</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateEvent')}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2">
            <Text className="font-bold text-white">✨ Create Event</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default EventList;

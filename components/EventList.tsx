import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import EventCard from './EventCard';
import { deleteEvent, loadEvents, selectEvents } from './redux/eventSlice';
import { Event } from './types';
import { getEventsFromLocalStorage, saveEventsToLocalStorage } from './utils';

const EventList: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const events: Event[] = useSelector(selectEvents);

  const handleDelete = (id: string) => {
    dispatch(deleteEvent(id));

    const events = getEventsFromLocalStorage();
    const updatedEvents = events.filter((event: Event) => event.id !== id); // Remove event by id
    saveEventsToLocalStorage(updatedEvents);
  };

  const handleEditEvent = (event: Event) => {
    // Navigate and pass the event data
    navigation.navigate('EditEvent', { event });
  };

  useEffect(() => {
    // Get events from local storage
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents);
      dispatch(loadEvents(parsedEvents)); // Dispatch events to Redux store
    }
  }, [dispatch]);

  return (
    <View className="max-w-md">
      {events.map((event) => (
        <EventCard
          key={event.id}
          {...event}
          onEdit={() => handleEditEvent(event)}
          onDelete={() => handleDelete(event.id)}
        />
      ))}
    </View>
  );
};

export default EventList;

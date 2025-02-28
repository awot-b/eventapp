import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import EventList from './EventList';
import { loadEvents, selectEvents } from './redux/eventSlice';
import { AppDispatch } from './redux/store';
import { Event } from './types';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const events: Event[] = useSelector(selectEvents);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const storedEvents = await AsyncStorage.getItem('events');
        if (storedEvents) {
          dispatch(loadEvents(JSON.parse(storedEvents)));
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };

    fetchEvents();
  }, [dispatch]);

  return (
    <ScrollView>
      {events.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEvent')}
          className="ml-auto mr-[15px] mt-4 rounded-lg bg-blue-600 px-3 py-2">
          <Text className="font-bold text-white">✨ Add Event</Text>
        </TouchableOpacity>
      )}
      <View className="p-2 flex flex-row justify-center">
        <EventList />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useDispatch } from 'react-redux';

import EventList from './EventList';
import { loadEvents } from './redux/eventSlice';
import { AppDispatch } from './redux/store';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

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

  // Add "Add Event" button to the top right of the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEvent')}
          style={{
            backgroundColor: '#2563eb', // Tailwind blue-600
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            marginRight: 15,
          }}>
          <Text className="font-bold text-white">✨ Add Event</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, padding: 20 }} className="items-center overflow-scroll">
      <EventList />
    </View>
  );
};

export default HomeScreen;

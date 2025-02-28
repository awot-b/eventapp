import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useDispatch } from 'react-redux';

import { loadEvents } from './redux/eventSlice';

const CalendarView = () => {
  const dispatch = useDispatch();
  const [events, setEvents] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [currentEvents, setCurrentEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let storedEventsString: string | null;

        if (Platform.OS === 'web') {
          storedEventsString = localStorage.getItem('events');
        } else {
          storedEventsString = await AsyncStorage.getItem('events');
        }

        if (storedEventsString) {
          const storedEvents = JSON.parse(storedEventsString);

          const eventMap: any = {};
          storedEvents.forEach((event: any) => {
            const { startDate, endDate } = event;
            const currentDate = new Date(startDate);

            while (currentDate <= new Date(endDate)) {
              const formattedDate = currentDate.toISOString().split('T')[0];
              eventMap[formattedDate] = { marked: true, dotColor: 'red' };
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });

          setEvents(eventMap);
          dispatch(loadEvents(storedEvents));
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };

    fetchEvents();
  }, [dispatch]);

  const handleDatePress = (date: string) => {
    setSelectedDate(date);

    const fetchEventsForDate = async () => {
      try {
        let storedEventsString: string | null;

        if (Platform.OS === 'web') {
          storedEventsString = localStorage.getItem('events');
        } else {
          storedEventsString = await AsyncStorage.getItem('events');
        }

        if (storedEventsString) {
          const storedEvents = JSON.parse(storedEventsString);

          const filteredEvents = storedEvents.filter((event: any) => {
            const eventStartDate = new Date(event.startDate).toISOString().split('T')[0];
            const eventEndDate = new Date(event.endDate).toISOString().split('T')[0];
            return date >= eventStartDate && date <= eventEndDate;
          });

          setCurrentEvents(filteredEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events for date:', error);
      }
    };

    fetchEventsForDate();
    setEventModalVisible(true);
  };

  const closeModal = () => {
    setEventModalVisible(false);
    setSelectedDate(null);
    setCurrentEvents([]);
  };

  return (
    <View className="flex-1 p-4">
      <Calendar
        markedDates={events}
        onDayPress={(day: { dateString: string }) => handleDatePress(day.dateString)}
        theme={{
          todayTextColor: '#ffffff',
          todayBackgroundColor: '#00307c',
          arrowColor: '#00307c',
        }}
      />

      <Modal
        visible={eventModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
          <View className="w-11/12 max-w-lg rounded-lg bg-white p-6">
            <Text className="mb-4 text-center text-xl font-bold">Events on {selectedDate}</Text>
            {currentEvents.length > 0 ? (
              currentEvents.map((event, index) => (
                <View key={index} className="mb-2 rounded-lg bg-gray-100 p-4 shadow-md">
                  <Text className="text-lg font-semibold">{event.title}</Text>
                  <Text className="text-sm text-gray-600">Description: {event.description}</Text>
                  <Text className="text-sm text-gray-600">
                    Start: {new Date(event.startDate).toLocaleString()}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    End: {new Date(event.endDate).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-center text-gray-500">No events for this day.</Text>
            )}
            <TouchableOpacity onPress={closeModal} className="mt-4 rounded-lg bg-blue-600 p-3">
              <Text className="text-center font-semibold text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CalendarView;

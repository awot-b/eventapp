import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarView from 'components/CalendarView';
import * as ImagePicker from 'expo-image-picker'; // For mobile image picker
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { addEvent, loadEvents } from '../redux/eventSlice';
import { AppDispatch } from '../redux/store';
import { Event } from '../types';

const repeatOptions = ['None', 'Weekly', 'Bi-weekly', 'Monthly'];

const CreateEventScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [repeat, setRepeat] = useState<'None' | 'Weekly' | 'Bi-weekly' | 'Monthly'>('None');
  const [openStartTime, setOpenStartTime] = useState(false);
  const [openEndTime, setOpenEndTime] = useState(false);
  const [image, setImage] = useState<string | null>(null); // State for image URI or base64 string
  const [disabledDates, setDisabledDates] = useState<{ start: string; end: string }[]>([]);

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().slice(0, 16);
    return disabledDates.some(
      (disabledDate) => dateString >= disabledDate.start && dateString <= disabledDate.end
    );
  };

  const handleStartTimeChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(e.target.value);
    const timeZoneOffset = selectedDateTime.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localDateTime = new Date(selectedDateTime.getTime() - timeZoneOffset); // Adjust for time zone
    if (isDateDisabled(localDateTime)) {
      if (Platform.OS === 'web') {
        window.alert('This date is already occupied by an event.');
      } else {
        Alert.alert('Error', 'This date is already occupied by an event.');
      }
      return;
    }
    setStartDate(localDateTime);
  };

  // Handle end time change for web
  const handleEndTimeChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(e.target.value);
    const timeZoneOffset = selectedDateTime.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localDateTime = new Date(selectedDateTime.getTime() - timeZoneOffset); // Adjust for time zone
    if (isDateDisabled(localDateTime)) {
      if (Platform.OS === 'web') {
        window.alert('This date is already occupied by an event.');
      } else {
        Alert.alert('Error', 'This date is already occupied by an event.');
      }
      return;
    }
    setEndDate(localDateTime);
  };

  useEffect(() => {
    // Get events from local storage
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents);
      dispatch(loadEvents(parsedEvents)); // Dispatch events to Redux store
    }
  }, [dispatch]);

  // Handle image upload for mobile
  const handleImageUploadMobile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('This date is already occupied by an event.');
      } else {
        Alert.alert(
          'Permission Denied',
          'Please allow access to your photo library to upload images.'
        );
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true, // Get base64 string for storage
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Save image URI
    }
  };

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

          // Extract start and end dates of existing events
          const dates = storedEvents.map((event: any) => ({
            start: new Date(event.startDate).toISOString().slice(0, 16),
            end: new Date(event.endDate).toISOString().slice(0, 16),
          }));

          setDisabledDates(dates);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        window.alert('This date is already occupied by an event.');
      } else {
        Alert.alert('Error', 'Title cannot be empty');
      }
      return;
    }

    const newEvent: Event = {
      id: uuidv4(),
      title,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      repeat,
      image, // Include image in the event data
    };

    // Dispatch the event to Redux
    dispatch(addEvent(newEvent));

    // Save the event to storage
    try {
      if (Platform.OS === 'web') {
        // Save to localStorage on web
        const storedEvents = localStorage.getItem('events');
        const events = storedEvents ? JSON.parse(storedEvents) : [];
        localStorage.setItem('events', JSON.stringify([...events, newEvent]));
      } else {
        // Save to AsyncStorage on Android/iOS
        const storedEvents = await AsyncStorage.getItem('events');
        const events = storedEvents ? JSON.parse(storedEvents) : [];
        await AsyncStorage.setItem('events', JSON.stringify([...events, newEvent]));
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }

    // Navigate back
    router.back();
  };

  const showStartTimePicker = () => setOpenStartTime(true);
  const showEndTimePicker = () => setOpenEndTime(true);
  const hideStartTimePicker = () => setOpenStartTime(false);
  const hideEndTimePicker = () => setOpenEndTime(false);

  const handleStartTimeConfirm = (selectedTime: Date) => {
    const updatedStartDate = new Date(startDate);
    updatedStartDate.setHours(selectedTime.getHours());
    updatedStartDate.setMinutes(selectedTime.getMinutes());
    if (isDateDisabled(updatedStartDate)) {
      if (Platform.OS === 'web') {
        window.alert('This date is already occupied by an event.');
      } else {
        Alert.alert('Error', 'This date is already occupied by an event.');
      }
      return;
    }
    setStartDate(updatedStartDate);
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (selectedTime: Date) => {
    const updatedEndDate = new Date(endDate);
    updatedEndDate.setHours(selectedTime.getHours());
    updatedEndDate.setMinutes(selectedTime.getMinutes());
    if (isDateDisabled(updatedEndDate)) {
      Alert.alert('Error', 'This date is already occupied by an event.');
      return;
    }
    setEndDate(updatedEndDate);
    hideEndTimePicker();
  };

  return (
    <ScrollView className="max-w-md flex-1 bg-gray-100 p-5">
      <View style={{ flex: 1 }}>
        <CalendarView />
      </View>
      <Text className="my-2 text-sm font-semibold text-gray-700">Event Title</Text>
      <TextInput
        placeholder="Enter event title"
        value={title}
        onChangeText={setTitle}
        className=" rounded-md border border-gray-300 bg-white p-3"
      />

      <Text className="my-2 text-sm font-semibold text-gray-700">Event Description</Text>
      <TextInput
        placeholder="Enter event description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        className=" rounded-md border border-gray-300 bg-white p-3"
      />

      {/* Image Upload */}
      <Text className="my-2 text-sm font-semibold text-gray-700">Event Image</Text>
      <TouchableOpacity
        onPress={handleImageUploadMobile}
        className="mb-3 rounded-md bg-indigo-600 p-3">
        <Text className="text-center font-semibold text-white">Upload Image</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} className="h-48 w-full rounded-md object-cover" />}

      {/* Time Picker for Start Time */}
      <Text className="my-2 text-sm font-semibold text-gray-700">Select Start Time</Text>
      {Platform.OS === 'web' ? (
        <input
          type="datetime-local"
          value={startDate.toISOString().slice(0, 16)} // Display in local time
          onChange={handleStartTimeChangeWeb}
          className="p-2"
          min={new Date().toISOString().slice(0, 16)}
          disabled={disabledDates.some(
            (date) =>
              new Date(startDate).toISOString().slice(0, 16) >= date.start &&
              new Date(startDate).toISOString().slice(0, 16) <= date.end
          )}
        />
      ) : (
        <>
          <Button title="Pick Start Time" onPress={showStartTimePicker} />
          <DatePicker
            modal
            open={openStartTime}
            date={startDate}
            mode="datetime" // Use datetime mode for mobile
            onConfirm={handleStartTimeConfirm}
            onCancel={hideStartTimePicker}
            minimumDate={new Date()}
          />
        </>
      )}

      {/* Time Picker for End Time */}
      <Text className="my-2 text-sm font-semibold text-gray-700">Select End Time</Text>
      {Platform.OS === 'web' ? (
        <input
          type="datetime-local"
          className="p-2"
          value={endDate.toISOString().slice(0, 16)} // Display in local time
          onChange={handleEndTimeChangeWeb}
          min={new Date().toISOString().slice(0, 16)}
          disabled={disabledDates.some(
            (date) =>
              new Date(endDate).toISOString().slice(0, 16) >= date.start &&
              new Date(endDate).toISOString().slice(0, 16) <= date.end
          )}
        />
      ) : (
        <>
          <Button title="Pick End Time" onPress={showEndTimePicker} />
          <DatePicker
            modal
            open={openEndTime}
            date={endDate}
            mode="datetime" // Use datetime mode for mobile
            onConfirm={handleEndTimeConfirm}
            onCancel={hideEndTimePicker}
            minimumDate={new Date()}
          />
        </>
      )}

      {/* Repeat Options */}
      <Text className="my-2 text-sm font-semibold text-gray-700">Repeat</Text>
      <View className="mb-5 mr-2 flex-row justify-between">
        {repeatOptions.map((option) => (
          <TouchableOpacity
            key={option}
            className={`ml-2 flex-1 rounded-md ${repeat === option ? 'bg-indigo-600' : 'bg-gray-300'}`}
            onPress={() => setRepeat(option as 'None' | 'Weekly' | 'Bi-weekly' | 'Monthly')}>
            <Text
              className={`text-center text-lg ${repeat === option ? 'text-white' : 'text-gray-800'}`}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Button */}
      <Button title="Save Event" onPress={handleSave} color="#6200ee" />
    </ScrollView>
  );
};

export default CreateEventScreen;

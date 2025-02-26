import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // For mobile image picker
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

import { editEvent } from '../redux/eventSlice';
import { AppDispatch } from '../redux/store';
import { Event } from '../types';

const repeatOptions = ['None', 'Weekly', 'Bi-weekly', 'Monthly'];

const EditEventScreen: React.FC = ({ route }: any) => {
  const router = useRouter();
  const { event } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [startDate, setStartDate] = useState(new Date(event?.startDate) ?? new Date());
  const [endDate, setEndDate] = useState(new Date(event?.endDate) ?? new Date());
  const [repeat, setRepeat] = useState<'None' | 'Weekly' | 'Bi-weekly' | 'Monthly'>(
    event.repeat ?? 'None'
  );
  const [openStartTime, setOpenStartTime] = useState(false);
  const [openEndTime, setOpenEndTime] = useState(false);
  const [image, setImage] = useState<string | null>(event.image ?? null); // State for image URI or base64 string

  // Handle start time change for web
  const handleStartTimeChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(e.target.value);
    const timeZoneOffset = selectedDateTime.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localDateTime = new Date(selectedDateTime.getTime() - timeZoneOffset); // Adjust for time zone
    setStartDate(localDateTime);
  };

  // Handle end time change for web
  const handleEndTimeChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(e.target.value);
    const timeZoneOffset = selectedDateTime.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localDateTime = new Date(selectedDateTime.getTime() - timeZoneOffset); // Adjust for time zone
    setEndDate(localDateTime);
  };

  // Handle image upload for mobile
  const handleImageUploadMobile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('Please allow access to your photo library to upload images.');
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

  const handleSave = async () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Event title is required.');
      } else {
        Alert.alert('Validation Error', 'Event title is required.');
      }
      return;
    }

    const eventData: Event = {
      ...event,
      title,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      repeat,
      image,
    };

    dispatch(editEvent(eventData));

    if (Platform.OS === 'web') {
      const storedEvents = localStorage.getItem('events');
      let updatedEvents = [];

      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        updatedEvents = parsedEvents.map((e: Event) => (e.id === event.id ? eventData : e));
      } else {
        updatedEvents = [eventData];
      }

      localStorage.setItem('events', JSON.stringify(updatedEvents));
    } else {
      // React Native: Use AsyncStorage
      const storedEvents = await AsyncStorage.getItem('events');
      let updatedEvents = [];

      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        updatedEvents = parsedEvents.map((e: Event) => (e.id === event.id ? eventData : e));
      } else {
        updatedEvents = [eventData];
      }

      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
    }

    if (Platform.OS === 'web') {
      window.alert('Event updated successfully!');
    } else {
      Alert.alert('Success', 'Event updated successfully!');
    }
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
    setStartDate(updatedStartDate);
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (selectedTime: Date) => {
    const updatedEndDate = new Date(endDate);
    updatedEndDate.setHours(selectedTime.getHours());
    updatedEndDate.setMinutes(selectedTime.getMinutes());
    setEndDate(updatedEndDate);
    hideEndTimePicker();
  };

  return (
    <ScrollView className="max-w-md flex-1 bg-gray-100 p-5">
      {/* Event Title Input */}
      <Text className="my-2 text-sm font-semibold text-gray-700">Event Title</Text>
      <TextInput
        placeholder="Enter event title"
        value={title}
        onChangeText={setTitle}
        className=" rounded-md border border-gray-300 bg-white p-3"
      />

      {/* Description Input */}
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

      <Text className="my-2 text-sm font-semibold text-gray-700">Select Start Time</Text>
      {Platform.OS === 'web' ? (
        <input
          type="datetime-local"
          className="p-2"
          value={startDate.toISOString().slice(0, 16)} // Display in local time
          onChange={handleStartTimeChangeWeb}
          min={new Date().toISOString().slice(0, 16)}
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
      <Text className="py-3 text-lg font-bold text-gray-800">Repeat</Text>
      <View className="mb-5 mr-2 flex-row justify-between">
        {repeatOptions.map((option) => (
          <TouchableOpacity
            key={option}
            className={`ml-2 flex-1 rounded-md py-1 ${repeat === option ? 'bg-indigo-600' : 'bg-gray-300'}`}
            onPress={() => setRepeat(option as 'None' | 'Weekly' | 'Bi-weekly' | 'Monthly')}>
            <Text
              className={`text-center text-lg ${repeat === option ? 'text-white' : 'text-gray-800'}`}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Save" onPress={handleSave} color="#6200ee" />
    </ScrollView>
  );
};

export default EditEventScreen;

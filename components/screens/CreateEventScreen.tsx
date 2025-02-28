import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarView from 'components/CalendarView';
import * as ImagePicker from 'expo-image-picker';
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
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { addEvent, loadEvents } from '../redux/eventSlice';
import { AppDispatch } from '../redux/store';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { generateSimpleId } from 'components/utils';

const repeatOptions = ['None', 'Weekly', 'Bi-weekly', 'Monthly'];

const CreateEventScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [repeat, setRepeat] = useState<'None' | 'Weekly' | 'Bi-weekly' | 'Monthly'>('None');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [disabledDates, setDisabledDates] = useState<{ start: string; end: string }[]>([]);

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().slice(0, 16);
    return disabledDates.some(
      (disabledDate) => dateString >= disabledDate.start && dateString <= disabledDate.end
    );
  };

  const handleStartTimeChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(e.target.value);
    const timeZoneOffset = selectedDateTime.getTimezoneOffset() * 60000;
    const localDateTime = new Date(selectedDateTime.getTime() - timeZoneOffset);
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

  const handleEndTimeChangeWeb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(e.target.value);
    const timeZoneOffset = selectedDateTime.getTimezoneOffset() * 60000;
    const localDateTime = new Date(selectedDateTime.getTime() - timeZoneOffset);
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
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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

  const isDateRangeDisabled = (startDate: Date, endDate: Date) => {
    const startString = startDate.toISOString().slice(0, 16);
    const endString = endDate.toISOString().slice(0, 16);

    return disabledDates.some(
      ({ start, end }) =>
        (startString >= start && startString <= end) ||
        (endString >= start && endString <= end) ||
        (startString <= start && endString >= end)
    );
  };
  const handleSave = async () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        window.alert('This date is already occupied by an event.');
      } else {
        Alert.alert('Error', 'Title cannot be empty');
      }
      return;
    }

    if (isDateRangeDisabled(startDate, endDate)) {
        Alert.alert('Error', 'The selected date range is unavailable.');
        return;
    }
    try { 
    const newEvent = {
        id: Platform.OS === 'web' ? uuidv4() : generateSimpleId(),
        title,
        description,
        startDate: startDate instanceof Date && !isNaN(startDate.getTime()) 
          ? startDate.toISOString() 
          : new Date().toISOString(),
        endDate: endDate instanceof Date && !isNaN(endDate.getTime()) 
          ? endDate.toISOString() 
          : new Date().toISOString(),
        repeat,
        image: image ?? null,
      };
     
      dispatch(addEvent(newEvent));
        if (Platform.OS === 'web') {
          const storedEvents = localStorage.getItem('events');
          const events = storedEvents ? JSON.parse(storedEvents) : [];
          localStorage.setItem('events', JSON.stringify([...events, newEvent]));
        } else {
          const storedEvents = await AsyncStorage.getItem('events');
          const events = storedEvents ? JSON.parse(storedEvents) : [];
          await AsyncStorage.setItem('events', JSON.stringify([...events, newEvent]));
        }
      } catch (error) {
        console.error('Error in handleSave:', error);
      }
      
       if (Platform.OS === 'web') {
        window.alert('Event created successfully!');
      } else {
        Alert.alert('Success', 'Event created successfully!');
      }
      
  };

  const handleStartTimeConfirm = (event: any, selectedTime: Date | undefined) => {
    if (selectedTime) {
      const updatedStartDate = new Date(selectedTime);
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
    }
    dismissPicker()
  };

  const showStartDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: startDate,
        onChange: (event, selectedDate) => {
          if (selectedDate) {
            if (selectedDate < new Date()) {
              Alert.alert('Error', 'Please select a date in the future.');
              return;
            }
            handleEndTimeConfirm(event, selectedDate);
    
            DateTimePickerAndroid.open({
              value: selectedDate,
              onChange: (event, selectedTime) => {
                if (selectedTime) {
                  const updatedDateTime = new Date(selectedDate);
                  updatedDateTime.setHours(selectedTime.getHours());
                  updatedDateTime.setMinutes(selectedTime.getMinutes());
               
                  handleStartTimeConfirm(event, updatedDateTime);
                }
              },
              mode: 'time',
            });
          }
        },
        mode: 'date',
      });
    }
    else{
      setShowStartTimePicker(true)
    }
  };

  const showEndDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: endDate,
        onChange: (event, selectedDate) => {
          if (selectedDate) {
            if (selectedDate < new Date()) {
              Alert.alert('Error', 'Please select a date in the future.');
              return;
            }
            handleEndTimeConfirm(event, selectedDate);
    
            DateTimePickerAndroid.open({
              value: selectedDate,
              onChange: (event, selectedTime) => {
                if (selectedTime) {
                  const updatedDateTime = new Date(selectedDate);
    
                  updatedDateTime.setHours(selectedTime.getHours());
                  updatedDateTime.setMinutes(selectedTime.getMinutes());
               
                  handleEndTimeConfirm(event, updatedDateTime);
                }
              },
              mode: 'time',
            });
          }
        },
        mode: 'date',
      });
    }
    
    else{
      setShowEndTimePicker(true)
    }
  };

  const dismissPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.dismiss('date'); 
    }
  };

  const handleEndTimeConfirm = (event: any, selectedTime: Date | undefined) => {
    if (selectedTime) {
      const updatedEndDate = new Date(selectedTime);
      updatedEndDate.setHours(selectedTime.getHours());
      updatedEndDate.setMinutes(selectedTime.getMinutes());
      if (isDateDisabled(updatedEndDate)) {
        if (Platform.OS === 'web') {
          window.alert('This date is already occupied by an event.');
        } else {
          Alert.alert('Error', 'This date is already occupied by an event.');
        }
        return;
      }
      setEndDate(updatedEndDate);
    }
  };

  return (
    <ScrollView className="max-w-lg w-[100vw]  px-2 flex-1 bg-gray-100">
      <ScrollView className='max-h-[85vh] min-h-[85vh ] h-[85vh]'>
      <View style={{ flex: 1 }}>
        <CalendarView />
      </View>
      <View>
      <Text className="my-2 text-sm font-semibold text-gray-700">Event Title</Text>
      <TextInput
        placeholder="Enter event title"
        value={title}
        onChangeText={setTitle}
        className="rounded-md border border-gray-300 bg-white p-3"
      />

      <Text className="my-2 text-sm font-semibold text-gray-700">Event Description</Text>
      <TextInput
        placeholder="Enter event description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        className="rounded-md border border-gray-300 bg-white p-3"
      />

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
          value={startDate.toISOString().slice(0, 16)}
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
        <View>
          <Button title="Pick Start Time" onPress={showStartDatePicker} color="#6200ee" />
          {showStartTimePicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              onChange={handleStartTimeConfirm}
              minimumDate={new Date()}
            />
          )}
          {startDate && (
            <Text className='py-1'>
              Selected Start Time: {startDate.toLocaleString()}
            </Text>
          )}
        </View>
      )}

      <Text className="my-2 text-sm font-semibold text-gray-700">Select End Time</Text>
      {Platform.OS === 'web' ? (
        <input
          type="datetime-local"
          className="p-2"
          value={endDate.toISOString().slice(0, 16)}
          onChange={handleEndTimeChangeWeb}
          min={new Date().toISOString().slice(0, 16)}
          disabled={disabledDates.some(
            (date) =>
              new Date(endDate).toISOString().slice(0, 16) >= date.start &&
              new Date(endDate).toISOString().slice(0, 16) <= date.end
          )}
        />
      ) : (
        <View>
          <Button title="Pick End Time" onPress={showEndDatePicker} color="#6200ee"/>
          {showEndTimePicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              display="default"
              onChange={handleEndTimeConfirm}
              minimumDate={new Date()}
            />
          )}
          {endDate && (
            <Text className='py-1'>
              Selected End Time: {endDate.toLocaleString()}
            </Text>
          )}
        </View>
      )}

      {/* Repeat Options */}
      <Text className="my-2 text-sm font-semibold text-gray-700">Repeat</Text>
      <View className="mb-5 mr-2 flex-row justify-between">
        {repeatOptions.map((option) => (
          <TouchableOpacity
            key={option}
            className={`ml-2 flex-1 py-1 rounded-md ${repeat === option ? 'bg-indigo-600' : 'bg-gray-300'}`}
            onPress={() => setRepeat(option as 'None' | 'Weekly' | 'Bi-weekly' | 'Monthly')}>
            <Text
              className={`text-center text-lg  font-bold ${repeat === option ? 'text-white' : 'text-gray-800'}`}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      </View>
      </ScrollView>
      <View className='max-w-md'>
        <Button title="Save Event" onPress={handleSave} color="#6200ee"  />
      </View>
    </ScrollView>
  );
};

export default CreateEventScreen;
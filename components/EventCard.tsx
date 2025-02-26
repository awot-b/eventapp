import { format } from 'date-fns';
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface EventCardProps {
  title: string;
  description: string;
  image?: string | null;
  id: string;
  startDate: string;
  endDate: string;
  repeat: 'None' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  onEdit: () => void;
  onDelete: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  startDate,
  endDate,
  description,
  image,
  repeat,
  onEdit,
  onDelete,
}) => {
  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-lg">
      {image && <Image source={{ uri: image }} className="h-56 w-full object-cover" />}
      <View className="p-5">
        <Text className="text-2xl font-semibold text-gray-900">{title}</Text>
        <Text className="mt-1 text-sm text-gray-500">{description}</Text>

        <View className="mt-3 border-t border-gray-200 pt-3">
          <Text className="text-sm text-gray-600">
            {format(new Date(startDate), 'MMM d, yyyy h:mm a')} -{' '}
            {format(new Date(endDate), 'MMM d, yyyy h:mm a')}
          </Text>
          {repeat !== 'None' && (
            <View className="mt-2 w-max rounded-lg bg-blue-100 px-2 py-1">
              <Text className="text-xs font-medium text-blue-800">Repeat: {repeat}</Text>
            </View>
          )}
        </View>

        <View className="mt-4 flex-row justify-between">
          <TouchableOpacity onPress={onEdit} className="mr-2 flex-1 rounded-lg bg-blue-600 py-2">
            <Text className="text-center font-semibold text-white">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} className="ml-2 flex-1 rounded-lg bg-red-500 py-2">
            <Text className="text-center font-semibold text-white">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default EventCard;

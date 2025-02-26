import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Event } from '../types';

interface EventState {
  events: Event[];
}

const initialState: EventState = { events: [] };

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
    },
    editEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
    loadEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
  },
});

export const { addEvent, editEvent, deleteEvent, loadEvents } = eventSlice.actions;
export const selectEvents = (state: { events: EventState }) => state.events.events;
export default eventSlice.reducer;

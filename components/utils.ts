const saveEventsToLocalStorage = (events: Event[]) => {
  localStorage.setItem('events', JSON.stringify(events));
};

// Get events from localStorage
const getEventsFromLocalStorage = () => {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events) : [];
};

export { saveEventsToLocalStorage, getEventsFromLocalStorage };

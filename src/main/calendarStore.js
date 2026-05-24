// Shared in-memory calendar store for simulation purposes
let events = [
  { id: '1', summary: 'Présentation FlowForge', date: new Date(Date.now() + 3600000 * 2).toISOString() }, // 2h from now
  { id: '2', summary: 'Dîner d\'affaires', date: new Date(Date.now() + 3600000 * 24).toISOString() }      // 24h from now
];

export function getEvents() {
  return events;
}

export function addEvent(summary, date) {
  const newEvent = {
    id: `event_${Math.random().toString(36).substr(2, 9)}`,
    summary,
    date
  };
  events.push(newEvent);
  return newEvent;
}

export function clearEvents() {
  events = [];
}

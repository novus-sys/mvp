
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: number;
  type: 'workshop' | 'deadline' | 'meeting' | 'seminar';
}

const events: Event[] = [
  {
    id: '1',
    title: 'AI Research Workshop',
    date: 'Tomorrow',
    time: '10:00 AM - 12:00 PM',
    participants: 42,
    type: 'workshop',
  },
  {
    id: '2',
    title: 'Project Proposal Deadline',
    date: 'Sep 30, 2025',
    time: '11:59 PM',
    participants: 0,
    type: 'deadline',
  },
  {
    id: '3',
    title: 'Mentorship Meeting',
    date: 'Oct 2, 2025',
    time: '3:00 PM - 4:00 PM',
    participants: 2,
    type: 'meeting',
  },
  {
    id: '4',
    title: 'Data Science Seminar',
    date: 'Oct 5, 2025',
    time: '2:00 PM - 4:30 PM',
    participants: 78,
    type: 'seminar',
  },
];

const getEventBadgeColor = (type: Event['type']) => {
  switch (type) {
    case 'workshop':
      return 'bg-brand-blue text-white';
    case 'deadline':
      return 'bg-brand-orange text-white';
    case 'meeting':
      return 'bg-brand-purple text-white';
    case 'seminar':
      return 'bg-emerald-500 text-white';
    default:
      return '';
  }
};

const UpcomingEvents = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Upcoming Events</CardTitle>
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-5">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col space-y-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{event.time}</span>
                </div>
              </div>
              <Badge className={getEventBadgeColor(event.type)} variant="secondary">
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>{event.date}</span>
              {event.participants > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{event.participants} participants</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;

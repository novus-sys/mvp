import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: number;
  type: 'workshop' | 'deadline' | 'meeting' | 'seminar';
  description?: string;
  location?: string;
  organizer?: string;
}

const events: Event[] = [
  {
    id: '1',
    title: 'AI Research Workshop',
    date: 'Tomorrow',
    time: '10:00 AM - 12:00 PM',
    participants: 42,
    type: 'workshop',
    description: 'Join us for an interactive workshop on the latest developments in AI research. Learn about cutting-edge techniques and network with fellow researchers.',
    location: 'Room 101, Computer Science Building',
    organizer: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    title: 'Project Proposal Deadline',
    date: 'Sep 30, 2025',
    time: '11:59 PM',
    participants: 0,
    type: 'deadline',
    description: 'Final submission deadline for research project proposals. Make sure to include all required documentation and follow the submission guidelines.',
  },
  {
    id: '3',
    title: 'Mentorship Meeting',
    date: 'Oct 2, 2025',
    time: '3:00 PM - 4:00 PM',
    participants: 2,
    type: 'meeting',
    description: 'One-on-one mentorship session to discuss research progress and career development.',
    location: 'Virtual Meeting Room',
    organizer: 'Prof. Michael Chen'
  },
  {
    id: '4',
    title: 'Data Science Seminar',
    date: 'Oct 5, 2025',
    time: '2:00 PM - 4:30 PM',
    participants: 78,
    type: 'seminar',
    description: 'Expert panel discussion on the future of data science and its applications in various industries.',
    location: 'Main Auditorium',
    organizer: 'Data Science Department'
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Upcoming Events</CardTitle>
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-5">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="flex flex-col space-y-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
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

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{selectedEvent.time}</span>
                  </div>
                </div>
                <Badge className={getEventBadgeColor(selectedEvent.type)} variant="secondary">
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.organizer && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Organized by: {selectedEvent.organizer}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-muted-foreground">{selectedEvent.date}</span>
                {selectedEvent.participants > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{selectedEvent.participants} participants</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpcomingEvents;

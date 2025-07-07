import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ServiceCalendarProps {
  onTicketSelect: (ticket: any) => void;
}

export function ServiceCalendar({ onTicketSelect }: ServiceCalendarProps) {
  const [events] = useState([
    {
      id: 1,
      title: 'Oil Change - John Doe',
      start: new Date(2024, 6, 15, 10, 0),
      end: new Date(2024, 6, 15, 11, 0),
      resource: {
        job_number: 'JOB-2024-0001',
        customer: 'John Doe',
        vehicle: '2020 Toyota Camry',
        status: 'scheduled'
      }
    },
    {
      id: 2,
      title: 'Brake Inspection - Jane Smith',
      start: new Date(2024, 6, 16, 14, 0),
      end: new Date(2024, 6, 16, 16, 0),
      resource: {
        job_number: 'JOB-2024-0002',
        customer: 'Jane Smith',
        vehicle: '2019 Honda Civic',
        status: 'in_progress'
      }
    }
  ]);

  const handleSelectEvent = (event: any) => {
    onTicketSelect(event.resource);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource?.status) {
      case 'scheduled':
        backgroundColor = '#3b82f6';
        break;
      case 'in_progress':
        backgroundColor = '#f59e0b';
        break;
      case 'completed':
        backgroundColor = '#10b981';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="week"
            step={30}
            showMultiDayTimes
            popup
          />
        </div>
        
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight, Plus, Wrench, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

interface CalendarBooking {
  id: string;
  date: Date;
  truckNumber: string;
  driverName: string;
  driverPhone: string;
  time: string;
  serviceType: string;
  description: string;
  priority: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export function WorkshopCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [formData, setFormData] = useState({
    truckNumber: '',
    driverName: '',
    driverPhone: '',
    time: '',
    serviceType: '',
    description: '',
    priority: 'MEDIUM'
  });

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();
  
  // Add empty cells for days before month starts
  const calendarDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...daysInMonth
  ];

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setShowBookingDialog(true);
    }
  };

  const handleSubmitBooking = () => {
    if (!selectedDate) return;

    const newBooking: CalendarBooking = {
      id: Date.now().toString(),
      date: selectedDate,
      ...formData,
      status: 'scheduled'
    };

    setBookings(prev => [...prev, newBooking]);
    toast.success(`Repair booked for ${format(selectedDate, 'MMM d, yyyy')}`);
    
    // Reset form
    setFormData({
      truckNumber: '',
      driverName: '',
      driverPhone: '',
      time: '',
      serviceType: '',
      description: '',
      priority: 'MEDIUM'
    });
    setShowBookingDialog(false);
  };

  const getBookingsForDate = (date: Date | null) => {
    if (!date) return [];
    return bookings.filter(booking => isSameDay(booking.date, date));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Workshop Repair Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 font-semibold min-w-[180px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </div>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-sm p-2 text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              const dayBookings = date ? getBookingsForDate(date) : [];
              const isCurrentMonth = date ? isSameMonth(date, currentDate) : false;
              const isTodayDate = date ? isToday(date) : false;
              
              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={date ? 0 : -1}
                  onClick={() => handleDateClick(date)}
                  onKeyDown={(e) => {
                    if (date && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleDateClick(date);
                    }
                  }}
                  className={`
                    min-h-[120px] p-2 border rounded-lg transition-all cursor-pointer
                    ${!date ? 'bg-muted/30' : ''}
                    ${!isCurrentMonth ? 'opacity-50' : ''}
                    ${isTodayDate ? 'border-primary border-2 bg-primary/5' : ''}
                    ${date ? 'hover:bg-accent hover:border-primary' : ''}
                  `}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-primary font-bold' : ''}`}>
                        {format(date, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map(booking => (
                          <div
                            key={booking.id}
                            className={`text-xs p-1 rounded ${getPriorityColor(booking.priority)} text-white truncate`}
                            title={`${booking.truckNumber} - ${booking.time}`}
                          >
                            {booking.truckNumber} {booking.time}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Bookings */}
      {/* Today's Bookings */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today&apos;s Schedule ({getBookingsForDate(new Date()).length} bookings)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getBookingsForDate(new Date()).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No repairs scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {getBookingsForDate(new Date()).map(booking => (
                <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className={`w-1 h-16 rounded-full ${getPriorityColor(booking.priority)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{booking.truckNumber}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm">{booking.time}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      <User className="w-3 h-3 inline mr-1" />
                      {booking.driverName} • {booking.driverPhone}
                    </div>
                    <p className="text-sm">{booking.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium mb-1">{booking.serviceType}</div>
                    <div className="text-xs text-muted-foreground">{booking.priority}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Book Repair - {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitBooking(); }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="truckNumber">Truck Number *</Label>
                <Input
                  id="truckNumber"
                  value={formData.truckNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, truckNumber: e.target.value }))}
                  placeholder="e.g., 01A, 02B"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name *</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                  placeholder="Driver name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverPhone">Driver Phone *</Label>
                <Input
                  id="driverPhone"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, driverPhone: e.target.value }))}
                  placeholder="Phone number"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={formData.serviceType} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine Maintenance">Routine Maintenance</SelectItem>
                    <SelectItem value="Repair Service">Repair Service</SelectItem>
                    <SelectItem value="Safety Inspection">Safety Inspection</SelectItem>
                    <SelectItem value="Emergency Service">Emergency Service</SelectItem>
                    <SelectItem value="Tire Service">Tire Service</SelectItem>
                    <SelectItem value="Brake Service">Brake Service</SelectItem>
                    <SelectItem value="Engine Work">Engine Work</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="URGENT">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the repair work needed..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Book Repair
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

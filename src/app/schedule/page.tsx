'use client';

import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WorkOrderCard } from '@/components/work-order-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import { Home, Calendar as CalendarIcon, Plus, Clock, Truck } from 'lucide-react';
import type { EventInput, EventClickArg, EventApi } from '@fullcalendar/core';
import type { WorkOrder, Issue, User as PrismaUser } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type WorkOrderWithRelations = WorkOrder & {
  issue: Issue;
  assignedTo?: Pick<PrismaUser, 'id' | 'name' | 'email' | 'phone'> | null;
};

type CalendarEvent = EventInput & {
  extendedProps: {
    workOrder: WorkOrderWithRelations;
    issue: Issue;
  };
};

type EventChangeArg = {
  event: EventApi;
  revert: () => void;
};

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [unscheduledIssues, setUnscheduledIssues] = useState<Issue[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderWithRelations | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [bookingForm, setBookingForm] = useState({
    startTime: '08:00',
    endTime: '17:00',
    workshopSite: '',
    workType: 'repair',
    notes: ''
  });

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/workorders');
      if (response.ok) {
        const data = (await response.json()) as CalendarEvent[];
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }, []);

  const fetchUnscheduledIssues = useCallback(async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        const issues = Array.isArray(data) ? data : (data.issues ?? []);
        // Filter for issues that are pending or in progress but not yet scheduled
        const unscheduled = issues.filter((issue: Issue) => 
          issue.status === 'PENDING' || issue.status === 'IN_PROGRESS'
        );
        setUnscheduledIssues(unscheduled);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
    void fetchUnscheduledIssues();
  }, [fetchEvents, fetchUnscheduledIssues]);

  const getWorkOrderFromEvent = (event: EventApi): WorkOrderWithRelations | null => {
    const props = event.extendedProps as Partial<CalendarEvent['extendedProps']>;
    return props?.workOrder ?? null;
  };

  const handleEventClick = (info: EventClickArg) => {
    const workOrder = getWorkOrderFromEvent(info.event);
    if (workOrder) {
      setSelectedWorkOrder(workOrder);
      setDialogOpen(true);
    }
  };

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.date);
    setSelectedIssue(null);
    setBookingDialogOpen(true);
  };

  const handleIssueSelect = (issue: Issue) => {
    setSelectedIssue(issue);
    setSelectedDate(new Date());
    setBookingDialogOpen(true);
  };

  const handleCreateBooking = async () => {
    if (!selectedIssue || !selectedDate) {
      toast.error('Please select an issue and date');
      return;
    }

    try {
      // Combine date and time
      const startDate = new Date(selectedDate);
      const [startHour = 0, startMin = 0] = bookingForm.startTime
        .split(':')
        .map((value) => Number.parseInt(value, 10));
      const [endHour = 0, endMin = 0] = bookingForm.endTime
        .split(':')
        .map((value) => Number.parseInt(value, 10));

      if (![startHour, startMin, endHour, endMin].every(Number.isFinite)) {
        toast.error('Please select valid start and end times');
        return;
      }

      startDate.setHours(startHour, startMin, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(endHour, endMin, 0);

      const response = await fetch('/api/workorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedIssue.id,
          startAt: startDate.toISOString(),
          endAt: endDate.toISOString(),
          workshopSite: bookingForm.workshopSite || 'Main Workshop',
          workType: bookingForm.workType,
          notes: bookingForm.notes,
          status: 'SCHEDULED'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      toast.success(`Booked ${selectedIssue.fleetNumber} for service`);
      setBookingDialogOpen(false);
      setSelectedIssue(null);
      setBookingForm({
        startTime: '08:00',
        endTime: '17:00',
        workshopSite: '',
        workType: 'repair',
        notes: ''
      });
      await fetchEvents();
      await fetchUnscheduledIssues();
    } catch (error) {
      console.error('Failed to create booking:', error);
      toast.error('Failed to create booking');
    }
  };

  const handleEventDrop = async (info: EventChangeArg) => {
    const workOrder = getWorkOrderFromEvent(info.event);
    if (!workOrder) {
      info.revert();
      return;
    }

    try {
      const response = await fetch(`/api/workorders/${info.event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startAt: info.event.start?.toISOString(),
          endAt: info.event.end?.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      toast.success('Work order rescheduled');
      await fetchEvents();
    } catch (error) {
      console.error('Failed to reschedule work order:', error);
      info.revert();
      toast.error('Failed to reschedule');
    }
  };

  const handleEventResize = async (info: EventChangeArg) => {
    const workOrder = getWorkOrderFromEvent(info.event);
    if (!workOrder) {
      info.revert();
      return;
    }

    try {
      const response = await fetch(`/api/workorders/${info.event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startAt: info.event.start?.toISOString(),
          endAt: info.event.end?.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      toast.success('Duration updated');
      await fetchEvents();
    } catch (error) {
      console.error('Failed to reschedule work order:', error);
      info.revert();
      toast.error('Failed to update duration');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/workshop">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Workshop
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Workshop Schedule</h1>
                  <p className="text-xs text-muted-foreground">Drag to reschedule • Click dates to book</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {unscheduledIssues.length} pending
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar - Unscheduled Issues */}
          <Card className="lg:sticky lg:top-24 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Unscheduled Issues</span>
                <Badge variant="secondary">{unscheduledIssues.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-2 p-4 pt-0">
                  {unscheduledIssues.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      All issues scheduled!
                    </div>
                  ) : (
                    unscheduledIssues.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => handleIssueSelect(issue)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:border-primary hover:shadow-md ${getSeverityColor(issue.severity)}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-semibold text-sm">#{issue.ticket}</span>
                          <Badge variant="outline" className="text-xs">{issue.severity}</Badge>
                        </div>
                        <div className="text-sm font-medium mb-1">{issue.fleetNumber}</div>
                        <div className="text-xs opacity-90 line-clamp-2">{issue.description}</div>
                        <div className="mt-2 flex items-center gap-1">
                          <Plus className="h-3 w-3" />
                          <span className="text-xs font-medium">Click to schedule</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Calendar */}
          <div className="bg-card rounded-2xl p-6 border shadow-sm">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              timeZone="Australia/Melbourne"
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              events={events}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              dateClick={handleDateClick}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="20:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              nowIndicator={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                startTime: '07:00',
                endTime: '18:00',
              }}
              eventClassNames="cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Work Order Details Dialog */}
      {selectedWorkOrder && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Work Order Details</DialogTitle>
            </DialogHeader>
            <WorkOrderCard
              workOrder={selectedWorkOrder}
              onUpdate={async () => {
                await fetchEvents();
                await fetchUnscheduledIssues();
                setDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Schedule Service
            </DialogTitle>
            <DialogDescription>
              {selectedIssue ? (
                <span className="font-medium">
                  #{selectedIssue.ticket} - {selectedIssue.fleetNumber}
                </span>
              ) : (
                'Select an issue from the sidebar first'
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedIssue ? (
            <div className="space-y-4">
              {/* Issue Info */}
              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{selectedIssue.fleetNumber}</div>
                    <div className="text-sm text-muted-foreground">{selectedIssue.category}</div>
                  </div>
                  <Badge className={getSeverityColor(selectedIssue.severity)}>
                    {selectedIssue.severity}
                  </Badge>
                </div>
                <p className="text-sm">{selectedIssue.description}</p>
              </div>

              {/* Booking Date */}
              <div className="space-y-2">
                <Label htmlFor="bookingDate">Service Date</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={selectedDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  required
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Workshop Site */}
              <div className="space-y-2">
                <Label htmlFor="workshopSite">Workshop Location</Label>
                <Input
                  id="workshopSite"
                  value={bookingForm.workshopSite}
                  onChange={(e) => setBookingForm({...bookingForm, workshopSite: e.target.value})}
                  placeholder="Main Workshop"
                />
              </div>

              {/* Work Type */}
              <div className="space-y-2">
                <Label htmlFor="workType">Service Type</Label>
                <Select 
                  value={bookingForm.workType} 
                  onValueChange={(value) => setBookingForm({...bookingForm, workType: value})}
                >
                  <SelectTrigger id="workType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  placeholder="Additional notes for the technician..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setBookingDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBooking}
                  className="flex-1"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Select an issue from the sidebar to schedule</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

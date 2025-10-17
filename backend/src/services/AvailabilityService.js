/**
 * AvailabilityService - Single Responsibility: Handle slot generation & availability
 */
export class AvailabilityService {
  generateAvailableSlots(availability, startDate = new Date(), days = 7) {
    const slots = [];
    
    if (!availability) {
      return [];
    }
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      const dayAvailability = availability[dayName];
      if (!dayAvailability || dayAvailability.length === 0) {
        continue;
      }
      
      dayAvailability.forEach(timeSlot => {
        const [startHour, startMin] = timeSlot.start.split(':').map(Number);
        const [endHour, endMin] = timeSlot.end.split(':').map(Number);
        
        let currentHour = startHour;
        let currentMin = startMin;
        
        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
          const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
          slots.push({
            date: date.toISOString().split('T')[0],
            time: timeString,
            available: true
          });
          
          currentMin += 30;
          if (currentMin >= 60) {
            currentMin = 0;
            currentHour++;
          }
        }
      });
    }
    
    return slots;
  }

  async checkSlotAvailability(doctorId, dateTime, appointmentRepository) {
    const existingAppointment = await appointmentRepository.findConflicting(doctorId, dateTime);
    return !existingAppointment;
  }
}
import { toDateString } from './price.helper';

export function buildConfirmationEmail(order: any): string {
  const dates = `${toDateString(order.checkInDate)} - ${toDateString(order.checkOutDate)}`;
  const total = Number(order.totalAmount).toLocaleString('id-ID');
  return `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2>Booking Confirmed #${order.orderNumber}</h2>
      <p>Dear ${order.user.name}, your reservation at <strong>${order.property.name}</strong> is confirmed!</p>
      <p>Address: ${order.property.address}, ${order.property.city} | Room: ${order.room.name}</p>
      <p>Dates: ${dates} | Guests: ${order.guestCount} | Total: Rp ${total}</p>
      <p>Note: Check-in begins at 14:00. Please have a valid ID ready upon arrival.</p>
    </div>
  `;
}

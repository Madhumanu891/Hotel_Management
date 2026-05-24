import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/axios';

export const useDownloadInvoice = () =>
  useMutation({
    mutationFn: async (bookingId) => {
      const res = await api.get(`/api/payments/booking/${bookingId}`);
      return res.data.data;
    },
    onError: () => toast.error('Could not fetch invoice details'),
  });

// Generate and download invoice as HTML printed PDF
export const generateInvoicePDF = (booking, payment, property) => {
  const checkIn  = new Date(booking.checkInDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const nights = Math.ceil(
    (new Date(booking.checkOutDate) - new Date(booking.checkInDate))
    / (1000 * 60 * 60 * 24)
  );
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${booking.bookingRef}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; color: #1f2937; background: #fff; }
        .page { max-width: 700px; margin: 0 auto; padding: 48px 40px; }

        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-icon { width: 44px; height: 44px; background: #6d28d9; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
        .brand-name { font-size: 22px; font-weight: 700; color: #111827; }
        .brand-sub  { font-size: 12px; color: #6b7280; margin-top: 2px; }

        .invoice-meta { text-align: right; }
        .invoice-title { font-size: 28px; font-weight: 700; color: #6d28d9; }
        .invoice-ref   { font-size: 14px; color: #6b7280; margin-top: 4px; }
        .invoice-date  { font-size: 13px; color: #6b7280; margin-top: 2px; }

        .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }

        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
        .info-section h3 { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .info-row { font-size: 14px; color: #374151; line-height: 1.8; }
        .info-label { color: #9ca3af; font-size: 12px; }

        .booking-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 32px; }
        .booking-row  { display: flex; justify-content: space-between; font-size: 14px; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; }
        .booking-row:last-child { border-bottom: none; }
        .booking-label { color: #6b7280; }
        .booking-value { font-weight: 500; color: #111827; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; }
        td { padding: 14px 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; }

        .totals { margin-left: auto; width: 280px; }
        .total-row { display: flex; justify-content: space-between; font-size: 14px; padding: 8px 0; color: #6b7280; }
        .total-final { display: flex; justify-content: space-between; font-size: 17px; font-weight: 700; color: #111827; padding: 12px 0; border-top: 2px solid #e5e7eb; margin-top: 4px; }

        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-paid { background: #d1fae5; color: #065f46; }

        .footer { margin-top: 48px; text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.8; }
        .footer strong { color: #6d28d9; }

        @media print {
          .page { padding: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div class="brand">
            <div class="brand-icon">N</div>
            <div>
              <div class="brand-name">NexoraHotels</div>
              <div class="brand-sub">Premium Hotel Management</div>
            </div>
          </div>
          <div class="invoice-meta">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-ref">#${booking.bookingRef}</div>
            <div class="invoice-date">Issued: ${issueDate}</div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Info Grid -->
        <div class="info-grid">
          <div class="info-section">
            <h3>Billed To</h3>
            <div class="info-row">
              <div style="font-weight:600;font-size:15px;margin-bottom:4px">Guest</div>
              <div class="info-label">Booking ID: ${booking._id}</div>
            </div>
          </div>
          <div class="info-section">
            <h3>Property</h3>
            <div class="info-row">
              <div style="font-weight:600;font-size:15px;margin-bottom:4px">
                ${property?.name || 'NexoraHotels Property'}
              </div>
              <div class="info-label">${property?.location?.city || ''}, ${property?.location?.state || ''}</div>
              <div class="info-label">${property?.contactInfo?.phone || ''}</div>
            </div>
          </div>
        </div>

        <!-- Booking Details -->
        <div class="booking-card">
          <div class="booking-row">
            <span class="booking-label">Check-in Date</span>
            <span class="booking-value">${checkIn}</span>
          </div>
          <div class="booking-row">
            <span class="booking-label">Check-out Date</span>
            <span class="booking-value">${checkOut}</span>
          </div>
          <div class="booking-row">
            <span class="booking-label">Duration</span>
            <span class="booking-value">${nights} Night${nights > 1 ? 's' : ''}</span>
          </div>
          <div class="booking-row">
            <span class="booking-label">Guests</span>
            <span class="booking-value">${booking.adults} Adult${booking.adults > 1 ? 's' : ''}${booking.children > 0 ? `, ${booking.children} Children` : ''}</span>
          </div>
          <div class="booking-row">
            <span class="booking-label">Status</span>
            <span class="status-badge status-paid">${booking.paymentStatus?.toUpperCase() || 'PAID'}</span>
          </div>
        </div>

        <!-- Line Items -->
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Nights</th>
              <th>Rate/Night</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Room Accommodation<br><span style="color:#9ca3af;font-size:12px">Standard room charges</span></td>
              <td>${nights}</td>
              <td>₹${Math.round((booking.pricing?.basePrice || 0) / nights).toLocaleString()}</td>
              <td style="text-align:right">₹${(booking.pricing?.basePrice || 0).toLocaleString()}</td>
            </tr>
            ${booking.specialRequests ? `
            <tr>
              <td colspan="3" style="color:#6b7280;font-size:12px;font-style:italic">
                Note: ${booking.specialRequests}
              </td>
              <td></td>
            </tr>` : ''}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${(booking.pricing?.basePrice || 0).toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>GST (18%)</span>
            <span>₹${(booking.pricing?.taxAmount || 0).toLocaleString()}</span>
          </div>
          <div class="total-final">
            <span>Total Paid</span>
            <span>₹${(booking.pricing?.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        ${payment ? `
        <div class="divider"></div>
        <div style="font-size:13px;color:#6b7280">
          <strong style="color:#374151">Payment Reference:</strong> ${payment.paymentRef || payment._id}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong style="color:#374151">Method:</strong> ${payment.method?.toUpperCase() || 'PAYPAL'}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong style="color:#374151">Date:</strong> ${new Date(payment.createdAt).toLocaleDateString('en-IN')}
        </div>` : ''}

        <!-- Footer -->
        <div class="footer">
          <p>Thank you for choosing <strong>NexoraHotels</strong></p>
          <p>For support: support@nexorahotels.com | +91 1800 123 4567</p>
          <p style="margin-top:8px;color:#d1d5db">This is a computer-generated invoice and does not require a signature</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
};
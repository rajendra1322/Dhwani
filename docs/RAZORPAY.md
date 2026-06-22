# Dhwani — Razorpay test mode

This app uses **post-accept payment** with a **50% or full** choice at checkout.

## Environment variables (backend)

| Variable | Purpose |
|----------|---------|
| `RAZORPAY_KEY_ID` | Test Key Id from Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Test Key Secret |
| `PAYMENT_WINDOW_MINUTES` | Optional. Default `30`. After accept, the guest must start checkout before expiry. |
| `COMPANY_NAME` | Shown on PDF invoice (default: `Dhwani Events Pvt. Ltd.`) |
| `COMPANY_ADDRESS` | Optional address line on invoice |
| `COMPANY_GSTIN` | Optional GSTIN on invoice |

The frontend loads Razorpay Checkout. The Key Id is returned from **`POST /api/user/bookings/:id/checkout`** (and listed under `GET /config/public` for diagnostics).

## Server flow

1. **`PATCH /api/artist/bookings/:id`** with `{ "action": "accept" }`  
   - Sets status to **`ACCEPTED`**, snapshots **`programPricePaise`** / **`balanceDuePaise`**, clears any prior order id, sets **`paymentDeadline`**.  
   - No Razorpay order is created yet.

2. **`POST /api/user/bookings/:id/checkout`** with `{ "mode": "HALF" \| "FULL" }` when status is **`ACCEPTED`** (or empty body when status is **`PARTIALLY_PAID`** to pay the remaining balance).  
   - Creates a Razorpay **order** for either half (floor of program total / 2) or full amount in paise.  
   - Stores `razorpayOrderId` and `amountPaise` for this attempt.

3. **Browser** — `new Razorpay({ key, amount, currency, order_id, handler })` using test keys.

4. **`POST /api/user/bookings/:id/verify-payment`** with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`  
   - Verifies HMAC SHA256: `HMAC_SHA256(order_id + "|" + payment_id, secret) === signature`.  
   - Adds the paid amount to **`totalPaidPaise`**. If anything remains, status becomes **`PARTIALLY_PAID`** and a **7-day** balance window applies; otherwise **`PAID`**.  
   - Idempotent on `razorpay_payment_id`.

5. **Invoice** — `GET /api/user/bookings/:id/invoice-data` returns JSON for the browser **jsPDF** script (see `frontend/index.html`) to download a PDF.

## Test cards

Use [Razorpay test cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/) from their documentation while in test mode.

## Notes

- Do not verify payments only in the browser; always use the verify endpoint.  
- Minimum checkout amount is **100 paise** (₹1) per Razorpay order rules; use realistic program prices in tests.

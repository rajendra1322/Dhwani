import jsPDF from "jspdf"
import { format } from "date-fns"

function currency(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`
}

function drawSectionBox(pdf, x, y, w, h, title) {
  pdf.setDrawColor(220, 224, 230)
  pdf.setFillColor(250, 251, 253)
  pdf.roundedRect(x, y, w, h, 3, 3, "FD")
  if (title) {
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(8)
    pdf.setTextColor(107, 91, 73)
    pdf.text(title.toUpperCase(), x + 4, y + 5)
  }
}

function writeLines(pdf, lines, x, y, lineHeight = 5, color = [28, 27, 26]) {
  pdf.setTextColor(...color)
  lines.forEach((line) => {
    pdf.text(String(line), x, y)
    y += lineHeight
  })
  return y
}

export async function generateProfessionalInvoice(bookingData) {
  const {
    invoiceNumber,
    invoiceDate,
    dueDate,
    artistName,
    artistEmail,
    artistPhone,
    artistGSTIN,
    userName,
    userEmail,
    userPhone,
    eventDate,
    eventLocation,
    programTitle,
    programDescription,
    amount,
    gstRate = 18,
    notes = "",
  } = bookingData

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "A4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - margin * 2
  const primary = [196, 92, 38]
  const navy = [30, 42, 94]
  const text = [28, 27, 26]
  const muted = [107, 91, 73]

  let y = margin

  pdf.setFillColor(...primary)
  pdf.roundedRect(margin, y, contentWidth, 22, 4, 4, "F")
  pdf.setTextColor(255, 255, 255)
  pdf.setFont("Helvetica", "bold")
  pdf.setFontSize(20)
  pdf.text("INVOICE", margin + 4, y + 9)
  pdf.setFontSize(9)
  pdf.setFont("Helvetica", "normal")
  pdf.text("Dhwani Event Management", margin + 4, y + 15)
  pdf.setFontSize(10)
  pdf.setFont("Helvetica", "bold")
  pdf.text(`#${invoiceNumber || "INV"}`, pageWidth - margin - 40, y + 9)
  pdf.setFont("Helvetica", "normal")
  pdf.text(format(new Date(invoiceDate), "dd MMM yyyy"), pageWidth - margin - 40, y + 15)

  y += 28

  const leftBoxH = 34
  const rightBoxH = 34
  drawSectionBox(pdf, margin, y, contentWidth / 2 - 2, leftBoxH, "From")
  drawSectionBox(pdf, pageWidth / 2 + 2, y, contentWidth / 2 - 2, rightBoxH, "Bill To")

  pdf.setFontSize(9)
  pdf.setFont("Helvetica", "normal")
  writeLines(
    pdf,
    [
      artistName || "Artist",
      artistEmail || "",
      artistPhone ? `Phone: ${artistPhone}` : "",
      artistGSTIN ? `GSTIN: ${artistGSTIN}` : "GSTIN: N/A",
    ].filter(Boolean),
    margin + 4,
    y + 10,
    4.8,
    text
  )

  writeLines(
    pdf,
    [userName || "Guest", userEmail || "", userPhone ? `Phone: ${userPhone}` : ""].filter(Boolean),
    pageWidth / 2 + 6,
    y + 10,
    4.8,
    text
  )

  y += Math.max(leftBoxH, rightBoxH) + 8

  const metaH = 20
  drawSectionBox(pdf, margin, y, contentWidth, metaH, "Invoice details")
  pdf.setTextColor(...text)
  pdf.setFont("Helvetica", "normal")
  pdf.setFontSize(9)
  pdf.text(`Invoice date: ${format(new Date(invoiceDate), "dd MMM yyyy")}`, margin + 4, y + 11)
  pdf.text(`Due date: ${format(new Date(dueDate), "dd MMM yyyy")}`, margin + 70, y + 11)
  pdf.text(`Event date: ${format(new Date(eventDate), "dd MMM yyyy")}`, margin + 126, y + 11)

  y += metaH + 8

  pdf.setDrawColor(220, 224, 230)
  pdf.setFillColor(...navy)
  pdf.rect(margin, y, contentWidth, 8, "F")
  pdf.setTextColor(255, 255, 255)
  pdf.setFont("Helvetica", "bold")
  pdf.setFontSize(9)
  pdf.text("Description", margin + 3, y + 5.5)
  pdf.text("Date", margin + 103, y + 5.5)
  pdf.text("Location", margin + 128, y + 5.5)
  pdf.text("Amount", pageWidth - margin - 18, y + 5.5, { align: "right" })

  y += 12

  const description = programDescription
    ? `${programTitle || "Booking service"} - ${programDescription}`
    : programTitle || "Booking service"
  const descLines = pdf.splitTextToSize(description, 90)
  const loc = eventLocation || "N/A"
  const locLines = pdf.splitTextToSize(loc, 40)
  const rowHeight = Math.max(descLines.length * 4.5, locLines.length * 4.5, 10)

  pdf.setFillColor(255, 255, 255)
  pdf.setDrawColor(232, 236, 241)
  pdf.roundedRect(margin, y - 1, contentWidth, rowHeight + 2, 2, 2, "FD")
  pdf.setTextColor(...text)
  pdf.setFont("Helvetica", "normal")
  pdf.setFontSize(9)

  let rowY = y + 4
  descLines.forEach((line, index) => {
    pdf.text(line, margin + 3, rowY + index * 4.5)
  })
  pdf.text(format(new Date(eventDate), "dd MMM yyyy"), margin + 103, rowY)
  locLines.forEach((line, index) => {
    pdf.text(line, margin + 128, rowY + index * 4.5)
  })
  pdf.text(currency(amount), pageWidth - margin - 3, rowY, { align: "right" })

  y += rowHeight + 8

  const subtotal = Number(amount || 0)
  const gstAmount = (subtotal * gstRate) / 100
  const total = subtotal + gstAmount

  const summaryX = pageWidth - margin - 72
  const summaryW = 72
  drawSectionBox(pdf, summaryX, y, summaryW, 32, "Summary")

  pdf.setTextColor(...text)
  pdf.setFontSize(9)
  pdf.setFont("Helvetica", "normal")
  pdf.text("Subtotal", summaryX + 4, y + 12)
  pdf.text(currency(subtotal), pageWidth - margin - 4, y + 12, { align: "right" })
  pdf.text(`GST (${gstRate}%)`, summaryX + 4, y + 18)
  pdf.text(currency(gstAmount), pageWidth - margin - 4, y + 18, { align: "right" })
  pdf.setFont("Helvetica", "bold")
  pdf.setFontSize(10)
  pdf.setTextColor(...navy)
  pdf.text("Total", summaryX + 4, y + 27)
  pdf.text(currency(total), pageWidth - margin - 4, y + 27, { align: "right" })

  y += 40

  if (eventLocation) {
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(9)
    pdf.setTextColor(...muted)
    pdf.text("Event location", margin, y)
    y += 5
    pdf.setFont("Helvetica", "normal")
    pdf.setTextColor(...text)
    y = writeLines(pdf, pdf.splitTextToSize(eventLocation, contentWidth), margin, y, 4.5, text) + 2
  }

  if (notes) {
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(9)
    pdf.setTextColor(...muted)
    pdf.text("Notes", margin, y)
    y += 5
    pdf.setFont("Helvetica", "normal")
    pdf.setTextColor(...text)
    y = writeLines(pdf, pdf.splitTextToSize(notes, contentWidth), margin, y, 4.5, text) + 2
  }

  const footerY = pageHeight - 16
  pdf.setDrawColor(220, 224, 230)
  pdf.line(margin, footerY, pageWidth - margin, footerY)
  pdf.setFontSize(8)
  pdf.setTextColor(120, 120, 120)
  pdf.text(
    "Thank you for your business. Payment terms: 50% upfront, 50% on event day.",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  )
  pdf.text(
    `Generated on ${format(new Date(), "dd MMM yyyy HH:mm")}`,
    pageWidth / 2,
    footerY + 9,
    { align: "center" }
  )

  return pdf
}

export async function downloadInvoicePDF(bookingData, filename = "invoice.pdf") {
  try {
    const pdf = await generateProfessionalInvoice(bookingData)
    pdf.save(filename)
    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}

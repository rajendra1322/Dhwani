import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { formatDate } from "date-fns"

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

  // Create PDF with A4 size
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "A4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  // Colors
  const primaryColor = [196, 92, 38] // #c45c26
  const darkColor = [15, 13, 24] // #0f0d18
  const lightColor = [255, 255, 255]

  let yPosition = margin

  // Header with company branding
  pdf.setFillColor(...primaryColor)
  pdf.rect(0, 0, pageWidth, 25, "F")

  // Invoice title
  pdf.setFont("Helvetica", "bold")
  pdf.setFontSize(20)
  pdf.setTextColor(...lightColor)
  pdf.text("INVOICE", margin, 12)

  pdf.setFontSize(10)
  pdf.setFont("Helvetica", "normal")
  pdf.text("Dhwani Event Management", margin, 18)

  // Invoice number and date on right
  pdf.setFontSize(9)
  pdf.setTextColor(80, 80, 80)
  const invoiceInfoX = pageWidth - margin - 60
  pdf.text(`Invoice #: ${invoiceNumber}`, invoiceInfoX, 12)
  pdf.text(`Date: ${formatDate(new Date(invoiceDate), "dd/MM/yyyy")}`, invoiceInfoX, 17)
  pdf.text(`Due: ${formatDate(new Date(dueDate), "dd/MM/yyyy")}`, invoiceInfoX, 22)

  yPosition = 35

  // Artist (From) and Customer (To) sections
  pdf.setFontSize(9)
  pdf.setFont("Helvetica", "bold")
  pdf.setTextColor(80, 80, 80)
  pdf.text("FROM:", margin, yPosition)
  pdf.text("BILL TO:", pageWidth / 2, yPosition)

  yPosition += 5
  pdf.setFont("Helvetica", "normal")
  pdf.setFontSize(9)

  // Artist details
  const artistDetails = [
    artistName,
    artistEmail,
    `Ph: ${artistPhone}`,
    `GSTIN: ${artistGSTIN || "N/A"}`,
  ]

  let artistY = yPosition
  artistDetails.forEach((detail) => {
    pdf.text(detail, margin, artistY)
    artistY += 5
  })

  // Customer details
  const customerDetails = [
    userName,
    userEmail,
    `Ph: ${userPhone}`,
  ]

  let customerY = yPosition
  customerDetails.forEach((detail) => {
    pdf.text(detail, pageWidth / 2, customerY)
    customerY += 5
  })

  yPosition = Math.max(artistY, customerY) + 5

  // Divider line
  pdf.setDrawColor(196, 92, 38)
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)

  yPosition += 8

  // Item details header
  pdf.setFillColor(245, 233, 216)
  pdf.setTextColor(80, 80, 80)
  pdf.setFont("Helvetica", "bold")
  pdf.setFontSize(9)

  const col1 = margin
  const col2 = margin + 80
  const col3 = pageWidth - margin - 40

  pdf.rect(margin - 1, yPosition - 4, contentWidth + 2, 6, "F")
  pdf.text("Description", col1, yPosition)
  pdf.text("Date", col2, yPosition)
  pdf.text("Amount", col3, yPosition)

  yPosition += 8

  // Items
  pdf.setFont("Helvetica", "normal")
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(9)

  // Program details
  const programText = `${programTitle}${programDescription ? ` - ${programDescription}` : ""}`
  const maxWidth = 60
  const lines = pdf.splitTextToSize(programText, maxWidth)

  lines.forEach((line, index) => {
    if (index === 0) {
      pdf.text(line, col1, yPosition)
      pdf.text(formatDate(new Date(eventDate), "dd/MM/yyyy"), col2, yPosition)
      pdf.text(`₹${amount.toFixed(2)}`, col3, yPosition)
    } else {
      pdf.text(line, col1, yPosition)
    }
    yPosition += 5
  })

  if (eventLocation) {
    const locationText = `Location: ${eventLocation}`
    const locationLines = pdf.splitTextToSize(locationText, maxWidth)
    yPosition += 2
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    locationLines.forEach((line) => {
      pdf.text(line, col1, yPosition)
      yPosition += 4
    })
    yPosition += 2
  }

  yPosition += 5

  // Divider
  pdf.setDrawColor(196, 92, 38)
  pdf.setLineWidth(0.3)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)

  yPosition += 8

  // Calculation table
  pdf.setFont("Helvetica", "normal")
  pdf.setFontSize(9)
  pdf.setTextColor(0, 0, 0)

  const subtotal = amount
  const gstAmount = (subtotal * gstRate) / 100
  const total = subtotal + gstAmount

  // Subtotal
  pdf.text("Subtotal:", col2, yPosition)
  pdf.text(`₹${subtotal.toFixed(2)}`, col3, yPosition)

  // GST
  yPosition += 6
  pdf.text(`GST (${gstRate}%):`, col2, yPosition)
  pdf.text(`₹${gstAmount.toFixed(2)}`, col3, yPosition)

  // Total (highlighted)
  yPosition += 8
  pdf.setFillColor(196, 92, 38)
  pdf.rect(col2 - 20, yPosition - 5, contentWidth - col2 + 20 + 1, 8, "F")
  pdf.setFont("Helvetica", "bold")
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(11)
  pdf.text("TOTAL:", col2, yPosition + 1)
  pdf.text(`₹${total.toFixed(2)}`, col3, yPosition + 1)

  yPosition += 15

  // Notes section
  if (notes) {
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(9)
    pdf.setTextColor(80, 80, 80)
    pdf.text("Notes:", margin, yPosition)

    yPosition += 5
    pdf.setFont("Helvetica", "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)

    const notesLines = pdf.splitTextToSize(notes, contentWidth)
    notesLines.forEach((line) => {
      pdf.text(line, margin, yPosition)
      yPosition += 4
    })
  }

  // Footer
  const footerY = pageHeight - 15
  pdf.setDrawColor(196, 92, 38)
  pdf.setLineWidth(0.3)
  pdf.line(margin, footerY, pageWidth - margin, footerY)

  pdf.setFontSize(8)
  pdf.setTextColor(150, 150, 150)
  pdf.setFont("Helvetica", "normal")
  pdf.text(
    "Thank you for your business! Payment terms: 50% upfront, 50% on event day",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  )
  pdf.text(
    `Generated on ${formatDate(new Date(), "dd/MM/yyyy HH:mm")} | Dhwani Event Management`,
    pageWidth / 2,
    pageHeight - 5,
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

// PDF generation
export async function generatePDF(pages) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    const imgData = pages[i].canvas.toDataURL('image/jpeg', 0.75);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
  }
  
  return pdf;
}

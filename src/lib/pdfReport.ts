import { jsPDF } from "jspdf";
export async function makeReportPDF(lines: string[], fontBytes?: Uint8Array) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const bytes =
    fontBytes ??
    new Uint8Array(
      await (await fetch("/assets/dm-sans-report.ttf")).arrayBuffer(),
    );
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  pdf.addFileToVFS("DMSans.ttf", btoa(binary));
  pdf.addFont("DMSans.ttf", "DMSans", "normal");
  pdf.setFont("DMSans");
  pdf.setFontSize(10);
  let y = 18,
    page = 1;
  for (const line of lines) {
    for (const part of pdf.splitTextToSize(line || " ", 176) as string[]) {
      if (y > 276) {
        pdf.addPage();
        page++;
        y = 18;
      }
      pdf.text(part, 17, y);
      y += 5;
    }
    y += 2;
  }
  for (let i = 1; i <= page; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(
      `RecoveryMap / descriptive demonstration / ${i} / ${page}`,
      17,
      289,
    );
  }
  return pdf;
}
export async function downloadReportPDF(lines: string[], name: string) {
  const pdf = await makeReportPDF(lines);
  pdf.save(name);
}

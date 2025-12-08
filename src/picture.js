import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js";

export async function downloadReportJPG(targetEl) {
  const box = targetEl || document.querySelector("#rep-result");

  if (!box) {
    alert("Report container not found.");
    return;
  }

  if (!box.innerHTML.trim()) {
    alert("No report found to download.");
    return;
  }

  const canvas = await html2canvas(box, {
    scale: 2,
    backgroundColor: "#ffffff"
  });

  const jpg = canvas.toDataURL("image/jpeg", 0.95);

  const a = document.createElement("a");
  a.href = jpg;
  a.download = "meal-report.jpg";
  a.click();
}

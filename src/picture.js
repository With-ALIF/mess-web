import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js";


export function downloadReportJPG(element) {
  if (typeof html2canvas !== "function") {
    alert("html2canvas library missing.");
    return;
  }

  html2canvas(element, { scale: 2 }).then((canvas) => {
    const margin = 5; // চারপাশে ৫px মার্জিন

    const newCanvas = document.createElement("canvas");
    newCanvas.width = canvas.width + margin * 2;
    newCanvas.height = canvas.height + margin * 2;

    const ctx = newCanvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    ctx.drawImage(canvas, margin, margin);

    const link = document.createElement("a");
    link.download = "meal-report.jpg";
    link.href = newCanvas.toDataURL("image/jpeg", 1.0);
    link.click();
  }).catch((e) => {
    console.error(e);
    alert("Could not generate JPG.");
  });
}
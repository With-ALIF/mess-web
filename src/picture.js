import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js";

export async function downloadReportJPG(resultDiv) {
  if (typeof html2canvas !== "function") {
    alert("html2canvas library missing.");
    return;
  }

  const clone = resultDiv.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.width = "1200px";
  clone.style.maxWidth = "1200px";
  clone.style.background = "#ffffff";
  clone.style.zIndex = "-1";
  clone.style.overflow = "visible";

  clone.querySelectorAll(".table-wrapper").forEach((el) => {
    el.style.maxHeight = "none";
    el.style.overflow = "visible";
  });

  clone.querySelectorAll(".report-table").forEach((el) => {
    el.style.overflow = "visible";
  });

  document.body.appendChild(clone);

  try {
    const w = clone.scrollWidth || clone.offsetWidth;
    const h = clone.scrollHeight || clone.offsetHeight;

    const canvas = await html2canvas(clone, {
      scale: 2,
      width: w,
      height: h,
      windowWidth: w,
      windowHeight: h,
      scrollX: 0,
      scrollY: 0
    });

    document.body.removeChild(clone);

    const marginPx = 5;
    const canvasWithMargin = document.createElement("canvas");
    canvasWithMargin.width = canvas.width + marginPx * 2;
    canvasWithMargin.height = canvas.height + marginPx * 2;

    const ctx = canvasWithMargin.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
    ctx.drawImage(canvas, marginPx, marginPx);

    const imgData = canvasWithMargin.toDataURL("image/jpeg", 0.95);

    const link = document.createElement("a");
    link.href = imgData;
    link.download = "meal-report.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    document.body.removeChild(clone);
    console.error(e);
    alert("Could not generate JPG.");
  }
}
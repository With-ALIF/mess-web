import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js";

export async function downloadReportJPG(resultDiv) {
  const fixedWidth = 1024;

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.width = fixedWidth + "px";
  wrapper.style.background = "white";

  const clone = resultDiv.cloneNode(true);
  clone.style.width = "100%";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const canvas = await html2canvas(wrapper, {
    scale: 2,
    width: fixedWidth,
    windowWidth: fixedWidth
  });

  document.body.removeChild(wrapper);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "meal-report.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

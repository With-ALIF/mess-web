import { qs, formatCurrency, parseDateInputValue } from "./utils.js";
import { getDailyMealsReport, getMonthlyMealsReport, getRangeMealsReport } from "./billing.js";
import { downloadReportJPG } from "./picture.js";

function renderMealsReport(report) {
  const container = qs("#rep-result");

  if (!report || report instanceof Error || report.error) {
    container.textContent = report?.message || "No data found.";
    return;
  }

  const title = report.title || report.label || "";
  const summary = report.summary || {};
  const list = report.byStudent || [];

  if (!list.length) {
    container.innerHTML = title
      ? `<div><strong>${title}</strong></div><div>No data found.</div>`
      : "No data found.";
    return;
  }

  const summaryHtml = `
    <div style="margin-bottom:10px;">
      <strong>${title}</strong>
    </div>
    <div class="table-wrapper" style="max-height:none;">
      <table class="summary-table">
        <thead>
          <tr>
            <th>Meal</th>
            <th>Count</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Breakfast</td>
            <td>${summary.breakfastCount || 0}</td>
            <td>${formatCurrency(summary.breakfastTotal || 0)}</td>
          </tr>
          <tr>
            <td>Lunch</td>
            <td>${summary.lunchCount || 0}</td>
            <td>${formatCurrency(summary.lunchTotal || 0)}</td>
          </tr>
          <tr>
            <td>Dinner</td>
            <td>${summary.dinnerCount || 0}</td>
            <td>${formatCurrency(summary.dinnerTotal || 0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const detailsHtml = `
    <div class="table-wrapper" style="max-height:none; margin-top:8px;">
      <table class="report-table">
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map(
              (s) => `
            <tr>
              <td>${s.rollNo}</td>
              <td>${s.name}</td>
              <td>${s.breakfast || 0}</td>
              <td>${s.lunch || 0}</td>
              <td>${s.dinner || 0}</td>
              <td>${formatCurrency(s.total || 0)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <div class="grand-total">
      Grand Total: ${formatCurrency(summary.grandTotal || 0)}
    </div>
  `;

  container.innerHTML = summaryHtml + detailsHtml;
}

export function initReports() {
  const typeSel = qs("#rep-type");
  const resultDiv = qs("#rep-result");

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const dateInput = qs("#rep-date");
  if (dateInput) dateInput.value = todayStr;

  const monthInput = qs("#rep-month");
  const yearInput = qs("#rep-year");
  if (monthInput) monthInput.value = today.getMonth() + 1;
  if (yearInput) yearInput.value = today.getFullYear();

  const fromInput = qs("#rep-from");
  const toInput = qs("#rep-to");
  if (fromInput && toInput) {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    fromInput.value = firstOfMonth;
    toInput.value = todayStr;
  }

  function updateFields() {
    const t = typeSel.value;
    document.querySelectorAll(".rep-field").forEach((el) => (el.style.display = "none"));
    if (t === "daily") document.querySelector(".rep-daily").style.display = "block";
    else if (t === "monthly") document.querySelector(".rep-monthly").style.display = "block";
    else document.querySelector(".rep-range").style.display = "block";
    resultDiv.textContent = "";
    resultDiv.style.color = "";
  }

  typeSel.addEventListener("change", updateFields);
  updateFields();

  qs("#btn-show-report").addEventListener("click", () => {
    const t = typeSel.value;
    let report;

    try {
      if (t === "daily") {
        const dStr = qs("#rep-date").value;
        if (!dStr) {
          resultDiv.textContent = "Please select a date.";
          resultDiv.style.color = "#b91c1c";
          return;
        }
        report = getDailyMealsReport(parseDateInputValue(dStr));
      } else if (t === "monthly") {
        const m = Number(qs("#rep-month").value);
        const y = Number(qs("#rep-year").value);
        if (!m || !y || m < 1 || m > 12) {
          resultDiv.textContent = "Enter valid month and year.";
          resultDiv.style.color = "#b91c1c";
          return;
        }
        report = getMonthlyMealsReport(y, m - 1);
      } else {
        const fromStr = qs("#rep-from").value;
        const toStr = qs("#rep-to").value;
        if (!fromStr || !toStr) {
          resultDiv.textContent = "Select both from and to dates.";
          resultDiv.style.color = "#b91c1c";
          return;
        }
        report = getRangeMealsReport(
          parseDateInputValue(fromStr),
          parseDateInputValue(toStr)
        );
      }

      renderMealsReport(report);
      resultDiv.style.color = "";
    } catch (e) {
      resultDiv.textContent = e.message || "Could not generate report.";
      resultDiv.style.color = "#b91c1c";
    }
  });

  const pdfBtn = qs("#btn-download-report");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", async () => {
      if (!resultDiv.innerHTML.trim()) {
        resultDiv.textContent = "Generate a report first.";
        resultDiv.style.color = "#b91c1c";
        return;
      }

      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        alert("PDF library missing.");
        return;
      }

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
      document.body.appendChild(clone);

      try {
        const canvas = await html2canvas(clone, {
          scale: 2,
          width: 1200,
          windowWidth: 1200,
          scrollX: 0,
          scrollY: 0
        });

        document.body.removeChild(clone);

        // === ৫px মার্জিন সহ নতুন ক্যানভাস তৈরি ===
        const marginPx = 2; // চারপাশে 2px করে মার্জিন
        const canvasWithMargin = document.createElement("canvas");
        canvasWithMargin.width = canvas.width + marginPx * 2;
        canvasWithMargin.height = canvas.height + marginPx * 2;

        const ctx = canvasWithMargin.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
        ctx.drawImage(canvas, marginPx, marginPx);

        const imgData = canvasWithMargin.toDataURL("image/png");

        const pdf = new jsPDF("landscape", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        let imgWidth = pageWidth;
        let imgHeight = (canvasWithMargin.height * imgWidth) / canvasWithMargin.width;

        if (imgHeight > pageHeight) {
          imgHeight = pageHeight;
          imgWidth = (canvasWithMargin.width * imgHeight) / canvasWithMargin.height;
        }

        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        pdf.autoPrint();
        const blobUrl = pdf.output("bloburl");
        const win = window.open(blobUrl, "_blank");
        if (!win) {
          pdf.save("meal-report.pdf");
        }
      } catch (e) {
        document.body.removeChild(clone);
        console.error(e);
        resultDiv.textContent = "Could not generate PDF.";
        resultDiv.style.color = "#b91c1c";
      }
    });
  }

  const jpgBtn = qs("#btn-download-report-jpg");
  if (jpgBtn) {
    jpgBtn.addEventListener("click", () => {
      if (!resultDiv.innerHTML.trim()) {
        resultDiv.textContent = "Generate a report first.";
        resultDiv.style.color = "#b91c1c";
        return;
      }
      // JPG এর মার্জিন downloadReportJPG() এর ভিতরে হ্যান্ডেল করবো
      downloadReportJPG(resultDiv);
    });
  }
}
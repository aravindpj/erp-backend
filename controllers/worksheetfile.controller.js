/*=====================================================================
  PDF Worksheet – BLACK TEXT, COMPACT, NO EMPTY PAGES
=====================================================================*/

const PDFDocument = require("pdfkit");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const os = require("os");
const axios = require("axios");
const {JobRequestSchema} = require("../models/Job.model");
// ---------------------------------------------------------------------
// 1. STYLE (BLACK TEXT ONLY)
// ---------------------------------------------------------------------
const COLORS = {
  black: "#000000",
  accent: "#3498db",
  light: "#ffffff",
  //   light: "#f8f9fa",
  border: "#dfe6e9",
  headerBg: "#ecf0f1",
  tableHeader: "#dfe6e9",
  zebra: "#f5f6fa",
};

const SPACING = {
  section: 12,
  block: 2,
  cardPad: 8,
};

// ---------------------------------------------------------------------
// 2. PAGE CONFIG
// ---------------------------------------------------------------------
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 40;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;

// ---------------------------------------------------------------------
// 3. HELPERS
// ---------------------------------------------------------------------
async function downloadLogo(url) {
  if (!url) return null;
  const ext = path.extname(url.split("?")[0]) || ".png";
  const tmp = path.join(os.tmpdir(), `logo_${Date.now()}${ext}`);
  const writer = fs.createWriteStream(tmp);
  const { data } = await axios({ url, method: "GET", responseType: "stream" });
  data.pipe(writer);
  return new Promise((res, rej) => {
    writer.on("finish", () => res(tmp));
    writer.on("error", (e) => {
      fs.unlink(tmp, () => {});
      rej(e);
    });
  });
}

function ensureSpace(doc, needed) {
  const bottom = doc.page.height - doc.page.margins.bottom - 10;
  if (doc.y + needed > bottom) {
    doc.addPage();
  }
}

function registerFonts(doc) {
  const reg = path.join(__dirname, "../fonts/NotoSans-Regular.ttf");
  const bold = path.join(__dirname, "../fonts/NotoSans-Bold.ttf");
  if (fs.existsSync(reg)) doc.font(reg);
  if (fs.existsSync(bold)) doc.registerFont("Bold", bold);
}

// ---------------------------------------------------------------------
// 4. DRAWING
// ---------------------------------------------------------------------
function drawHeader(doc, mainObject, logoPath) {
  const TOP_MARGIN = 10; // small space from top of page
  const LOGO_SIZE = 50; // NDT Plus logo size
  const HEADER_HEIGHT = 70; // total header height

  // Light-gray background
  doc.rect(0, 0, PAGE.width, HEADER_HEIGHT).fill(COLORS.headerBg);

  // ── LOGO (top-left, small) ───────────────────────────────────────
  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, MARGIN, TOP_MARGIN, { width: LOGO_SIZE });
  }

  // ── TITLE (centered) ─────────────────────────────────────────────
  doc
    .font("Bold")
    .fontSize(20)
    .fillColor(COLORS.black)
    .text(mainObject.name || "Worksheet", 0, TOP_MARGIN + 8, {
      align: "center",
      width: PAGE.width,
    });

  // ── GENERATED DATE (top-right) ───────────────────────────────────
  doc
    .fontSize(9)
    .fillColor(COLORS.black)
    .text(
      `Generated: ${moment().format("DD MMM YYYY, hh:mm A")}`,
      0,
      TOP_MARGIN + 32,
      {
        align: "right",
        width: PAGE.width - MARGIN,
      }
    );

  // ── DIVIDER LINE ─────────────────────────────────────────────────
  const lineY = HEADER_HEIGHT - 10;
  doc
    .moveTo(MARGIN, lineY)
    .lineTo(PAGE.width - MARGIN, lineY)
    .lineWidth(0.5)
    .stroke(COLORS.border);

  // Set cursor for next content
  doc.y = HEADER_HEIGHT + 5;
}

// Footer drawn **once per page** (after page is added)
function setupFooter(doc) {
  let totalPages = 0;
  doc.on("pageAdded", () => {
    totalPages++;
  });

  doc.on("end", () => {
    // Re-draw footers with correct page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      const y = PAGE.height - 45;

      doc.fontSize(8).fillColor(COLORS.black);
      doc.text("Printed version is uncontrolled.", MARGIN, y);
      doc.text(`Page ${i + 1} of ${pages.count}`, 0, y, {
        align: "center",
        width: PAGE.width,
      });
      doc.text(
        `Created at ${moment().format("ddd, DD MMM YYYY, hh:mm A")}`,
        0,
        y,
        { align: "right", width: PAGE.width - MARGIN }
      );
      doc
        .moveTo(MARGIN, y - 6)
        .lineTo(PAGE.width - MARGIN, y - 6)
        .stroke(COLORS.border);
    }
  });
}

function drawSectionHeader(doc, title) {
  const h = 22;
  ensureSpace(doc, h + SPACING.section);

  // solid accent bar
  doc.rect(MARGIN, doc.y, CONTENT_WIDTH, h).fill(COLORS.accent);

  doc
    .font("Bold")
    .fontSize(12)
    .fillColor("#ffffff")
    .text(title.toUpperCase(), MARGIN + SPACING.cardPad, doc.y + 5);

  doc.y += h + SPACING.section;
}

// Key-value:  "Field name : value"
function drawKeyValueGrid(doc, section, record, layout = 2) {
  const fields = section.fields.filter((f) => f.type !== "table");
  if (!fields.length) return;

  const cols = Math.min(layout, 4);
  const gutter = 8;
  const colW = (CONTENT_WIDTH - (cols - 1) * gutter) / cols;
  const cardH = 32;

  for (let i = 0; i < fields.length; i += cols) {
    const row = fields.slice(i, i + cols);
    ensureSpace(doc, cardH + SPACING.block);

    const startY = doc.y;

    row.forEach((fld, idx) => {
      const x = MARGIN + idx * (colW + gutter);
      const val = record?.[fld.fieldId] ?? "";

      doc
        .roundedRect(x, startY, colW, cardH, 3)
        .fill(COLORS.light)
        .stroke(COLORS.border);

      const line = `${fld.name} : ${
        typeof val == "boolean" ? (val ? "✔️" : "❌") : val
      }`;
      doc
        .fontSize(9.5)
        .fillColor(COLORS.black)
        .text(line, x + SPACING.cardPad, startY + 10, {
          width: colW - 2 * SPACING.cardPad,
          ellipsis: true,
        });
    });

    doc.y = startY + cardH + SPACING.block;
  }
}

// Table – field name = table title
function drawTable(doc, tableDef, rows = []) {
  if (!tableDef?.tableColumns?.length) return;

  const cols = tableDef.tableColumns;
  const gutter = 4;
  const colW = (CONTENT_WIDTH - (cols.length - 1) * gutter) / cols.length;
  const headerH = 20;
  const rowH = 18;

  ensureSpace(doc, headerH + rowH + SPACING.block);

  let y = doc.y;

  // Table title
  doc
    .font("Bold")
    .fontSize(11)
    .fillColor(COLORS.black)
    .text(tableDef.name, MARGIN, y);
  y += 16;

  // Column headers
  cols.forEach((c, i) => {
    const x = MARGIN + i * (colW + gutter);
    doc.rect(x, y, colW, headerH).fill(COLORS.tableHeader);
    doc
      .font("Bold")
      .fontSize(9.5)
      .fillColor(COLORS.black)
      .text(c.name, x + 5, y + 4);
  });
  y += headerH;

  // Rows
  if (!rows.length) {
    doc
      .fontSize(9)
      .fillColor(COLORS.black)
      .text("No records", MARGIN + 5, y + 4);
    doc.y = y + rowH + SPACING.block;
    return;
  }

  rows.forEach((row, rIdx) => {
    ensureSpace(doc, rowH + 2);
    const rowY = doc.y;
    const bg = rIdx % 2 === 0 ? COLORS.light : COLORS.zebra;

    cols.forEach((c, i) => {
      const x = MARGIN + i * (colW + gutter);
      const val = row[c.columnId] ?? "";

      doc.rect(x, rowY, colW, rowH).fill(bg).stroke(COLORS.border);

      doc
        .fontSize(9)
        .fillColor(COLORS.black)
        .text(
          typeof val == "boolean" ? (val ? "✔️" : "❌") : val,
          x + 4,
          rowY + 4,
          {
            width: colW - 8,
            ellipsis: true,
          }
        );
    });

    doc.y = rowY + rowH + 2;
  });
}

// ---------------------------------------------------------------------
// 4.5 DRAW FIRST DETAILS (NDT PLUS STYLE)
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// 4.5 DRAW FIRST DETAILS – NDT PLUS EXACT LAYOUT
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// 4.5 DRAW FIRST DETAILS – NDT PLUS STYLE (BORDER-LESS TABLE)
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// 4.5 DRAW FIRST DETAILS – NDT PLUS STYLE (TWO COLUMN, NO BORDERS)
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// 4.5 DRAW FIRST DETAILS – NDT PLUS EXACT LAYOUT (FROM SCREENSHOT)
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// 4.5 DRAW FIRST DETAILS – NDT PLUS EXACT LAYOUT (FIXED OVERLAP)
// ---------------------------------------------------------------------

function drawFirstDetails(doc, details) {
  const ROW_H = 15;
  const TOP_MARGIN = 15;

  // Table Column Coordinates
  const COL1_LABEL_X = MARGIN;
  const COL1_VALUE_X = MARGIN + 95;

  const COL2_LABEL_X = MARGIN + 360;
  const COL2_VALUE_X = COL2_LABEL_X + 95;

  let y = doc.y + TOP_MARGIN;

  // ───────────────────────────────────────────────
  // JOB DESCRIPTION (full-width table row)
  // ───────────────────────────────────────────────
  doc.font("Bold").fontSize(10).text("Job Description:", COL1_LABEL_X, y);
  doc.font("Helvetica").text(details.jobDescription || "", COL1_VALUE_X, y, {
    width: PAGE.width - MARGIN * 2 - 95,
    lineBreak: true,
  });

  y += ROW_H * 2;

  // ───────────────────────────────────────────────
  // RIGHT COLUMN TABLE (Report info)
  // ───────────────────────────────────────────────
  const rightRows = [
    ["Report No.:", details.reportNumber],
    ["Report Date:", details.reportDate],
    ["Job No.:", details.jobNumber || ""],
    ["P/O No.:", details.poNo || ""],
    ["Client Job No.:", details.clientJobNo || ""],
    ["Attention:", details.attention],
  ];

  rightRows.forEach(([label, value]) => {
    doc.font("Bold").text(label, COL2_LABEL_X, y);
    doc.font("Helvetica").text(value || "", COL2_VALUE_X, y);
    y += ROW_H;
  });

  // Track right column bottom for table alignment
  const rightBottom = y;

  // Reset Y for left block (below job description)
  y = doc.y + TOP_MARGIN + ROW_H * 2;

  // ───────────────────────────────────────────────
  // LEFT COLUMN TABLE
  // ───────────────────────────────────────────────
  const leftRows = [
    ["Client:", details.client],
    ["Address:", details.address],
    ["Job Address:", details.jobAddress],
    ["Technician:", details.technician],
    ["Date of Inspection:", details.dateOfInspection],
  ];

  leftRows.forEach(([label, value]) => {
    doc.font("Bold").text(label, COL1_LABEL_X, y);
    doc.font("Helvetica").text(value || "", COL1_VALUE_X, y, {
      width: 250,
    });
    y += ROW_H;
  });

  // Left column bottom
  const leftBottom = y;

  // ───────────────────────────────────────────────
  // SEPARATOR LINE (below both table columns)
  // ───────────────────────────────────────────────
  const lineY = Math.max(leftBottom, rightBottom) + 5;

  doc
    .moveTo(MARGIN, lineY)
    .lineTo(PAGE.width - MARGIN, lineY)
    .lineWidth(0.5)
    .stroke(COLORS.border);

  doc.y = lineY + 12;
}


// =====================================================================
// 5. MAIN CONTROLLER
// =====================================================================
exports.generateWorksheetPdf = async (req, res) => {
  try {
    // ---- DATA (replace with DB fetch in real app) ----
    const mainObject = {
      _id: "69072212cc1cfbbb4af16289",
      workSheetId: "WRKSHT0000000004",
      name: "work sheet 2",
      sections: [
        {
          sectionId: "46657c62-c05d-41da-a114-5435b7701e7b",
          name: "section 1",
          layout: 2,
          fields: [
            {
              fieldId: "89a0cf6d-81d5-4d06-8912-4bd1f621b0e6",
              name: "field 1",
              type: "textfield",
              required: false,
              options: [],
              tableColumns: [],
              tableActions: null,
            },
            {
              fieldId: "d5b11e70-5944-4e47-9fa8-d7dcac544750",
              name: "field 2",
              type: "textfield",
              required: false,
              options: [],
              tableColumns: [],
              tableActions: null,
            },
            {
              fieldId: "6948eeca-aced-4081-8a0b-1f17a02f98a1",
              name: "field 3",
              type: "textfield",
              required: false,
              options: [],
              tableColumns: [],
              tableActions: null,
            },
            {
              fieldId: "d53a542a-fc28-4e9a-b608-a544cfeabf29",
              name: "field 4",
              type: "table",
              required: false,
              options: [],
              tableColumns: [
                {
                  columnId: "47bdf47b-1b6e-4d6b-af55-0a054f9ef4fb",
                  name: "c1",
                  type: "textfield",
                  options: [],
                },
                {
                  columnId: "bae7d676-925d-4374-bfac-7f108c3fc3e8",
                  name: "c2",
                  type: "textarea",
                  options: [],
                },
                {
                  columnId: "a256dc46-0ae3-4656-8300-6b8d5f467f9f",
                  name: "c3",
                  type: "select",
                  options: [
                    {
                      optionId: "41670af0-82ab-4639-b24a-c82d7c7029e0",
                      value: "option 1",
                    },
                    {
                      optionId: "b8748dc3-a8d9-4647-b299-a01aff37bb5a",
                      value: "option 2",
                    },
                  ],
                },
                {
                  columnId: "8ae802f8-53a5-479d-abdf-2766e0688b8f",
                  name: "c4",
                  type: "checkbox",
                  options: [],
                },
              ],
              tableActions: {
                edit: false,
                view: false,
                delete: false,
              },
            },
          ],
        },
      ],
      isActive: true,
      createdAt: "2025-11-02T09:19:14.122Z",
      updatedAt: "2025-11-13T18:50:45.880Z",
      __v: 0,
      description: "this is a test description",
    };
    const data = {
      _id: "691637d1375951bc6d1872df",
      recordId: "record_JOB00021_WRKSHT0000000004",
      worksheetId: "WRKSHT0000000004",
      data: {
        "89a0cf6d-81d5-4d06-8912-4bd1f621b0e6": "test value 1",
        "d5b11e70-5944-4e47-9fa8-d7dcac544750": "test value 2",
        "6948eeca-aced-4081-8a0b-1f17a02f98a1": "test value 3",
        "d53a542a-fc28-4e9a-b608-a544cfeabf29": [
          {
            "47bdf47b-1b6e-4d6b-af55-0a054f9ef4fb": "test 1",
            "bae7d676-925d-4374-bfac-7f108c3fc3e8": "test 1",
            "a256dc46-0ae3-4656-8300-6b8d5f467f9f": "option 1",
            "8ae802f8-53a5-479d-abdf-2766e0688b8f": "",
          },
          {
            "47bdf47b-1b6e-4d6b-af55-0a054f9ef4fb": "test 2",
            "bae7d676-925d-4374-bfac-7f108c3fc3e8": "test 2",
            "a256dc46-0ae3-4656-8300-6b8d5f467f9f": "option 2",
            "8ae802f8-53a5-479d-abdf-2766e0688b8f": true,
          },
        ],
      },
      createdAt: "2025-11-13T19:56:01.100Z",
      updatedAt: "2025-11-13T19:56:01.100Z",
      __v: 0,
    };
    const logoUrl =
      "https://www.shutterstock.com/shutterstock/photos/2278726727/display_1500/stock-vector-minimalistic-circular-logo-sample-vector-2278726727.jpg";

    const details = await JobRequestSchema.aggregate([
      { $match: { jobId: "JOB00021" } },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "clientId",
          as: "client",
        },
      },
      { $unwind: "$client" },
    ]);

    const firstDetails = {
      jobDescription: "Test job description",
      reportNumber: "RPT001",
      client: "Client name",
      reportDate: "11-10-2025",
      address: "Client address",
      jobNumber: "JOB00002",
      poNo: "TBA",
      jobAddress: "job address",
      clientId: "CLNT0000001",
      attention: "John Doe",
      technician: "John wick",
      dateOfInspection: "15-10-2025",
    };

    const localLogoPath = await downloadLogo(logoUrl).catch(() => null);

    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      bufferPages: true,
    });
    registerFonts(doc);
    setupFooter(doc); // <-- footer on every page

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {
      const pdfBase64 = Buffer.concat(chunks).toString("base64");
      if (localLogoPath) fs.unlinkSync(localLogoPath);
      //   res.setHeader("Content-Type", "text/plain");
      res.send(`${pdfBase64}`);
    });

    // First page header
    drawHeader(doc, mainObject, localLogoPath);
    drawFirstDetails(doc, firstDetails);
    // Sections
    for (const section of mainObject.sections) {
      ensureSpace(doc, 60);
      drawSectionHeader(doc, section.name);
      drawKeyValueGrid(doc, section, data.data, 2);

      for (const fld of section.fields.filter((f) => f.type === "table")) {
        drawTable(doc, fld, data.data[fld.fieldId] || []);
      }
    }

    doc.end();
  } catch (err) {
    console.error("PDF error:", err);
    res.status(500).json({
      status: 500,
      message: "PDF generation failed",
      error: err.message,
    });
  }
};

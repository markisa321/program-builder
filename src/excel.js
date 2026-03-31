import XLSX from 'xlsx-js-style';
import { SESSIONS } from './data';

const white = { color: { rgb: "FFFFFF" } };
const bold9 = { font: { name: "Arial", sz: 9, bold: true } };
const normal9 = { font: { name: "Arial", sz: 9 } };
const center = { alignment: { horizontal: "center" } };

const styles = {
  title: { font: { name: "Arial", sz: 14, bold: true }, alignment: { horizontal: "center" } },
  hdrBlue: { font: { name: "Arial", sz: 11, bold: true, ...white }, fill: { fgColor: { rgb: "4472C4" } }, ...center },
  hdrGreen: { font: { name: "Arial", sz: 11, bold: true, ...white }, fill: { fgColor: { rgb: "70AD47" } }, ...center },
  hdrOrange: { font: { name: "Arial", sz: 11, bold: true, ...white }, fill: { fgColor: { rgb: "ED7D31" } }, ...center },
  gray: { font: { name: "Arial", sz: 9, bold: true }, fill: { fgColor: { rgb: "F2F2F2" } } },
  weekHdr: { font: { name: "Arial", sz: 9, bold: true }, fill: { fgColor: { rgb: "D9D9D9" } }, alignment: { horizontal: "center" } },
  exNum: { font: { name: "Arial", sz: 9, bold: true }, fill: { fgColor: { rgb: "D6E4F0" } } },
  exNum2: { font: { name: "Arial", sz: 9, bold: true }, fill: { fgColor: { rgb: "E2EFDA" } } },
  exNum3: { font: { name: "Arial", sz: 9, bold: true }, fill: { fgColor: { rgb: "FCE4D6" } } },
};

const sessionHdrStyles = [styles.hdrBlue, styles.hdrGreen, styles.hdrOrange];
const exNumStyles = [styles.exNum, styles.exNum2, styles.exNum3];

function setCell(ws, r, c, val, style) {
  const ref = XLSX.utils.encode_cell({ r, c });
  ws[ref] = { v: val || "", t: "s", s: style || normal9 };
}

function fillMergedCells(ws, r, c1, c2, val, style) {
  for (let c = c1; c <= c2; c++) {
    setCell(ws, r, c, c === c1 ? val : "", style);
  }
}

export function generateExcel(clients) {
  const wb = XLSX.utils.book_new();

  clients.forEach(cl => {
    const ws = {};
    const merges = [];
    let r = 0;

    // Title
    fillMergedCells(ws, r, 0, 14, cl.name, styles.title);
    merges.push({ s: { r, c: 0 }, e: { r, c: 14 } });
    r += 2;

    SESSIONS.forEach((sess, si) => {
      const t = cl[sess.key];
      const hdrStyle = sessionHdrStyles[si];
      const exStyle = exNumStyles[si];

      // Session header
      fillMergedCells(ws, r, 0, 14, `TRENING ${si + 1} - ${sess.label}`, hdrStyle);
      merges.push({ s: { r, c: 0 }, e: { r, c: 14 } });
      r++;

      // Core A
      setCell(ws, r, 0, "A", styles.gray);
      setCell(ws, r, 1, "S", styles.gray);
      setCell(ws, r, 2, t.coreA?.static || "", normal9);
      r++;
      setCell(ws, r, 0, "", styles.gray);
      setCell(ws, r, 1, "M", styles.gray);
      setCell(ws, r, 2, t.coreA?.dynamic || "", normal9);
      r++;

      // Core B
      setCell(ws, r, 0, "B", styles.gray);
      setCell(ws, r, 1, "S", styles.gray);
      setCell(ws, r, 2, t.coreB?.static || "", normal9);
      r++;
      setCell(ws, r, 0, "", styles.gray);
      setCell(ws, r, 1, "M", styles.gray);
      setCell(ws, r, 2, t.coreB?.dynamic || "", normal9);
      r++;

      // Week headers
      setCell(ws, r, 0, "", styles.weekHdr);
      setCell(ws, r, 1, "", styles.weekHdr);
      setCell(ws, r, 2, "", styles.weekHdr);
      for (let w = 0; w < 6; w++) {
        setCell(ws, r, 3 + w * 2, `w${w + 1}`, styles.weekHdr);
        setCell(ws, r, 4 + w * 2, "Datum", styles.weekHdr);
      }
      r++;

      // Exercises
      [["1", t.ex1], ["2", t.ex2], ["3", t.ex3]].forEach(([num, ex]) => {
        setCell(ws, r, 0, `${num}a`, exStyle);
        setCell(ws, r, 1, ex?.a || "", normal9);
        setCell(ws, r, 2, "", normal9);
        merges.push({ s: { r, c: 1 }, e: { r, c: 2 } });
        r++;
        setCell(ws, r, 0, `${num}b`, exStyle);
        setCell(ws, r, 1, ex?.b || "", normal9);
        setCell(ws, r, 2, "", normal9);
        merges.push({ s: { r, c: 1 }, e: { r, c: 2 } });
        r++;
      });

      r++;
    });

    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r, c: 14 } });
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 5 }, { wch: 5 }, { wch: 38 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }
    ];

    const sheetName = cl.name.substring(0, 31).replace(/[\\\/\?\*\[\]]/g, '');
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, 'trening_programi.xlsx');
}
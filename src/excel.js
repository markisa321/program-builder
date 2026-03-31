import * as XLSX from 'xlsx';
import { SESSIONS } from './data';

export function generateExcel(clients) {
  const wb = XLSX.utils.book_new();

  clients.forEach(cl => {
    const rows = [];
    const merges = [];
    let r = 0;

    rows.push([cl.name]);
    merges.push({ s: { r, c: 0 }, e: { r, c: 14 } });
    r++;
    rows.push([]);
    r++;

    SESSIONS.forEach((sess, si) => {
      const t = cl[sess.key];

      rows.push([`TRENING ${si + 1} - ${sess.label}`]);
      merges.push({ s: { r, c: 0 }, e: { r, c: 14 } });
      r++;

      rows.push(["A", "S", t.coreA?.static || ""]);
      r++;
      rows.push(["", "M", t.coreA?.dynamic || ""]);
      r++;
      rows.push(["B", "S", t.coreB?.static || ""]);
      r++;
      rows.push(["", "M", t.coreB?.dynamic || ""]);
      r++;

      rows.push(["", "", "", "w1", "Datum", "w2", "Datum", "w3", "Datum", "w4", "Datum", "w5", "Datum", "w6", "Datum"]);
      r++;

      [["1", t.ex1], ["2", t.ex2], ["3", t.ex3]].forEach(([num, ex]) => {
        rows.push([`${num}a`, ex?.a || ""]);
        merges.push({ s: { r, c: 1 }, e: { r, c: 2 } });
        r++;
        rows.push([`${num}b`, ex?.b || ""]);
        merges.push({ s: { r, c: 1 }, e: { r, c: 2 } });
        r++;
      });

      rows.push([]);
      r++;
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
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
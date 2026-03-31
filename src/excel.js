import { SESSIONS } from './data';

const esc = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function generateExcel(clients) {
  let x = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
  x += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
  x += '<Styles>';
  x += '<Style ss:ID="title"><Font ss:Bold="1" ss:Size="14" ss:FontName="Arial"/><Alignment ss:Horizontal="Center"/></Style>';
  x += '<Style ss:ID="hB"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11" ss:FontName="Arial"/><Interior ss:Color="#4472C4" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>';
  x += '<Style ss:ID="hG"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11" ss:FontName="Arial"/><Interior ss:Color="#70AD47" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>';
  x += '<Style ss:ID="hO"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11" ss:FontName="Arial"/><Interior ss:Color="#ED7D31" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>';
  x += '<Style ss:ID="gr"><Interior ss:Color="#F2F2F2" ss:Pattern="Solid"/><Font ss:Bold="1" ss:Size="9" ss:FontName="Arial"/></Style>';
  x += '<Style ss:ID="wh"><Interior ss:Color="#D9D9D9" ss:Pattern="Solid"/><Font ss:Bold="1" ss:Size="9" ss:FontName="Arial"/><Alignment ss:Horizontal="Center"/></Style>';
  x += '<Style ss:ID="n"><Font ss:Size="9" ss:FontName="Arial"/></Style>';
  x += '<Style ss:ID="b9"><Font ss:Bold="1" ss:Size="9" ss:FontName="Arial"/></Style>';
  x += '</Styles>';

  const ss = ["hB", "hG", "hO"];

  clients.forEach(cl => {
    x += `<Worksheet ss:Name="${esc(cl.name.substring(0, 30))}"><Table ss:DefaultColumnWidth="70">`;
    x += '<Column ss:Width="35"/><Column ss:Width="35"/><Column ss:Width="250"/><Column ss:Width="90"/>';
    for (let i = 0; i < 12; i++) x += '<Column ss:Width="65"/>';
    x += `<Row><Cell ss:MergeAcross="14" ss:StyleID="title"><Data ss:Type="String">${esc(cl.name)}</Data></Cell></Row><Row/>`;

    SESSIONS.forEach((s, si) => {
      const t = cl[s.key];
      x += `<Row><Cell ss:MergeAcross="14" ss:StyleID="${ss[si]}"><Data ss:Type="String">TRENING ${si + 1} - ${esc(s.label)}</Data></Cell></Row>`;
      x += `<Row><Cell ss:StyleID="gr"><Data ss:Type="String">A</Data></Cell><Cell ss:StyleID="gr"><Data ss:Type="String">S</Data></Cell><Cell ss:StyleID="n"><Data ss:Type="String">${esc(t.coreA.static)}</Data></Cell></Row>`;
      x += `<Row><Cell ss:StyleID="gr"><Data ss:Type="String"></Data></Cell><Cell ss:StyleID="gr"><Data ss:Type="String">M</Data></Cell><Cell ss:StyleID="n"><Data ss:Type="String">${esc(t.coreA.dynamic)}</Data></Cell></Row>`;
      x += `<Row><Cell ss:StyleID="gr"><Data ss:Type="String">B</Data></Cell><Cell ss:StyleID="gr"><Data ss:Type="String">S</Data></Cell><Cell ss:StyleID="n"><Data ss:Type="String">${esc(t.coreB.static)}</Data></Cell></Row>`;
      x += `<Row><Cell ss:StyleID="gr"><Data ss:Type="String"></Data></Cell><Cell ss:StyleID="gr"><Data ss:Type="String">M</Data></Cell><Cell ss:StyleID="n"><Data ss:Type="String">${esc(t.coreB.dynamic)}</Data></Cell></Row>`;
      x += '<Row>';
      for (let w = 1; w <= 6; w++) x += `<Cell${w === 1 ? ' ss:Index="4"' : ''} ss:StyleID="wh"><Data ss:Type="String">w${w}</Data></Cell><Cell ss:StyleID="wh"><Data ss:Type="String">Datum</Data></Cell>`;
      x += '</Row>';
      [["1", t.ex1], ["2", t.ex2], ["3", t.ex3]].forEach(([n, ex]) => {
        x += `<Row><Cell ss:StyleID="b9"><Data ss:Type="String">${n}a</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="n"><Data ss:Type="String">${esc(ex.a)}</Data></Cell></Row>`;
        x += `<Row><Cell ss:StyleID="b9"><Data ss:Type="String">${n}b</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="n"><Data ss:Type="String">${esc(ex.b)}</Data></Cell></Row>`;
      });
      x += '<Row/>';
    });
    x += '</Table></Worksheet>';
  });

  x += '</Workbook>';
  const blob = new Blob([x], { type: "application/vnd.ms-excel" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "trening_programi.xls";
  a.click();
  URL.revokeObjectURL(a.href);
}

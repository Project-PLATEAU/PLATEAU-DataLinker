import { XMLParser } from "fast-xml-parser";

export function processCsvData(xmlObject: any, selectedCsvData: { tag: string; index: number }[]): void {
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsedXml = parser.parse(xmlObject);

  const tags = selectedCsvData.map(data => data.tag);
  const rows: string[][] = [tags]; // ヘッダー行

  const traverse = (obj: any, row: string[] = []) => {
    if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (tags.includes(key)) {
          row.push(value as string);
        }
        if (typeof value === "object") {
          traverse(value, row);
        }
      }
    }
  };

  traverse(parsedXml);
  const csvContent = rows.map(e => e.join(",")).join("\n");
  downloadCsvContent(csvContent, "output.csv");
}

function downloadCsvContent(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

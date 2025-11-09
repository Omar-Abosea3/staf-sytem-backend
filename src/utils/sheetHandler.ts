import XLSX from 'xlsx';

// Define interface for Excel data structure
export interface ExcelRowData {
    pyempl?: string;
    [key: string]: any; // Allow other dynamic properties from Excel
}

const sheetHandeler = (filePath: string): ExcelRowData[] => {
    const workbook = XLSX.readFile(filePath, { codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet) as ExcelRowData[];
    return data;
};
export default sheetHandeler;

export const dataDateFormatter = (data: ExcelRowData[]) => {
    const newData = data.map((item: ExcelRowData, index) => {
        console.log(typeof item['مرتب شهر']);

        const year = item['مرتب شهر']?.toString().slice(0, 4);
        const month = item['مرتب شهر']?.toString().slice(4, item['مرتب شهر'].length);
        item['مرتب شهر'] = `${year}-${month}`;
        return item;
    });
    return newData;
}
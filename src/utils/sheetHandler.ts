import XLSX from 'xlsx';
const sheetHandeler = (filePath:string) => {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    return data;
};
export default sheetHandeler;

export const dataDateFormatter = (data : any[] ) => {
    const newData = data.map((item:any , index) => {
        if(index === 0) return;
        const year = item['الشهر'].slice(0,4);
        const month = item['الشهر'].slice(4,item['الشهر'].length);
        item['الشهر'] = new Date(`${year}-${month}`);
        return item;
    });
    return newData;
}
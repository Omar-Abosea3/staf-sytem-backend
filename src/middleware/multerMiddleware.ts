import multer, { diskStorage } from "multer";

export const multerFunction = () => {
  const storage = diskStorage({
    destination(_req: any, _file: any, cb: any) {
      cb(null, "./uploads");
    },
    filename(_req: any, file: any, cb: any) {
      const dateSuffix = Date.now();
      cb(
        null,
        `${file.fieldname}_${dateSuffix}.${file.mimetype.split("/")[1]}`
      );
    },
  });

  const fileFilter = function (_req: any, file: any, cb: any) {
    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // ✅ .xlsx
      "text/csv", // ✅ .csv
    ];

    if (!allowedMimeTypes.includes(file.mimetype))
      return cb(
        new Error(`Only .xlsx files are allowed!`, {
          cause: 409,
        })
      );

    return cb(null, true);
  };

  const upload = multer({ storage, fileFilter });

  return upload;
};

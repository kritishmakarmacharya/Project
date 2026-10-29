import multer from "multer";
import fs from "fs";

const uploader = (dir = "/") => {
  const myStorage = multer.diskStorage({
    destination: (_, __, cb) => {
      const uploadDir = "./public/uploads" + dir;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },

    filename: (_, file, cb) => {
      const fileName = Date.now() + "-" + file.originalname;
      cb(null, fileName);
    },
  });

  return multer({
    storage: myStorage,
    fileFilter: (_, file, cb) => {
      const ext = file.originalname.split(".").pop() as string;
      const allowedExts = ["jpg", "jpeg", "png", "svg", "bmp", "webp", "gif"];
      if (allowedExts.includes(ext?.toLowerCase())) {
        cb(null, true);
      } else {
        cb(new Error("File format not supported"));
      }
    },
    limits: {
      fileSize: 3000000,
    },
  });
};

export default uploader;

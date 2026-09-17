import path from "path";
import multer from "multer";

const profileTypes = ["image/jpeg", "image/png", "image/webp"];
const documentTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "profilePhoto") {
      cb(null, "uploads/profiles");
      return;
    }

    cb(null, "uploads/documents");
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "profilePhoto" && profileTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  if (file.fieldname === "documents" && documentTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Unsupported file type"));
};

export const registerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
}).fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "documents", maxCount: 5 },
]);

export const profilePhotoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("profilePhoto");

export const profileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 6,
  },
}).fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "documents", maxCount: 5 },
]);


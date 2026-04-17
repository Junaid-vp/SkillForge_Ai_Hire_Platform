import multer from "multer";
export const uploadPdf = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(new Error("Only PDF files allowed"));
        }
    },
});
export const uploadZipFile = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            const dir = "/tmp/skillforge-uploads";
            import("fs").then(fs => {
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            });
        },
        filename: (_req, file, cb) => {
            cb(null, `task_${Date.now()}_${file.originalname}`);
        }
    }),
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.originalname.endsWith(".zip")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only ZIP files allowed"));
        }
    }
});

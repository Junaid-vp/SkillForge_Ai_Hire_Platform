import { FileText, ExternalLink } from "lucide-react";
import { SectionCard, EmptyCard } from "./SectionCard";

const isCloudinaryPdfUrl = (url: string) =>
  url.includes("res.cloudinary.com") && /\.pdf(?:$|\?)/i.test(url);

const getResumePreviewUrl = (url: string) => {
  if (!isCloudinaryPdfUrl(url)) return url;
  const [base, qs] = url.split("?");
  const preview = base
    .replace("/raw/upload/", "/image/upload/pg_1,f_png/")
    .replace("/image/upload/", "/image/upload/pg_1,f_png/")
    .replace(/\.pdf$/i, ".png");
  return qs ? `${preview}?${qs}` : preview;
};

export function ResumeSection({ resumeUrl }: { resumeUrl: string | null }) {
  const previewUrl    = resumeUrl ? getResumePreviewUrl(resumeUrl) : null;
  const isImgPreview  = resumeUrl ? isCloudinaryPdfUrl(resumeUrl)  : false;

  return (
    <SectionCard
      icon={<FileText size={13} className="text-blue-600" />}
      title="Resume"
      subtitle="Candidate's uploaded resume"
    >
      {previewUrl ? (
        <div className="space-y-3">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 border border-blue-100 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={11} />
            {isImgPreview ? "Open preview" : "Open in new tab"}
          </a>
          <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ height: 600 }}>
            {isImgPreview ? (
              <img src={previewUrl} alt="Resume Preview" className="w-full h-full object-contain" />
            ) : (
              <iframe src={previewUrl} title="Developer Resume" className="w-full h-full" style={{ border: "none" }} />
            )}
          </div>
          {isImgPreview && (
            <p className="text-xs text-gray-400">Showing first page preview from Cloudinary.</p>
          )}
        </div>
      ) : (
        <EmptyCard message="No resume uploaded for this candidate." />
      )}
    </SectionCard>
  );
}

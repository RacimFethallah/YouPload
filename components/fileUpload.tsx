import { createClient } from "@/utils/supabase/client";
import { useState, ChangeEvent, FormEvent } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";

interface FileUploadProps {
  onUploadComplete: () => void;
}

export default function FileUpload({
  onUploadComplete,
  user,
}: FileUploadProps & { user: any }) {
  const supabase = createClient();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files;
    if (file && file.length > 0) {
      setUploading(true);
      setError(null);
      try {
        // Create a folder structure with the user's ID
        const filePath = `${user.id}/${file[0].name}`;

        const { data, error } = await supabase.storage
          .from("files") // Use the 'files' bucket
          .upload(filePath, file[0], {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        console.log("File uploaded successfully:", data);
        onUploadComplete();
      } catch (error: any) {
        console.error("Error uploading file:", error);
        setError(error.message);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <form className="flex flex-col items-center">
      <div className="">
        <label htmlFor="file-upload" className="custom-file-upload w-full">
          <div className="flex flex-col h-full items-center justify-center gap-2 p-5">
            <IoCloudUploadOutline size={42} />
            <p className="text-lg font-semibold">Import or Upload a file</p>
            <p className="text-sm font-light text-gray-500">
              Maximum file size 50MB
            </p>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          required
        />
      </div>
      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-blue-600 h-full w-1/2 rounded-full animate-progress"></div>
          </div>
          <p className="text-sm text-center mt-2">Uploading...</p>
        </div>
      )}
      {error && <p className="text-red-500 mt-2">Error uploading file, {error}</p>}
    </form>
  );
}

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { GoDownload, GoPencil } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";

interface FileListProps {
  refreshTrigger: number;
  user: any;
}
interface FileDetails {
  name: string;
  size: number;
  created_at: string;
  last_modified: string;
}

export default function FileList({ refreshTrigger, user }: FileListProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger, user.id]);

  async function fetchFiles() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.storage
        .from("files")
        .list(`${user.id}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      if (data) {
        setFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleFileDownload = async (file: any) => {
    try {
      const { data, error } = await supabase.storage
        .from("files")
        .download(`${user.id}/${file.name}`);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleFileDelete = async (file: any) => {
    try {
      const { error } = await supabase.storage
        .from("files")
        .remove([`${user.id}/${file.name}`]);
      if (error) throw error;
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    }
  };

  const handleFileRename = async (file: any) => {
    if (!newFileName.trim()) {
      alert("Please enter a new file name.");
      return;
    }

    try {
      const { data, error: copyError } = await supabase.storage
        .from("files")
        .copy(`${user.id}/${file.name}`, `${user.id}/${newFileName}`);

      if (copyError) throw copyError;

      const { error: deleteError } = await supabase.storage
        .from("files")
        .remove([`${user.id}/${file.name}`]);

      if (deleteError) throw deleteError;

      setRenaming(null);
      setNewFileName("");
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error renaming file:", error);
      alert("Failed to rename file. Please try again.");
    }
  };

  const handleFileClick = (file: any) => {
    setSelectedFile({
      name: file.name,
      size: file.metadata.size,
      created_at: file.created_at,
      last_modified: file.updated_at || file.created_at,
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  function FileDetailsPanel({ file }: { file: FileDetails | null }) {
    if (!file) return null;

    return (
      <div className="mt-4 p-4 border rounded-lg shadow-md absolute w-96 top-1/3 right-0">
        <h3 className="text-lg font-semibold mb-2">File Details</h3>
        <p>
          <strong>Name:</strong> {file.name}
        </p>
        <p>
          <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p>
          <strong>Created:</strong> {new Date(file.created_at).toLocaleString()}
        </p>
        <p>
          <strong>Last Modified:</strong>{" "}
          {new Date(file.last_modified).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 w-[38rem] ">
      <h2 className="text-xl font-semibold mb-4">Your Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul className="space-y-5">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between shadow-md border p-3 py-6 rounded-lg hover:cursor-pointer "
              onClick={() => handleFileClick(file)}
              
            >
              <div className="flex gap-3 items-center">
                <button
                  className="border rounded-full p-2 shadow-md hover:bg-gray-100 transition-all"
                  onClick={() => {
                    setRenaming(file.id);
                    setNewFileName(file.name);
                  }}
                >
                  <GoPencil />
                </button>
                {renaming === file.id ? (
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleFileRename(file)
                    }
                    className="border rounded-full px-2 py-1"
                  />
                ) : (
                  <span>{file.name}</span>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500">
                  {(file.metadata.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  className="border  rounded-full p-2 shadow-md hover:bg-gray-100 transition-all"
                  onClick={() => handleFileDownload(file)}
                >
                  <GoDownload />
                </button>

                <button
                  className="border rounded-full p-2 shadow-md hover:bg-gray-100 transition-all"
                  onClick={() => handleFileDelete(file)}
                >
                  <MdOutlineDelete color="red" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FileDetailsPanel file={selectedFile} />
    </div>
  );
}

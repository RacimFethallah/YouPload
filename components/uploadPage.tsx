"use client";

import React, { use, useEffect, useState } from "react";
import FileUpload from "./fileUpload";
import FileList from "@/components/fileList";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { IoCloudUploadOutline } from "react-icons/io5";

export default function UploadPage({user} : {user: any}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center w-full">
     
      <FileUpload onUploadComplete={handleUploadComplete} user={user} />
      <FileList refreshTrigger={refreshTrigger} user={user} />
    </div>
  );
}

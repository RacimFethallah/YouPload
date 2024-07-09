import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AuthButton from "../components/AuthButton";
import UploadPage from "@/components/uploadPage";
import { Toaster } from "sonner";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <Toaster />
      <nav className="w-full flex justify-end border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-end items-center pr-10 text-sm">
          <AuthButton />
        </div>
      </nav>
      <UploadPage user={user} />
    </div>
  );
}

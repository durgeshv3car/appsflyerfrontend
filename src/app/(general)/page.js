"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role === "user") {
      const assignedPages = session.user.assignedPages || [];
      const firstPage = assignedPages[0]?.page || "preview";
      if (firstPage === "reports") {
        router.replace("/reports");
        return;
      }
    }
    router.replace("/preview");
  }, [session, status, router]);

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Home;

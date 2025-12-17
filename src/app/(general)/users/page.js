import UserPage from "./components/User";
import { checkPermissions } from "../checkPermissions";

export default async function Page() {
  const isSuperAdmin = await checkPermissions();

  if (!isSuperAdmin) {
    return <div className="text-center text-danger mt-5">Access Denied</div>;
  }

  return <UserPage />;
}

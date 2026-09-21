import UserList from "@/components/admin/UserList";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";

export default async function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <AdminPageHeader
        eyebrow="Customers"
        title="Users"
        description="Understand who is buying and how often they return."
      />
      <UserList />
    </div>
  );
}

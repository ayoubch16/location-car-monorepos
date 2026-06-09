import { PageMeta, PageBreadcrumb, Footer } from "components";
import BasicTableOne from "../../../components/tables";

export function BasicTables() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Contacts" />
      <div className="space-y-6">
        <BasicTableOne />
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
}

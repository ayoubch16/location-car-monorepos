import { PageMeta } from "components/common";
import { AuthLayout } from "layouts";
import { SignUpForm } from "./components";

export function PasswordReset() {
  return (
    <>
      <PageMeta description="" title="contact app - Reset Password" />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}

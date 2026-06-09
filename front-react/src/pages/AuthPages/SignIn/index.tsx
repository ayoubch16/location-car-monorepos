import { PageMeta } from "components/common";
import { AuthLayout } from "layouts";
import SignInForm from "./components";

export function SignIn() {
  return (
    <>
      <PageMeta
        title="contact app - authentification Password"
        description=""
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}

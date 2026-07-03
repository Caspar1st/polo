import type { Metadata } from "next";
import UpdatePasswordForm from "@/components/account/UpdatePasswordForm";

export const metadata: Metadata = { title: "Choose a new password" };

export default function UpdatePasswordPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl text-primary-900">Choose a new password</h1>
      </div>
      <div className="mt-10">
        <UpdatePasswordForm />
      </div>
    </section>
  );
}

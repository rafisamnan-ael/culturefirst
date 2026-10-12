import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, UserCircle2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dataSource } from "@/lib/config";
import { listDevUsers } from "@/lib/auth";
import { devSignIn } from "@/lib/auth/actions";
import { getServerT } from "@/lib/i18n/server";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  moderator: Wrench,
  user: UserCircle2,
};

export default async function LoginPage() {
  const { t } = await getServerT();
  const devMode = dataSource === "fixtures";

  return (
    <div className="container flex max-w-md flex-col py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-charcoal">{t("auth.loginTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-jade hover:underline">
          {t("nav.signup")}
        </Link>
      </p>

      <div className="mt-8">
        {devMode ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <p className="rounded-md bg-gold/10 p-3 text-xs text-[#7a5f2e]">
                Development sign-in (fixtures mode). Production uses Supabase authentication.
              </p>
              <div className="space-y-2">
                {listDevUsers().map((u) => {
                  const Icon = icons[u.role] ?? UserCircle2;
                  return (
                    <form action={devSignIn} key={u.id}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard" />
                      <Button type="submit" variant="outline" className="w-full justify-start">
                        <Icon className="h-4 w-4" />
                        {u.label}
                        <span className="ml-auto text-xs capitalize text-muted-foreground">{u.role}</span>
                      </Button>
                    </form>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <AuthForm mode="login" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

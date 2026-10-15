import type { Metadata } from "next";
import { ShieldCheck, UserCircle2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
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

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const { t } = await getServerT();
  const params = await searchParams;
  const nextTo = params?.next;
  const devMode = dataSource === "fixtures";
  const redirectTo = nextTo && nextTo.startsWith("/") ? nextTo : "/dashboard";

  return (
    <div>
      <PageHero
        eyebrow={t("nav.login")}
        icon={UserCircle2}
        title={t("auth.loginTitle")}
        subtitle={t("auth.loginOnly")}
        align="center"
        size="compact"
      />

      <div className="container flex max-w-md flex-col py-12">
        <div className="animate-fade-up">
          {devMode ? (
            <Card className="border-border/60 shadow-lux">
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
                        <input type="hidden" name="redirectTo" value={redirectTo} />
                        <Button type="submit" variant="outline" className="w-full justify-start hover:border-jade/40 hover:bg-jade-highlight/40">
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
            <Card className="border-border/60 shadow-lux">
              <CardContent className="p-6">
                <AuthForm mode="login" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

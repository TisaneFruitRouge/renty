import PropertiesList from "@/features/properties/components/PropertiesList";
import { getPropertiesForUser } from "@/features/properties/db";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
 
export default async function Home() {

  const t = await getTranslations('home');

  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  });

  if (!session) {
    redirect("/sign-in");
  }

  const properties = await getPropertiesForUser(session.user.id);

  return (
    <div className="p-4 lg:p-8 flex flex-col gap-16">
      {session?.user?.name &&  (
        <h1 className="text-lg lg:text-xl font-semibold">{t("welcome", { name: session.user.name })}</h1>
      )}
      <PropertiesList
        properties={properties}
      />
    </div> 
  )
}
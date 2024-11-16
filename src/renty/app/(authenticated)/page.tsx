import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
 
export default async function Home() {

  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  });


  return (
    <div className="p-4 lg:p-8">
      {session?.user?.name &&  (
        <h1 className="text-lg lg:text-xl font-semibold">Bonjour, {session?.user?.name}</h1>
      )}
    </div> 
  )
}
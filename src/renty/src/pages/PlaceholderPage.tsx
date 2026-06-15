import { PageDescription, PageTitle } from "@/components/ui/typography";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <PageTitle>{title}</PageTitle>
        <PageDescription className="mt-1">{description}</PageDescription>
      </div>
    </div>
  );
}

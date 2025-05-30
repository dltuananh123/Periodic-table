import { PeriodicTable } from "@/components/periodic-table";
import { PageTitle } from "@/components/page-title";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-8 bg-background text-foreground">
      <PageTitle />
      <PeriodicTable />
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Periodic table. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Element data sourced from public datasets.
        </p>
      </footer>
    </main>
  );
}

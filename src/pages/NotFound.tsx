
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";

const NotFound = () => {
  return (
    <PageLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-humanly-teal to-humanly-teal-light bg-clip-text text-transparent mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </PageLayout>
  );
}

export default NotFound;

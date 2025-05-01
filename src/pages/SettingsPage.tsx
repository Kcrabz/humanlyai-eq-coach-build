
import { PageLayout } from "@/components/layout/PageLayout";

const SettingsPage = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-8">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
            <p className="text-sm text-muted-foreground">
              This application uses a centrally managed API key. No additional configuration is needed.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;

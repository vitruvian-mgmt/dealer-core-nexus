import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SMSTemplateSettings } from "@/components/settings/SMSTemplateSettings";
import { TaxRateSettings } from "@/components/settings/TaxRateSettings";
import { DataBackupSettings } from "@/components/settings/DataBackupSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { User, Settings as SettingsIcon, Bell, MessageSquare, Calculator, Database } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { profile } = useAuth();

  const isAdmin = profile?.roles?.name === 'admin';

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and dealership preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="sms-templates" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>SMS Templates</span>
                </TabsTrigger>
                <TabsTrigger value="tax-rates" className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Tax Rates</span>
                </TabsTrigger>
                <TabsTrigger value="data-backup" className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Data Backup</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile" className="mt-0">
              <ProfileSettings />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings />
            </TabsContent>
            
            {isAdmin && (
              <>
                <TabsContent value="sms-templates" className="mt-0">
                  <SMSTemplateSettings />
                </TabsContent>
                
                <TabsContent value="tax-rates" className="mt-0">
                  <TaxRateSettings />
                </TabsContent>
                
                <TabsContent value="data-backup" className="mt-0">
                  <DataBackupSettings />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
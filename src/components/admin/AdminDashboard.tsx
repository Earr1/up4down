import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { AdminItemForm } from "./AdminItemForm";
import { AdminItemList } from "./AdminItemList";

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">Admin Panel - Up4Down</h1>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {!showForm ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Downloads</h2>
              <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            </div>

            <AdminItemList key={refreshKey} onEdit={handleEdit} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <AdminItemForm
              item={editingItem}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}
      </main>
    </div>
  );
};

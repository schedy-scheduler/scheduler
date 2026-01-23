import { DataTable } from "@/components/Datatable";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useState, useEffect } from "react";
import { UpsertCustomerModal } from "@/components/customers/UpsertCustomerModal";
import { customersService } from "@/services/customersService";
import { storeService } from "@/services/storeService";
import { authService } from "@/services/authService";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export const Customers: React.FC = () => {
  const [customerModalIsOpen, setCustomerModalIsOpen] = useState(false);
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState<string>("");
  const [editingId, setEditingId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userResult = await authService.getCurrentUser();
    if (userResult.data?.id) {
      const storeResult = await storeService.getByOwnerId(userResult.data.id);
      if (storeResult.data?.id) {
        setStoreId(storeResult.data.id);
        loadCustomers(storeResult.data.id);
      }
    }
  };

  const loadCustomers = async (storeId: string) => {
    setIsLoading(true);
    const result = await customersService.getAll(storeId);
    if (result.data) {
      setCustomers(result.data as User[]);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este cliente?")) {
      await customersService.delete(id);
      loadCustomers(storeId);
    }
  };

  const handleEdit = (customer: User) => {
    setEditingId(customer.id);
    setCustomerModalIsOpen(true);
  };

  const handleAddNew = () => {
    setEditingId("");
    setCustomerModalIsOpen(true);
  };

  const handleConfirm = async (data: any) => {
    if (editingId) {
      await customersService.update(editingId, data);
    } else {
      await customersService.create({
        ...data,
        store_id: storeId,
      });
    }
    setCustomerModalIsOpen(false);
    loadCustomers(storeId);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Telefone",
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center gap-1 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(user)}
              className="h-7 sm:h-8 px-1.5 sm:px-2.5"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(user.id)}
              className="h-7 sm:h-8 px-1.5 sm:px-2.5"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      <PageHeader
        title="Meus clientes"
        subtitle="Gerêncie seus clientes aqui."
        buttons={[
          <Button onClick={handleAddNew} size="sm" className="w-full sm:w-auto">
            <Plus size={16} />
            <span className="hidden sm:inline">Novo cliente</span>
            <span className="sm:hidden">Novo</span>
          </Button>,
        ]}
      />

      {isLoading ? (
        <div className="text-center py-10">Carregando...</div>
      ) : (
        <DataTable columns={columns} data={customers} />
      )}

      <UpsertCustomerModal
        isOpen={customerModalIsOpen}
        onClose={() => setCustomerModalIsOpen(false)}
        onConfirmClick={handleConfirm}
      />
    </div>
  );
};

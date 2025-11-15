import { getAdminOrders } from '@/actions/admin-orders';
import { OrderTable } from '@/components/admin/order-table';
import { OrderFilters } from '@/components/admin/order-filters';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const status = params.status as any;

  const { orders, pagination } = await getAdminOrders({
    search,
    status,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-gray-600">Manage customer orders</p>
      </div>

      {/* Filters */}
      <OrderFilters />

      {/* Order Table */}
      <OrderTable orders={orders} pagination={pagination} />
    </div>
  );
}
